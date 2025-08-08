import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Download, Search, Phone } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useOfficerAuth } from '../../../contexts/OfficerAuthContext';
import { useSupabaseData } from '../../../hooks/useSupabaseData';
import toast from 'react-hot-toast';

interface MobileToPanResult {
  code: number;
  timestamp: number | string;
  transaction_id: string;
  sub_code: string;
  message: string;
  data?: {
    pan_number?: string;
    full_name?: string;
    full_name_split?: string[];
    masked_aadhaar?: string;
    address?: {
      line_1?: string;
      line_2?: string;
      street_name?: string;
      zip?: string;
      city?: string;
      state?: string;
      country?: string;
      full?: string;
    };
    email?: string | null;
    phone_number?: string | null;
    gender?: string;
    dob?: string;
    input_dob?: string | null;
    aadhaar_linked?: boolean;
    dob_verified?: boolean;
    dob_check?: boolean;
    category?: string;
    less_info?: boolean;
    [key: string]: any;
  };
  [key: string]: any;
}

const MobileToPan: React.FC = () => {
  const { isDark } = useTheme();
  const { officer, updateOfficerState } = useOfficerAuth();
  const { apis, addQuery, addTransaction, getOfficerEnabledAPIs } = useSupabaseData();
  const [mobileNumber, setMobileNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MobileToPanResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({ details: true, raw: false });
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (apis && officer) {
      setIsLoading(false);
      if (!accessToken) {
        const api = apis.find(a => a.name.toLowerCase().includes('mobile to pan'));
        if (api && api.api_key) {
          const [clientSecret, clientId] = api.api_key.split(':');
          getDeepvueAccessToken(clientId || '', clientSecret || '');
        }
      }
    }
  }, [apis, officer, accessToken]);

  const getDeepvueAccessToken = async (clientId: string, clientSecret: string): Promise<void> => {
    try {
      const response = await fetch('/api/deepvue/v1/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret }),
      });
      if (!response.ok) throw new Error(`Authentication failed: ${response.status}`);
      const data = await response.json();
      if (data.access_token) setAccessToken(data.access_token);
      else throw new Error('Access token not found');
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSearch = async () => {
    if (!mobileNumber.trim()) {
      toast.error('Please enter a mobile number');
      return;
    }
    if (!/^\d{10}$/.test(mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!accessToken) {
      setSearchError('Authentication token not available');
      toast.error('Authentication token not available');
      return;
    }

    const enabledAPIs = getOfficerEnabledAPIs(officer.id);
    const deepvueAPI = enabledAPIs.find(api => api.name.toLowerCase().includes('mobile to pan') && api.key_status === 'Active');
    if (!deepvueAPI) {
      setSearchError('Mobile to Pan API not configured or inactive');
      toast.error('Mobile to Pan API not configured or inactive');
      return;
    }

    const creditCost = deepvueAPI.default_credit_charge || 5.00;
    if (officer.credits_remaining < creditCost) {
      setSearchError(`Insufficient credits: ${creditCost} required`);
      toast.error(`Insufficient credits. Required: ${creditCost}`);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResults(null);

    try {
      const response = await fetch(`/api/deepvue/v1/mobile-intelligence/mobile-to-pan?mobile_number=${encodeURIComponent(mobileNumber.trim())}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${await response.text()}`);
      const data: MobileToPanResult = await response.json();
      setSearchResults(data);

      const newCredits = officer.credits_remaining - creditCost;
      updateOfficerState({ credits_remaining: newCredits });

      if (addTransaction) await addTransaction({
        officer_id: officer.id, officer_name: officer.name || 'Unknown', action: 'Deduction',
        credits: creditCost, payment_mode: 'Query Usage', remarks: `Mobile to Pan for ${mobileNumber}`,
      });
      if (addQuery) await addQuery({
        officer_id: officer.id, officer_name: officer.name || 'Unknown', type: 'PRO',
        category: 'Mobile to Pan', input_data: `Mobile Number: ${mobileNumber}`,
        source: 'Deepvue', result_summary: `PAN fetched: ${data.message || 'Success'}`,
        full_result: data, credits_used: creditCost, status: data.code === 200 ? 'Success' : 'Failed',
      });

      toast.success(data.code === 200 ? 'PAN details retrieved successfully!' : `Search failed: ${data.message || 'Details not found'}`);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Unknown error');
      if (addQuery) await addQuery({
        officer_id: officer.id, officer_name: officer.name || 'Unknown', type: 'PRO',
        category: 'Mobile to Pan', input_data: `Mobile Number: ${mobileNumber}`,
        source: 'Deepvue', result_summary: `Search failed: ${error}`, full_result: null, credits_used: 0, status: 'Failed',
      });
      toast.error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoading) return <div className={`border border-cyber-teal/20 rounded-lg p-6 ${isDark ? 'bg-muted-graphite' : 'bg-white'} text-center`}>Loading...</div>;
  if (!officer || !apis) return (
    <div className={`border border-cyber-teal/20 rounded-lg p-6 ${isDark ? 'bg-muted-graphite' : 'bg-white'}`}>
      <div className={`p-4 rounded-lg border flex items-center space-x-3 ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
        <AlertCircle className="w-5 h-5 text-red-400" /><div><p className="text-red-400 text-sm font-medium">Error</p><p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Required data not loaded. Please try refreshing or contact support.</p></div>
      </div>
    </div>
  );

  return (
    <div className={`border border-cyber-teal/20 rounded-lg p-6 ${isDark ? 'bg-muted-graphite' : 'bg-white'} shadow-md hover:shadow-cyber transition-shadow duration-300`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3"><Phone className="w-6 h-6 text-electric-blue" /><h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Mobile to Pan</h3></div>
        <div className="flex items-center space-x-2"><Shield className="w-5 h-5 text-electric-blue" /><span className="text-xs bg-electric-blue/20 text-electric-blue px-2 py-1 rounded">PREMIUM</span></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div><label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Mobile Number *</label>
          <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="Enter 10-digit mobile number"
            className={`w-full px-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${isDark ? 'bg-crisp-black text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`} />
        </div>
        <div className="flex items-end"><button onClick={handleSearch} disabled={isSearching || !mobileNumber.trim() || !accessToken}
          className="w-full py-3 px-4 bg-cyber-gradient text-white font-medium rounded-lg hover:shadow-cyber transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
          {isSearching ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Searching...</span></> :
            <><Search className="w-4 h-4" /><span>Search Pan</span></>}
        </button></div>
      </div>
      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
        * Required. Consumes {apis.find(api => api.name.toLowerCase().includes('mobile to pan'))?.default_credit_charge || 5.00} credits per query.
      </p>
      {searchError && (
        <div className={`p-4 rounded-lg border flex items-center space-x-3 ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'} mb-6`}>
          <AlertCircle className="w-5 h-5 text-red-400" /><div><p className="text-red-400 text-sm font-medium">Error</p><p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {searchError}{searchError.includes('Insufficient credits') ? <span> Contact admin to top up.</span> : searchError.includes('API request failed') ? <span> Check API config or network.</span> : <span> Try again or contact support.</span>}
          </p></div>
        </div>
      )}
      {searchResults && searchResults.data && (
        <div className={`p-6 rounded-lg border ${isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3"><CheckCircle className="w-5 h-5 text-green-400" /><h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Pan Details</h4></div>
            <div className="flex items-center space-x-2"><span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>Verified 8/2/2025, 12:42 AM</span></div>
          </div>
          <div className="mb-6"><button onClick={() => toggleSection('details')}
            className={`w-full flex items-center justify-between p-4 rounded-lg border ${isDark ? 'bg-crisp-black/50 border-cyber-teal/10' : 'bg-gray-50 border-gray-200'}`}>
            <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Pan Information</h5>
            {expandedSections.details ? <ChevronUp className="w-5 h-5 text-cyber-teal" /> : <ChevronDown className="w-5 h-5 text-cyber-teal" />}
          </button>{expandedSections.details && (
            <div className={`p-4 mt-2 rounded-lg border ${isDark ? 'bg-muted-graphite border-cyber-teal/10' : 'bg-white border-gray-200'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between items-center"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Pan Number:</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{searchResults.data.pan_number || 'N/A'}</span></div>
                <div className="flex justify-between items-center"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Full Name:</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{searchResults.data.full_name || 'N/A'}</span></div>
                <div className="flex justify-between items-center"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Masked Aadhaar:</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{searchResults.data.masked_aadhaar || 'N/A'}</span></div>
                <div className="flex justify-between items-center"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Gender:</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{searchResults.data.gender || 'N/A'}</span></div>
                <div className="flex justify-between items-center"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>DOB:</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{searchResults.data.dob || 'N/A'}</span></div>
                <div className="flex justify-between items-center"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Message:</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{searchResults.message || 'N/A'}</span></div>
              </div>
            </div>)}
          </div>
          <div className="mb-6"><button onClick={() => toggleSection('raw')}
            className={`w-full flex items-center justify-between p-4 rounded-lg border ${isDark ? 'bg-crisp-black/50 border-cyber-teal/10' : 'bg-gray-50 border-gray-200'}`}>
            <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Raw JSON Response</h5>
            {expandedSections.raw ? <ChevronUp className="w-5 h-5 text-cyber-teal" /> : <ChevronDown className="w-5 h-5 text-cyber-teal" />}
          </button>{expandedSections.raw && (
            <div className={`mt-2 p-4 rounded-lg border ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} overflow-x-auto`}>
              <pre className="text-xs"><code>{JSON.stringify(searchResults, null, 2)}</code></pre>
            </div>)}
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-cyber-teal/20">
            <button onClick={() => {
              const dataStr = JSON.stringify(searchResults, null, 2); const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob); const link = document.createElement('a'); link.href = url;
              link.download = `mobile-to-pan-${mobileNumber}-${Date.now()}.json`; link.click(); URL.revokeObjectURL(url);
              toast.success('Results exported successfully!');
            }} className="px-4 py-2 bg-electric-blue/20 text-electric-blue rounded-lg hover:bg-electric-blue/30 transition-all duration-200 flex items-center space-x-2">
              <Download className="w-4 h-4" /><span>Export Results</span>
            </button>
            <button onClick={() => { setSearchResults(null); setSearchError(null); setMobileNumber(''); }}
              className="px-4 py-2 bg-cyber-gradient text-white rounded-lg hover:shadow-cyber transition-all duration-200">New Search</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileToPan;