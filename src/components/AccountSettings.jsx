import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { User, Mail, Save, Loader2, Shield, Lock, Smartphone, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import Input from './Input';
import { useAuth } from '../context/AuthContext';

const AccountSettings = () => {
  const { user, login } = useAuth(); // 'login' is used to update the local user context
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    companyName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 2FA State
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading2fa, setLoading2fa] = useState(false);
  const [error2fa, setError2fa] = useState(null);

  // Initialize from user context
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        companyName: user.companyName || ''
      }));
      // Check if 2FA is enabled (Assuming backend sends this flag in user object)
      setIs2faEnabled(user.isTwoFactorEnabled || false);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.put('/user/profile', {
        username: formData.username,
        email: formData.email,
        companyName: formData.companyName
      });
      login(res.data); // Update context
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    }
    setLoading(false);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/user/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setMessage({ type: 'success', text: 'Password changed successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Password update failed' });
    }
    setLoading(false);
  };

  // --- 2FA Handlers ---
  const handleGenerate2FA = async () => {
    setLoading2fa(true);
    setError2fa(null);
    try {
      const res = await api.post('/user/2fa/generate');
      setQrCodeUrl(res.data.qrCode);
    } catch (err) {
      setError2fa("Failed to generate QR code.");
    }
    setLoading2fa(false);
  };

  const handleEnable2FA = async () => {
    if (!verificationCode) return;
    setLoading2fa(true);
    setError2fa(null);
    try {
      const res = await api.post('/user/2fa/enable', { token: verificationCode });

      setIs2faEnabled(true);
      setQrCodeUrl(null);
      setVerificationCode('');

      // Update global context so the UI reflects the change immediately
      login({ ...user, isTwoFactorEnabled: true });

      setMessage({ type: 'success', text: res.data.message });
    } catch (err) {
      setError2fa(err.response?.data?.message || "Invalid verification code.");
    }
    setLoading2fa(false);
  };

  const handleDisable2FA = async () => {
    if (!window.confirm("Are you sure you want to disable 2FA? Your account will be less secure.")) return;
    setLoading2fa(true);
    try {
      const res = await api.post('/user/2fa/disable');
      setIs2faEnabled(false);
      login({ ...user, isTwoFactorEnabled: false });
      setMessage({ type: 'success', text: res.data.message });
    } catch (err) {
      setError2fa("Failed to disable 2FA.");
    }
    setLoading2fa(false);
  };

  return (
    <div className="space-y-8">
      {/* Feedback Message */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
          <User size={20} className="text-gray-500" /> Profile Information
        </h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Username"
              icon={<User size={18} className="text-gray-400" />}
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            <Input
              label="Email"
              icon={<Mail size={18} className="text-gray-400" />}
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <div className="md:col-span-2">
              <Input
                label="Company Name"
                icon={<Shield size={18} className="text-gray-400" />}
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Password Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
          <Lock size={20} className="text-gray-500" /> Change Password
        </h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <Input
            type="password"
            label="Current Password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="password"
              label="New Password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
            />
            <Input
              type="password"
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !formData.currentPassword}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* --- 2FA SECTION --- */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Smartphone className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">Two-Factor Authentication</h2>
            <p className="text-sm text-gray-500">Secure your account with Google Authenticator.</p>
          </div>
        </div>

        {error2fa && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle size={16} /> {error2fa}
          </div>
        )}

        {!is2faEnabled ? (
          // STATE: 2FA NOT ENABLED
          <div className="space-y-6">
            {!qrCodeUrl ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Add an extra layer of security. We will require a code in addition to your password.
                </p>
                <button
                  onClick={handleGenerate2FA}
                  disabled={loading2fa}
                  className="whitespace-nowrap px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                   {loading2fa && <Loader2 className="animate-spin" size={16} />}
                   Setup 2FA
                </button>
              </div>
            ) : (
              // STATE: QR CODE SHOWN
              <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <h3 className="font-semibold text-primary">Scan this QR Code</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Open <strong>Google Authenticator</strong> on your phone and scan the image below.
                </p>

                <div className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                </div>

                <div className="w-full max-w-xs space-y-3">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    Enter Verification Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="000 000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center tracking-widest font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      onClick={handleEnable2FA}
                      disabled={loading2fa || verificationCode.length !== 6}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {loading2fa ? <Loader2 size={18} className="animate-spin" /> : 'Enable'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => { setQrCodeUrl(null); setVerificationCode(''); }}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  Cancel Setup
                </button>
              </div>
            )}
          </div>
        ) : (
          // STATE: 2FA ENABLED
          <div className="flex items-center justify-between bg-green-50 p-4 rounded-xl border border-green-100">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <ShieldCheck className="text-green-600" size={24} />
              </div>
              <div>
                <p className="font-bold text-green-900">2FA is Enabled</p>
                <p className="text-sm text-green-700">Your account is secure.</p>
              </div>
            </div>

            <button
              onClick={handleDisable2FA}
              disabled={loading2fa}
              className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              {loading2fa ? <Loader2 className="animate-spin" size={16} /> : 'Disable'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;
