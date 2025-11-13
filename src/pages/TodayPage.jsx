import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import {
  Clock,
  AlertTriangle,
  CalendarCheck,
  FileText,
  Plus,
  Sunrise,
  Send,
  Loader2,
  Calendar,
  CheckCircle,
  Users,
  Target,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../components/Input';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-component for the Quick Add Note form ---
const QuickAddNote = ({ onNoteAdded }) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/notes', {
        title,
        content: '(Quick-add from Today page)',
        planPeriod: 'This Week',
        category: 'Personal',
      });
      onNoteAdded(res.data);
      setTitle('');
      setIsExpanded(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add note');
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
    >
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-4 flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Plus size={18} />
          <span className="font-medium">Add to Weekly Plan</span>
        </button>
      ) : (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleSubmit}
          className="p-4"
        >
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Add Quick Note
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                icon={<FileText size={18} className="text-gray-400" />}
                type="text"
                placeholder="What's on your mind..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoComplete="off"
                autoFocus
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center space-x-2 bg-gray-900 text-white px-4 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl min-w-[100px]"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                <span className="hidden sm:inline">Add</span>
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="flex items-center justify-center px-4 py-3 rounded-xl border border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-all duration-200"
              >
                <span className="text-sm font-medium">Cancel</span>
              </button>
            </div>
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-600 mt-2"
            >
              {error}
            </motion.p>
          )}
        </motion.form>
      )}
    </motion.div>
  );
};

