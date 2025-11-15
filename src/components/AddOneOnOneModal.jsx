// src/components/AddOneOnOneModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { Calendar, MessageSquare } from 'lucide-react';

const AddOneOnOneModal = ({ isOpen, onClose, memberName, onOneOnOneCreated, initialDiscussionPoints = '' }) => {
  const [meetingDate, setMeetingDate] = useState('');
  const [discussionPoints, setDiscussionPoints] = useState(initialDiscussionPoints);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // When the modal opens, set the discussion points from the prop
      setDiscussionPoints(initialDiscussionPoints);

      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setMeetingDate(today);

    } else {
      // Reset fields when closing
      setMeetingDate('');
      setDiscussionPoints('');
      setError(null);
    }
  }, [isOpen, initialDiscussionPoints]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/oneonones', {
        memberName,
        meetingDate,
        discussionPoints,
      });
      onOneOnOneCreated(res.data);
      setLoading(false);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule 1-on-1');
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Schedule 1-on-1 for ${memberName}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          icon={<Calendar size={18} className="text-gray-400" />}
          label="Meeting Date"
          type="date"
          value={meetingDate}
          onChange={(e) => setMeetingDate(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare size={16} className="inline mr-1" />
            Discussion Points (Optional)
          </label>
          <textarea
            placeholder="e.g., - Review Q3 goals..."
            value={discussionPoints}
            onChange={(e) => setDiscussionPoints(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 resize-none"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gray-900 text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Scheduling...' : 'Schedule 1-on-1'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default AddOneOnOneModal;
