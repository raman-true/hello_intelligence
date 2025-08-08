import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Download, Search, Phone } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useOfficerAuth } from '../../../contexts/OfficerAuthContext';
import { useSupabaseData } from '../../../hooks/useSupabaseData';
import toast from 'react-hot-toast';

interface CreditReportResult {
  code: number;
  timestamp: number | string;
  transaction_id: string;
  sub_code: string;
  message: string;
  data?: {
    pan?: string | null;
    mobile?: string;
    name?: string;
    credit_score?: string;
    credit_report?: {
      InquiryResponseHeader?: {
        ClientID?: string;
        CustRefField?: string;
        ReportOrderNO?: string;
        ProductCode?: string[];
        SuccessCode?: string;
        Date?: string;
        Time?: string;
      };
      InquiryRequestInfo?: {
        InquiryPurpose?: string;
        TransactionAmount?: string;
        FirstName?: string;
        InquiryAddresses?: { seq?: string; AddressType?: string[]; AddressLine1?: string; City?: string; State?: string; Postal?: string }[];
        InquiryPhones?: { seq?: string; PhoneType?: string[]; Number?: string }[];
        IDDetails?: { seq?: string; IDType?: string; IDValue?: string }[];
        DOB?: string;
        Gender?: string;
      };
      Score?: { Type?: string; Version?: string }[];
      [key: string]: any;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

const CreditReportV2: React.FC = () => {
  const { isDark } = useTheme();
  const { officer, updateOfficerState } = useOfficerAuth();
  const { apis, addQuery, addTransaction, getOfficerEnabledAPIs } = useSupabaseData();
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [consent, setConsent] = useState<'Y' | ''>('Y');
  const [purpose, setPurpose] = useState('For Loan Eligibility Check');
  const [generatePdf, setGeneratePdf] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CreditReportResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({ details: true, raw: false });
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (apis && officer) {
      setIsLoading(false);
      if (!accessToken) {
        const api = apis.find(a => a.name.toLowerCase().includes('credit report'));
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
    if (!fullName.trim() || !idNumber.trim() || !mobileNumber.trim() || !gender || !consent || !purpose) {
      toast.error('All fields are required');
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
    const deepvueAPI = enabledAPIs.find(api => api.name.toLowerCase().includes('credit report') && api.key_status === 'Active');
    if (!deepvueAPI) {
      setSearchError('Credit Report API not configured or inactive');
      toast.error('Credit Report API not configured or inactive');
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
      const params = new URLSearchParams({
        full_name: fullName.trim(),
        id_number: idNumber.trim(),
        mobile_number: mobileNumber.trim(),
        gender,
        consent,
        purpose,
        generate_pdf: generatePdf.toString(),
      }).toString();
      const response = await fetch(`/api/deepvue/v2/financial-services/credit-bureau/credit-report?${params}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${await response.text()}`);
      const data: CreditReportResult = await response.json();
      setSearchResults(data);

      const newCredits = officer.credits_remaining - creditCost;
      updateOfficerState({ credits_remaining: newCredits });

      if (addTransaction) await addTransaction({
        officer_id: officer.id, officer_name: officer.name || 'Unknown', action: 'Deduction',
        credits: creditCost, payment_mode: 'Query Usage', remarks: `Credit Report for ${mobileNumber}`,
      });
      if (addQuery) await addQuery({
        officer_id: officer.id, officer_name: officer.name || 'Unknown', type: 'PRO',
        category: 'Credit Report V2', input_data: `Name: ${fullName}, ID: ${idNumber}, Mobile: ${mobileNumber}`,
        source: 'Deepvue', result_summary: `Credit report fetched: ${data.message || 'Success'}`,
        full_result: data, credits_used: creditCost, status: data.code === 200 ? 'Success' : 'Failed',
      });

      toast.success(data.code === 200 ? 'Credit report retrieved successfully!' : `Search failed: ${data.message || 'No records found'}`);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Unknown error');
      if (addQuery) await addQuery({
        officer_id: officer.id, officer_name: officer.name || 'Unknown', type: 'PRO',
        category: 'Credit Report V2', input_data: `Name: ${fullName}, ID: ${idNumber}, Mobile: ${mobileNumber}`,
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
        <div className="flex items-center space-x-3"><Phone className="w-6 h-6 text-electric-blue" /><h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Credit Report V2</h3></div>
        <div className="flex items-center space-x-2"><Shield className="w-5 h-5 text-electric-blue" /><span className="text-xs bg-electric-blue/20 text-electric-blue px-2 py-1 rounded">PREMIUM</span></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div><label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Full Name *</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter full name"
            className={`w-full px-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${isDark ? 'bg-crisp-black text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`} />
        </div>
        <div><label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>ID Number (PAN/Aadhaar) *</label>
          <input type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="Enter PAN or Aadhaar"
            className={`w-full px-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${isDark ? 'bg-crisp-black text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`} />
        </div>
        <div><label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Mobile Number *</label>
          <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="Enter 10-digit mobile number"
            className={`w-full px-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${isDark ? 'bg-crisp-black text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`} />
        </div>
        <div><label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Gender *</label>
          <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female' | '')}
            className={`w-full px-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${isDark ? 'bg-crisp-black text-white' : 'bg-white text-gray-900'}`}>
            <option value="">Select Gender</option><option value="male">Male</option><option value="female">Female</option>
          </select>
        </div>
        <div><label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Consent *</label>
          <select value={consent} onChange={(e) => setConsent(e.target.value as 'Y' | '')}
            className={`w-full px-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${isDark ? 'bg-crisp-black text-white' : 'bg-white text-gray-900'}`}>
            <option value="Y">Yes</option><option value="">No</option>
          </select>
        </div>
        <div><label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Purpose *</label>
          <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Enter purpose"
            className={`w-full px-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${isDark ? 'bg-crisp-black text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`} />
        </div>
        <div className="flex items-center"><label className={`mr-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Generate PDF</label>
          <input type="checkbox" checked={generatePdf} onChange={(e) => setGeneratePdf(e.target.checked)}
            className={`h-5 w-5 ${isDark ? 'bg-crisp-black border-cyber-teal/30' : 'bg-white border-gray-300'} rounded focus:ring-cyber-teal`} />
        </div>
        <div className="flex items-end"><button onClick={handleSearch} disabled={isSearching || !fullName || !idNumber || !mobileNumber || !gender || !consent || !purpose || !accessToken}
          className="w-full py-3 px-4 bg-cyber-gradient text-white font-medium rounded-lg hover:shadow-cyber transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
          {isSearching ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Searching...</span></> :
            <><Search className="w-4 h-4" /><span>Fetch Credit Report</span></>}
        </button></div>
      </div>
      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
        * Required. Consumes {apis.find(api => api.name.toLowerCase().includes('credit report'))?.default_credit_charge || 5.00} credits per query.
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
            <div className="flex items-center space-x-3"><CheckCircle className="w-5 h-5 text-green-400" /><h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Credit Report</h4></div>
            <div className="flex items-center space-x-2"><span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>Verified 8/2/2025, 1:10 AM</span></div>
          </div>
          <div className="mb-6"><button onClick={() => toggleSection('details')}
            className={`w-full flex items-center justify-between p-4 rounded-lg border ${isDark ? 'bg-crisp-black/50 border-cyber-teal/10' : 'bg-gray-50 border-gray-200'}`}>
            <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Credit Information</h5>
            {expandedSections.details ? <ChevronUp className="w-5 h-5 text-cyber-teal" /> : <ChevronDown className="w-5 h-5 text-cyber-teal" />}
          </button>{expandedSections.details && (
            <div className={`p-4 mt-2 rounded-lg border ${isDark ? 'bg-muted-graphite border-cyber-teal/10' : 'bg-white border-gray-200'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between items-center"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Name:</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{searchResults.data.name || 'N/A'}</span></div>
                <div className="flex justify-between items-center"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Credit Score:</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{searchResults.data.credit_score || 'N/A'}</span></div>
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
              link.download = `credit-report-${mobileNumber}-${Date.now()}.json`; link.click(); URL.revokeObjectURL(url);
              toast.success('Results exported successfully!');
            }} className="px-4 py-2 bg-electric-blue/20 text-electric-blue rounded-lg hover:bg-electric-blue/30 transition-all duration-200 flex items-center space-x-2">
              <Download className="w-4 h-4" /><span>Export Results</span>
            </button>
            <button onClick={() => { setSearchResults(null); setSearchError(null); setFullName(''); setIdNumber(''); setMobileNumber(''); setGender(''); setConsent('Y'); setPurpose('For Loan Eligibility Check'); setGeneratePdf(false); }}
              className="px-4 py-2 bg-cyber-gradient text-white rounded-lg hover:shadow-cyber transition-all duration-200">New Search</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditReportV2;