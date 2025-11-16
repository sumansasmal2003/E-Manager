import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LogIn, UserPlus, LogOut, LayoutDashboard, Menu, X, User,
  Search,
  Shield,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../context/ModalContext';

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openModal } = useModal();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const isActiveRoute = (path) => {
    const current = location.pathname;
    if (path === "/" || path === "/today") {
      return current === "/" || current === "/today";
    }
    return current === path;
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to={isLoggedIn ? "/" : "/"}
              className="flex items-center space-x-3 group"
            >
              <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center group-hover:bg-gray-800 transition-colors duration-200">
                <Shield className="text-white" size={18} />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block tracking-tight">
                E Manager
              </span>
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {/* Search & Shortcuts */}
                <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-1">
                  <button
                    onClick={() => openModal('commandPalette')}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white transition-all duration-200 border border-transparent hover:border-gray-200 min-w-[200px] justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Search size={16} className="text-gray-400" />
                      <span className="text-gray-500">Search...</span>
                    </div>
                    <kbd className="px-1.5 py-0.5 text-xs font-medium text-gray-400 bg-white border border-gray-200 rounded-md shadow-sm">
                      Ctrl + k
                    </kbd>
                  </button>

                  <div className="h-6 w-px bg-gray-300"></div>

                  <button
                    onClick={() => openModal('shortcuts')}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white transition-all duration-200"
                  >
                    <Info size={16} className="text-gray-400" />
                    <span>Shortcuts</span>
                  </button>
                </div>

                {/* Navigation */}
                <div className="flex items-center space-x-2 bg-gray-50 rounded-xl p-1">
                  <Link
                    to="/"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveRoute('/')
                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>

                  <div className="h-6 w-px bg-gray-300"></div>

                  <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={12} className="text-gray-600" />
                    </div>
                    <span className="font-medium">{user?.username}</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveRoute('/login')
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <LogIn size={16} />
                  <span>Sign in</span>
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2 shadow-sm"
                >
                  <UserPlus size={16} />
                  <span>Get started</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            {isLoggedIn && (
              <button
                onClick={() => openModal('commandPalette')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Search size={20} />
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200 bg-white"
            >
              <div className="py-3 space-y-1">
                {isLoggedIn ? (
                  <>
                    {/* User Info */}
                    <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 mx-3 rounded-lg mb-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User size={14} className="text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user?.username}</div>
                        <div className="text-xs text-gray-500">Active</div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="px-3 py-2">
                      <button
                        onClick={() => {
                          openModal('commandPalette');
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 w-full text-left border border-gray-200"
                      >
                        <Search size={18} />
                        <div className="flex-1">
                          <div className="font-medium">Search & Actions</div>
                          <div className="text-xs text-gray-500 mt-0.5">Quick access to everything</div>
                        </div>
                      </button>
                    </div>

                    {/* Navigation Links */}
                    <Link
                      to="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 mx-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActiveRoute('/')
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <LayoutDashboard size={18} />
                      <span>Dashboard</span>
                    </Link>

                    <button
                      onClick={() => {
                        openModal('shortcuts');
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 mx-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 w-full text-left"
                    >
                      <Info size={18} />
                      <span>Keyboard Shortcuts</span>
                    </button>

                    <div className="border-t border-gray-200 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 mx-3 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 w-full text-left"
                    >
                      <LogOut size={18} />
                      <span>Log out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 mx-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActiveRoute('/login')
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <LogIn size={18} />
                      <span>Sign in</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 mx-3 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200"
                    >
                      <UserPlus size={18} />
                      <span>Create account</span>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
