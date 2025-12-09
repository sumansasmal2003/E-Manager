import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Users, Notebook, Settings, Calendar, UserCheck,
  CheckSquare, Bell, ClipboardList, FileText, User, Loader2, UserPlus, Video
} from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useDebounce } from '../hooks/useDebounce';

// --- Static Actions ---
const staticActions = [
  { id: 'create_task', title: 'Create New Task', icon: <Plus size={18} />, action: (openModal) => openModal('createTask') },
  { id: 'create_team', title: 'Create New Team', icon: <Users size={18} />, action: (openModal) => openModal('createTeam') },
  { id: 'add_note', title: 'Add New Note', icon: <Notebook size={18} />, action: (openModal) => openModal('addNote') },
  { id: 'create_meeting', title: 'Schedule Meeting', icon: <Video size={18} />, action: (openModal) => openModal('createMeeting') },
  { id: 'add_member', title: 'Add New Member', icon: <UserPlus size={18} />, action: (openModal) => openModal('addMember') },
  { id: 'go_settings', title: 'Go to Settings', icon: <Settings size={18} />, link: '/settings' },
  { id: 'go_calendar', title: 'Go to Calendar', icon: <Calendar size={18} />, link: '/calendar' },
  { id: 'go_members', title: 'Go to Members', icon: <UserCheck size={18} />, link: '/members' },
  { id: 'go_attendance', title: 'Go to Attendance', icon: <CheckSquare size={18} />, link: '/attendance' },
  { id: 'go_notifications', title: 'Go to Notifications', icon: <Bell size={18} />, link: '/notifications' },
];

const CommandPalette = () => {
  const { modalState, closeModal, openModal, modalContext } = useModal();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const debouncedQuery = useDebounce(searchQuery, 300);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

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

  // Filter static actions
  const filteredStaticActions = staticActions.filter(action => {
    // Hide contextual actions if context isn't set
    if ((action.id === 'create_task' || action.id === 'create_meeting' || action.id === 'add_member') && !modalContext?.teamId) {
      return false;
    }
    return action.title.toLowerCase().includes(searchQuery.toLowerCase())
  });

  // Combine dynamic results
  const dynamicResults = [
    ...(results?.teams || []),
    ...(results?.tasks || []),
    ...(results?.members || []),
    ...(results?.notes || []),
    ...(results?.teamNotes || []),
  ];

  const allResults = [...filteredStaticActions, ...dynamicResults];

  const handleClose = () => {
    closeModal('commandPalette');
    setSearchQuery('');
    setResults(null);
    setSelectedIndex(0);
  };

  const handleSelect = (result) => {
    if (result.action) {
      result.action(openModal); // e.g., openModal('createTask')
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
