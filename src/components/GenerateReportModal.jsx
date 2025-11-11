import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { User, Calendar, Loader2, Clipboard, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GenerateReportModal = ({ isOpen, onClose, teamId, teamName }) => {
  const { user } = useAuth();
  const [leaderName, setLeaderName] = useState(user.username || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null); // This will store the AI-generated text
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await api.post(`/teams/${teamId}/generate-report`, {
        leaderName,
        startDate,
        endDate,
      });
      setReport(res.data.report);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setReport(null);
    setError(null);
    setLoading(false);
    setStartDate('');
    setEndDate('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Generate Report for ${teamName}`}>
      {!report && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Input
            icon={<User size={18} className="text-gray-400" />}
            type="text"
            placeholder="Your Name (for the report)"
            value={leaderName}
            onChange={(e) => setLeaderName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              icon={<Calendar size={18} className="text-gray-400" />}
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              icon={<Calendar size={18} className="text-gray-400" />}
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="animate-spin" size={18} />
                <span>Generating AI Summary...</span>
              </div>
            ) : (
              'Generate Report'
            )}
          </motion.button>
        </form>
      )}

      {report && !loading && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Report is Ready</h3>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-80 overflow-y-auto">
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{report}</p>
          </div>
          <motion.button
            onClick={handleCopy}
            className="w-full bg-green-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {copied ? (
              <Check size={18} />
            ) : (
              <Clipboard size={18} />
            )}
            <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
          </motion.button>
        </div>
      )}
    </Modal>
  );
};

export default GenerateReportModal;
