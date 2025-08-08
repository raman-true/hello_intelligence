import React, { useState } from 'react';
import { FileText, Info, Search, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useOfficerAuth } from '../../contexts/OfficerAuthContext';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import toast from 'react-hot-toast';
import { ManualRequest } from '../../lib/supabase'; // Import the ManualRequest interface

export const OfficerManualRequest: React.FC = () => {
  const { isDark } = useTheme();
  const { officer } = useOfficerAuth();
  const { addManualRequest } = useSupabaseData();

  const [inputType, setInputType] = useState<ManualRequest['input_type']>('Mobile');
  const [inputValue, setInputValue] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!officer) {
      toast.error('You must be logged in to submit a request.');
      return;
    }

    if (!inputValue.trim()) {
      toast.error('Please enter an input value.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newRequest: Omit<ManualRequest, 'id' | 'status' | 'admin_response' | 'credit_deducted' | 'approved_by' | 'created_at' | 'approved_at'> = {
        officer_id: officer.id,
        input_type: inputType,
        input_value: inputValue.trim(),
        notes: requestNotes.trim() || null,
      };

      await addManualRequest(newRequest);
      
      // Clear form fields on success
      setInputValue('');
      setRequestNotes('');
      setInputType('Mobile'); // Reset to default
      
    } catch (error) {
      console.error('Failed to submit manual request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`p-6 space-y-6 min-h-screen ${isDark ? 'bg-crisp-black' : 'bg-soft-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Manual Data Request
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Request sensitive, custom, or manual data not available via automated lookups.
          </p>
        </div>
      </div>

      <div className={`border border-cyber-teal/20 rounded-lg p-6 ${isDark ? 'bg-muted-graphite' : 'bg-white'} shadow-md hover:shadow-cyber transition-shadow duration-300`}>
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-6 h-6 text-electric-blue" />
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Submit New Request
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="inputType" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Input Type *
            </label>
            <select
              id="inputType"
              value={inputType}
              onChange={(e) => setInputType(e.target.value as ManualRequest['input_type'])}
              className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                isDark ? 'bg-crisp-black text-white' : 'bg-white text-gray-900'
              }`}
              required
            >
              <option value="Mobile">Mobile</option>
              <option value="Email">Email</option>
              <option value="PAN">PAN</option>
              <option value="Name">Name</option>
              <option value="Address">Address</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="inputValue" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Input Value *
            </label>
            <input
              id="inputValue"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g., 9848012345, john@gmail.com, ABCDE1234F"
              className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                isDark ? 'bg-crisp-black text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'
              }`}
              required
            />
          </div>

          <div>
            <label htmlFor="requestNotes" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Request Notes (Optional)
            </label>
            <textarea
              id="requestNotes"
              value={requestNotes}
              onChange={(e) => setRequestNotes(e.target.value)}
              rows={4}
              placeholder="Provide any additional context or specific data needed (e.g., 'Need SDR for this number', 'Looking for CIBIL score')."
              className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal resize-none ${
                isDark ? 'bg-crisp-black text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          <div className={`p-4 rounded-lg border ${isDark ? 'bg-electric-blue/10 border-electric-blue/30' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-electric-blue mt-0.5" />
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Examples of Manual Requests:
                </p>
                <ul className={`text-xs mt-1 list-disc list-inside ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>GAS ADDRESS 9848012345</li>
                  <li>LIVE LOCATION 9848012345</li>
                  <li>SDR ADDRESS 9XXXXXXXXX</li>
                  <li>CIBIL SCORE 9XXXXXXXXX</li>
                  <li>Any other sensitive or custom data not available via automated APIs.</li>
                </ul>
                <p className={`text-xs mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Credits will only be deducted if your request is approved by an admin.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-cyber-gradient text-white font-medium rounded-lg hover:shadow-cyber transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
