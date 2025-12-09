import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, Shield, ArrowRight, ShieldCheck,
  Smartphone, Key, AlertCircle, Sparkles, Globe, RefreshCw, Loader2,
  CheckCircle2
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

const LoginPage = () => {
  // Form State
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2FA State
  const [isTwoFactorStep, setIsTwoFactorStep] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState(['', '', '', '', '', '']);
  const [tempUserId, setTempUserId] = useState(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Google State
  const [isProcessingGoogle, setIsProcessingGoogle] = useState(false);

  // Hooks
  const inputRefs = useRef([]);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { email, password } = formData;

  // --- 1. EXISTING USER REDIRECT ---
  useEffect(() => {
    // If user is already logged in (and NOT processing a Google callback currently)
    if (user && !isProcessingGoogle) {
       if (!user.companyName || user.companyName.trim() === '') {
         navigate('/setup-organization', { replace: true });
       } else {
         navigate('/today', { replace: true });
       }
    }
  }, [user, navigate, isProcessingGoogle]);

  // --- 2. GOOGLE CALLBACK HANDLER ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userDataStr = params.get('userData');
    const googleError = params.get('error');

    if (googleError) {
      setError('Google Sign-in failed. Please try again.');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (token && userDataStr) {
      setIsProcessingGoogle(true);

      try {
        const userData = JSON.parse(decodeURIComponent(userDataStr));
        userData.token = token;

        // Update Context
        login(userData);

        // Immediate Redirect Decision (Bypassing the other useEffect for speed/stability)
        if (!userData.companyName || userData.companyName.trim() === '') {
           navigate('/setup-organization', { replace: true });
        } else {
           navigate('/today', { replace: true });
        }
      } catch (e) {
        console.error("Failed to parse user data", e);
        setError("Login failed. Invalid data received.");
        setIsProcessingGoogle(false);
      }
    }
  }, [location, login, navigate]);

  // --- 3. GOOGLE LOGIN TRIGGER ---
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google/google`;
  };

  // --- 2FA LOGIC ---
  useEffect(() => {
    if (isTwoFactorStep && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [isTwoFactorStep, resendTimer]);

  useEffect(() => {
    if (isTwoFactorStep && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0].focus(), 100);
    }
  }, [isTwoFactorStep]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTwoFactorInput = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newCode = [...twoFactorCode];
    newCode[index] = value.slice(0, 1);
    setTwoFactorCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newCode.every(digit => digit !== '') && index === 5) handleTwoFactorSubmit();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!twoFactorCode[index] && index > 0) {
        const newCode = [...twoFactorCode];
        newCode[index - 1] = '';
        setTwoFactorCode(newCode);
        inputRefs.current[index - 1]?.focus();
      } else if (twoFactorCode[index]) {
        const newCode = [...twoFactorCode];
        newCode[index] = '';
        setTwoFactorCode(newCode);
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const numbers = pastedData.replace(/\D/g, '').slice(0, 6);
    const newCode = [...twoFactorCode];
    numbers.split('').forEach((num, index) => { if (index < 6) newCode[index] = num; });
    setTwoFactorCode(newCode);
    const lastFilledIndex = Math.min(numbers.length - 1, 5);
    if (inputRefs.current[lastFilledIndex]) inputRefs.current[lastFilledIndex].focus();
  };

  const handleTwoFactorSubmit = async () => {
    const code = twoFactorCode.join('');
    if (code.length !== 6) { setError('Please enter a valid 6-digit code'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/verify-2fa', { userId: tempUserId, token: code });
      login(res.data);
      // Let the useEffect handle redirection
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid verification code');
      setLoading(false);
      setTwoFactorCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendCode = async () => {
    try {
      await api.post('/auth/resend-2fa', { userId: tempUserId });
      setResendTimer(30);
      setCanResend(false);
      setError(null);
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isTwoFactorStep) {
        await handleTwoFactorSubmit();
      } else {
        const res = await api.post('/auth/login', formData);
        if (res.data.twoFactorRequired) {
          setIsTwoFactorStep(true);
          setTempUserId(res.data.userId);
          setLoading(false);
        } else {
          login(res.data);
          // Let the useEffect handle redirection
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // --- RENDER ---
  if (isProcessingGoogle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <h2 className="text-xl font-semibold text-zinc-900">Verifying Account...</h2>
          <p className="text-slate-500">Please wait while we log you in.</p>
        </div>
      </div>
    );
  }

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
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl font-black text-zinc-900 mb-2">
                {isTwoFactorStep ? 'Two-Factor Verification' : 'Welcome back'}
              </h2>
              <p className="text-slate-600">
                {isTwoFactorStep
                  ? 'Enter the 6-digit code from your authenticator app.'
                  : 'Please enter your details to sign in.'
                }
              </p>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center font-medium"
                >
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isTwoFactorStep ? (
              <>
                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-medium py-3.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm cursor-pointer"
                >
                  <GoogleIcon />
                  <span>Sign in with Google</span>
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wider font-semibold">
                    <span className="px-4 bg-white text-slate-400">Or continue with email</span>
                  </div>
                </div>

                {/* Login Form */}
                <form className="space-y-5" onSubmit={onSubmit}>
                  <Input
                    icon={<Mail size={18} className="text-slate-400" />}
                    type="email"
                    placeholder="Email Address"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                    autoComplete="email"
                    autoFocus
                  />

                  <div className="relative">
                    <Input
                      icon={<Lock size={18} className="text-slate-400" />}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      name="password"
                      value={password}
                      onChange={onChange}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-zinc-900 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-zinc-900 border-slate-300 rounded focus:ring-zinc-900"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                        Remember me
                      </label>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-zinc-900 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-zinc-900 text-white font-bold py-4 px-4 rounded-xl hover:bg-black focus:outline-none focus:ring-4 focus:ring-zinc-200 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>
                </form>
              </>
            ) : (
              // --- 2FA FORM ---
              <div className="space-y-8">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                    <ShieldCheck size={32} className="text-blue-600" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-center gap-2" onClick={() => inputRefs.current[0]?.focus()}>
                    {twoFactorCode.map((digit, index) => (
                      <div
                        key={index}
                        className={`
                          relative w-12 h-14 border-2 rounded-xl flex items-center justify-center bg-slate-50
                          ${inputRefs.current[index] === document.activeElement
                            ? 'border-zinc-900 ring-4 ring-zinc-100 bg-white'
                            : 'border-slate-200'
                          }
                          transition-all duration-200 cursor-text
                        `}
                      >
                        <span className="text-2xl font-bold text-zinc-900">{digit}</span>
                        <input
                          ref={el => inputRefs.current[index] = el}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleTwoFactorInput(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={handlePaste}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          autoFocus={index === 0}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-sm text-slate-600">Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={!canResend}
                    className={`text-sm font-bold flex items-center gap-2 ${
                      canResend ? 'text-zinc-900 hover:text-blue-600' : 'text-slate-400 cursor-not-allowed'
                    } transition-colors`}
                  >
                    {canResend ? (
                      <>
                        <RefreshCw size={14} /> Resend Code
                      </>
                    ) : (
                      <span>Resend in {resendTimer}s</span>
                    )}
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTwoFactorSubmit}
                  disabled={loading || twoFactorCode.join('').length !== 6}
                  className="w-full bg-zinc-900 text-white font-bold py-4 px-4 rounded-xl hover:bg-black transition-all shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <span>Verify & Login</span>
                  )}
                </motion.button>

                <button
                  onClick={() => {
                    setIsTwoFactorStep(false);
                    setTwoFactorCode(['', '', '', '', '', '']);
                    setError(null);
                  }}
                  className="w-full text-center text-sm font-medium text-slate-500 hover:text-zinc-900 transition-colors"
                >
                  ← Use a different account
                </button>
              </div>
            )}

            {!isTwoFactorStep && (
              <div className="text-center pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Don't have an organization?{' '}
                  <Link to="/register" className="font-bold text-zinc-900 hover:underline">
                    Create one now
                  </Link>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: BRANDING --- */}
      <div className="hidden lg:flex lg:flex-1 relative bg-slate-50 overflow-hidden items-center justify-center p-12">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-100 rounded-full blur-[100px] opacity-50 mix-blend-multiply"></div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 max-w-lg"
        >
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide mb-6">
              <Shield size={12} />
              Enterprise Security
            </div>
            <h2 className="text-3xl font-black text-zinc-900 mb-4 leading-tight">
              Secure access for global teams.
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Protect your organization with Two-Factor Authentication, SSO, and bank-grade encryption.
            </p>

            <div className="space-y-4">
              {[
                "2FA & Device Management",
                "Real-time Security Alerts",
                "SOC2 Type II Compliant"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                  <CheckCircle2 size={18} className="text-green-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
