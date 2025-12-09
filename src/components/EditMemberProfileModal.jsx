import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import api from '../api/axiosConfig';
import { Loader2, Calendar, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import format from 'date-fns/format';

// Helper to format date for input (yyyy-MM-dd)
const formatDateForInput = (date) => {
  if (!date) return '';
  return format(new Date(date), 'yyyy-MM-dd');
};

const EditMemberProfileModal = ({ isOpen, onClose, profile, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    joiningDate: '',
    endingDate: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        joiningDate: formatDateForInput(profile.joiningDate),
        endingDate: formatDateForInput(profile.endingDate),
        email: profile.email || '',
      });
    }
  }, [profile]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.put('/members/profile', {
        name: profile.name, // Send the name as the identifier
        joiningDate: formData.joiningDate || null,
        endingDate: formData.endingDate || null,
        email: formData.email,
      });
      onProfileUpdated(res.data); // Send the new profile back to the parent page
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  if (!profile) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Profile: ${profile.name}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          icon={<Mail size={18} className="text-gray-400" />}
          label="Email Address"
          type="email"
          name="email"
          placeholder="e.g., member@email.com"
          value={formData.email}
          onChange={onChange}
        />

        <Input
          icon={<Calendar size={18} className="text-gray-400" />}
          label="Joining Date"
          type="date"
          name="joiningDate"
          value={formData.joiningDate}
          onChange={onChange}
        />

        <Input
          icon={<Calendar size={18} className="text-gray-400" />}
          label="Ending Date (if applicable)"
          type="date"
          name="endingDate"
          value={formData.endingDate}
          onChange={onChange}
        />

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
            className="flex-1 bg-primary text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Save Changes'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default EditMemberProfileModal;