// --- Stats Card Component ---
const StatsCard = ({ icon, title, value, color, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 text-center"
  >
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
      {icon}
    </div>
    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm font-semibold text-gray-700 mb-2">{title}</div>
    <div className="text-xs text-gray-500">{description}</div>
  </motion.div>
);

// --- Main Today Page Component ---
const TodayPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stats/action-items');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch action items');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNoteAdded = (newNote) => {
    setData(prevData => ({
      ...prevData,
      weeklyNotes: [newNote, ...prevData.weeklyNotes],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sunrise className="text-white" size={24} />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your day...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-2xl border border-red-200 shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load your day</h3>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors w-full"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const { todayMeetings = [], actionTasks = { overdue: [], dueToday: [] }, weeklyNotes = [] } = data || {};

  // Calculate stats for the overview
  const totalUrgentTasks = actionTasks.overdue.length + actionTasks.dueToday.length;
  const hasUrgentTasks = totalUrgentTasks > 0;
  const hasMeetings = todayMeetings.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Good Morning
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Here's your overview for {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 w-fit">
              <Zap size={20} className="text-amber-500" />
              <span className="text-sm font-semibold text-gray-900">
                {totalUrgentTasks} urgent items
              </span>
            </div>
          </div>

          {/* Mobile Section Navigation */}
          <div className="lg:hidden bg-white rounded-2xl border border-gray-200 shadow-sm p-2 mb-6">
            <nav className="flex space-x-1">
              {[
                { id: 'overview', name: 'Overview', icon: Target },
                { id: 'meetings', name: 'Meetings', icon: Users },
                { id: 'tasks', name: 'Tasks', icon: CheckCircle },
                { id: 'plan', name: 'Plan', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex-1 flex flex-col items-center py-3 px-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                      activeSection === tab.id
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={16} className="mb-1" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <StatsCard
              icon={<Clock className="text-blue-600" size={24} />}
              title="Today's Meetings"
              value={todayMeetings.length}
              color="bg-blue-100"
              description="Scheduled sessions"
            />
            <StatsCard
              icon={<AlertTriangle className="text-red-600" size={24} />}
              title="Overdue Tasks"
              value={actionTasks.overdue.length}
              color="bg-red-100"
              description="Require attention"
            />
            <StatsCard
              icon={<CalendarCheck className="text-amber-600" size={24} />}
              title="Due Today"
              value={actionTasks.dueToday.length}
              color="bg-amber-100"
              description="To be completed"
            />
            <StatsCard
              icon={<FileText className="text-green-600" size={24} />}
              title="Weekly Notes"
              value={weeklyNotes.length}
              color="bg-green-100"
              description="In your plan"
            />
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Column - Desktop */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Mobile Content Switcher */}
            <AnimatePresence mode="wait">
              {/* Overview Section (Mobile) */}
              {(activeSection === 'overview' || !window.matchMedia('(max-width: 1024px)').matches) && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="lg:block"
                >
                  {/* Today's Meetings Card */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Clock className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">Today's Meetings</h2>
                          <p className="text-sm text-gray-600">Your scheduled sessions</p>
                        </div>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium ml-auto">
                          {todayMeetings.length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {todayMeetings.length > 0 ? (
                          todayMeetings.map(meeting => (
                            <Link
                              to={`/team/${meeting.team._id}`}
                              key={meeting._id}
                              className="block p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-200 group"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 truncate">
                                    {meeting.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 truncate">{meeting.team.teamName}</p>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-700">
                                  <Clock size={14} />
                                  <span className="font-medium whitespace-nowrap">
                                    {new Date(meeting.meetingTime).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Calendar className="mx-auto text-gray-300 mb-3" size={32} />
                            <p className="text-gray-500 text-sm">No meetings scheduled for today</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tasks Section (Mobile) */}
              {(activeSection === 'tasks' || !window.matchMedia('(max-width: 1024px)').matches) && (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="lg:block"
                >
                  {/* Action Items Card */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                          <AlertTriangle className="text-red-600" size={20} />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">Action Items</h2>
                          <p className="text-sm text-gray-600">Tasks requiring attention</p>
                        </div>
                        <div className="flex space-x-2 ml-auto">
                          {actionTasks.overdue.length > 0 && (
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                              {actionTasks.overdue.length} Overdue
                            </span>
                          )}
                          {actionTasks.dueToday.length > 0 && (
                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                              {actionTasks.dueToday.length} Due Today
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {actionTasks.overdue.length === 0 && actionTasks.dueToday.length === 0 ? (
                          <div className="text-center py-8">
                            <CheckCircle className="mx-auto text-green-500 mb-3" size={32} />
                            <p className="text-gray-500 text-sm">No pressing tasks. Well done!</p>
                          </div>
                        ) : (
                          <>
                            {actionTasks.overdue.map(task => (
                              <Link
                                to={`/team/${task.team}`}
                                key={task._id}
                                className="block p-4 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 transition-all duration-200 group"
                              >
                                <div className="flex items-start space-x-3">
                                  <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-red-800 group-hover:text-red-900 truncate">
                                      {task.title}
                                    </h3>
                                    <p className="text-sm text-red-600">Overdue • {task.assignedTo}</p>
                                  </div>
                                </div>
                              </Link>
                            ))}
                            {actionTasks.dueToday.map(task => (
                              <Link
                                to={`/team/${task.team}`}
                                key={task._id}
                                className="block p-4 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all duration-200 group"
                              >
                                <div className="flex items-start space-x-3">
                                  <CalendarCheck size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-amber-800 group-hover:text-amber-900 truncate">
                                      {task.title}
                                    </h3>
                                    <p className="text-sm text-amber-600">Due Today • {task.assignedTo}</p>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <AnimatePresence>
              {(activeSection === 'plan' || !window.matchMedia('(max-width: 1024px)').matches) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:sticky lg:top-24"
                >
                  {/* Weekly Plan Card */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <FileText className="text-green-600" size={20} />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">Weekly Plan</h2>
                          <p className="text-sm text-gray-600">Notes and reminders</p>
                        </div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium ml-auto">
                          {weeklyNotes.length}
                        </span>
                      </div>

                      <QuickAddNote onNoteAdded={handleNoteAdded} />

                      <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
                        {weeklyNotes.length > 0 ? (
                          weeklyNotes.map(note => (
                            <Link
                              to="/notes"
                              key={note._id}
                              className="block p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-200 group"
                            >
                              <p className="font-medium text-gray-800 group-hover:text-gray-900 line-clamp-2">
                                {note.title}
                              </p>
                            </Link>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="mx-auto text-gray-300 mb-3" size={32} />
                            <p className="text-gray-500 text-sm">No notes for this week yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayPage;
