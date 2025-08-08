\n\n-- Drop existing policies to recreate them with proper permissions\nDROP POLICY IF EXISTS "Admins can manage officers" ON officers
\nDROP POLICY IF EXISTS "Officers can read own data" ON officers
\nDROP POLICY IF EXISTS "Officers can update own data" ON officers
\n\n-- Create comprehensive admin policies\nCREATE POLICY "Admins can select officers"\n  ON officers\n  FOR SELECT\n  TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM admin_users \n      WHERE admin_users.id::text = auth.uid()::text\n    )\n  )
\n\nCREATE POLICY "Admins can insert officers"\n  ON officers\n  FOR INSERT\n  TO authenticated\n  WITH CHECK (\n    EXISTS (\n      SELECT 1 FROM admin_users \n      WHERE admin_users.id::text = auth.uid()::text\n    )\n  )
\n\nCREATE POLICY "Admins can update officers"\n  ON officers\n  FOR UPDATE\n  TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM admin_users \n      WHERE admin_users.id::text = auth.uid()::text\n    )\n  )\n  WITH CHECK (\n    EXISTS (\n      SELECT 1 FROM admin_users \n      WHERE admin_users.id::text = auth.uid()::text\n    )\n  )
\n\nCREATE POLICY "Admins can delete officers"\n  ON officers\n  FOR DELETE\n  TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM admin_users \n      WHERE admin_users.id::text = auth.uid()::text\n    )\n  )
\n\n-- Officers can read their own data\nCREATE POLICY "Officers can read own data"\n  ON officers\n  FOR SELECT\n  TO authenticated\n  USING (auth.uid()::text = id::text)
\n\n-- Officers can update their own data (excluding sensitive fields)\nCREATE POLICY "Officers can update own data"\n  ON officers\n  FOR UPDATE\n  TO authenticated\n  USING (auth.uid()::text = id::text)\n  WITH CHECK (auth.uid()::text = id::text)
