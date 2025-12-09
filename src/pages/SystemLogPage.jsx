// src/pages/SystemLogPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig';
import {
  AlertTriangle,
  Server,
  Loader2,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { useConfirm } from '../context/ConfirmContext';

// Log Item Component
const LogItem = ({ log }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const getLevelConfig = () => {
    switch (log.level) {
      case 'ERROR':
        return {
          icon: <AlertTriangle className="text-red-600" size={20} />,
          bg: 'bg-red-50',
          border: 'border-red-200',
        };
      case 'WARN':
        return {
          icon: <AlertTriangle className="text-yellow-600" size={20} />,
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
        };
      default:
        return {
          icon: <Server className="text-gray-600" size={20} />,
          bg: 'bg-gray-50',
          border: 'border-gray-200',
        };
    }
  };

  const config = getLevelConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden`}
    >
      {/* Clickable Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 flex items-center justify-between"
      >
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0">{config.icon}</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-primary truncate" title={log.message}>
              {log.message}
            </p>
            <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
              <span className="font-medium bg-white px-2 py-0.5 rounded border border-gray-200">
                {log.route || 'N/A'}
              </span>
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{format(new Date(log.createdAt), 'MMM dd, yyyy h:mm a')}</span>
              </div>
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="ml-4"
        >
          <ChevronDown size={20} className="text-gray-500" />
        </motion.div>
      </button>

      {/* Expandable Stack Trace */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-gray-200 bg-white">
              <h4 className="text-sm font-semibold text-primary mb-2">Error Stack Trace:</h4>
              <pre className="text-xs text-gray-700 bg-gray-100 p-3 rounded-md overflow-x-auto">
                {log.stack || 'No stack trace available.'}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


// Main Page Component
const SystemLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { confirm } = useConfirm();

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/system-logs');
      setLogs(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch system logs');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleClearLogs = async () => {
    const confirmed = await confirm({
      title: 'Clear All System Logs?',
      description: 'This will permanently delete all 100 recent error logs. This action cannot be undone.',
      confirmText: 'Yes, Clear Logs',
      danger: true,
    });

    if (confirmed) {
      try {
        await api.delete('/system-logs/clear');
        setLogs([]); // Optimistically clear logs from UI
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to clear logs');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Server className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-2">System Logs</h1>
            <p className="text-gray-600">Review recent application errors and warnings</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 font-medium shadow-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleClearLogs}
            disabled={loading || logs.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all duration-200 font-medium shadow-sm"
          >
            <Trash2 size={16} />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertTriangle className="text-red-500 mb-4" size={40} />
            <h3 className="text-lg font-semibold text-red-800">Failed to load logs</h3>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Server className="text-gray-300 mb-4" size={40} />
            <h3 className="text-lg font-semibold text-primary">All Systems Clear</h3>
            <p className="text-gray-500 mt-2">No system errors have been logged. Great job!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map(log => (
              <LogItem key={log._id} log={log} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SystemLogPage;
