import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import { motion } from 'framer-motion';
import { FileText, Calendar, Tag } from 'lucide-react'; // <-- Import Tag
import api from '../api/axiosConfig';
import CustomSelect from './CustomSelect';
import { Editor } from '@tinymce/tinymce-react';

const planPeriodOptions = [
  { value: 'General', label: 'General' },
  { value: 'This Week', label: 'This Week' },
  { value: 'This Month', label: 'This Month' },
  { value: 'This Year', label: 'This Year' },
];

const AddNoteModal = ({ isOpen, onClose, onNoteAdded }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [planPeriod, setPlanPeriod] = useState('General');
  const [category, setCategory] = useState('Personal'); // <-- ADDED
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/notes', {
        title,
        content,
        planPeriod,
        category, // <-- ADDED
      });

      onNoteAdded(res.data);
      setLoading(false);
      onClose();
      // Reset fields
      setTitle('');
      setContent('');
      setPlanPeriod('General');
      setCategory('Personal'); // <-- ADDED
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add note');
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset fields
    setTitle('');
    setContent('');
    setPlanPeriod('General');
    setCategory('Personal'); // <-- ADDED
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Note">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          icon={<FileText size={18} className="text-gray-400" />}
          type="text"
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoComplete="off"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <Editor
            apiKey='btbqthaaki8gu807fixqn8vbiv7peb7wcoml3q320qnkfedf' // <-- PUT YOUR API KEY HERE
            value={content}
            onEditorChange={(newValue, editor) => setContent(newValue)}
            init={{
              height: 250, // Taller
              menubar: false,
              plugins: [
                'lists', 'link', 'autolink', 'code', 'wordcount', 'textcolor'
              ],
              toolbar:
                'undo redo | bold italic | bullist numlist | link | code | forecolor backcolor | removeformat',
              content_style: 'body { font-family:Roboto,sans-serif; font-size:14px }',
            }}
          />
        </div>

        {/* --- UPDATED SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Plan Period
            </label>
            <CustomSelect
              icon={Calendar}
              options={planPeriodOptions}
              value={planPeriod}
              onChange={(value) => setPlanPeriod(value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag size={16} className="inline mr-1" />
              Category
            </label>
            <Input
              type="text"
              placeholder="e.g., Personal, Work"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
        </div>
        {/* --- END UPDATED SECTION --- */}


        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </div>
            ) : (
              'Create Note'
            )}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default AddNoteModal;
