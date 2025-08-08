import React, { useState } from 'react';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  Download,
  AlertCircle,
  User,
  Mail,
  Phone,
  FileText,
  DollarSign,
  Save,
  X
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { StatusBadge } from '../components/UI/StatusBadge';
import toast from 'react-hot-toast';
import { ManualRequest } from '../lib/supabase';

export const ManualRequests: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { manualRequests, updateManualRequest, officers, addTransaction, updateOfficer, isLoading } = useSupabaseData(); // Added updateOfficer

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ManualRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [creditsToDeduct, setCreditsToDeduct] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminResponseText, setAdminResponseText] = useState(''); // For admin response in modal

  const filteredRequests = manualRequests.filter((request) => {
    const officerName = request.officers?.name || '';
    const matchesSearch =
      request.input_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (request: ManualRequest) => {
    setSelectedRequest(request);
    setAdminResponseText(request.admin_response || ''); // Pre-fill admin response if exists
    setCreditsToDeduct(request.credit_deducted || 0); // Pre-fill credits if exists
    setShowDetailsModal(true);
  };

  const handleApproveRequest = (request: ManualRequest) => {
    setSelectedRequest(request);
    setCreditsToDeduct(0); // Reset credits for new approval
    setAdminResponseText(''); // Reset admin response
    setShowApproveModal(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedRequest || creditsToDeduct <= 0) {
      toast.error('Please enter a valid credit amount to deduct.');
      return;
    }

    const officer = officers.find(o => o.id === selectedRequest.officer_id);
    if (!officer) {
      toast.error('Officer not found for this request.');
      return;
    }

    if (officer.credits_remaining < creditsToDeduct) {
      toast.error(`Insufficient credits. Officer has ${officer.credits_remaining} but ${creditsToDeduct} are required.`);
      return;
    }

    setIsProcessing(true);
    try {
      // Update the manual request status and admin response
      await updateManualRequest(selectedRequest.id, {
        status: 'approved',
        admin_response: adminResponseText.trim() || `Approved. ${creditsToDeduct} credits deducted.`,
        credit_deducted: creditsToDeduct,
        approved_by: user?.id, // Corrected: Use user.id (UUID) instead of user.name
        approved_at: new Date().toISOString()
      });

      toast.success('Manual request approved and credits deducted!');
    } catch (error: any) {
      console.error('Error approving manual request:', error);
      toast.error(`Failed to approve request: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setShowApproveModal(false);
      setSelectedRequest(null);
      setCreditsToDeduct(0);
      setAdminResponseText('');
    }
  };

  const handleRejectRequest = (request: ManualRequest) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setAdminResponseText(''); // Reset admin response
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }

    setIsProcessing(true);
    try {
      await updateManualRequest(selectedRequest.id, {
        status: 'rejected',
        admin_response: rejectionReason.trim(),
        credit_deducted: 0, // No credits deducted on rejection
        approved_by: user?.id, // Corrected: Use user.id (UUID) instead of user.name
        approved_at: new Date().toISOString()
      });
      toast.success('Manual request rejected!');
    } catch (error: any) {
      console.error('Error rejecting manual request:', error);
      toast.error(`Failed to reject request: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      setAdminResponseText('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-cyber-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 min-h-screen ${isDark ? 'bg-crisp-black' : 'bg-soft-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Manual Requests
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Review and manage manual data requests from officers
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => toast.info('Export functionality coming soon!')}
            className="bg-electric-blue/20 text-electric-blue px-4 py-2 rounded-lg hover:bg-electric-blue/30 transition-all duration-200 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${isDark ? 'bg-muted-graphite' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Requests
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {manualRequests.length}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-cyber-teal" />
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${isDark ? 'bg-muted-graphite' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Pending Review
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {manualRequests.filter((r) => r.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${isDark ? 'bg-muted-graphite' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Approved
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {manualRequests.filter((r) => r.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${isDark ? 'bg-muted-graphite' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Rejected
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {manualRequests.filter((r) => r.status === 'rejected').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`border border-cyber-teal/20 rounded-lg p-4 ${isDark ? 'bg-muted-graphite' : 'bg-white'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            <input
              type="text"
              placeholder="Search by officer, input value, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent ${
                isDark ? 'bg-crisp-black text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
              isDark ? 'bg-crisp-black text-white' : 'bg-white text-gray-900'
            }`}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <button className="px-3 py-2 bg-cyber-teal/20 text-cyber-teal rounded-lg hover:bg-cyber-teal/30 transition-colors flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Advanced Filters</span>
          </button>
        </div>
      </div>

      {/* Manual Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare
              className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
            />
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No Manual Requests Found
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              No manual requests found matching your criteria.
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className={`border border-cyber-teal/20 rounded-lg p-6 ${
                isDark ? 'bg-muted-graphite' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {request.input_type}: {request.input_value}
                    </h3>
                    <StatusBadge status={request.status} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-cyber-teal" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Officer: {request.officers?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-cyber-teal" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email: {request.officers?.email || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-cyber-teal" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Mobile: {request.officers?.mobile || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-cyber-teal" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Requested: {new Date(request.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="mt-3">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Notes:
                      </span>
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {request.notes}
                      </p>
                    </div>
                  )}

                  {request.admin_response && (
                    <div className="mt-3">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Admin Response:
                      </span>
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {request.admin_response}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => handleViewDetails(request)}
                    className={`p-2 rounded transition-colors ${
                      isDark ? 'text-gray-400 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
                    }`}
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproveRequest(request)}
                        disabled={isProcessing}
                        className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all duration-200 disabled:opacity-50"
                        title="Approve Request"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request)}
                        disabled={isProcessing}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-200 disabled:opacity-50"
                        title="Reject Request"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-lg p-6 ${isDark ? 'bg-muted-graphite border border-cyber-teal/20' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Request Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className={`p-2 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <p><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Officer:</span> {selectedRequest.officers?.name || 'N/A'}</p>
              <p><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Input Type:</span> {selectedRequest.input_type}</p>
              <p><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Input Value:</span> {selectedRequest.input_value}</p>
              <p><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Notes:</span> {selectedRequest.notes || 'N/A'}</p>
              <p><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Status:</span> <StatusBadge status={selectedRequest.status} /></p>
              {selectedRequest.admin_response && <p><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Admin Response:</span> {selectedRequest.admin_response}</p>}
              {selectedRequest.credit_deducted !== null && <p><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Credits Deducted:</span> {selectedRequest.credit_deducted}</p>}
              {selectedRequest.approved_by && <p><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Approved By:</span> {selectedRequest.approved_by}</p>}
              <p><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Requested At:</span> {new Date(selectedRequest.created_at).toLocaleString()}</p>
              {selectedRequest.approved_at && <p><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Processed At:</span> {new Date(selectedRequest.approved_at).toLocaleString()}</p>}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-cyber-gradient text-white rounded-lg hover:shadow-cyber transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-lg p-6 ${isDark ? 'bg-muted-graphite border border-cyber-teal/20' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Approve Manual Request
              </h3>
              <button
                onClick={() => setShowApproveModal(false)}
                className={`p-2 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Approve the request for "{selectedRequest.input_type}: {selectedRequest.input_value}" by{' '}
              {selectedRequest.officers?.name || 'N/A'}.
            </p>
            <div className="mb-4">
              <label htmlFor="creditsToDeduct" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Credits to Deduct *
              </label>
              <input
                id="creditsToDeduct"
                type="number"
                value={creditsToDeduct}
                onChange={(e) => setCreditsToDeduct(parseFloat(e.target.value))}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${isDark ? 'bg-crisp-black text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                placeholder="Enter credits"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="adminResponseText" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Admin Response (Optional)
              </label>
              <textarea
                id="adminResponseText"
                value={adminResponseText}
                onChange={(e) => setAdminResponseText(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal resize-none ${isDark ? 'bg-crisp-black text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                placeholder="Add any notes for the officer..."
              />
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowApproveModal(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                disabled={isProcessing || creditsToDeduct <= 0}
                className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all duration-200 disabled:opacity-50"
              >
                {isProcessing ? 'Approving...' : 'Confirm Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-lg p-6 ${isDark ? 'bg-muted-graphite border border-cyber-teal/20' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Reject Manual Request
              </h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className={`p-2 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Provide a reason for rejecting the request for "{selectedRequest.input_type}: {selectedRequest.input_value}" by{' '}
              {selectedRequest.officers?.name || 'N/A'}:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal resize-none ${isDark ? 'bg-crisp-black text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
              placeholder="Reason for rejection..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-200 disabled:opacity-50"
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
            </div>
        </div>
      )}
    </div>
  );
};
