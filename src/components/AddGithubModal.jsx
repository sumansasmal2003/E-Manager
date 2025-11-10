import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { Link, Clipboard, Github } from 'lucide-react'; // <-- Import Github icon

const AddGithubModal = ({ isOpen, onClose, teamId, onGithubRepoAdded }) => {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/teams/${teamId}/github`, { name, link }); // <-- Use /github endpoint
      onGithubRepoAdded(res.data); // <-- Call the correct prop
      setLoading(false);
      onClose();
      setName('');
      setLink('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add repo');
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Add GitHub Repository">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          icon={<Clipboard size={18} className="text-gray-400" />}
          type="text"
          placeholder="Repo name (e.g., 'frontend-app')"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="off"
        />

        <Input
          icon={<Github size={18} className="text-gray-400" />}
          type="url"
          placeholder="Repo link (https://github.com/...)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          required
          autoComplete="off"
        />

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="flex-1 bg-gray-900 text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Repository'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default AddGithubModal;
