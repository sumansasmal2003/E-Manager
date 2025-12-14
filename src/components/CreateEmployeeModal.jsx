import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { UserPlus, User, Mail, Lock, Loader2, Sparkles } from 'lucide-react';

const CreateEmployeeModal = ({ isOpen, onClose, teamId, onEmployeeCreated }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [canUseAI, setCanUseAI] = useState(true); // Default Allow AI
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/create-employee', {
        ...formData,
        teamId,
        canUseAI // Send this to backend
      });

      if (onEmployeeCreated) onEmployeeCreated();

      setLoading(false);
      onClose();
      setFormData({ username: '', email: '', password: '' });
      setCanUseAI(true);
      alert('Employee hired successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee account');
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hire New Employee">
      <form onSubmit={handleSubmit} className="space-y-5">

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
          <div className="bg-blue-100 p-2 rounded-full h-fit text-blue-600">
            <UserPlus size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900">Create Account</h4>
            <p className="text-xs text-blue-700 mt-1">
              Create login for user and assign to team.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            icon={<User size={18} className="text-gray-400" />}
            type="text"
            name="username"
            placeholder="Full Name"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <Input
            icon={<Mail size={18} className="text-gray-400" />}
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            icon={<Lock size={18} className="text-gray-400" />}
            type="password"
            name="password"
            placeholder="Temporary Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          {/* AI PERMISSION TOGGLE */}
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-purple-100 rounded text-purple-600"><Sparkles size={16}/></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Allow AI Features</p>
                <p className="text-xs text-gray-500">Access to Chat, Briefings, Reports</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={canUseAI} onChange={(e) => setCanUseAI(e.target.checked)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            <span>Hire</span>
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateEmployeeModal;
