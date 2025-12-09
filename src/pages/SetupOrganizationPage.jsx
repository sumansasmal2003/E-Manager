import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, ArrowRight, Loader2, Shield } from 'lucide-react';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

const SetupOrganizationPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Call API to update profile
      const res = await api.put('/user/profile', {
        companyName: companyName,
        username: user.username,
        email: user.email
      });

      // 2. CRITICAL FIX: Preserve the existing token
      // The backend response (res.data) doesn't include the token, so we must add it back.
      const updatedUser = {
        ...res.data,
        token: user.token
      };

      // 3. Update Auth Context
      login(updatedUser);

      // 4. Redirect
      navigate('/dashboard');

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update organization details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4 font-sans text-zinc-900">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="text-white" size={24} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="text-blue-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">One Last Step!</h1>
            <p className="text-slate-500">
              Please provide the name of your organization to complete your workspace setup.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              icon={<Building size={18} className="text-slate-400" />}
              type="text"
              placeholder="Organization Name (e.g. Acme Corp)"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              autoFocus
            />

            <button
              type="submit"
              disabled={loading || !companyName.trim()}
              className="w-full bg-zinc-900 text-white font-bold py-4 px-4 rounded-xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Complete Setup</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SetupOrganizationPage;
