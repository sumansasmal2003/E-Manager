import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Key, CheckCircle, ArrowLeft, Shield, Users, Clock, Zap } from 'lucide-react';
import Input from '../components/Input';
import api from '../api/axiosConfig';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'success'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');

  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef([]);

  // Variant for page transitions
  const pageVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle OTP key down for backspace and navigation
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split('').slice(0, 6);
      const updatedOtp = [...otp];
      newOtp.forEach((digit, index) => {
        updatedOtp[index] = digit;
      });
      setOtp(updatedOtp);

      // Focus the next empty input or the last one
      const nextEmptyIndex = newOtp.length < 6 ? newOtp.length : 5;
      otpRefs.current[nextEmptyIndex]?.focus();
    }
  };

  // Resend OTP functionality
  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      setResendCooldown(30); // 30 seconds cooldown
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    }
    setLoading(false);
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      setStep('otp');
      setResendCooldown(30); // Start cooldown
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send code');
    }
    setLoading(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/reset-password', { otp: otpString, password });
      setMessage(res.data.message);
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <>
      <div className="min-h-screen flex">
        {/* Left Section - Brand & Features */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:p-12 xl:p-16 bg-gradient-to-br from-gray-50 to-gray-100">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-lg"
          >
            <Link to="/" className="inline-flex items-center space-x-3 mb-16">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Shield className="text-white" size={20} />
              </div>
              <span className="text-2xl font-bold text-primary">E-Manager</span>
            </Link>

            <div className="space-y-8">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl xl:text-5xl font-bold text-primary leading-tight mb-4"
                >
                  Secure Account
                  <span className="block text-gray-700">Recovery</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-gray-600 leading-relaxed"
                >
                  We take your account security seriously. Follow these simple steps to securely reset your password and regain access to your team management dashboard.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                {[
                  {
                    icon: <Mail className="text-primary" size={20} />,
                    text: "Enter your email address to receive a secure code"
                  },
                  {
                    icon: <Key className="text-primary" size={20} />,
                    text: "Check your email and enter the 6-digit verification code"
                  },
                  {
                    icon: <Lock className="text-primary" size={20} />,
                    text: "Create a new strong password for your account"
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                      {feature.icon}
                    </div>
                    <span className="text-gray-700 font-medium">{feature.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Bottom text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center lg:text-left"
          >
            <p className="text-gray-500 text-sm">
              Trusted by 500+ team leaders worldwide
            </p>
          </motion.div>
        </div>

        {/* Right Section - Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="mx-auto w-full max-w-md lg:max-w-lg">
            {/* Mobile Logo */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:hidden flex justify-center mb-8"
            >
              <Link to="/" className="inline-flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Shield className="text-white" size={20} />
                </div>
                <span className="text-2xl font-bold text-primary">E-Manager</span>
              </Link>
            </motion.div>

            <motion.div
              className="w-full bg-white lg:bg-transparent lg:border-0 lg:shadow-none border border-gray-200 rounded-2xl shadow-sm p-8 space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <AnimatePresence mode="wait">
                {/* --- STEP 1: EMAIL FORM --- */}
                {step === 'email' && (
                  <motion.div
                    key="email"
                    variants={pageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <div className="text-center space-y-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                        className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center"
                      >
                        <Key className="text-white" size={20} />
                      </motion.div>
                      <h2 className="text-3xl font-bold text-primary">Forgot Password?</h2>
                      <p className="text-gray-600 text-base">
                        No problem! Enter your email and we'll send you a secure reset code.
                      </p>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center"
                      >
                        {error}
                      </motion.div>
                    )}

                    <form className="space-y-6" onSubmit={handleEmailSubmit}>
                      <Input
                        icon={<Mail size={18} className="text-gray-400" />}
                        type="email"
                        placeholder="Enter your email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-medium py-3.5 px-4 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sending Code...</span>
                          </div>
                        ) : (
                          'Send Reset Code'
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}

                {/* --- STEP 2: OTP & NEW PASSWORD FORM --- */}
                {step === 'otp' && (
                  <motion.div
                    key="otp"
                    variants={pageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <div className="text-center space-y-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                        className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center"
                      >
                        <Lock className="text-white" size={20} />
                      </motion.div>
                      <h2 className="text-3xl font-bold text-primary">Check Your Email</h2>
                      <p className="text-gray-600 text-base">
                        {message || "We've sent a 6-digit verification code to your email address."}
                      </p>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center"
                      >
                        {error}
                      </motion.div>
                    )}

                    <form className="space-y-6" onSubmit={handleResetSubmit}>
                      {/* OTP Input */}
                      <div className="space-y-4">
                        <label className="text-sm font-medium text-gray-700 text-center block">
                          Enter 6-digit verification code
                        </label>
                        <div className="flex justify-center space-x-3">
                          {otp.map((digit, index) => (
                            <motion.input
                              key={index}
                              ref={(el) => (otpRefs.current[index] = el)}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength="1"
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              onPaste={handleOtpPaste}
                              className="w-12 h-12 text-center text-lg font-semibold bg-white border-2 border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 outline-none"
                              autoFocus={index === 0}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          Can't find the code? Check your spam folder
                        </p>
                      </div>

                      {/* Resend OTP */}
                      <div className="text-center">
                        {resendCooldown > 0 ? (
                          <p className="text-sm text-gray-500">
                            Resend code in <span className="font-semibold">{resendCooldown}s</span>
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={loading}
                            className="text-sm text-gray-600 hover:text-primary font-medium transition-colors disabled:opacity-50"
                          >
                            Didn't receive code? Resend
                          </button>
                        )}
                      </div>

                      <Input
                        icon={<Lock size={18} className="text-gray-400" />}
                        type="password"
                        placeholder="Create new password (min. 6 characters)"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength="6"
                        autoComplete="new-password"
                      />
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading || otp.join('').length !== 6}
                        className="w-full bg-primary text-white font-medium py-3.5 px-4 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Resetting Password...</span>
                          </div>
                        ) : (
                          'Set New Password'
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}

                {/* --- STEP 3: SUCCESS --- */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    variants={pageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="text-center space-y-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle className="text-green-600" size={32} />
                    </motion.div>
                    <div>
                      <h2 className="text-3xl font-bold text-primary">Password Reset Successfully!</h2>
                      <p className="text-gray-600 text-base mt-3">
                        {message || "Your password has been reset successfully. You can now log in with your new password."}
                      </p>
                    </div>
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center space-x-3 bg-primary text-white font-medium py-3.5 px-8 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <ArrowLeft size={18} />
                      <span>Back to Login</span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Back to Login Link */}
              {step !== 'success' && (
                <div className="text-center border-t border-gray-200 pt-6">
                  <Link
                    to="/login"
                    className="text-sm text-gray-600 hover:text-primary transition-colors font-medium flex items-center justify-center"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Login
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
