import React, { useState, useRef } from 'react';
import Modal from './Modal';
import { Loader2, UploadCloud, CheckCircle, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig'; // Ensure this points to your configured axios

const ApplyModal = ({ isOpen, onClose, role }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload your resume.");
      return;
    }

    setLoading(true);

    // Use FormData for file upload
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('role', role); // Passed from parent
    data.append('coverLetter', formData.coverLetter);
    data.append('resume', file);

    try {
      // We need to override the header for this request to multipart/form-data
      // But usually axios detects FormData automatically.
      // If your global config forces JSON, you might need to set headers manually here.
      await api.post('/careers/apply', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to send application.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', coverLetter: '' });
    setFile(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetForm} title={`Apply for ${role}`}>
      {success ? (
        <div className="text-center py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={40} className="text-green-600" />
          </motion.div>
          <h3 className="text-2xl font-bold text-primary mb-2">Application Sent!</h3>
          <p className="text-gray-600 mb-8">
            Thanks for applying. We've sent a confirmation email to <strong>{formData.email}</strong>.
          </p>
          <button
            onClick={resetForm}
            className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resume/CV *</label>
            <div
              onClick={() => fileInputRef.current.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />

              {file ? (
                <div className="flex items-center justify-center gap-3 text-green-700">
                  <FileText size={24} />
                  <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="p-1 hover:bg-green-200 rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="text-gray-500">
                  <UploadCloud size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">Click to upload Resume</p>
                  <p className="text-xs mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter (Optional)</label>
            <textarea
              name="coverLetter"
              rows={4}
              value={formData.coverLetter}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              placeholder="Tell us why you're a great fit..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Submit Application
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ApplyModal;
