import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Notebook, Users, LayoutDashboard, ChevronLeft, ChevronRight, Settings, Calendar,
  Menu, X, Sunrise, UserCheck, CheckSquare, Bell, User, Gamepad2, Brain, BarChart3,
  Server, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig'; // <-- Import API for interceptor

// Modals
import CommandPalette from '../components/CommandPalette';
import AddNoteModal from '../components/AddNoteModal';
import CreateTeamModal from '../components/CreateTeamModal';
import CreateTaskModal from '../components/CreateTaskModal';
import CreateMeetingModal from '../components/CreateMeetingModal';
import AddMemberModal from '../components/AddMemberModal';
import ShortcutsModal from '../components/ShortcutsModal';
import AiChatModal from '../components/AiChatModal';
import OnboardingModal from '../components/OnboardingModal';
import UpgradeModal from '../components/UpgradeModal'; // <-- Import UpgradeModal

// Sidebar Link Component
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
            ? 'bg-primary text-white shadow-sm'
            : 'text-gray-600 hover:text-primary hover:bg-gray-50'
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
  const navigate = useNavigate();
  const { isFirstLogin, user } = useAuth();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  const { modalState, openModal, closeModal, modalContext } = useModal();

  // --- 1. GLOBAL INTERCEPTOR FOR LIMITS ---
  useEffect(() => {
    // Intercept any response to check for "Upgrade" errors
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Check for 403 Forbidden + specific message content
        if (error.response && error.response.status === 403) {
          const msg = error.response.data?.message || '';

          // If the backend message mentions "Upgrade" or "limit"
          if (msg.toLowerCase().includes('upgrade') || msg.toLowerCase().includes('limit')) {
            openModal('upgradeModal', { message: msg });
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [openModal]);

  // --- End Interceptor ---

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const updateSidebarHeight = () => {
      const navbarHeight = 64;
      const footerHeight = 60;
      const containerPadding = 32;
      const viewportHeight = window.innerHeight;
      const calculatedHeight = viewportHeight - navbarHeight - footerHeight - containerPadding;
      setSidebarHeight(calculatedHeight);
    };
    updateSidebarHeight();
    window.addEventListener('resize', updateSidebarHeight);
    return () => window.removeEventListener('resize', updateSidebarHeight);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isTyping = e.target.tagName === 'INPUT' ||
                       e.target.tagName === 'TEXTAREA' ||
                       e.target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openModal('commandPalette');
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        openModal('aiChat');
        return;
      }

      if ((e.key === '?' || e.key === '/') && !isTyping) {
        e.preventDefault();
        if (!Object.values(modalState).some(isOpen => isOpen)) {
          openModal('shortcuts');
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openModal, modalState]);

  useEffect(() => {
    if (isFirstLogin) {
      const timer = setTimeout(() => {
        setShowOnboardingModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isFirstLogin]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/today' || path === '/') return 'Today\'s Command Center';
    if (path === '/dashboard') return 'Dashboard Overview';
    if (path === '/managers') return 'Organization Managers';
    if (path === '/notes') return 'My Notes';
    if (path === '/teams') return 'My Teams';
    if (path === '/settings') return 'My Settings';
    if (path === '/calendar') return 'My Calendar';
    if (path === '/members') return 'Team Members';
    if (path === '/attendance') return 'Attendance Tracking';
    if (path === '/notifications') return 'Notification Log';
    if (path === '/pricing') return 'Plans & Billing'; // Added title for Pricing
    return 'Dashboard';
  };

  const getPageDescription = () => {
    const path = location.pathname;
    if (path === '/today' || path === '/') return 'Your daily briefing and action items.';
    if (path === '/dashboard') return 'Welcome to your dashboard overview';
    if (path === '/managers') return 'Manage your team leads and their access.';
    if (path === '/notes') return 'Manage and organize your personal notes';
    if (path === '/teams') return 'Collaborate with your team members';
    if (path === '/settings') return 'Manage your account and connections';
    if (path === '/calendar') return 'View all your tasks and meetings in one place';
    if (path === '/members') return 'Manage your team members and roles';
    if (path === '/attendance') return 'Track and manage team attendance';
    if (path === '/notifications') return 'View a log of all sent emails';
    if (path === '/pricing') return 'Upgrade your workspace limits';
    return '';
  };

  const handleNavigate = () => {
    setIsMobileSidebarOpen(false);
  };

  const renderSidebarLinks = (isCollapsed) => (
    <>
      <SidebarLink to="/today" icon={<Sunrise size={isCollapsed ? 22 : 20} />} isCollapsed={isCollapsed} onNavigate={handleNavigate}>Today</SidebarLink>
      <SidebarLink to="/dashboard" icon={<LayoutDashboard size={isCollapsed ? 22 : 20} />} isCollapsed={isCollapsed} onNavigate={handleNavigate}>Overview</SidebarLink>

      {/* Show Managers link ONLY for Owners */}
      {user?.role === 'owner' && (
        <SidebarLink to="/managers" icon={<Briefcase size={isCollapsed ? 22 : 20} />} isCollapsed={isCollapsed} onNavigate={handleNavigate}>Managers</SidebarLink>
      )}

      <button
        onClick={() => {
          openModal('aiChat');
          handleNavigate();
        }}
        className={`group flex items-center cursor-pointer ${
          isCollapsed ? 'justify-center' : 'space-x-3'
        } px-3 py-3 rounded-xl transition-all duration-200 w-full ${
          modalState.aiChat
            ? 'bg-primary text-white shadow-sm'
            : 'text-gray-600 hover:text-primary hover:bg-gray-50'
        }`}
      >
        <div className={`${
          modalState.aiChat ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
        } flex-shrink-0`}>
          <Brain size={isCollapsed ? 22 : 20} />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-medium whitespace-nowrap overflow-hidden"
            >
              AI Assistant
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      <SidebarLink to="/ai-usage" icon={<BarChart3 size={isCollapsed ? 22 : 20} />} isCollapsed={isCollapsed} onNavigate={handleNavigate}>AI Usage</SidebarLink>
      <SidebarLink to="/notes" icon={<Notebook size={isCollapsed ? 22 : 20} />} isCollapsed={isCollapsed} onNavigate={handleNavigate}>My Notes</SidebarLink>
      <SidebarLink to="/teams" icon={<Users size={isCollapsed ? 22 : 20} />} isCollapsed={isCollapsed} onNavigate={handleNavigate}>My Teams</SidebarLink>
      <SidebarLink to="/members" icon={<UserCheck size={isCollapsed ? 22 : 20} />} isCollapsed={isCollapsed} onNavigate={handleNavigate}>Members</SidebarLink>
      <SidebarLink to="/attendance" icon={<CheckSquare size={isCollapsed ? 22 : 20} />} isCollapsed={isCollapsed} onNavigate={handleNavigate}>Attendance</SidebarLink>
      <SidebarLink to="/calendar" icon={<Calendar size={isCollapsed ? 22 : 20} />} isCollapsed={isCollapsed} onNavigate={handleNavigate}>Calendar</SidebarLink>
      <SidebarLink to="/games" icon={<Gamepad2 size={isCollapsed ? 22 : 20} />} isCollapsed={isCollapsed} onNavigate={handleNavigate}>Game Space</SidebarLink>
      <SidebarLink to="/notifications" icon={<Bell size={isCollapsed ? 22 : 20} />} isCollapsed={isCollapsed} onNavigate={handleNavigate}>Notifications</SidebarLink>
      <SidebarLink to="/profile" icon={<User size={isCollapsed ? 22 : 20} />} isCollapsed={isCollapsed} onNavigate={handleNavigate}>My Profile</SidebarLink>
      <SidebarLink to="/settings" icon={<Settings size={isCollapsed ? 22 : 20} />} isCollapsed={isCollapsed} onNavigate={handleNavigate}>Settings</SidebarLink>
      <SidebarLink to="/system-logs" icon={<Server size={isCollapsed ? 22 : 20} />} isCollapsed={isCollapsed} onNavigate={handleNavigate}>System Log</SidebarLink>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-semibold text-primary">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-gray-600 truncate">
              {getPageDescription()}
            </p>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 rounded-lg text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors"
          >
            {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 h-full">
          {/* Mobile Sidebar */}
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
                  className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 lg:hidden flex flex-col"
                >
                  <div className="p-4 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-primary">
                        Navigation
                      </h2>
                      <button
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <nav className="space-y-2 flex-1 overflow-y-auto">
                      {renderSidebarLinks(false)}
                    </nav>
                    <div className="pt-4 border-t border-gray-200 mt-4">
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
              isSidebarCollapsed ? 'lg:w-25' : 'lg:w-64'
            } transition-all duration-300`}
          >
            <motion.aside
              style={{ height: `${sidebarHeight}px` }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-32 flex flex-col"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="p-4 flex flex-col h-full">
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} mb-6`}>
                  {!isSidebarCollapsed && (
                    <motion.h2
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-lg font-semibold text-primary"
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
                <nav className="space-y-2 flex-1 overflow-y-auto">
                  {renderSidebarLinks(isSidebarCollapsed)}
                </nav>
                <div className={`pt-4 border-t border-gray-200 mt-4 ${isSidebarCollapsed ? 'text-center' : ''}`}>
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

          <main className="flex-1 min-w-0 lg:mt-0 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 hidden lg:block"
            >
              <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-2">
                {getPageTitle()}
              </h1>
              <p className="text-gray-600">
                {getPageDescription()}
              </p>
            </motion.div>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col"
            >
              <div className="p-4 lg:p-6 flex-1 overflow-y-auto">
                <Outlet />
              </div>
            </motion.div>
          </main>
        </div>
      </div>

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <p className="text-2xl font-bold text-primary">E-Manager</p>
              <p className="text-gray-600 text-sm mt-2">
                The AI-Powered Team Command Center.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-2 text-rose-600 text-sm">
              <p>© {new Date().getFullYear()} E-Manager. All rights reserved.</p>
              <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium">
                Terms of Service
              </Link>
              <Link to="/support" className="text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium">
                Support
              </Link>
            </div>
            </div>
          </div>
        </div>
      </footer>

      {/* --- Global Modals --- */}

      {/* 1. Limit/Upgrade Modal */}
      <UpgradeModal
        isOpen={modalState.upgradeModal}
        onClose={() => closeModal('upgradeModal')}
        message={modalContext?.message}
      />

      <CommandPalette />
      <ShortcutsModal />
      <AiChatModal />
      <OnboardingModal isOpen={showOnboardingModal} onClose={() => setShowOnboardingModal(false)} />

      {/* Entity Creation Modals */}
      <CreateTeamModal isOpen={modalState.createTeam} onClose={() => closeModal('createTeam')} onTeamCreated={(newTeam) => { modalContext?.onTeamCreated ? modalContext.onTeamCreated(newTeam) : navigate('/teams'); closeModal('createTeam'); }} />
      <AddNoteModal isOpen={modalState.addNote} onClose={() => closeModal('addNote')} onNoteAdded={(newNote) => { modalContext?.onNoteAdded ? modalContext.onNoteAdded(newNote) : navigate('/notes'); closeModal('addNote'); }} />
      <CreateTaskModal isOpen={modalState.createTask} onClose={() => closeModal('createTask')} teamId={modalContext?.teamId} members={modalContext?.teamMembers} onTasksCreated={(newTasks) => { modalContext?.onTasksCreated && modalContext.onTasksCreated(newTasks); closeModal('createTask'); }} />
      <CreateMeetingModal isOpen={modalState.createMeeting} onClose={() => closeModal('createMeeting')} teamId={modalContext?.teamId} members={modalContext?.teamMembers} onMeetingCreated={(newMeeting) => { modalContext?.onMeetingCreated && modalContext.onMeetingCreated(newMeeting); closeModal('createMeeting'); }} />
      <AddMemberModal isOpen={modalState.addMember} onClose={() => closeModal('addMember')} teamId={modalContext?.teamId} onMemberAdded={(updatedTeam) => { modalContext?.onMemberAdded && modalContext.onMemberAdded(updatedTeam); closeModal('addMember'); }} />
    </div>
  );
};

export default DashboardLayout;
