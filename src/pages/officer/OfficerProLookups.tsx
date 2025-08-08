import React, { useState } from 'react';
import { Shield, Database, Phone, Car, CreditCard, FileText, Search, Smartphone, MapPin } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSupabaseData } from '../../hooks/useSupabaseData'; // Import useSupabaseData
import PhonePrefillV2 from './tabs/PhonePrefillV2';
import RCSearch from './tabs/RCSearch';
import RechargeStatusCheck from './tabs/RechargeStatusCheck';
import RechargeExpiryCheck from './tabs/RechargeExpiryCheck';
import OperatorCircleCheck from './tabs/Operator_Circle_Check';
import PhoneToCreditAndBusinessDetails from './tabs/PhoneToCreditAndBusinessDetails';
import UdyamDetailsSearch from './tabs/UdyamDetailsSearch';
import PanToTanSearch from './tabs/PanToTanSearch';
import PanToInsuranceDetailsSearch from './tabs/PanToInsuranceDetailsSearch';
import PanComplianceSearch from './tabs/PanComplianceSearch';
import AmlCftNddSearch from './tabs/AmlCftNddSearch';
import PincodePopulationSearch from './tabs/PincodePopulationSearch';
import FssaiVerificationSearch from './tabs/FssaiVerificationSearch';
import EmploymentHistorySearch from './tabs/EmploymentHistorySearch';
import EmployeePFVerification from './tabs/EmployeePFVerification';
import EmployeeNameSearch from './tabs/EmployeeNameSearch';
import CheckDualEmployment from './tabs/CheckDualEmployment';
import FetchEmploymentHistory from './tabs/FetchEmploymentHistory';
import DigitalIdentityScore from './tabs/DigitalIdentityScore';
import DomainVerification from './tabs/DomainVerification';
import BankAccountVerification from './tabs/BankAccountVerification';
import MobileToVehicleRC from './tabs/MobileToVehicleRC';
import MobileToDigitalAge from './tabs/MobileToDigitalAge';
import MobileToMultipleUpi from './tabs/MobileToMultipleUpi';
import MobileToPan from './tabs/MobileToPan';
import MobileToName from './tabs/MobileToName';
import CreditReportV2 from './tabs/CreditReportV2';

