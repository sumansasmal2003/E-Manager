import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { User, Mail, Lock, Loader2, Briefcase, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CustomSelect from './CustomSelect'; // Assuming you have this component

const CreateManagerModal = ({ isOpen, onClose, onManagerCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    teamId: ''
  });
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);

  // Fetch teams when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchTeams = async () => {
        setLoadingTeams(true);
        try {
          const res = await api.get('/teams');
          // Filter to show ONLY teams owned directly by the Owner (user._id)
          // because these are the ones available for assignment.
          const availableTeams = res.data.filter(team => team.owner._id === user._id);
          setTeams(availableTeams);
        } catch (err) {
          console.error("Failed to load teams", err);
        }
        setLoadingTeams(false);
      };
      fetchTeams();
    }
  }, [isOpen, user._id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTeamChange = (value) => {
    setFormData({ ...formData, teamId: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.teamId) {
      setError("Please select a team to assign to this manager.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/create-manager', formData);
      onManagerCreated(res.data);
      setLoading(false);
      onClose();
      setFormData({ username: '', email: '', password: '', teamId: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create manager');
      setLoading(false);
    }
  };

  const teamOptions = teams.map(t => ({ value: t._id, label: t.teamName }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hire New Manager">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Briefcase className="text-gray-400" size={24} />
          </div>
          <p className="text-gray-600 text-sm">
            Create an account for a team lead. We will email them their credentials.
          </p>
        </div>

        <Input
          icon={<User size={18} className="text-gray-400" />}
          type="text"
          name="username"
          placeholder="Manager Username"
          value={formData.username}
          onChange={handleChange}
          required
          autoComplete="off"
        />

        <Input
          icon={<Mail size={18} className="text-gray-400" />}
          type="email"
          name="email"
          placeholder="Manager Email"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="off"
        />

        <Input
          icon={<Lock size={18} className="text-gray-400" />}
          type="password"
          name="password"
          placeholder="Set Initial Password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength="6"
          autoComplete="new-password"
        />

        {/* Team Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign Team
          </label>
          {loadingTeams ? (
            <div className="flex items-center space-x-2 text-sm text-gray-500 py-2">
                <Loader2 className="animate-spin" size={16} />
                <span>Loading available teams...</span>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              You have no unassigned teams. Please create a team first or remove a manager from an existing team.
            </div>
          ) : (
            <CustomSelect
                icon={Users}
                options={teamOptions}
                value={formData.teamId}
                onChange={handleTeamChange}
                placeholder="Select a team..."
            />
          )}
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading || teams.length === 0}
            className="flex-1 bg-primary text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              'Hire & Assign'
            )}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateManagerModal;
