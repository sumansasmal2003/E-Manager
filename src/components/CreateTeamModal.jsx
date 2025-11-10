import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import { motion } from 'framer-motion';
import { Users, Building } from 'lucide-react';
import api from '../api/axiosConfig';

const CreateTeamModal = ({ isOpen, onClose, onTeamCreated }) => {
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/teams', { teamName });
      onTeamCreated(res.data);
      setLoading(false);
      onClose();
      setTeamName('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTeamName('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Team">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Building className="text-gray-400" size={24} />
          </div>
          <p className="text-gray-600 text-sm">
            Create a new team to collaborate with others
          </p>
        </div>

        <Input
          icon={<Users size={18} className="text-gray-400" />}
          type="text"
          placeholder="Enter team name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
          autoComplete="off"
        />

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Team Features:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
              Collaborative task management
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
              Team meetings and scheduling
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
              Member role management
            </li>
          </ul>
        </div>

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
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </div>
            ) : (
              'Create Team'
            )}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTeamModal;
