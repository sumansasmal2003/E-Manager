import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Save, Shield, Info, CheckCircle, AlertCircle, Plus, Trash2, ExternalLink, Loader2, Calendar } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Input from './Input';
import { useConfirm } from '../context/ConfirmContext';

const IntegrationSettings = () => {
  const { user, login, connecteamAccounts = [] } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { confirm } = useConfirm();

  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleSuccess, setGoogleSuccess] = useState(false);
  const [googleError, setGoogleError] = useState(false);
  const [disconnectLoading, setDisconnectLoading] = useState(false);

  useEffect(() => {
    const googleStatus = searchParams.get('google');
    if (googleStatus === 'success') {
      setGoogleSuccess(true);
      api.get('/user/profile').then(res => login({ ...user, ...res.data }));
      searchParams.delete('google');
      setSearchParams(searchParams);
    } else if (googleStatus === 'error') {
      setGoogleError(true);
      searchParams.delete('google');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams, login, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !link.trim()) {
      setError('Please enter both a name and a link.');
      return;
    }
    if (!link.startsWith('https://')) {
      setError('URL must start with https://');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await api.post('/user/connecteam', { name, link });
      const updatedUser = { ...user, connecteamAccounts: res.data };
      login(updatedUser);

      setSuccess(true);
      setName('');
      setLink('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add account.');
    }
    setLoading(false);
  };

  const handleDelete = async (accountId) => {
    const confirmed = await confirm({
      title: 'Remove ConnecTeam Account?',
      description: 'This will remove the account link from your settings.',
      confirmText: 'Remove Account',
      danger: false
    });

    if (!confirmed) return;

    try {
      const res = await api.delete(`/user/connecteam/${accountId}`);
      const updatedUser = { ...user, connecteamAccounts: res.data };
      login(updatedUser);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account.');
    }
  };

  const handleGoogleConnect = async () => {
    setGoogleLoading(true);
    setGoogleError(false);
    try {
      const res = await api.get('/auth/google/connect');
      if (res.data.authUrl) {
        window.location.href = res.data.authUrl;
      } else {
        throw new Error('Could not get Google auth URL.');
      }
    } catch (err) {
      setGoogleError(true);
      setGoogleLoading(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    const confirmed = await confirm({
      title: 'Disconnect Google Calendar?',
      description: 'This will stop new meetings from syncing to your calendar and will no longer show Google events in the app.',
      confirmText: 'Disconnect',
      danger: true,
    });

    if (!confirmed) return;

    setDisconnectLoading(true);
    setGoogleError(false);
    setGoogleSuccess(false);
    try {
      const res = await api.delete('/auth/google/disconnect');
      login(res.data);
    } catch (err) {
      setGoogleError(true);
    }
    setDisconnectLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Google Calendar Integration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <Calendar className="text-gray-600" size={20} />
            <div>
              <h2 className="text-lg font-semibold text-primary">Google Calendar</h2>
              <p className="text-sm text-gray-600 mt-0.5">Sync your meetings and tasks with Google Calendar</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence>
            {googleSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-6"
              >
                <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                <p className="text-green-700 text-sm font-medium">
                  Google Calendar connected successfully!
                </p>
              </motion.div>
            )}
            {googleError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6"
              >
                <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
                <p className="text-red-700 text-sm font-medium">
                  Failed to connect Google Calendar. Please try again.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {user.googleCalendarConnected ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-600" size={20} />
                <div>
                  <p className="text-green-800 font-medium">Google Calendar Connected</p>
                  <p className="text-green-700 text-sm">Your calendar is synced with the application</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleDisconnect}
                disabled={disconnectLoading}
                className="inline-flex items-center justify-center space-x-2 bg-red-600 text-white font-medium py-2.5 px-5 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto"
              >
                {disconnectLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                <span>Disconnect</span>
              </motion.button>
            </div>
          ) : (
            <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <Calendar className="mx-auto text-gray-400 mb-3" size={32} />
              <h3 className="text-lg font-medium text-primary mb-2">Connect Google Calendar</h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                Sync your meetings and tasks with Google Calendar for better schedule management
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleConnect}
                disabled={googleLoading}
                className="inline-flex items-center justify-center space-x-2 bg-primary text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {googleLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Calendar size={18} />
                    <span>Connect Google Calendar</span>
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* ConnecTeam Accounts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <Shield className="text-gray-600" size={20} />
            <div>
              <h2 className="text-lg font-semibold text-primary">ConnecTeam Accounts</h2>
              <p className="text-sm text-gray-600 mt-0.5">Manage your ConnecTeam admin account links</p>
            </div>
          </div>
        </div>

        {/* Current Accounts List */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-md font-semibold text-primary mb-4">Connected Accounts</h3>
          {connecteamAccounts.length > 0 ? (
            <div className="space-y-3">
              {connecteamAccounts.map(account => (
                <motion.div
                  key={account._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200 group hover:bg-white transition-colors duration-200"
                >
                  <a
                    href={account.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-4 flex-1 min-w-0 group"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-300 group-hover:border-gray-400 transition-colors flex-shrink-0">
                      <Shield size={18} className="text-gray-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-primary truncate">{account.name}</p>
                      <p className="text-sm text-gray-500 truncate">{account.link}</p>
                    </div>
                    <ExternalLink size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                  </a>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(account._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 ml-3 flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <Shield className="mx-auto text-gray-400 mb-3" size={32} />
              <p className="text-gray-500">No ConnecTeam accounts connected yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your first account below</p>
            </div>
          )}
        </div>

        {/* Add New Account Form */}
        <div className="p-6">
          <h3 className="text-md font-semibold text-primary mb-4">Add New Account</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                  <p className="text-green-700 text-sm font-medium">Account added successfully!</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Account Name</label>
                <Input
                  icon={<Shield size={18} className="text-gray-400" />}
                  type="text"
                  placeholder="e.g., 'Main Admin' or 'Client Team'"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(null); }}
                  disabled={loading}
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Admin URL</label>
                <Input
                  icon={<Link size={18} className="text-gray-400" />}
                  type="url"
                  placeholder="https://app.connecteam.com/..."
                  value={link}
                  onChange={(e) => { setLink(e.target.value); setError(null); }}
                  disabled={loading}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center space-x-3 bg-primary text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Adding Account...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Add Account</span>
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default IntegrationSettings;
