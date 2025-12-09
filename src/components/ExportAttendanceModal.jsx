// src/components/ExportAttendanceModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import api from '../api/axiosConfig';
import { Loader2, Download, User, Calendar, Check, X, FileText, Table } from 'lucide-react';
import { motion } from 'framer-motion';

// Import PDF libraries
import jsPDF from 'jspdf';

// Helper to build the CSV content (Unchanged)
const buildCSV = (records) => {
  const headers = ['Date', 'Member', 'Status'];
  const csvData = records.map(record => [
    formatForReport(record.date),
    record.member,
    record.status
  ]);

  return [headers, ...csvData]
    .map(row => row.map(str => `"${str}"`).join(','))
    .join('\n');
};

// Helper to trigger the download
const triggerDownload = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Generate mock data for testing
const generateMockData = (startDate, endDate, selectedMembers) => {
  const records = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const statuses = ['Present', 'Absent', 'Leave', 'Holiday'];

  // Generate data for each day in the range
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    selectedMembers.forEach(memberName => {
      // Skip weekends for more realistic data
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip Sunday (0) and Saturday (6)
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        records.push({
          date: date.toISOString().split('T')[0],
          member: memberName,
          status: randomStatus
        });
      }
    });
  }

  return records;
};

// --- UPDATED: Member-wise PDF generation ---
const buildPDF = (records, startDate, endDate, selectedMembers) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  // Colors
  const colors = {
    primary: [31, 41, 55],    // Gray 800
    secondary: [107, 114, 128], // Gray 500
    success: [16, 185, 129],  // Green 500
    warning: [245, 158, 11],  // Amber 500
    danger: [239, 68, 68],    // Red 500
    info: [59, 130, 246],     // Blue 500
    lightBg: [249, 250, 251], // Gray 50
    white: [255, 255, 255]
  };

  // Helper: Draw rounded rectangle
  const drawRoundedRect = (x, y, width, height, radius, color) => {
    pdf.setFillColor(...color);
    pdf.roundedRect(x, y, width, height, radius, radius, 'F');
  };

  // 1. Group records by member
  const recordsByMember = {};
  records.forEach(r => {
    if (!recordsByMember[r.member]) recordsByMember[r.member] = [];
    recordsByMember[r.member].push(r);
  });

  // Sort members alphabetically
  const sortedMembers = Object.keys(recordsByMember).sort();

  // Iterate through each member
  sortedMembers.forEach((member, mIndex) => {
    // Add new page for subsequent members
    if (mIndex > 0) pdf.addPage();

    let yPosition = margin;

    // --- Header for this Member ---
    drawRoundedRect(0, 0, pageWidth, 50, 0, colors.primary);

    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.white);
    pdf.text(member.toUpperCase(), pageWidth / 2, 20, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(200, 200, 200);
    pdf.text(`Attendance Report: ${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`, pageWidth / 2, 30, { align: 'center' });

    yPosition = 60;

    // --- Member Stats ---
    const memberRecords = recordsByMember[member];
    // Sort by date
    memberRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

    const stats = calculateStatistics(memberRecords);
    const totalDays = memberRecords.length;
    const attendanceRate = totalDays > 0 ? ((stats.Present / totalDays) * 100).toFixed(1) : 0;

    // Draw Stats Row
    const statBoxWidth = (pageWidth - (2 * margin) - 15) / 4;

    const statConfigs = [
      { label: 'Present', value: stats.Present, color: colors.success },
      { label: 'Absent', value: stats.Absent, color: colors.danger },
      { label: 'Leave', value: stats.Leave, color: colors.warning },
      { label: 'Rate', value: `${attendanceRate}%`, color: colors.primary }
    ];

    statConfigs.forEach((stat, idx) => {
      const x = margin + idx * (statBoxWidth + 5);

      // Box
      drawRoundedRect(x, yPosition, statBoxWidth, 20, 4, colors.lightBg);

      // Label
      pdf.setFontSize(8);
      pdf.setTextColor(...colors.secondary);
      pdf.text(stat.label.toUpperCase(), x + 5, yPosition + 8);

      // Value
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...stat.color);
      pdf.text(stat.value.toString(), x + 5, yPosition + 16);
    });

    yPosition += 30;

    // --- Table Header ---
    const tableWidth = pageWidth - 2 * margin;
    const colDateWidth = tableWidth * 0.4;
    const colStatusWidth = tableWidth * 0.6;

    drawRoundedRect(margin, yPosition, tableWidth, 8, 2, colors.primary);
    pdf.setFontSize(9);
    pdf.setTextColor(...colors.white);
    pdf.setFont('helvetica', 'bold');

    pdf.text('DATE', margin + 10, yPosition + 5.5);
    pdf.text('STATUS', margin + colDateWidth + 10, yPosition + 5.5);

    yPosition += 10;

    // --- Table Rows ---
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);

    memberRecords.forEach((record, index) => {
      // Check for page break
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;

        // Re-draw header on new page
        drawRoundedRect(margin, yPosition, tableWidth, 8, 2, colors.primary);
        pdf.setTextColor(...colors.white);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DATE', margin + 10, yPosition + 5.5);
        pdf.text('STATUS', margin + colDateWidth + 10, yPosition + 5.5);
        yPosition += 10;
        pdf.setFont('helvetica', 'normal');
      }

      // Zebra striping
      if (index % 2 === 0) {
        drawRoundedRect(margin, yPosition - 2, tableWidth, 6, 1, colors.lightBg);
      }

      const dateStr = formatForReport(record.date);
      const status = record.status;

      // Status Color
      let statusColor = colors.primary;
      if (status === 'Present') statusColor = colors.success;
      if (status === 'Absent') statusColor = colors.danger;
      if (status === 'Leave') statusColor = colors.warning;
      if (status === 'Holiday') statusColor = colors.info;

      pdf.setTextColor(...colors.primary);
      pdf.text(dateStr, margin + 10, yPosition + 2);

      pdf.setTextColor(...statusColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text(status, margin + colDateWidth + 10, yPosition + 2);
      pdf.setFont('helvetica', 'normal');

      yPosition += 7;
    });

    // Footer for Member
    const footerY = pageHeight - 10;
    pdf.setFontSize(7);
    pdf.setTextColor(...colors.secondary);
    pdf.text(`Page ${pdf.internal.getNumberOfPages()} • E-Manager Report`, pageWidth / 2, footerY, { align: 'center' });
  });

  return pdf.output('blob');
};

