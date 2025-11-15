import React, { useState } from 'react'; // <-- Removed useEffect, useRef
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LogIn, UserPlus, LogOut, LayoutDashboard, Menu, X, User,
  Search,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../context/ModalContext'; // <-- 1. IMPORT useModal

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- 2. GET openModal FROM THE CONTEXT ---
  const { openModal } = useModal();

  // --- 3. ALL SEARCH-RELATED STATE, REFS, AND EFFECTS ARE REMOVED ---

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

  // --- 4. handleResultClick IS REMOVED ---

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to={isLoggedIn ? "/" : "/"}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <Shield className="text-white" size={20} />
            </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                E Manager
              </span>
            </Link>
          </div>

          {/* --- 5. DESKTOP SEARCH BAR REPLACED WITH BUTTON --- */}
          {isLoggedIn && (
            <div className="hidden md:block">
              <button
                onClick={() => openModal('commandPalette')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200 border border-gray-300 hover:border-gray-400"
              >
                <Search size={16} />
                <span>Search...</span>
                <kbd className="ml-4 px-2 py-0.5 text-xs font-sans text-gray-400 border border-gray-300 rounded-md">
                  Ctrl+K
                </kbd>
              </button>
            </div>
          )}
          {/* --- END OF REPLACEMENT --- */}


          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isLoggedIn ? (
              <>
                <div className="flex items-center space-x-6">
                  <Link
                    to="/"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveRoute('/')
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
               <div className="flex items-center space-x-4">
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
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2"
                >
                  <UserPlus size={16} />
                  <span>Get started</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* --- 6. MOBILE SEARCH BAR REMOVED --- */}
        {/* The search bar that was here is now gone. */}

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4 space-y-3"
            >
              {isLoggedIn ? (
                <>
                  <div className="flex items-center space-x-3 px-2 py-3 bg-gray-50 rounded-lg">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{user?.username}</span>
                  </div>

                  {/* --- 7. ADDED MOBILE SEARCH BUTTON --- */}
                  <button
                    onClick={() => {
                      openModal('commandPalette');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 w-full text-left"
                  >
                    <Search size={16} />
                    <span>Search &amp; Actions</span>
                  </button>
                  {/* --- END OF ADDITION --- */}

                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 w-full ${
                      isActiveRoute('/')
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 w-full text-left"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 w-full ${
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
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 w-full"
                  >
                    <UserPlus size={16} />
                    <span>Create account</span>
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
