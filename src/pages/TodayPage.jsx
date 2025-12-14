import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import {
  Clock, AlertTriangle, CalendarCheck, FileText, Plus, Sunrise, Send,
  Loader2, Calendar, CheckCircle, Users, Target, Zap, Moon, Sun, UserCheck,
  ChevronDown, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../components/Input';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import DailyRollCall from '../components/DailyRollCall';

// Constants
const SECTIONS = {
  OVERVIEW: 'overview',
  TASKS: 'tasks',
  ROLL_CALL: 'rollcall',
  PLAN: 'plan'
};

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: "Good Morning", icon: <Sunrise className="text-amber-500" size={24} />, description: "Rise and shine! Ready for the day?" };
  if (hour >= 12 && hour < 13) return { text: "Good Noon", icon: <Sun className="text-yellow-500" size={24} />, description: "Midday energy! Check your progress." };
  if (hour >= 13 && hour < 17) return { text: "Good Afternoon", icon: <Sun className="text-orange-500" size={24} />, description: "Keep the momentum going." };
  if (hour >= 17 && hour < 21) return { text: "Good Evening", icon: <Moon className="text-indigo-500" size={24} />, description: "Wrap up and reflect." };
  return { text: "Good Night", icon: <Moon className="text-blue-500" size={24} />, description: "Rest and recharge for tomorrow." };
};

const useExpandable = (initialState = false) => {
  const [isExpanded, setIsExpanded] = useState(initialState);
  const toggle = useCallback(() => setIsExpanded(prev => !prev), []);
  const expand = useCallback(() => setIsExpanded(true), []);
  const collapse = useCallback(() => setIsExpanded(false), []);
  return { isExpanded, toggle, expand, collapse };
};

const QuickAddNote = ({ onNoteAdded }) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isExpanded, toggle, collapse } = useExpandable();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/notes', { title, content: '(Quick-add from Today page)', planPeriod: 'This Week', category: 'Personal' });
      onNoteAdded(res.data);
      setTitle('');
      collapse();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add note');
    }
    setLoading(false);
  };

  const handleCancel = () => { setTitle(''); setError(null); collapse(); };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {!isExpanded ? (
        <button onClick={toggle} className="w-full p-4 flex items-center justify-center gap-2 text-gray-600 hover:text-primary transition-colors group">
          <Plus size={18} className="transition-transform group-hover:scale-110" /><span className="font-medium">Add to Weekly Plan</span>
        </button>
      ) : (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="p-4 flex flex-col">
          <label className="block text-sm font-semibold text-primary mb-3">Add Quick Note</label>
          <div className="flex flex-col gap-3">
            <Input icon={<FileText size={18} className="text-gray-400" />} type="text" placeholder="What's on your mind..." value={title} onChange={(e) => setTitle(e.target.value)} required autoComplete="off" autoFocus className="w-full" />
            <div className="flex gap-2">
              <button type="submit" disabled={loading || !title.trim()} className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 min-w-[100px]">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}<span className="hidden sm:inline">Add</span>
              </button>
              <button type="button" onClick={handleCancel} className="flex items-center justify-center px-4 py-3 rounded-lg border border-gray-300 text-gray-600 hover:text-primary hover:border-gray-400 transition-all"><span className="text-sm font-medium">Cancel</span></button>
            </div>
          </div>
          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-600 mt-2">{error}</motion.p>}
        </motion.form>
      )}
    </motion.div>
  );
};

const StatsCard = ({ icon, title, value, color, description, onClick }) => (
  <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={onClick} className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 text-center w-full transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${onClick ? 'cursor-pointer' : 'cursor-default'}`} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mx-auto mb-3`}>{icon}</div>
    <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">{value}</div>
    <div className="text-sm font-semibold text-gray-700 mb-2">{title}</div>
    <div className="text-xs text-gray-500">{description}</div>
  </motion.button>
);

