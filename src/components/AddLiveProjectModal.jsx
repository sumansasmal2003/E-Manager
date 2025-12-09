// src/components/AddLiveProjectModal.jsx

import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { Link, Clipboard, ExternalLink } from 'lucide-react'; // <-- Use ExternalLink

const AddLiveProjectModal = ({ isOpen, onClose, teamId, onLiveProjectAdded }) => { // <-- Rename prop
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/teams/${teamId}/liveproject`, { name, link }); // <-- Use /liveproject endpoint
      onLiveProjectAdded(res.data); // <-- Call the correct prop
      setLoading(false);
      onClose();
      setName('');
      setLink('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add project link');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setLink('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Live Project Link"> {/* <-- Change title */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          icon={<Clipboard size={18} className="text-gray-400" />}
          type="text"
          placeholder="Project Name (e.g., 'Frontend', 'Backend')" // <-- Change placeholder
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="off"
        />

        <Input
          icon={<ExternalLink size={18} className="text-gray-400" />} // <-- Use ExternalLink icon
          type="url"
          placeholder="Live Project URL (https://...)" // <-- Change placeholder
          value={link}
          onChange={(e) => setLink(e.target.value)}
          required
          autoComplete="off"
        />

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
            {loading ? 'Adding...' : 'Add Project Link'} {/* <-- Change button text */}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default AddLiveProjectModal;
