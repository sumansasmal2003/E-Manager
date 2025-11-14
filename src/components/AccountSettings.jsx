import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, User, Mail, Lock, CheckCircle, AlertCircle, LogOut, AlertTriangle, Loader2 } from 'lucide-react';
import Input from './Input';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../context/ConfirmContext';

const AccountSettings = () => {
  const { user, login, logout } = useAuth();

  const navigate = useNavigate();
  const { confirm } = useConfirm();

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

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);

    // 1. Show confirmation dialog
    const confirmed = await confirm({
      title: 'Delete Your Account?',
      description: 'This is permanent and cannot be undone. All your teams, tasks, notes, and other data will be deleted forever.',
      confirmText: 'Yes, Delete My Account',
      danger: true // This will use the red button style
    });

    // 2. If not confirmed, stop here
    if (!confirmed) {
      return;
    }

    // 3. If confirmed, proceed with deletion
    setDeleteLoading(true);
    try {
      // 4. Call the new backend endpoint
      await api.delete('/user/profile');

      // 5. Log the user out and redirect
      logout();
      navigate('/login', { replace: true });

    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account.');
      setDeleteLoading(false);
    }
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
      <div className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-red-200 bg-red-50">
          <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
          <p className="text-sm text-red-700 mt-1">Be careful with these actions.</p>
        </div>

        {/* Logout Section */}
        <div className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h3 className="font-medium text-gray-900">Sign Out</h3>
            <p className="text-sm text-gray-600">You will be logged out of your current session.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="inline-flex items-center justify-center space-x-2 bg-gray-900 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 w-full sm:w-auto"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </motion.button>
        </div>

        {/* --- ADDED DELETE ACCOUNT SECTION --- */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="font-medium text-red-900">Delete Account</h3>
              <p className="text-sm text-gray-600">Permanently delete your account and all associated data.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="inline-flex items-center justify-center space-x-2 bg-red-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 transition-all duration-200 w-full sm:w-auto disabled:opacity-50"
            >
              {deleteLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <AlertTriangle size={18} />
              )}
              <span>Delete Account</span>
            </motion.button>
          </div>
          {deleteError && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-red-700 text-sm font-medium text-center sm:text-right mt-3">
              {deleteError}
            </motion.div>
          )}
        </div>
        {/* --- END DELETE ACCOUNT SECTION --- */}
      </div>
    </motion.div>
  );
};

export default AccountSettings;