const ExpandableSection = ({ title, count, icon, children, defaultExpanded = true, badgeColor = "bg-gray-100 text-gray-700" }) => {
  const { isExpanded, toggle } = useExpandable(defaultExpanded);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={toggle} className="w-full p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">{icon}<span className="font-semibold text-primary">{title}</span><span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>{count}</span></div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown size={16} className="text-gray-500" /></motion.div>
      </button>
      <AnimatePresence initial={false}>{isExpanded && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 bg-gray-50 border-t border-gray-200">{children}</div></motion.div>)}</AnimatePresence>
    </div>
  );
};

const TaskItem = ({ task, isOverdue = false }) => {
  const config = isOverdue
    ? { icon: <AlertTriangle size={16} className="text-red-600" />, label: 'Overdue', className: 'bg-red-50 border-red-200 hover:border-red-300' }
    : { icon: <CalendarCheck size={16} className="text-amber-600" />, label: 'Due Today', className: 'bg-amber-50 border-amber-200 hover:border-amber-300' };

  return (
    <Link to={`/team/${task.team}`} className={`block p-4 rounded-lg border transition-all group ${config.className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primary group-hover:text-gray-700 truncate">{task.title}</h3>
          <p className="text-sm text-gray-700 mt-1">{config.label} • {task.assignedTo}</p>
          {task.dueDate && <p className="text-xs text-gray-600 mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
        </div>
        <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
};

const TodayPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(SECTIONS.OVERVIEW);
  const [currentGreeting, setCurrentGreeting] = useState(getTimeBasedGreeting());
  const [briefing, setBriefing] = useState(null);
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [briefingError, setBriefingError] = useState(null);

  const overdueSection = useExpandable(true);
  const dueTodaySection = useExpandable(true);

  // Constants based on Role
  const isEmployee = user?.role === 'employee';
  const isManager = user?.role === 'manager';
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';

  // Check Permission: Only Owner or Managers with specific permission can mark/view Roll Call
  // This evaluates to FALSE for employees, and FALSE for restricted managers
  const canMarkAttendance = user?.role === 'owner' || (isManager && user?.permissions?.canMarkAttendance !== false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentGreeting(getTimeBasedGreeting()), 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/stats/action-items');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch action items');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const fetchBriefing = async () => {
      setBriefingLoading(true);
      const today = new Date().toISOString().split('T')[0];
      try {
        const cachedData = JSON.parse(sessionStorage.getItem('dailyBriefingData'));
        if (cachedData && cachedData.timestamp === today && cachedData.username === user.username) {
          setBriefing(cachedData.briefing);
          setBriefingLoading(false);
          return;
        }
      } catch (e) { sessionStorage.removeItem('dailyBriefingData'); }

      try {
        const res = await api.get('/stats/briefing');
        setBriefing(res.data.briefing);
        sessionStorage.setItem('dailyBriefingData', JSON.stringify({ briefing: res.data.briefing, timestamp: today, username: user.username }));
      } catch (err) { setBriefingError('Failed to load AI briefing.'); }
      setBriefingLoading(false);
    };
    if (user?.username) fetchBriefing();
  }, [user]);

  const handleNoteAdded = useCallback((newNote) => {
    setData(prev => ({ ...prev, weeklyNotes: [newNote, ...prev.weeklyNotes] }));
  }, []);

  const stats = useMemo(() => {
    const todayMeetings = data?.todayMeetings?.length || 0;
    const overdueTasks = data?.actionTasks?.overdue?.length || 0;
    const dueTodayTasks = data?.actionTasks?.dueToday?.length || 0;
    const weeklyNotes = data?.weeklyNotes?.length || 0;
    return { todayMeetings, overdueTasks, dueTodayTasks, weeklyNotes, totalUrgentTasks: overdueTasks + dueTodayTasks };
  }, [data]);

  // FIX: Filter out ROLL_CALL based on permission (hides for employees AND restricted managers)
  const navigationTabs = useMemo(() => [
    { id: SECTIONS.OVERVIEW, name: 'Overview', icon: Target },
    { id: SECTIONS.TASKS, name: isEmployee ? 'My Tasks' : 'Team Tasks', icon: CheckCircle },
    // Only show if user has permission (Owner or Allowed Manager)
    canMarkAttendance && { id: SECTIONS.ROLL_CALL, name: 'Roll Call', icon: UserCheck },
    { id: SECTIONS.PLAN, name: 'My Plan', icon: FileText }
  ].filter(Boolean), [isEmployee, canMarkAttendance]);

  if (loading) return <div className="min-h-screen flex items-center justify-center px-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const { todayMeetings = [], actionTasks = { overdue: [], dueToday: [] }, weeklyNotes = [] } = data || {};

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">{currentGreeting.icon}</div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">{currentGreeting.text}, {user?.username}</h1>
                  <p className="text-gray-600 text-sm sm:text-base">{currentGreeting.description}</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-2">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • <span className="font-medium text-primary">{roleLabel} View</span></p>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 w-fit">
              <Zap size={20} className="text-amber-500" /><span className="text-sm font-semibold text-primary">{stats.totalUrgentTasks} urgent items</span>
            </div>
          </div>

          {/* AI Briefing */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6">
            {briefingLoading ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-pulse"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div><div className="h-4 bg-gray-200 rounded w-1/2"></div></div>
            ) : briefing ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 bg-gradient-to-br from-primary to-gray-700 rounded-xl flex items-center justify-center"><Zap size={20} className="text-white" /></div><h2 className="text-xl font-semibold text-primary">Your Daily Briefing</h2></div>
                <div className="prose prose-sm max-w-none text-gray-700"><ReactMarkdown>{briefing}</ReactMarkdown></div>
              </div>
            ) : null}
          </motion.div>

          {/* Mobile Nav */}
          <div className="lg:hidden bg-white rounded-2xl border border-gray-200 shadow-sm p-2 my-6">
            <nav className="flex gap-1">
              {navigationTabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveSection(tab.id)} className={`flex-1 flex flex-col items-center py-3 px-2 rounded-xl text-xs font-medium transition-all ${activeSection === tab.id ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-primary hover:bg-gray-50'}`}>
                  <tab.icon size={16} className="mb-1" /><span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
            <StatsCard icon={<Clock className="text-blue-600" size={24}/>} title={isEmployee ? "My Meetings" : "Team Meetings"} value={stats.todayMeetings} color="bg-blue-100" description="Today's sessions" onClick={() => setActiveSection(SECTIONS.OVERVIEW)} />
            <StatsCard icon={<AlertTriangle className="text-red-600" size={24}/>} title="Overdue" value={stats.overdueTasks} color="bg-red-100" description={isEmployee ? "My pending items" : "Team pending items"} onClick={() => { setActiveSection(SECTIONS.TASKS); overdueSection.expand(); }} />
            <StatsCard icon={<CalendarCheck className="text-amber-600" size={24}/>} title="Due Today" value={stats.dueTodayTasks} color="bg-amber-100" description="Must finish today" onClick={() => { setActiveSection(SECTIONS.TASKS); dueTodaySection.expand(); }} />
            <StatsCard icon={<FileText className="text-green-600" size={24}/>} title="My Notes" value={stats.weeklyNotes} color="bg-green-100" description="Weekly plan" onClick={() => setActiveSection(SECTIONS.PLAN)} />
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6">
            <AnimatePresence mode="wait">
              {/* Overview (Meetings) */}
              {(activeSection === SECTIONS.OVERVIEW || !window.matchMedia('(max-width: 1024px)').matches) && (
                <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="lg:block">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Clock className="text-blue-600" size={20}/></div>
                        <div><h2 className="text-xl font-semibold text-primary">{isEmployee ? "My Meetings" : "Today's Meetings"}</h2><p className="text-sm text-gray-600">Your scheduled sessions</p></div>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium ml-auto">{todayMeetings.length}</span>
                      </div>
                      <div className="space-y-3">
                        {todayMeetings.length > 0 ? todayMeetings.map(m => (
                          <Link to={`/team/${m.team._id}`} key={m._id} className="block p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all group">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex-1 min-w-0"><h3 className="font-semibold text-primary group-hover:text-blue-700 truncate">{m.title}</h3><p className="text-sm text-gray-600 truncate">{m.team.teamName}</p></div>
                              <div className="flex items-center gap-2 text-sm text-gray-700"><Clock size={14} /><span className="font-medium whitespace-nowrap">{new Date(m.meetingTime).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}</span></div>
                            </div>
                          </Link>
                        )) : <div className="text-center py-8"><Calendar className="mx-auto text-gray-300 mb-3" size={32}/><p className="text-gray-500 text-sm">No meetings scheduled for today</p></div>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tasks */}
              {(activeSection === SECTIONS.TASKS || !window.matchMedia('(max-width: 1024px)').matches) && (
                <motion.div key="tasks" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="lg:block">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><AlertTriangle className="text-red-600" size={20}/></div>
                        <div><h2 className="text-xl font-semibold text-primary">Action Items</h2><p className="text-sm text-gray-600">Tasks requiring attention</p></div>
                        <div className="flex gap-2 ml-auto">
                          {actionTasks.overdue.length > 0 && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">{actionTasks.overdue.length} Overdue</span>}
                          {actionTasks.dueToday.length > 0 && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">{actionTasks.dueToday.length} Due Today</span>}
                        </div>
                      </div>
                      <div className="space-y-4">
                        {actionTasks.overdue.length === 0 && actionTasks.dueToday.length === 0 ? (
                          <div className="text-center py-8"><CheckCircle className="mx-auto text-green-500 mb-3" size={32}/><p className="text-gray-500 text-sm">No pressing tasks. Well done!</p></div>
                        ) : (
                          <>
                            {actionTasks.overdue.length > 0 && (
                              <ExpandableSection title="Overdue Tasks" count={actionTasks.overdue.length} icon={<AlertTriangle size={18} className="text-red-600"/>} badgeColor="bg-red-100 text-red-700" defaultExpanded={overdueSection.isExpanded}>
                                <div className="space-y-3">{actionTasks.overdue.map(t => <TaskItem key={t._id} task={t} isOverdue={true} />)}</div>
                              </ExpandableSection>
                            )}
                            {actionTasks.dueToday.length > 0 && (
                              <ExpandableSection title="Due Today" count={actionTasks.dueToday.length} icon={<CalendarCheck size={18} className="text-amber-600"/>} badgeColor="bg-amber-100 text-amber-700" defaultExpanded={dueTodaySection.isExpanded}>
                                <div className="space-y-3">{actionTasks.dueToday.map(t => <TaskItem key={t._id} task={t} isOverdue={false} />)}</div>
                              </ExpandableSection>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <AnimatePresence>
              {/* Roll Call (Hidden for Employees & Restricted Managers) */}
              {canMarkAttendance && (activeSection === SECTIONS.ROLL_CALL || !window.matchMedia('(max-width: 1024px)').matches) && (
                <motion.div key="rollcall" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
                  <DailyRollCall />
                </motion.div>
              )}

              {/* Plan */}
              {(activeSection === SECTIONS.PLAN || !window.matchMedia('(max-width: 1024px)').matches) && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:sticky lg:top-24">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><FileText className="text-green-600" size={20}/></div>
                        <div><h2 className="text-xl font-semibold text-primary">Weekly Plan</h2><p className="text-sm text-gray-600">Notes and reminders</p></div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium ml-auto">{weeklyNotes.length}</span>
                      </div>
                      <QuickAddNote onNoteAdded={handleNoteAdded} />
                      <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
                        {weeklyNotes.length > 0 ? weeklyNotes.map(n => (
                          <Link to="/notes" key={n._id} className="block p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all group">
                            <p className="font-medium text-gray-800 group-hover:text-primary line-clamp-2">{n.title}</p>
                          </Link>
                        )) : <div className="text-center py-8"><FileText className="mx-auto text-gray-300 mb-3" size={32}/><p className="text-gray-500 text-sm">No notes for this week yet</p></div>}
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
