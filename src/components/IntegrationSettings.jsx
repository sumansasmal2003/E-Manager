import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Save, Shield, Info, CheckCircle, AlertCircle, Plus, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Input from './Input';
import { useConfirm } from '../context/ConfirmContext';

const IntegrationSettings = () => {
  const { user, login, connecteamAccounts } = useAuth(); // Get accounts from context
  const [searchParams, setSearchParams] = useSearchParams();
  const { confirm } = useConfirm();

  // State for the form
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
      // We should refetch the user to confirm googleCalendarConnected is true
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
      // The API returns the new array of accounts
      const updatedUser = { ...user, connecteamAccounts: res.data };
      login(updatedUser); // Update context and local storage

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
    try {
      const res = await api.delete(`/user/connecteam/${accountId}`);
      // API returns the updated array
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
      // 1. Make an authenticated request to your backend
      const res = await api.get('/auth/google');

      // 2. Get the authUrl from the JSON response
      if (res.data.authUrl) {
        // 3. Manually redirect the user's browser to Google
        window.location.href = res.data.authUrl;
      } else {
        throw new Error('Could not get Google auth URL.');
      }
    } catch (err) {
      setGoogleError(true);
      setGoogleLoading(false); // Only set loading false on error
    }
    // On success, the browser navigates away, so no need to set loading false.
  };

  const handleGoogleDisconnect = async () => {
    // 1. Ask for confirmation
    const confirmed = await confirm({
      title: 'Disconnect Google Calendar?',
      description:
        'This will stop new meetings from syncing to your calendar and will no longer show Google events in the app.',
      confirmText: 'Disconnect',
      danger: true, // This makes the button red
    });

    if (!confirmed) {
      return;
    }

    // 2. Run the disconnect logic
    setDisconnectLoading(true);
    setGoogleError(false);
    setGoogleSuccess(false); // Clear any old success messages
    try {
      // 3. Call the new backend endpoint
      const res = await api.delete('/auth/google/disconnect');

      // 4. Update the AuthContext with the new user data from the backend
      login(res.data);
    } catch (err) {
      setGoogleError(true);
    }
    setDisconnectLoading(false);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Google Calendar
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Sync your app's meetings and tasks with your Google Calendar.
          </p>
        </div>
        <div className="p-6">
          <AnimatePresence>
            {/* ... (Success and Error messages remain the same) ... */}
          </AnimatePresence>

          {user.googleCalendarConnected ? (
            // --- THIS IS THE FIX (CONNECTED STATE) ---
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="text-green-600" size={18} />
                <p className="text-green-700 text-sm font-medium">
                  Google Calendar is connected.
                </p>
              </div>
              <button
                onClick={handleGoogleDisconnect}
                disabled={disconnectLoading}
                className="inline-flex items-center justify-center space-x-2 bg-red-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {disconnectLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            // --- THIS IS THE FIX (DISCONNECTED STATE) ---
            <button
              onClick={handleGoogleConnect}
              disabled={googleLoading}
              className="inline-flex items-center justify-center space-x-2 bg-gray-900 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <span>Connect Google Calendar</span>
              )}
            </button>
          )}
        </div>
      </motion.div>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">ConnecTeam Accounts</h2>
        <p className="text-sm text-gray-600 mt-1">
          Add, view, or remove your ConnecTeam admin account links.
        </p>
      </div>

      {/* List of Current Accounts */}
      <div className="p-6 space-y-3">
        {connecteamAccounts.length > 0 ? (
          connecteamAccounts.map(account => (
            <div
              key={account._id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 group"
            >
              <a
                href={account.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 overflow-hidden"
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border flex-shrink-0">
                  <Link size={16} className="text-gray-600" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-gray-900 truncate">{account.name}</p>
                  <p className="text-sm text-gray-500 truncate">{account.link}</p>
                </div>
              </a>
              <div className="flex items-center flex-shrink-0 pl-2">
                <a
                  href={account.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => handleDelete(account._id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No ConnecTeam accounts added yet.</p>
        )}
      </div>

      {/* Add New Account Form */}
      <div className="p-6 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-md font-semibold text-gray-900">Add New Account</h3>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                <p className="text-green-700 text-sm font-medium">Account added successfully!</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
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
          <div className="space-y-2">
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

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center space-x-2 bg-gray-900 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
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
