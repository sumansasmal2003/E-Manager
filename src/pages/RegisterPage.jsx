import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Shield, CheckCircle, Users, Calendar, FilePieChart, Zap } from 'lucide-react';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const { username, email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        'https://e-manager-backend-6vwv.onrender.com/api/auth/register',
        formData
      );

      login(res.data);
      setLoading(false);
      navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Password strength indicators
  const passwordStrength = {
    length: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Registration Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-md lg:max-w-lg">
          {/* Mobile Logo */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden flex justify-center mb-8"
          >
            <Link to="/" className="inline-flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <Shield className="text-white" size={20} />
              </div>
              <span className="text-2xl font-bold text-gray-900">E-Manager</span>
            </Link>
          </motion.div>

          <motion.div
            className="w-full bg-white lg:bg-transparent lg:border-0 lg:shadow-none border border-gray-200 rounded-2xl shadow-sm p-8 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="text-center space-y-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mx-auto w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center"
              >
                <User className="text-white" size={20} />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                Create Account
              </h2>
              <p className="text-gray-600 text-base">
                Join E-Manager and take control of your work
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Registration Form */}
            <form className="space-y-6" onSubmit={onSubmit}>
              <Input
                icon={<User size={18} className="text-gray-400" />}
                type="text"
                placeholder="Enter your username"
                name="username"
                value={username}
                onChange={onChange}
                required
                autoComplete="username"
              />

              <Input
                icon={<Mail size={18} className="text-gray-400" />}
                type="email"
                placeholder="Enter your email"
                name="email"
                value={email}
                onChange={onChange}
                required
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  icon={<Lock size={18} className="text-gray-400" />}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                  minLength="6"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Enhanced Password Requirements */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <p className="text-sm font-medium text-gray-900 mb-3">Password requirements:</p>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle
                        size={14}
                        className={`mr-2 ${passwordStrength.length ? 'text-green-500' : 'text-gray-300'}`}
                      />
                      At least 6 characters
                    </li>
                    <li className="flex items-center">
                      <CheckCircle
                        size={14}
                        className={`mr-2 ${passwordStrength.hasUppercase ? 'text-green-500' : 'text-gray-300'}`}
                      />
                      One uppercase letter
                    </li>
                    <li className="flex items-center">
                      <CheckCircle
                        size={14}
                        className={`mr-2 ${passwordStrength.hasLowercase ? 'text-green-500' : 'text-gray-300'}`}
                      />
                      One lowercase letter
                    </li>
                    <li className="flex items-center">
                      <CheckCircle
                        size={14}
                        className={`mr-2 ${passwordStrength.hasNumber ? 'text-green-500' : 'text-gray-300'}`}
                      />
                      One number
                    </li>
                  </ul>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white font-medium py-3.5 px-4 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </motion.button>
            </form>

            {/* Terms and Login Link */}
            <div className="text-center space-y-4">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-gray-700 hover:text-gray-900 underline underline-offset-2">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-gray-700 hover:text-gray-900 underline underline-offset-2">
                  Privacy Policy
                </Link>
              </p>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-gray-900 hover:text-gray-700 transition-colors underline underline-offset-2"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Section - Brand & Benefits */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:p-12 xl:p-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg"
        >
          <Link to="/" className="inline-flex items-center space-x-3 mb-16">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <Shield className="text-white" size={20} />
            </div>
            <span className="text-2xl font-bold text-gray-900">E-Manager</span>
          </Link>

          <div className="space-y-8">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl xl:text-5xl font-bold text-gray-900 leading-tight mb-4"
              >
                Start your journey to
                <span className="block text-gray-700">better team leadership</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-gray-600 leading-relaxed"
              >
                Join thousands of team leaders who have transformed their workflow with our all-in-one management platform.
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
                  icon: <Users className="text-gray-900" size={20} />,
                  title: "Smart Team Management",
                  description: "Organize unlimited teams and members with intuitive controls"
                },
                {
                  icon: <Calendar className="text-gray-900" size={20} />,
                  title: "Effortless Scheduling",
                  description: "Schedule meetings and track attendance in one place"
                },
                {
                  icon: <FilePieChart className="text-gray-900" size={20} />,
                  title: "AI-Powered Insights",
                  description: "Generate professional reports with intelligent analytics"
                },
                {
                  icon: <Zap className="text-gray-900" size={20} />,
                  title: "Instant Setup",
                  description: "Get started in minutes with no complex configuration"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (index * 0.1) }}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-3 gap-8 text-center"
        >
          <div>
            <div className="text-2xl font-bold text-gray-900">500+</div>
            <div className="text-xs text-gray-500">Team Leaders</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">10K+</div>
            <div className="text-xs text-gray-500">Teams Managed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">99%</div>
            <div className="text-xs text-gray-500">Satisfaction</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
