import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LogIn, UserPlus, LogOut, LayoutDashboard, Menu, X, User,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../api/axiosConfig';
import { useDebounce } from '../hooks/useDebounce';
import GlobalSearchResults from './GlobalSearchResults';
import Input from './Input';

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate(); // Already here, which is great
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const searchContainerRef = useRef(null);

  // This useEffect (for API calls) remains the same
  useEffect(() => {
    if (debouncedQuery.length > 1) {
      setIsSearching(true);
      api.get(`/search?q=${debouncedQuery}`)
        .then(res => {
          setResults(res.data);
          setIsSearching(false);
        })
        .catch(err => {
          console.error("Search failed:", err);
          setIsSearching(false);
          setResults(null);
        });
    } else {
      setResults(null);
      setIsSearching(false);
    }
  }, [debouncedQuery]);

  // This useEffect (for clicking outside) remains the same
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // This function remains the same
  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  // This function remains the same (with the fix from before)
  const isActiveRoute = (path) => {
    const current = location.pathname;
    if (path === "/" || path === "/today") {
        return current === "/" || current === "/today";
    }
    return current === path;
  };

  // --- *** MODIFICATION HERE *** ---
  // We rename 'clearSearch' to 'handleResultClick'
  // It now receives the 'link' and handles navigation
  const handleResultClick = (link) => {
    navigate(link); // 1. Navigate first

    // 2. Then clear and close the search dropdown
    setSearchQuery('');
    setResults(null);
    setIsSearching(false);
    setIsSearchFocused(false);
  };
  // --- *** END MODIFICATION *** ---

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo (remains the same) */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to={isLoggedIn ? "/" : "/"}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                E Manager
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          {isLoggedIn && (
            <div className="hidden md:block w-full max-w-md mx-4" ref={searchContainerRef}>
              <div className="relative">
                <Input
                  icon={<Search size={18} className="text-gray-400" />}
                  type="text"
                  placeholder="Search tasks, teams, members, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                />
                {isSearchFocused && (
                  <GlobalSearchResults
                    isLoading={isSearching}
                    results={results}
                    // --- *** MODIFICATION HERE *** ---
                    // Pass the new handler down
                    onResultClick={handleResultClick}
                    // --- *** END MODIFICATION *** ---
                  />
                )}
              </div>
            </div>
          )}

          {/* Desktop Navigation (remains the same) */}
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

          {/* Mobile menu button (remains the same) */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isLoggedIn && (
          <div className="md:hidden pt-2 pb-4" ref={isMobileMenuOpen ? null : searchContainerRef}>
            <div className="relative">
              <Input
                icon={<Search size={18} className="text-gray-400" />}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />
              {isSearchFocused && (
                <GlobalSearchResults
                  isLoading={isSearching}
                  results={results}
                  // --- *** MODIFICATION HERE *** ---
                  // Pass the new handler down
                  onResultClick={handleResultClick}
                  // --- *** END MODIFICATION *** ---
                />
              )}
            </div>
          </div>
        )}

        {/* Mobile Navigation (remains the same) */}
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
