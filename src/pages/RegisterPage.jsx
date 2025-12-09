import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, Lock, Eye, EyeOff, Shield, Building, ArrowRight, CheckCircle2
} from 'lucide-react';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

// --- Google Icon Component ---
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    companyName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const { username, email, password, companyName } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', formData);
      login(res.data);
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  // Google OAuth Redirect
  const handleGoogleLogin = () => {
    // This URL must match your backend route
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google/google`;
  };

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* --- LEFT COLUMN: FORM --- */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 xl:px-12 bg-white z-10">
        <div className="mx-auto w-full max-w-md lg:max-w-lg">

          {/* Logo (Mobile) */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <Shield className="text-white" size={16} />
              </div>
              <span className="text-xl font-bold text-zinc-900">E-Manager</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-zinc-900 mb-2">Create Organization</h2>
              <p className="text-slate-600">Start your 30-day free trial. No credit card required.</p>
            </div>

            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center font-medium"
              >
                {error}
              </motion.div>
            )}

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-medium py-3.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm cursor-pointer"
            >
              <GoogleIcon />
              <span>Sign up with Google</span>
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider font-semibold">
                <span className="px-4 bg-white text-slate-400">Or register with email</span>
              </div>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={onSubmit}>
              <Input
                icon={<Building size={18} className="text-slate-400" />}
                type="text"
                placeholder="Organization Name"
                name="companyName"
                value={companyName}
                onChange={onChange}
                required
                autoComplete="organization"
                autoFocus
              />

              <Input
                icon={<User size={18} className="text-slate-400" />}
                type="text"
                placeholder="Full Name"
                name="username"
                value={username}
                onChange={onChange}
                required
                autoComplete="name"
              />

              <Input
                icon={<Mail size={18} className="text-slate-400" />}
                type="email"
                placeholder="Work Email"
                name="email"
                value={email}
                onChange={onChange}
                required
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  icon={<Lock size={18} className="text-slate-400" />}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create Password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                  minLength="6"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-zinc-900 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-900 text-white font-bold py-4 px-4 rounded-xl hover:bg-black focus:outline-none focus:ring-4 focus:ring-zinc-200 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Get Started</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-zinc-900 hover:underline">
                Log in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: BRANDING --- */}
      <div className="hidden lg:flex lg:flex-1 relative bg-slate-50 overflow-hidden items-center justify-center p-12">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100 rounded-full blur-[100px] opacity-50 mix-blend-multiply"></div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 max-w-lg"
        >
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide mb-6">
              <Shield size={12} />
              Enterprise Ready
            </div>
            <h2 className="text-3xl font-black text-zinc-900 mb-4 leading-tight">
              Scale your team with confidence.
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Join 500+ organizations that use E-Manager to streamline operations, automate reporting, and secure their data.
            </p>

            <div className="space-y-4">
              {[
                "AI-Powered Productivity Insights",
                "Automated Daily Briefings",
                "Bank-Grade Security (SOC2)"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                  <CheckCircle2 size={18} className="text-green-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-sm font-medium">
            <Shield size={14} />
            <span>Secure 256-bit Encryption</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