export const OfficerProLookups: React.FC = () => {
  const { isDark } = useTheme();
  const { apis } = useSupabaseData(); // Access apis from useSupabaseData
  const [activeTab, setActiveTab] = useState<
    | 'phone-prefill-v2'
    | 'rc'
    | 'imei'
    | 'fasttag'
    | 'credit-history'
    | 'cell-id'
    | 'recharge-status'
    | 'recharge-expiry'
    | 'operator-check'
    | 'phone-to-credit-business'
    | 'phone-to-udyam'
    | 'pan-to-tan'
    | 'pan-to-insurance-details'
    | 'pan-compliance'
    | 'aml-cft-ndd-search'
    | 'pincode-population-search'
    | 'fssai-verification-search'
    | 'employment-history-search'
    | 'employee-pf-verification'
    | 'employee-name-search'
    | 'check-dual-employment'
    | 'fetch-employment-history'
    | 'digital-identity-score'
    | 'domain-verification'
    | 'bank-account-verification'
    | 'mobile-to-vehicle-rc'
    | 'mobile-to-digital-age'
    | 'mobile-to-multiple-upi'
    | 'mobile-to-pan'
    | 'mobile-to-name'
    | 'credit-report-v2'
  >('phone-prefill-v2');

  const getCreditCost = (apiName: string): string => {
    const api = apis.find(a => a.name.toLowerCase().includes(apiName.toLowerCase()));
    return api ? `${api.default_credit_charge} credits` : 'N/A';
  };

  const renderComingSoon = (title: string, icon: React.ElementType) => {
    const Icon = icon;
    return (
      <div className={`border border-cyber-teal/20 rounded-lg p-6 ${isDark ? 'bg-muted-graphite' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        <div className="text-center py-12">
          <Icon className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Coming Soon
          </h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {title} functionality will be available soon.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-6 space-y-6 min-h-screen ${isDark ? 'bg-crisp-black' : 'bg-soft-white'}`}>
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          PRO Verification Services
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Premium API-based verification and intelligence services
        </p>
      </div>

      <div className={`border border-cyber-teal/20 rounded-lg p-4 ${isDark ? 'bg-muted-graphite' : 'bg-white'}`}>
        <div className="flex space-x-2 flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('phone-prefill-v2')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'phone-prefill-v2'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span className="font-medium">Phone Prefill V2</span>
          </button>
          <button
            onClick={() => setActiveTab('rc')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'rc'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Car className="w-4 h-4" />
            <span className="font-medium">RC</span>
          </button>
          <button
            onClick={() => setActiveTab('imei')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'imei'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="font-medium">IMEI</span>
          </button>
          <button
            onClick={() => setActiveTab('fasttag')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'fasttag'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Car className="w-4 h-4" />
            <span className="font-medium">FastTag</span>
          </button>
          <button
            onClick={() => setActiveTab('cell-id')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'cell-id'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Cell ID</span>
          </button>
          <button
            onClick={() => setActiveTab('recharge-status')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'recharge-status'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="font-medium">Recharge Status Check</span>
          </button>
          <button
            onClick={() => setActiveTab('recharge-expiry')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'recharge-expiry'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="font-medium">Recharge Expiry Check</span>
          </button>
          <button
            onClick={() => setActiveTab('operator-check')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'operator-check'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Search className="w-4 h-4" />
            <span className="font-medium">Operator Check</span>
          </button>
          <button
            onClick={() => setActiveTab('phone-to-credit-business')}
            className={`relative flex items-center space-x-3 py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
              activeTab === 'phone-to-credit-business'
                ? 'bg-gradient-to-r from-neon-magenta to-cyber-teal text-white border-2 border-electric-blue shadow-2xl shadow-electric-blue/40 animate-pulse-slow'
                : isDark
                  ? 'bg-gradient-to-r from-neon-magenta/70 to-cyber-teal/70 text-white border border-electric-blue/50 hover:bg-gradient-to-r hover:from-neon-magenta/90 hover:to-cyber-teal/90'
                  : 'bg-gradient-to-r from-neon-magenta/60 to-cyber-teal/60 text-white border border-electric-blue/40 hover:bg-gradient-to-r hover:from-neon-magenta/80 hover:to-cyber-teal/80'
            } overflow-hidden group`}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-electric-blue/20 to-neon-magenta/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CreditCard className="w-6 h-6 relative z-10" />
            <span className="font-extrabold text-lg relative z-10 tracking-wide">Phone PRO MAX</span>
          </button>
          <button
            onClick={() => setActiveTab('phone-to-udyam')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'phone-to-udyam'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium">Phone to Udyam</span>
          </button>
          <button
            onClick={() => setActiveTab('pan-to-tan')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'pan-to-tan'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Database className="w-4 h-4" />
            <span className="font-medium">Pan To Tan</span>
          </button>
          <button
            onClick={() => setActiveTab('pan-to-insurance-details')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'pan-to-insurance-details'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span className="font-medium">Pan To Insurance Details</span>
          </button>
          <button
            onClick={() => setActiveTab('pan-compliance')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'pan-compliance'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Car className="w-4 h-4" />
            <span className="font-medium">Pan Compliance</span>
          </button>
          <button
            onClick={() => setActiveTab('aml-cft-ndd-search')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'aml-cft-ndd-search'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span className="font-medium">AML/CFT NDD Search</span>
          </button>
          <button
            onClick={() => setActiveTab('pincode-population-search')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'pincode-population-search'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="font-medium">Pincode Population Search</span>
          </button>
          <button
            onClick={() => setActiveTab('fssai-verification-search')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'fssai-verification-search'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Search className="w-4 h-4" />
            <span className="font-medium">FSSAI Verification Search</span>
          </button>
          <button
            onClick={() => setActiveTab('employment-history-search')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'employment-history-search'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="font-medium">Employment History Search</span>
          </button>
          <button
            onClick={() => setActiveTab('employee-pf-verification')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'employee-pf-verification'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Employee PF Verification</span>
          </button>
          <button
            onClick={() => setActiveTab('employee-name-search')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'employee-name-search'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium">Employee Name Search</span>
          </button>
          <button
            onClick={() => setActiveTab('check-dual-employment')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'check-dual-employment'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium">Check Dual Employment</span>
          </button>
          <button
            onClick={() => setActiveTab('fetch-employment-history')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'fetch-employment-history'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium">Fetch Employment History</span>
          </button>
          <button
            onClick={() => setActiveTab('digital-identity-score')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'digital-identity-score'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium">Digital Identity Score</span>
          </button>
          <button
            onClick={() => setActiveTab('domain-verification')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'domain-verification'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium">Domain Verification</span>
          </button>
          <button
            onClick={() => setActiveTab('bank-account-verification')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'bank-account-verification'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium">Bank Account Verification</span>
          </button>
          <button
            onClick={() => setActiveTab('mobile-to-vehicle-rc')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'mobile-to-vehicle-rc'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium">Mobile To Vehicle RC</span>
          </button>
          <button
            onClick={() => setActiveTab('mobile-to-digital-age')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'mobile-to-digital-age'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium">Mobile To Digital Age</span>
          </button>
          <button
            onClick={() => setActiveTab('mobile-to-multiple-upi')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'mobile-to-multiple-upi'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium">Mobile To Multiple UPI</span>
          </button>
          <button
            onClick={() => setActiveTab('mobile-to-pan')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'mobile-to-pan'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium">Mobile To PAN</span>
          </button>
          <button
            onClick={() => setActiveTab('mobile-to-name')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'mobile-to-name'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium">Mobile To Name</span>
          </button>
          <button
            onClick={() => setActiveTab('credit-report-v2')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
              activeTab === 'credit-report-v2'
                ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                : isDark 
                  ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                  : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium">Credit Report V2</span>
          </button>

        </div>
      </div>

      {activeTab === 'phone-prefill-v2' && <PhonePrefillV2 />}
      {activeTab === 'rc' && <RCSearch />}
      {activeTab === 'recharge-status' && <RechargeStatusCheck />}
      {activeTab === 'recharge-expiry' && <RechargeExpiryCheck />}
      {activeTab === 'imei' && renderComingSoon('IMEI Verification', Smartphone)}
      {activeTab === 'fasttag' && renderComingSoon('FastTag Verification', Car)}
      {activeTab === 'cell-id' && renderComingSoon('Cell ID Lookup', MapPin)}
      {activeTab === 'operator-check' && <OperatorCircleCheck />}
      {activeTab === 'phone-to-credit-business' && <PhoneToCreditAndBusinessDetails />}
      {activeTab === 'phone-to-udyam' && <UdyamDetailsSearch />}
      {activeTab === 'pan-to-tan' && <PanToTanSearch />}
      {activeTab === 'pan-to-insurance-details' && <PanToInsuranceDetailsSearch />}
      {activeTab === 'pan-compliance' && <PanComplianceSearch />}
      {activeTab === 'aml-cft-ndd-search' && <AmlCftNddSearch />}
      {activeTab === 'pincode-population-search' && <PincodePopulationSearch />}
      {activeTab === 'fssai-verification-search' && <FssaiVerificationSearch />}
      {activeTab === 'employment-history-search' && <EmploymentHistorySearch />}
      {activeTab === 'employee-pf-verification' && <EmployeePFVerification />}
      {activeTab === 'employee-name-search' && <EmployeeNameSearch />}
      {activeTab === 'check-dual-employment' && <CheckDualEmployment />}
      {activeTab === 'fetch-employment-history' && <FetchEmploymentHistory />}
      {activeTab === 'digital-identity-score' && <DigitalIdentityScore />}
      {activeTab === 'domain-verification' && <DomainVerification />}
      {activeTab === 'bank-account-verification' && <BankAccountVerification />}
      {activeTab === 'mobile-to-vehicle-rc' && <MobileToVehicleRC />}
      {activeTab === 'mobile-to-digital-age' && <MobileToDigitalAge />}
      {activeTab === 'mobile-to-multiple-upi' && <MobileToMultipleUpi />}
      {activeTab === 'mobile-to-pan' && <MobileToPan />}
      {activeTab === 'mobile-to-name' && <MobileToName />}
      {activeTab === 'credit-report-v2' && <CreditReportV2 />}

     
      

     
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={`border border-cyber-teal/20 rounded-lg p-6 hover:shadow-cyber transition-all duration-300 ${isDark ? 'bg-muted-graphite' : 'bg-white'}`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-lg bg-neon-magenta/10 border-neon-magenta/30 text-neon-magenta">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Phone Verification
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Advanced phone intelligence
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Phone Prefill V2</span>
              <span className="text-cyber-teal">{getCreditCost('Phone Prefill V2')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Mobile To Name</span>
              <span className="text-cyber-teal">{getCreditCost('Mobile To Name')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Mobile To PAN</span>
              <span className="text-cyber-teal">{getCreditCost('Mobile To Pan')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Mobile To Multiple UPI</span>
              <span className="text-cyber-teal">{getCreditCost('Mobile To Multiple UPI')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Mobile To Digital Age</span>
              <span className="text-cyber-teal">{getCreditCost('Mobile To Digital Age')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Mobile To Vehicle RC</span>
              <span className="text-cyber-teal">{getCreditCost('Mobile to Vehicle RC')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Credit Report V2</span>
              <span className="text-cyber-teal">{getCreditCost('Credit Report')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Recharge Status Check</span>
              <span className="text-cyber-teal">{getCreditCost('RECHARGE STATUS CHECK')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Recharge Expiry Check</span>
              <span className="text-cyber-teal">{getCreditCost('RECHARGE EXPIRY CHECK')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Operator Circle Check</span>
              <span className="text-cyber-teal">{getCreditCost('OPERATOR CIRCLE CHECK')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Phone To Credit & Business Details</span>
              <span className="text-cyber-teal">{getCreditCost('Phone to Credit and Business Details')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Phone To Udyam Details</span>
              <span className="text-cyber-teal">{getCreditCost('PHONE TO UDYAM DETAILS')}</span>
            </div>
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 hover:shadow-cyber transition-all duration-300 ${isDark ? 'bg-muted-graphite' : 'bg-white'}`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-lg bg-electric-blue/10 border-electric-blue/30 text-electric-blue">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Vehicle Verification
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                RC and vehicle details
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Registration Certificate</span>
              <span className="text-cyber-teal">{getCreditCost('Registration Certificate')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>DIN Verification</span>
              <span className="text-cyber-teal">{getCreditCost('DIN Verification')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Driving License Verification</span>
              <span className="text-cyber-teal">{getCreditCost('DRIVING LICENSE VERIFICATION')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Vehicle Challan Details</span>
              <span className="text-cyber-teal">{getCreditCost('VEHICLE CHALLAN DETAILS')}</span>
            </div>
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 hover:shadow-cyber transition-all duration-300 ${isDark ? 'bg-muted-graphite' : 'bg-white'}`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-lg bg-cyber-teal/10 border-cyber-teal/30 text-cyber-teal">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Document Verification
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                ID and document checks
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Aadhaar OCR Verification</span>
              <span className="text-cyber-teal">{getCreditCost('AADHAAR OCR')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>PAN OCR</span>
              <span className="text-cyber-teal">{getCreditCost('PAN OCR')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>PAN Verification</span>
              <span className="text-cyber-teal">{getCreditCost('PAN VERIFICATION')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>PAN Details</span>
              <span className="text-cyber-teal">{getCreditCost('PAN DETAILS')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>PAN By GST</span>
              <span className="text-cyber-teal">{getCreditCost('PAN BY GST')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Pan To Tan</span>
              <span className="text-cyber-teal">{getCreditCost('Pan To Tan')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Pan To Insurance Details</span>
              <span className="text-cyber-teal">{getCreditCost('Pan To Insurance Details')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Pan Compliance Search</span>
              <span className="text-cyber-teal">{getCreditCost('Pan Compliance Search')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Passport Verification</span>
              <span className="text-cyber-teal">{getCreditCost('PASSPORT VERIFICATION')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Voter ID Verification</span>
              <span className="text-cyber-teal">{getCreditCost('VOTER ID VERIFICATION')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Voter ID 2 Verification</span>
              <span className="text-cyber-teal">{getCreditCost('VOTER ID 2 VERIFICATION')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>GST Verification</span>
              <span className="text-cyber-teal">{getCreditCost('GST VERIFICATION')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>GST Advance</span>
              <span className="text-cyber-teal">{getCreditCost('GST ADVANCE')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>MCA CIN</span>
              <span className="text-cyber-teal">{getCreditCost('MCA CIN')}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>MCA Company</span>
              <span className="text-cyber-teal">{getCreditCost('MCA COMPANY')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
