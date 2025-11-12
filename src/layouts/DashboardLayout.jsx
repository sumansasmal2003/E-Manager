import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Notebook, Users, LayoutDashboard, ChevronLeft, ChevronRight, Settings, Calendar, Menu, X, Sunrise, UserCheck, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarLink = ({ to, icon, children, isCollapsed, onNavigate }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group flex items-center ${
          isCollapsed ? 'justify-center' : 'space-x-3'
        } px-3 py-3 rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-gray-900 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`
      }
    >
      <div className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} flex-shrink-0`}>
        {icon}
      </div>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="font-medium whitespace-nowrap overflow-hidden"
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );
};

const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [sidebarHeight, setSidebarHeight] = useState(0);
  const location = useLocation();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Calculate sidebar height based on viewport
  useEffect(() => {
    const updateSidebarHeight = () => {
      const navbarHeight = 64; // h-16 = 64px
      const containerPadding = 32; // py-8 = 32px top + 32px bottom
      const viewportHeight = window.innerHeight;
      const calculatedHeight = viewportHeight - navbarHeight - containerPadding;
      setSidebarHeight(calculatedHeight);
    };

    updateSidebarHeight();
    window.addEventListener('resize', updateSidebarHeight);

    return () => window.removeEventListener('resize', updateSidebarHeight);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/today' || path === '/') return 'Today\'s Command Center';
    if (path === '/dashboard') return 'Dashboard Overview';
    if (path === '/notes') return 'My Notes';
    if (path === '/teams') return 'My Teams';
    if (path === '/settings') return 'My Settings';
    if (path === '/calendar') return 'My Calendar';
    return 'Dashboard';
  };

  const getPageDescription = () => {
    const path = location.pathname;
    if (path === '/today' || path === '/') return 'Your daily briefing and action items.';
    if (path === '/dashboard') return 'Welcome to your dashboard overview';
    if (path === '/notes') return 'Manage and organize your personal notes';
    if (path === '/teams') return 'Collaborate with your team members';
    if (path === '/settings') return 'Manage your account and connections';
    if (path === '/calendar') return 'View all your tasks and meetings in one place';
    return '';
  };

  const handleNavigate = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-gray-600 truncate">
              {getPageDescription()}
            </p>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {isMobileSidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-50 z-40 lg:hidden"
                  onClick={() => setIsMobileSidebarOpen(false)}
                />
                <motion.aside
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'tween', duration: 0.3 }}
                  className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 lg:hidden overflow-y-auto"
                >
                  <div className="p-4 h-full flex flex-col">
                    {/* Mobile Sidebar Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Navigation
                      </h2>
                      <button
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-2 flex-1">
                      <SidebarLink
                        to="/today"
                        icon={<Sunrise size={20} />}
                        isCollapsed={false}
                        onNavigate={handleNavigate}
                      >
                        Today
                      </SidebarLink>
                      <SidebarLink
                        to="/dashboard"
                        icon={<LayoutDashboard size={20} />}
                        isCollapsed={false}
                        onNavigate={handleNavigate}
                      >
                        Overview
                      </SidebarLink>
                      <SidebarLink
                        to="/notes"
                        icon={<Notebook size={20} />}
                        isCollapsed={false}
                        onNavigate={handleNavigate}
                      >
                        My Notes
                      </SidebarLink>
                      <SidebarLink
                        to="/teams"
                        icon={<Users size={20} />}
                        isCollapsed={false}
                        onNavigate={handleNavigate}
                      >
                        My Teams
                      </SidebarLink>
                      <SidebarLink
                to="/members"
                icon={<UserCheck size={20} />}
                isCollapsed={false}
                onNavigate={handleNavigate}
              >
                Members
              </SidebarLink>
              <SidebarLink
                to="/attendance"
                icon={<CheckSquare size={20} />}
                isCollapsed={false}
                onNavigate={handleNavigate}
              >
                Attendance
              </SidebarLink>
                      <SidebarLink
                        to="/calendar"
                        icon={<Calendar size={20} />}
                        isCollapsed={false}
                        onNavigate={handleNavigate}
                      >
                        Calendar
                      </SidebarLink>
                      <SidebarLink
                        to="/settings"
                        icon={<Settings size={20} />}
                        isCollapsed={false}
                        onNavigate={handleNavigate}
                      >
                        Settings
                      </SidebarLink>
                    </nav>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        E Manager v1.0
                      </p>
                    </div>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Desktop Sidebar */}
          <div
            className={`hidden lg:block shrink-0 ${
              isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
            } transition-all duration-300`}
          >
            <motion.aside
              style={{ height: `${sidebarHeight}px` }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-32"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="p-4 h-full flex flex-col">
                {/* Sidebar Header */}
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} mb-6`}>
                  {!isSidebarCollapsed && (
                    <motion.h2
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-lg font-semibold text-gray-900"
                    >
                      Navigation
                    </motion.h2>
                  )}
                  <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors hidden lg:flex"
                  >
                    {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-2 flex-1">
                  <SidebarLink
                    to="/today"
                    icon={<Sunrise size={isSidebarCollapsed ? 22 : 20} />}
                    isCollapsed={isSidebarCollapsed}
                    onNavigate={handleNavigate}
                  >
                    Today
                  </SidebarLink>
                  <SidebarLink
                    to="/dashboard"
                    icon={<LayoutDashboard size={isSidebarCollapsed ? 22 : 20} />}
                    isCollapsed={isSidebarCollapsed}
                    onNavigate={handleNavigate}
                  >
                    Overview
                  </SidebarLink>
                  <SidebarLink
                    to="/notes"
                    icon={<Notebook size={isSidebarCollapsed ? 22 : 20} />}
                    isCollapsed={isSidebarCollapsed}
                    onNavigate={handleNavigate}
                  >
                    My Notes
                  </SidebarLink>
                  <SidebarLink
                    to="/teams"
                    icon={<Users size={isSidebarCollapsed ? 22 : 20} />}
                    isCollapsed={isSidebarCollapsed}
                    onNavigate={handleNavigate}
                  >
                    My Teams
                  </SidebarLink>
                  <SidebarLink
                to="/members"
                icon={<UserCheck size={isSidebarCollapsed ? 22 : 20} />}
                isCollapsed={isSidebarCollapsed}
                onNavigate={handleNavigate}
              >
                Members
              </SidebarLink>
              <SidebarLink
                to="/attendance"
                icon={<CheckSquare size={isSidebarCollapsed ? 22 : 20} />}
                isCollapsed={isSidebarCollapsed}
                onNavigate={handleNavigate}
              >
                Attendance
              </SidebarLink>
                  <SidebarLink
                    to="/calendar"
                    icon={<Calendar size={isSidebarCollapsed ? 22 : 20} />}
                    isCollapsed={isSidebarCollapsed}
                    onNavigate={handleNavigate}
                  >
                    Calendar
                  </SidebarLink>
                  <SidebarLink
                    to="/settings"
                    icon={<Settings size={isSidebarCollapsed ? 22 : 20} />}
                    isCollapsed={isSidebarCollapsed}
                    onNavigate={handleNavigate}
                  >
                    Settings
                  </SidebarLink>
                </nav>

                <div className={`pt-4 border-t border-gray-200 ${isSidebarCollapsed ? 'text-center' : ''}`}>
                  {!isSidebarCollapsed && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-gray-500"
                    >
                      E Manager v1.0
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.aside>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 lg:mt-0">
            {/* Desktop Page Header - Hidden on mobile */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 hidden lg:block"
            >
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {getPageTitle()}
              </h1>
              <p className="text-gray-600">
                {getPageDescription()}
              </p>
            </motion.div>

            {/* Page Content */}
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4 lg:p-6">
                <Outlet />
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
