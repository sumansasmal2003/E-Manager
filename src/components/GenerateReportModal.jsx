import React, { useState, useRef } from 'react';
import Modal from './Modal';
import Input from './Input';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { User, Calendar, Loader2, Clipboard, Check, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';

const GenerateReportModal = ({ isOpen, onClose, teamId, teamName }) => {
  const { user } = useAuth();
  const [leaderName, setLeaderName] = useState(user.username || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [copied, setCopied] = useState(false);

  const reportContentRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReport(null);
    setCopied(false);

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
    if (!report) return;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!report) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = { top: 20, left: 20, right: 20, bottom: 20 };
    const pageMaxY = pdf.internal.pageSize.getHeight() - margin.bottom;
    const pageMaxWidth = pdf.internal.pageSize.getWidth() - margin.left - margin.right;

    let yPos = margin.top;

    const addText = (text, options) => {
      pdf.setFont(options.font || 'helvetica', options.style || 'normal');
      pdf.setFontSize(options.size || 10);

      const lines = pdf.splitTextToSize(text, pageMaxWidth);

      lines.forEach(line => {
        if (yPos + options.size / 2.8 > pageMaxY) {
          pdf.addPage();
          yPos = margin.top;
        }
        pdf.text(line, margin.left, yPos);
        yPos += (options.size / 2.8) * 1.2;
      });
    };

    const reportLines = report.split('\n');

    reportLines.forEach(line => {
      if (line.startsWith('# ')) {
        addText(line.substring(2), { size: 18, style: 'bold' });
        yPos += 3;
      } else if (line.startsWith('## ')) {
        addText(line.substring(3), { size: 14, style: 'bold' });
        yPos += 2;
      } else if (line.startsWith('### ')) {
        addText(line.substring(4), { size: 12, style: 'bold' });
        yPos += 1;
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        const bulletText = line.substring(2);
        addText(`• ${bulletText}`, { size: 10 });
      } else if (line.trim() === '') {
        yPos += 5;
      } else {
        addText(line, { size: 10 });
      }
    });

    pdf.save(`Report-${teamName}-${startDate}.pdf`);
  };

  const handleClose = () => {
    setReport(null);
    setError(null);
    setLoading(false);
    setStartDate('');
    setEndDate('');
    setCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Generate Report - ${teamName}`}>
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
            placeholder="Team Leader Name"
            value={leaderName}
            onChange={(e) => setLeaderName(e.target.value)}
            required
            autoComplete="off"
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
            className="w-full bg-gray-900 text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="animate-spin" size={18} />
                <span>Generating Report...</span>
              </div>
            ) : (
              'Generate Report'
            )}
          </motion.button>
        </form>
      )}

      {report && !loading && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Report Generated Successfully</h3>
            <p className="text-sm text-gray-600">Review your team report below</p>
          </div>

          <div className="border border-gray-200 rounded-lg bg-gray-50">
            <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Report Preview</span>
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            <div
              ref={reportContentRef}
              className="prose prose-sm max-w-none p-6 bg-white max-h-80 overflow-y-auto"
            >
              <ReactMarkdown>
                {report}
              </ReactMarkdown>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              onClick={handleCopy}
              className="flex-1 bg-white border border-gray-300 text-gray-900 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {copied ? (
                <Check size={18} className="text-green-600" />
              ) : (
                <Clipboard size={18} className="text-gray-600" />
              )}
              <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
            </motion.button>

            <motion.button
              onClick={handleDownloadPDF}
              className="flex-1 bg-gray-900 text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download size={18} />
              <span>Download PDF</span>
            </motion.button>
          </div>

          <div className="text-center">
            <button
              onClick={handleClose}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default GenerateReportModal;
