import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import {
  Loader2,
  Mail,
  Send,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  AlertTriangle,
  Eye,
  Clock,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import CustomSelect from '../components/CustomSelect'; // <-- 1. IMPORT CUSTOM SELECT

// --- 2. DEFINE OPTIONS FOR CUSTOM SELECT ---
const filterOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
  { value: 'pending', label: 'Pending' },
];

const NotificationPage = () => {
  // ... (all state and hooks remain the same) ...
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await api.get('/notifications');
      setLogs(res.data);
      if (!selectedLog && res.data.length > 0 && window.innerWidth >= 1024) {
        setSelectedLog(res.data[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notification logs');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedLog]);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ... (filteredLogs, getStatusIcon, getStatusBadge, stats, loading, and error blocks remain the same) ...
  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.toEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.memberName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      log.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'sent':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      default:
        return <AlertTriangle size={16} className="text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status?.toLowerCase()) {
      case 'sent':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const stats = {
    total: logs.length,
    sent: logs.filter(log => log.status?.toLowerCase() === 'sent').length,
    failed: logs.filter(log => log.status?.toLowerCase() === 'failed').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="animate-spin text-gray-900" size={40} />
        <p className="text-gray-600">Loading notification logs...</p>
      </div>
    );
  }

  if (error && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 p-8">
        <AlertTriangle size={48} className="text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load notifications</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchLogs}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        {/* ... (Header content remains the same) ... */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Notifications</h1>
            <p className="text-gray-600">Monitor and review all sent email communications</p>
          </div>
          <button
            onClick={fetchLogs}
            disabled={refreshing}
            className="mt-4 lg:mt-0 flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
        {/* ... (Stats content remains the same) ... */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Emails</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900">{stats.sent}</div>
            <div className="text-sm text-green-700">Successful</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-900">{stats.failed}</div>
            <div className="text-sm text-red-700">Failed</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Email List Panel */}
        <div className={`lg:col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col
                         ${selectedLog ? 'hidden lg:flex' : 'flex'}`}
        >
          {/* Panel Header */}
          <div className="p-4 border-b border-gray-200">
            {/* ... (Panel Header title/count remains the same) ... */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Sent Emails</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {filteredLogs.length}
              </span>
            </div>

            {/* Search and Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {/* --- 3. REPLACE <select> WITH <CustomSelect> --- */}
              <div className="flex space-x-2">
                <CustomSelect
                  icon={Filter}
                  options={filterOptions}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                />
              </div>
              {/* --- END REPLACEMENT --- */}

            </div>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto">
            {/* ... (Email list logic remains the same) ... */}
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Mail size={40} className="text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No emails found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'No emails have been sent yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <button
                    key={log._id}
                    onClick={() => setSelectedLog(log)}
                    className={`w-full text-left p-4 transition-all duration-200 ${
                      selectedLog?._id === log._id
                        ? 'bg-gray-900 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {getStatusIcon(log.status)}
                        <span className={`text-sm font-medium truncate ${
                          selectedLog?._id === log._id ? 'text-white' : 'text-gray-900'
                        }`}>
                          {log.subject || 'No Subject'}
                        </span>
                      </div>
                      <ChevronRight
                        size={16}
                        className={`flex-shrink-0 ${
                          selectedLog?._id === log._id ? 'text-white' : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className={`text-xs truncate ${
                        selectedLog?._id === log._id ? 'text-gray-200' : 'text-gray-600'
                      }`}>
                        To: {log.toEmail}
                      </p>
                      {log.memberName && (
                        <div className="flex items-center space-x-1">
                          <User size={12} className={selectedLog?._id === log._id ? 'text-gray-300' : 'text-gray-400'} />
                          <span className={`text-xs ${
                            selectedLog?._id === log._id ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            {log.memberName}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={getStatusBadge(log.status)}>
                          {log.status || 'Unknown'}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} className={selectedLog?._id === log._id ? 'text-gray-300' : 'text-gray-400'} />
                          <span className={`text-xs ${
                            selectedLog?._id === log._id ? 'text-gray-300' : 'text-gray-400'
                          }`}>
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email Preview Panel */}
        <div className={`lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col
                         ${selectedLog ? 'flex' : 'hidden lg:flex'}`}
        >
          {/* ... (Email Preview Panel remains the same) ... */}
          {selectedLog ? (
            <>
              {/* Preview Header */}
              <div className="p-6 border-b border-gray-200 space-y-4">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="lg:hidden flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 font-medium mb-2"
                >
                  <ArrowLeft size={16} />
                  <span>Back to List</span>
                </button>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
                      {selectedLog.subject || 'No Subject'}
                    </h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">To:</span>
                        <span className="font-medium text-gray-900 ml-1">{selectedLog.toEmail}</span>
                      </div>
                      {selectedLog.memberName && (
                        <div>
                          <span className="text-gray-600">Member:</span>
                          <span className="font-medium text-gray-900 ml-1">{selectedLog.memberName}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Sent:</span>
                        <span className="font-medium text-gray-900 ml-1">
                          {format(new Date(selectedLog.createdAt), 'PPpp')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={getStatusBadge(selectedLog.status) + ' ml-4'}>
                    {selectedLog.status}
                  </div>
                </div>

                {selectedLog.status?.toLowerCase() === 'failed' && selectedLog.error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-800 mb-1">
                      <AlertTriangle size={16} />
                      <span className="font-medium">Delivery Failed</span>
                    </div>
                    <p className="text-red-700 text-sm">{selectedLog.error}</p>
                  </div>
                )}
              </div>

              {/* Email Content */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="border-b border-gray-200 px-6 py-3 bg-gray-50">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Eye size={16} />
                    <span>Email Preview</span>
                  </div>
                </div>

                {selectedLog.html ? (
                  <iframe
                    srcDoc={selectedLog.html}
                    title="Email Preview"
                    className="w-full flex-1 border-none"
                    sandbox="allow-same-origin"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <Mail size={48} className="text-gray-300 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Content Available</h4>
                    <p className="text-gray-500">
                      This email doesn't have any HTML content to display.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <Send size={64} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Select an Email
              </h3>
              <p className="text-gray-500 max-w-md">
                Choose an email from the list to view its content, delivery status, and recipient information.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Banner (if any error but data exists) */}
      {error && logs.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 text-yellow-800">
            <AlertTriangle size={16} />
            <span className="text-sm">Data may be outdated: {error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
