// src/pages/NotificationPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import {
  Loader2, Mail, Send, CheckCircle, XCircle, User, Calendar,
  AlertTriangle, Eye, Clock, ChevronRight, ArrowLeft, Zap,
  Inbox, FileText, Check, Users
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import CustomMultiSelect from '../components/CustomMultiSelect';
import { Editor } from '@tinymce/tinymce-react';
import AiDraftModal from '../components/AiDraftModal';

// Enhanced Log Item Component
const LogItem = ({ log, onClick, isSelected }) => (
  <motion.button
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    onClick={onClick}
    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
      isSelected
        ? 'bg-gray-900 text-white border-gray-900'
        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
    }`}
  >
    <div className="flex items-start justify-between mb-2">
      <span className={`text-sm font-medium line-clamp-2 ${
        isSelected ? 'text-white' : 'text-gray-900'
      }`}>
        {log.subject || 'No Subject'}
      </span>
      {log.status?.toLowerCase() === 'sent' ? (
        <CheckCircle size={16} className="text-green-500 flex-shrink-0 ml-2" />
      ) : (
        <XCircle size={16} className="text-red-500 flex-shrink-0 ml-2" />
      )}
    </div>

    <div className={`text-xs mb-2 line-clamp-1 ${
      isSelected ? 'text-gray-300' : 'text-gray-600'
    }`}>
      To: {log.toEmail}
    </div>

    <div className="flex items-center justify-between">
      <span className={`text-xs ${
        isSelected ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
      </span>
      {!isSelected && (
        <ChevronRight size={14} className="text-gray-400" />
      )}
    </div>
  </motion.button>
);

// Main Page Component
const NotificationPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for Compose View
  const [view, setView] = useState('compose');
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(null);
  const [sendError, setSendError] = useState(null);

  // Mobile state
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [logsRes, membersRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/attendance/members')
      ]);
      setLogs(logsRes.data);
      setMembers(membersRes.data.map(m => m.name));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle AI Draft Generation
  const handleDraftWithAI = async (userPrompt) => {
    setIsDrafting(true);
    setSendError(null);
    try {
      const res = await api.post('/emails/draft', {
        userPrompt,
        memberNames: selectedMembers,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setSubject(res.data.subject);
      setBody(res.data.body);
    } catch (err) {
      setSendError(err.response?.data?.message || 'Failed to generate AI draft');
    }
    setIsDrafting(false);
  };

  // Handle Send Email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setSendError(null);
    setSendSuccess(null);
    try {
      const res = await api.post('/emails/send', {
        subject,
        body,
        memberNames: selectedMembers,
      });
      setSendSuccess(res.data.message);
      // Clear form
      setSubject('');
      setBody('');
      setSelectedMembers([]);
      fetchData();
    } catch (err) {
      setSendError(err.response?.data?.message || 'Failed to send email');
    }
    setIsSending(false);
  };

  // Handle log selection (mobile)
  const handleLogSelect = (log) => {
    setSelectedLog(log);
    setShowMobilePreview(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AiDraftModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onDraft={handleDraftWithAI}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <Mail className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Email Notifications</h1>
                <p className="text-gray-600 text-sm">Communicate with your team</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">

          {/* Left Panel - Compose & Log */}
          <div className={`lg:col-span-1 space-y-4 ${
            showMobilePreview ? 'hidden lg:block' : 'block'
          }`}>

            {/* View Toggle */}
            <div className="bg-white rounded-lg border border-gray-200 p-1">
              <div className="flex">
                <button
                  onClick={() => setView('compose')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    view === 'compose'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText size={16} />
                  Compose
                </button>
                <button
                  onClick={() => setView('log')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    view === 'log'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Inbox size={16} />
                  Sent Log
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-lg border border-gray-200">
              {view === 'compose' ? (
                // COMPOSE VIEW
                <form onSubmit={handleSendEmail} className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipients
                    </label>
                    <CustomMultiSelect
                      icon={Users}
                      options={members}
                      value={selectedMembers}
                      onChange={setSelectedMembers}
                      placeholder="Select team members..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Email subject line"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Message
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAiModalOpen(true)}
                        disabled={isDrafting}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-50 hover:text-white disabled:opacity-50 bg-gray-900 px-2 py-1.5 rounded-full cursor-pointer"
                      >
                        {isDrafting ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Zap size={12} />
                        )}
                        AI Draft
                      </button>
                    </div>
                    <Editor
                      apiKey='btbqthaaki8gu807fixqn8vbiv7peb7wcoml3q320qnkfedf'
                      value={body}
                      onEditorChange={(newValue) => setBody(newValue)}
                      init={{
                        height: 200,
                        menubar: false,
                        plugins: ['lists', 'link', 'autolink', 'wordcount'],
                        toolbar: 'undo redo | bold italic | bullist numlist | link',
                        content_style: 'body { font-family:Inter,sans-serif; font-size:14px; color:#374151; }',
                        statusbar: false,
                        branding: false
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Use <code className="bg-gray-100 px-1 rounded">{'{MEMBER_NAME}'}</code> to personalize emails
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSending || !subject || !body || selectedMembers.length === 0}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {isSending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    <span>
                      {isSending ? 'Sending...' : `Send to ${selectedMembers.length} recipient${selectedMembers.length !== 1 ? 's' : ''}`}
                    </span>
                  </button>

                  <AnimatePresence>
                    {sendSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
                      >
                        {sendSuccess}
                      </motion.div>
                    )}
                    {sendError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                      >
                        {sendError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              ) : (
                // LOG VIEW
                <div className="p-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="animate-spin text-gray-400" size={24} />
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Inbox size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No emails sent yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {logs.map(log => (
                        <LogItem
                          key={log._id}
                          log={log}
                          onClick={() => handleLogSelect(log)}
                          isSelected={selectedLog?._id === log._id}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className={`lg:col-span-2 ${
            showMobilePreview ? 'block' : 'hidden lg:block'
          }`}>
            <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
              {selectedLog ? (
                <>
                  {/* Preview Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => {
                          setSelectedLog(null);
                          setShowMobilePreview(false);
                        }}
                        className="lg:hidden flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                      >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                      </button>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Eye size={16} />
                        <span>Email Preview</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                          {selectedLog.subject}
                        </h2>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>To: {selectedLog.toEmail}</span>
                          <span>•</span>
                          <span>{format(new Date(selectedLog.createdAt), 'MMM dd, yyyy • h:mm a')}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedLog.status?.toLowerCase() === 'sent'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedLog.status?.toLowerCase() === 'sent' ? (
                            <CheckCircle size={12} className="mr-1" />
                          ) : (
                            <XCircle size={12} className="mr-1" />
                          )}
                          {selectedLog.status}
                        </div>
                      </div>

                      {selectedLog.status?.toLowerCase() === 'failed' && selectedLog.error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-red-700">
                              <div className="font-medium">Delivery Failed</div>
                              <div className="mt-1">{selectedLog.error}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email Content */}
                  <div className="flex-1 min-h-0">
                    <iframe
                      srcDoc={selectedLog.html}
                      title="Email Preview"
                      className="w-full h-full border-none"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <Inbox size={48} className="text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select an Email
                  </h3>
                  <p className="text-gray-500 text-sm max-w-sm">
                    Choose an email from the sent log to view its content and delivery status.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