// Helper function to calculate statistics
const calculateStatistics = (records) => {
  const stats = {
    Present: 0,
    Absent: 0,
    Leave: 0,
    Holiday: 0
  };

  records.forEach(record => {
    if (stats[record.status] !== undefined) {
      stats[record.status]++;
    }
  });

  return stats;
};

// Format date for display
const formatDateForDisplay = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const ExportAttendanceModal = ({ isOpen, onClose, members }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMembers, setSelectedMembers] = useState(new Set());
  const [exportFormat, setExportFormat] = useState('PDF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  // Pre-select all members when modal opens
  useEffect(() => {
    if (isOpen && members.length > 0) {
      setSelectedMembers(new Set(members.map(m => m.name)));
      setError(null);
      setSuccess(false);

      // Set default date range to last 30 days
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);

      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  }, [members, isOpen]);

  const handleMemberToggle = (name) => {
    setSelectedMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  const setAllMembers = (select) => {
    if (select) {
      setSelectedMembers(new Set(members.map(m => m.name)));
    } else {
      setSelectedMembers(new Set());
    }
  };

  const handleExport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      setLoading(false);
      return;
    }

    if (selectedMembers.size === 0) {
      setError('Please select at least one team member.');
      setLoading(false);
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('End date cannot be before start date.');
      setLoading(false);
      return;
    }

    try {
      let records = [];

      if (useMockData) {
        // Use mock data for testing
        records = generateMockData(startDate, endDate, Array.from(selectedMembers));
      } else {
        // Try to fetch from API
        let query = `?startDate=${startDate}&endDate=${endDate}`;
        query += Array.from(selectedMembers).map(name => `&members=${encodeURIComponent(name)}`).join('');

        const res = await api.get(`/attendance/export${query}`);

        if (!res.data || res.data.length === 0) {
          setError('No attendance records found for the selected criteria.');
          setLoading(false);
          return;
        }
        records = res.data;
      }

      const fileNameBase = `attendance_report_${startDate}_to_${endDate}`;

      // Build and download file based on format
      if (exportFormat === 'CSV') {
        const csvContent = buildCSV(records);
        triggerDownload(csvContent, `${fileNameBase}.csv`, 'text/csv;charset=utf-8;');
      } else {
        const pdfBlob = buildPDF(records, startDate, endDate, selectedMembers);
        triggerDownload(pdfBlob, `${fileNameBase}.pdf`, 'application/pdf');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);

    } catch (err) {
      console.error('Export error:', err);

      // If API fails, offer to use mock data
      if (!useMockData) {
        setError(
          `API Error: ${err.response?.data?.message || err.message || 'Failed to export data'}. ` +
          'Would you like to generate sample data for testing?'
        );
        setUseMockData(true); // Auto-enable mock data for retry
      } else {
        setError('Failed to generate report. Please check your parameters and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    setLoading(false);
    setUseMockData(false);
    onClose();
  };

  const retryWithMockData = () => {
    setError(null);
    handleExport(new Event('submit')); // Trigger export again with mock data enabled
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Export Professional Report" size="lg">
      <form onSubmit={handleExport} className="space-y-6">
        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center space-x-3"
          >
            <Check size={20} className="text-green-600" />
            <div>
              <p className="font-medium">Report Generated Successfully!</p>
              <p className="text-sm">Your professional report is downloading...</p>
            </div>
          </motion.div>
        )}

        {/* Error Message with retry option */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
          >
            <div className="flex items-center space-x-3 mb-2">
              <X size={20} className="text-red-600" />
              <div>
                <p className="font-medium">Export Failed</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            {useMockData && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>Demo Mode:</strong> Using sample data for testing.
                </p>
                <button
                  type="button"
                  onClick={retryWithMockData}
                  className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Generate Sample Report
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Demo Mode Indicator */}
        {useMockData && !error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 flex items-center space-x-3"
          >
            <div>
              <p className="font-medium">Demo Mode Active</p>
              <p className="text-sm">Using sample data for testing purposes.</p>
            </div>
          </motion.div>
        )}

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            icon={<Calendar size={18} className="text-gray-400" />}
            label="Start Date"
            name="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            icon={<Calendar size={18} className="text-gray-400" />}
            label="End Date"
            name="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        {/* Member Selection */}
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="block text-sm font-semibold text-primary mb-3">
            Team Members Selection
          </label>

          {/* Selection Controls */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => setAllMembers(true)}
              className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Select All ({selectedMembers.size}/{members.length})
            </button>
            <button
              type="button"
              onClick={() => setAllMembers(false)}
              className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Clear Selection
            </button>
          </div>

          {/* Members List */}
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white p-3 space-y-2">
            {members.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User size={32} className="mx-auto mb-2 opacity-50" />
                <p>No team members available</p>
              </div>
            ) : (
              members.map(member => (
                <label
                  key={member.name}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center justify-center w-5 h-5 border-2 border-gray-300 rounded group-hover:border-gray-400 transition-colors">
                    <input
                      type="checkbox"
                      className="opacity-0 absolute"
                      checked={selectedMembers.has(member.name)}
                      onChange={() => handleMemberToggle(member.name)}
                    />
                    {selectedMembers.has(member.name) && (
                      <Check size={12} className="text-primary" />
                    )}
                  </div>
                  <User size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span className="text-sm font-medium text-primary flex-1">{member.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                    selectedMembers.has(member.name)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedMembers.has(member.name) ? 'Selected' : 'Click to select'}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Format Selection */}
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="block text-sm font-semibold text-primary mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className={`flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              exportFormat === 'PDF'
                ? 'border-primary bg-white shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
              <div className={`p-3 rounded-lg ${
                exportFormat === 'PDF' ? 'bg-primary' : 'bg-gray-100'
              }`}>
                <FileText size={20} className={exportFormat === 'PDF' ? 'text-white' : 'text-gray-600'} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-primary">PDF</div>
              </div>
              <input
                type="radio"
                name="format"
                value="PDF"
                checked={exportFormat === 'PDF'}
                onChange={() => setExportFormat('PDF')}
                className="text-primary focus:ring-primary"
              />
            </label>

            <label className={`flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              exportFormat === 'CSV'
                ? 'border-primary bg-white shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
              <div className={`p-3 rounded-lg ${
                exportFormat === 'CSV' ? 'bg-primary' : 'bg-gray-100'
              }`}>
                <Table size={20} className={exportFormat === 'CSV' ? 'text-white' : 'text-gray-600'} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-primary">CSV</div>
              </div>
              <input
                type="radio"
                name="format"
                value="CSV"
                checked={exportFormat === 'CSV'}
                onChange={() => setExportFormat('CSV')}
                className="text-primary focus:ring-primary"
              />
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all duration-200"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Creating Professional Report...</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Download {exportFormat} Report</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

// Simple formatter to parse UTC date and show local dd/MM/yyyy
const formatForReport = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${day}/${month}/${year}`;
};

export default ExportAttendanceModal;
