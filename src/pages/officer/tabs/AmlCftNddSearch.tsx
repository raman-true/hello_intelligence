import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Copy, Download, Search } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useOfficerAuth } from '../../../contexts/OfficerAuthContext';
import { useSupabaseData } from '../../../hooks/useSupabaseData';
import toast from 'react-hot-toast';

const AmlCftNddSearch: React.FC = () => {
  const { isDark } = useTheme();
  const { officer, updateOfficerState } = useOfficerAuth();
  const { apis, addQuery, addTransaction, getOfficerEnabledAPIs } = useSupabaseData();
  const [name, setName] = useState('');
  const [type, setType] = useState('individual');
  const [category, setCategory] = useState(['AML', 'CFT', 'NONCOMPLIANCE', 'LENDING']);
  const [databaseList, setDatabaseList] = useState(['All']);
  const [matchScoreThreshold, setMatchScoreThreshold] = useState('0.50');
  const [country, setCountry] = useState('INDIA');
  const [searchText, setSearchText] = useState(['']);
  const [aliasArray, setAliasArray] = useState(['']);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    raw: false,
  });

  useEffect(() => {
    if (apis && officer) {
      const api = apis.find(a => a.name === 'AML/CFT NDD Search');
      if (api && api.usage_count === 0) {
        toast('New API instance detected. Usage count will be updated with your first search.', { type: 'info' });
      }
    }
  }, [apis, officer]);

  const handleAmlCftNddSearch = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    const enabledAPIs = getOfficerEnabledAPIs(officer.id);
    const amlApi = enabledAPIs.find(api =>
      api.name === 'AML/CFT NDD Search' && api.key_status === 'Active'
    );

    if (!amlApi) {
      setSearchError('AML/CFT NDD search service is currently unavailable');
      toast.error('AML/CFT NDD search service is currently unavailable');
      return;
    }

    const creditCost = amlApi.default_credit_charge || 5.00;
    if (officer.credits_remaining < creditCost) {
      toast.error(`Insufficient credits. Required: ${creditCost}, Available: ${officer.credits_remaining}`);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResults(null);

    try {
      const response = await fetch('/api/signzy/api/v3/amlcft/ndd', {
        method: 'POST',
        headers: {
          'Authorization': amlApi.api_key,
          'x-client-unique-id': officer.email,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          type,
          category,
          databaseList,
          matchScoreThreshold,
          country,
          searchText,
          aliasArray,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.error) {
        throw new Error(data.error.message || 'Search failed');
      } else {
        setSearchResults(data.result);
      }
      
      const newCredits = officer.credits_remaining - creditCost;
      updateOfficerState({ credits_remaining: newCredits });

      if (addTransaction) {
        await addTransaction({
          officer_id: officer.id,
          officer_name: officer.name || 'Unknown',
          action: 'Deduction',
          credits: creditCost,
          payment_mode: 'Query Usage',
          remarks: `AML/CFT NDD Search for ${name}`,
        });
      }

      if (addQuery) {
        await addQuery({
          officer_id: officer.id,
          officer_name: officer.name || 'Unknown',
          type: 'PRO',
          category: 'AML/CFT NDD Search',
          input_data: name,
          source: 'Signzy API',
          result_summary: `NDD results found for ${name}: ${data.result.matchStatus || 'N/A'}`,
          full_result: data.result,
          credits_used: creditCost,
          status: 'Success'
        });
      }

      toast.success('NDD details retrieved successfully!');
    } catch (error: any) {
      console.error('AML/CFT NDD Search Error:', error);
      setSearchError(error.message || 'Search failed');
      toast.error(error.message || 'Search failed. Please try again.');

      if (addQuery) {
        await addQuery({
          officer_id: officer.id,
          officer_name: officer.name || 'Unknown',
          type: 'PRO',
          category: 'AML/CFT NDD Search',
          input_data: name,
          source: 'Signzy API',
          result_summary: `Search failed: ${error.message}`,
          credits_used: 0,
          status: 'Failed'
        });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!officer || !apis) {
    return (
      <div className={`border border-cyber-teal/20 rounded-lg p-6 ${isDark ? 'bg-muted-graphite' : 'bg-white'}`}>
        <div className={`p-4 rounded-lg border flex items-center space-x-3 ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-red-400 text-sm font-medium">Error</p>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Required data not loaded. Please try refreshing or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-cyber-teal/20 rounded-lg p-6 ${isDark ? 'bg-muted-graphite' : 'bg-white'} shadow-md hover:shadow-cyber transition-shadow duration-300`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-electric-blue" />
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            AML/CFT NDD Search
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-electric-blue" />
          <span className="text-xs bg-electric-blue/20 text-electric-blue px-2 py-1 rounded">PREMIUM</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name (e.g., Vijay Mallya)"
            className={`w-full px-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
              isDark ? 'bg-crisp-black text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleAmlCftNddSearch}
            disabled={isSearching || !name.trim()}
            className="w-full py-3 px-4 bg-cyber-gradient text-white font-medium rounded-lg hover:shadow-cyber transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search NDD</span>
              </>
            )}
          </button>
        </div>
      </div>
      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
        * Required. Consumes {apis.find(api => api.name === 'AML/CFT NDD Search')?.default_credit_charge || 5.00} credits per query.
      </p>

      {searchError && (
        <div className={`p-4 rounded-lg border flex items-center space-x-3 ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'} mb-6`}>
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-red-400 text-sm font-medium">Error</p>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {searchError}
              {searchError === 'AML/CFT NDD search service is currently unavailable' ? (
                <span> Please try again later or contact support.</span>
              ) : searchError.includes('Insufficient credits') ? (
                <span> Contact admin to top up your credits.</span>
              ) : searchError.includes('HTTP error') ? (
                <span> Please try again or check your network connection.</span>
              ) : (
                <span> Please try again or contact support.</span>
              )}
            </p>
          </div>
        </div>
      )}

      {searchResults && Object.keys(searchResults).length > 0 && (
        <div className={`p-6 rounded-lg border ${isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                NDD Details Found
              </h4>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
                Verified 8/1/2025, 12:00 AM
              </span>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={() => toggleSection('details')}
              className={`w-full flex items-center justify-between p-4 rounded-lg border ${isDark ? 'bg-crisp-black/50 border-cyber-teal/10' : 'bg-gray-50 border-gray-200'}`}
            >
              <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                NDD Information
              </h5>
              {expandedSections.details ? (
                <ChevronUp className="w-5 h-5 text-cyber-teal" />
              ) : (
                <ChevronDown className="w-5 h-5 text-cyber-teal" />
              )}
            </button>
            {expandedSections.details && (
              <div className={`p-4 mt-2 rounded-lg border ${isDark ? 'bg-muted-graphite border-cyber-teal/10' : 'bg-white border-gray-200'}`}>
                {searchResults.generalWatchlist && searchResults.generalWatchlist.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <h6 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>General Watchlist</h6>
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Match Status:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {searchResults.generalWatchlist[0].details.match_status || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Score:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {searchResults.generalWatchlist[0].overallScore || 'N/A'}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Details:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {searchResults.generalWatchlist[0].details.Summary || searchResults.generalWatchlist[0].details.details || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Date:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {searchResults.generalWatchlist[0].details['Date of Event'] || 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
                {searchResults.enforcement && searchResults.enforcement.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <h6 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Enforcement</h6>
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Authority:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {searchResults.enforcement[0].details['Authority Name'] || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Score:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {searchResults.enforcement[0].overallScore || 'N/A'}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Reason:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {searchResults.enforcement[0].details.Reason || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Date:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {searchResults.enforcement[0].details['Date of Press Release'] || 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
                {searchResults.politicallyExposedPerson && searchResults.politicallyExposedPerson.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <h6 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Politically Exposed Person</h6>
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Status:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {searchResults.politicallyExposedPerson[0].details.match_status || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Score:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {searchResults.politicallyExposedPerson[0].overallScore || 'N/A'}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Address:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {searchResults.politicallyExposedPerson[0].details.Address || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>DOB:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {searchResults.politicallyExposedPerson[0].details.DOB || 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-6">
            <button
              onClick={() => toggleSection('raw')}
              className={`w-full flex items-center justify-between p-4 rounded-lg border ${isDark ? 'bg-crisp-black/50 border-cyber-teal/10' : 'bg-gray-50 border-gray-200'}`}
            >
              <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Raw JSON Response
              </h5>
              {expandedSections.raw ? (
                <ChevronUp className="w-5 h-5 text-cyber-teal" />
              ) : (
                <ChevronDown className="w-5 h-5 text-cyber-teal" />
              )}
            </button>
            {expandedSections.raw && (
              <div className={`mt-2 p-4 rounded-lg border ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} overflow-x-auto`}>
                <pre className="text-xs">
                  <code>{JSON.stringify(searchResults, null, 2)}</code>
                </pre>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-cyber-teal/20">
            <button
              onClick={() => {
                const dataStr = JSON.stringify(searchResults, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `amlcft-ndd-${name}-${Date.now()}.json`;
                link.click();
                URL.revokeObjectURL(url);
                toast.success('Results exported successfully!');
              }}
              className="px-4 py-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-all duration-200 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Results</span>
            </button>
            <button
              onClick={() => {
                setSearchResults(null);
                setSearchError(null);
                setName('');
                setType('individual');
                setCategory(['AML', 'CFT', 'NONCOMPLIANCE', 'LENDING']);
                setDatabaseList(['All']);
                setMatchScoreThreshold('0.50');
                setCountry('INDIA');
                setSearchText(['']);
                setAliasArray(['']);
              }}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              New Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmlCftNddSearch;