import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Users, Notebook, Settings, Calendar, UserCheck,
  CheckSquare, Bell, ClipboardList, FileText, User, Loader2, Briefcase, Video
} from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useDebounce } from '../hooks/useDebounce';

const CommandPalette = () => {
  const { modalState, closeModal, openModal, modalContext } = useModal();
  const { user } = useAuth(); // Get current user
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const debouncedQuery = useDebounce(searchQuery, 300);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // --- ROLE & PERMISSION CHECKS ---
  const isOwner = user?.role === 'owner';
  const isManager = user?.role === 'manager';
  const isEmployee = user?.role === 'employee';

  const canCreateTasks = isOwner || (isManager && user?.permissions?.canCreateTasks !== false);
  const canCreateMeetings = isOwner || (isManager && user?.permissions?.canCreateMeetings !== false);
  const canCreateNotes = isOwner || (isManager && user?.permissions?.canCreateNotes !== false);

  // View Permissions
  const canViewMembers = isOwner || isManager; // Employees usually shouldn't browse full member list via shortcut
  const canViewAttendance = isOwner || (isManager && user?.permissions?.canMarkAttendance !== false);

  // --- DEFINE ACTIONS DYNAMICALLY ---
  const getActions = () => {
    const actions = [];

    // 1. GLOBAL ACTIONS (Always available if permitted)

    // Create Team: OWNER ONLY
    if (isOwner) {
      actions.push({ id: 'create_team', title: 'Create New Team', icon: <Users size={18} />, action: (open) => open('createTeam') });
    }

    // Hire Employee: OWNER ONLY (Replaces Add Member)
    // "remove the add new member... give the hire member functionality but not for managers or members"
    if (isOwner) {
      actions.push({ id: 'hire_employee', title: 'Hire New Employee', icon: <Briefcase size={18} />, action: (open) => open('createEmployee') });
    }

    // Settings: Owner or Manager (maybe restricted for Employee)
    if (!isEmployee) {
      actions.push({ id: 'go_settings', title: 'Go to Settings', icon: <Settings size={18} />, link: '/settings' });
    }

    // Calendar: If permitted
    if (user?.permissions?.canViewCalendar !== false) {
      actions.push({ id: 'go_calendar', title: 'Go to Calendar', icon: <Calendar size={18} />, link: '/calendar' });
    }

    // Members: Owner/Manager only
    if (canViewMembers) {
      actions.push({ id: 'go_members', title: 'Go to Members', icon: <UserCheck size={18} />, link: '/members' });
    }

    // Attendance: Owner/Manager with permission
    if (canViewAttendance) {
      actions.push({ id: 'go_attendance', title: 'Go to Attendance', icon: <CheckSquare size={18} />, link: '/attendance' });
    }

    // Notifications: Everyone
    if (user?.permissions?.canViewNotifications !== false) {
      actions.push({ id: 'go_notifications', title: 'Go to Notifications', icon: <Bell size={18} />, link: '/notifications' });
    }

    // 2. CONTEXTUAL ACTIONS (Only when on a Team Page)
    // We check modalContext?.teamId to ensure we are in a team context
    if (modalContext?.teamId) {

      // Create Task: Owner or Permitted Manager (Not Employee)
      if (canCreateTasks) {
        actions.push({ id: 'create_task', title: 'Create New Task', icon: <Plus size={18} />, action: (open) => open('createTask') });
      }

      // Create Meeting: Owner or Permitted Manager (Not Employee)
      if (canCreateMeetings) {
        actions.push({ id: 'create_meeting', title: 'Schedule Meeting', icon: <Video size={18} />, action: (open) => open('createMeeting') });
      }

      // Add Note: Owner or Permitted Manager (Not Employee)
      if (canCreateNotes) {
        actions.push({ id: 'add_note', title: 'Add New Note', icon: <Notebook size={18} />, action: (open) => open('addNote') });
      }
    }

    return actions;
  };

  const staticActions = getActions();

  // Focus input when modal opens
  useEffect(() => {
    if (modalState.commandPalette) {
      inputRef.current?.focus();
    }
  }, [modalState.commandPalette]);

  // API Search Logic
  useEffect(() => {
    if (debouncedQuery.length > 1) {
      setIsSearching(true);
      api.get(`/search?q=${debouncedQuery}`)
        .then(res => setResults(res.data))
        .catch(err => console.error("Search failed:", err))
        .finally(() => setIsSearching(false));
    } else {
      setResults(null);
      setIsSearching(false);
    }
  }, [debouncedQuery]);

  // Filter static actions based on search
  const filteredStaticActions = staticActions.filter(action =>
    action.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Combine dynamic results
  const dynamicResults = [
    ...(results?.teams || []),
    ...(results?.tasks || []),
    ...(results?.members || []),
    ...(results?.notes || []),
    ...(results?.teamNotes || []),
  ];

  // OPTIONAL: You could strictly filter dynamicResults here if the API leaks data
  // e.g., Filter teams where user is not a member (if you had that list)

  const allResults = [...filteredStaticActions, ...dynamicResults];

  const handleClose = () => {
    closeModal('commandPalette');
    setSearchQuery('');
    setResults(null);
    setSelectedIndex(0);
  };

  const handleSelect = (result) => {
    if (result.action) {
      result.action(openModal);
    } else if (result.link) {
      navigate(result.link);
    } else if (result.teamName) { // Team
      navigate(`/team/${result._id}`);
    } else if (result.status) { // Task
      navigate(`/team/${result.team._id}`);
    } else if (result.joiningDate) { // Member
      navigate(`/members/details?name=${encodeURIComponent(result.name)}`);
    } else if (result.category) { // Personal Note
      navigate('/notes');
    } else if (result.team) { // Team Note
      navigate(`/team/${result.team._id}`);
    }
    handleClose();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % allResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + allResults.length) % allResults.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allResults[selectedIndex]) {
          handleSelect(allResults[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };
    if (modalState.commandPalette) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState.commandPalette, allResults, selectedIndex]);

  // Scroll to active item
  useEffect(() => {
    resultsRef.current?.querySelector(`[data-index="${selectedIndex}"]`)?.scrollIntoView({
      block: 'nearest',
    });
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {modalState.commandPalette && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[20vh]"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[60vh] overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {isSearching ? <Loader2 size={18} className="text-gray-400 animate-spin" /> : <Search size={18} className="text-gray-400" />}
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for actions or content..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelectedIndex(0); }}
                className="w-full pl-11 pr-4 py-4 text-lg border-b border-gray-200 focus:outline-none"
              />
            </div>

            {/* Results */}
            <div ref={resultsRef} className="flex-1 overflow-y-auto p-2">
              {allResults.length === 0 && !isSearching && (
                <div className="text-center p-6 text-gray-500">
                  No results found.
                </div>
              )}

              {allResults.map((result, index) => {
                let icon, title, subtitle;

                if (result.action || result.link) {
                  icon = result.icon;
                  title = result.title;
                  subtitle = "Action";
                }
                else if (result.teamName) {
                  icon = <Users size={18} />;
                  title = result.teamName;
                  subtitle = "Team";
                }
                else if (result.status) {
                  icon = <ClipboardList size={18} />;
                  title = result.title;
                  subtitle = `Task in ${result.team.teamName}`;
                }
                else if (result.joiningDate) {
                  icon = <User size={18} />;
                  title = result.name;
                  subtitle = "Member";
                }
                else if (result.category) {
                  icon = <Notebook size={18} />;
                  title = result.title;
                  subtitle = "Personal Note";
                }
                else if (result.team) {
                  icon = <FileText size={18} />;
                  title = result.title;
                  subtitle = `Note in ${result.team.teamName}`;
                }

                return (
                  <button
                    key={result.id || result._id}
                    data-index={index}
                    onClick={() => handleSelect(result)}
                    className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg ${
                      index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-500">
                      {icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-primary truncate">{title}</p>
                      <p className="text-xs text-gray-500 truncate">{subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
