import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Input from './Input';

const AccountSettings = () => {
  const { user, login } = useAuth();

  // State for profile form
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // State for password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setProfileError(null);
    setProfileSuccess(false);
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordError(null);
    setPasswordSuccess(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const res = await api.put('/user/profile', formData);
      // Update auth context with new user data
      const updatedUser = { ...user, ...res.data };
      login(updatedUser);

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    }
    setProfileLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
        setPasswordError('Password must be at least 6 characters.');
        return;
    }

    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      await api.put('/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    }
    setPasswordLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Profile Information Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
          <p className="text-sm text-gray-600 mt-1">Update your account's profile details.</p>
        </div>
        <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
          <AnimatePresence>
            {profileError && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
                <p className="text-red-700 text-sm font-medium">{profileError}</p>
              </motion.div>
            )}
            {profileSuccess && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                <p className="text-green-700 text-sm font-medium">Profile updated successfully!</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <Input
              icon={<User size={18} className="text-gray-400" />}
              type="text"
              name="username"
              value={formData.username}
              onChange={handleProfileChange}
              disabled={profileLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <Input
              icon={<Mail size={18} className="text-gray-400" />}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleProfileChange}
              disabled={profileLoading}
            />
          </div>
          <div className="pt-4 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={profileLoading}
              className="inline-flex items-center justify-center space-x-2 bg-gray-900 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profileLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Profile</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
          <p className="text-sm text-gray-600 mt-1">Update your password. Ensure it is at least 6 characters long.</p>
        </div>
        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
          <AnimatePresence>
            {passwordError && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
                <p className="text-red-700 text-sm font-medium">{passwordError}</p>
              </motion.div>
            )}
            {passwordSuccess && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                <p className="text-green-700 text-sm font-medium">Password changed successfully!</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <Input
              icon={<Lock size={18} className="text-gray-400" />}
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              disabled={passwordLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <Input
              icon={<Lock size={18} className="text-gray-400" />}
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              disabled={passwordLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <Input
              icon={<Lock size={18} className="text-gray-400" />}
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              disabled={passwordLoading}
            />
          </div>
          <div className="pt-4 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center justify-center space-x-2 bg-gray-900 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Password</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AccountSettings;
