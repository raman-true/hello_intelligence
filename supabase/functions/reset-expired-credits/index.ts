import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import { addDays, isPast } from 'https://esm.sh/date-fns@2.30.0';

// Initialize Supabase client with service role key
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

Deno.serve(async (req) => {
  try {
    console.log('Starting credit reset check...');

    // 1. Query officers and join with rate_plans
    const { data: officers, error: fetchError } = await supabase
      .from('officers')
      .select(`
        id,
        name,
        credits_remaining,
        total_credits,
        plan_start_date,
        rate_plans (
          validity_days,
          carry_forward_credits_on_renewal,
          default_credits
        )
      `)
      .not('plan_id', 'is', null); // Only consider officers with an assigned plan

    if (fetchError) {
      console.error('Error fetching officers:', fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!officers || officers.length === 0) {
      console.log('No officers with plans found.');
      return new Response(JSON.stringify({ message: 'No officers with plans to check.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const updatedOfficers = [];

    for (const officer of officers) {
      const plan = officer.rate_plans; // Access the joined rate_plans data
      
      // Ensure plan data is available and valid_days is set
      if (plan && plan.validity_days !== null && officer.plan_start_date) {
        const planStartDate = new Date(officer.plan_start_date);
        const planExpiryDate = addDays(planStartDate, plan.validity_days);

        // Check if the plan has expired and credits should not be carried forward
        if (isPast(planExpiryDate) && !plan.carry_forward_credits_on_renewal) {
          // Reset credits to 0 or default_credits if specified by plan
          const newCredits = plan.default_credits !== null ? plan.default_credits : 0;

          // Only update if credits are not already at the new value to avoid unnecessary writes
          if (officer.credits_remaining !== newCredits || officer.total_credits !== newCredits) {
            const { error: updateError } = await supabase
              .from('officers')
              .update({
                credits_remaining: newCredits,
                total_credits: newCredits,
                // Optionally, you might want to update plan_start_date here if it's considered a "renewal"
                // even without an explicit action from the admin. This depends on your exact business logic.
                // For now, we'll assume plan_start_date is only reset on explicit plan changes/renewals.
              })
              .eq('id', officer.id);

            if (updateError) {
              console.error(`Error updating credits for officer ${officer.id}:`, updateError);
            } else {
              updatedOfficers.push({
                id: officer.id,
                name: officer.name,
                old_credits_remaining: officer.credits_remaining,
                old_total_credits: officer.total_credits,
                new_credits: newCredits,
                reason: 'Plan expired and no carry forward',
              });
              console.log(`Credits reset for officer ${officer.name} (ID: ${officer.id}). Old: ${officer.credits_remaining}/${officer.total_credits}, New: ${newCredits}/${newCredits}`);
            }
          }
        }
      }
    }

    console.log(`Credit reset check completed. ${updatedOfficers.length} officers updated.`);

    return new Response(JSON.stringify({
      message: 'Credit reset check completed.',
      updated_officers_count: updatedOfficers.length,
      updated_officers: updatedOfficers,
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Unhandled error in Edge Function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
