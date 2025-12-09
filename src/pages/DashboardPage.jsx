import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Notebook, Users, ClipboardList, Calendar, FileText, Plus,
  TrendingUp, Clock, Activity, BarChart3,
  Building, ShieldCheck, Briefcase, Zap, CheckCircle2, ArrowRight, Crown,
  LayoutDashboard, Timer // <-- Added Timer icon
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';
import { motion } from 'framer-motion';
import { useModal } from '../context/ModalContext';
import AiInsights from '../components/AiInsights';

// --- UPDATED: Subscription Status Card ---
const SubscriptionCard = ({ subscription, aiStats }) => {
  const navigate = useNavigate();
  const plan = subscription?.plan || 'free';
  const endDate = subscription?.endDate; // Get the end date

  const usage = aiStats && aiStats.used !== undefined ? aiStats.used : 0;

  const tiers = {
    free: {
      label: 'Free Tier',
      limit: 10,
      next: 'professional',
      color: 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200',
      icon: <Users size={20} className="text-gray-600" />
    },
    professional: {
      label: 'Professional',
      limit: 100,
      next: 'premium',
      color: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200',
      icon: <Zap size={20} className="text-blue-600" />
    },
    premium: {
      label: 'Premium',
      limit: 'Unlimited',
      next: null,
      color: 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200',
      icon: <Crown size={20} className="text-purple-600" />
    }
  };

  const currentTier = tiers[plan];
  const limitDisplay = aiStats?.limit || currentTier.limit;
  const nextTierKey = currentTier.next;
  const isUnlimited = limitDisplay === 'Unlimited' || limitDisplay >= 9999;

  // Format the date properly
  const formattedEndDate = endDate
    ? new Date(endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  const upgradeBenefits = {
    professional: [
      "10x AI Requests (100/day)",
      "Hire up to 3 Managers",
      "Google Calendar Sync",
      "Export Reports to PDF"
    ],
    premium: [
      "Unlimited AI & Managers",
      "Unlimited Teams & Members",
      "Advanced CSV Exports",
      "Priority Support"
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-6 mb-8 shadow-sm ${currentTier.color}`}
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

        {/* Left: Current Status & Usage */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              {currentTier.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                {currentTier.label} Plan
                {plan === 'premium' && (
                  <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">PRO</span>
                )}
              </h3>

              {/* --- NEW: Date Display --- */}
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                <Timer size={14} className="text-gray-400" />
                {plan === 'free' ? (
                  <span>Free Forever</span>
                ) : formattedEndDate ? (
                  <span>Active until <span className="font-semibold text-gray-700">{formattedEndDate}</span></span>
                ) : (
                  <span>Renews monthly</span>
                )}
              </div>
              {/* ------------------------- */}
            </div>
          </div>

          {!isUnlimited && (
            <div className="mt-4 max-w-md">
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                <span>Daily AI Usage</span>
                <span>{usage} / {limitDisplay}</span>
              </div>
              <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-gray-200/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((usage / limitDisplay) * 100, 100)}%` }}
                  transition={{ duration: 1 }}
                  className={`h-full rounded-full ${
                    usage >= limitDisplay ? 'bg-red-500' : 'bg-primary'
                  }`}
                />
              </div>
              {usage >= limitDisplay && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  Limit reached. Upgrade to continue using AI features today.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Upgrade Call to Action */}
        {nextTierKey && (
          <div className="w-full lg:w-auto bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-white/50 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="text-sm">
                <p className="font-bold text-primary mb-2">Upgrade to {tiers[nextTierKey].label}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                  {upgradeBenefits[nextTierKey].map((benefit, i) => (
                    <div key={i} className="flex items-center text-gray-600 text-xs">
                      <CheckCircle2 size={12} className="text-green-500 mr-1.5 flex-shrink-0" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => navigate('/billing')} // Updated link to internal billing page
                className="w-full sm:w-auto px-6 py-3 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
              >
                <span>Upgrade</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ... (StatCard, ActivityItem, ChartContainer components remain unchanged) ...
const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl border border-gray-200 p-5 group hover:shadow-sm transition-all duration-200"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
          trend > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
          <span className="font-medium">{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-semibold text-primary mb-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  </motion.div>
);

const ActivityItem = ({ icon, title, subtitle, time, link, type = 'note' }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Link
      to={link}
      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 group transition-all duration-200"
    >
      <div className={`p-2 rounded-lg ${
        type === 'note' ? 'bg-blue-50 text-blue-600' :
        type === 'meeting' ? 'bg-purple-50 text-purple-600' :
        'bg-gray-50 text-gray-600'
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate group-hover:text-gray-700">
          {title}
        </p>
        <p className="text-xs text-gray-500 truncate">{subtitle}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </Link>
  </motion.div>
);

const ChartContainer = ({ title, icon, children, isEmpty, emptyMessage }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-center space-x-2 mb-4">
      {icon}
      <h3 className="text-base font-semibold text-primary">{title}</h3>
    </div>
    {isEmpty ? (
      <div className="text-center py-8">
        <ClipboardList className="mx-auto text-gray-300 mb-2" size={32} />
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    ) : (
      <div style={{ width: '100%', height: 250 }}>
        {children}
      </div>
    )}
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { openModal } = useModal();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [activeChart, setActiveChart] = useState('pie');

  // Determine Role
  const isOwner = user?.role === 'owner';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/stats/overview');
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      }
      setLoading(false);
    };
    fetchStats();
  }, [dataVersion]);

  const handleNoteAdded = (newNote) => {
    setData(prevData => ({
      ...prevData,
      recentNotes: [newNote, ...prevData.recentNotes.slice(0, 4)],
      stats: {
        ...prevData.stats,
        totalNotes: prevData.stats.totalNotes + 1
      }
    }));
  };

  const handleTeamCreated = (newTeam) => {
    setDataVersion(v => v + 1);
  };

  const CHART_COLORS = {
    'Pending': '#f59e0b',
    'In Progress': '#6366f1',
    'Completed': '#10b981',
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-sm text-center">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="text-red-500" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">Unable to load</h3>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const {
    stats,
    aiStats,
    taskChartData,
    recentNotes,
    upcomingMeetings,
    workloadChartData,
    activityChartData
  } = data;

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* AI Insights */}
        <div className="mb-6">
          <AiInsights />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                {isOwner ? (
                  <Building className="text-white" size={24} />
                ) : (
                  <LayoutDashboard className="text-white" size={24} />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  {isOwner ? 'Organization Overview' : 'Team Dashboard'}
                </h1>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <span className="text-gray-600">Welcome back,</span>
                  <span className="font-semibold text-primary">{user?.username}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                    isOwner
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {isOwner ? <ShieldCheck size={10} className="mr-1" /> : <Users size={10} className="mr-1" />}
                    {isOwner ? 'Organization Owner' : 'Team Manager'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => openModal('addNote', { onNoteAdded: handleNoteAdded })}
                className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
              >
                <Plus size={16} />
                <span>New Note</span>
              </button>

              {isOwner && (
                <button
                  onClick={() => openModal('createTeam', { onTeamCreated: handleTeamCreated })}
                  className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
                >
                  <Users size={16} />
                  <span>New Team</span>
                </button>
              )}

              {/* --- OWNER ONLY ACTION --- */}
              {isOwner && (
                <button
                  onClick={() => navigate('/managers')}
                  className="flex items-center space-x-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium shadow-md"
                >
                  <Briefcase size={16} />
                  <span>Manage Managers</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* --- SUBSCRIPTION BANNER (Owner Only) --- */}
        {isOwner && (
          <SubscriptionCard
            subscription={user?.subscription}
            aiStats={aiStats}
          />
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title={isOwner ? "Total Org. Tasks" : "My Team Tasks"}
            value={stats.totalTasks}
            icon={<ClipboardList className="text-purple-600" size={20} />}
            color="bg-purple-50"
            subtitle={isOwner ? "Across all teams" : "Assigned to your teams"}
          />
          <StatCard
            title={isOwner ? "Organization Teams" : "Active Teams"}
            value={stats.totalTeams}
            icon={<Users className="text-green-600" size={20} />}
            color="bg-green-50"
            subtitle={isOwner ? "Managed by you & managers" : "Teams you manage"}
          />
          <StatCard
            title="Upcoming Meetings"
            value={stats.upcomingMeetings}
            icon={<Calendar className="text-amber-600" size={20} />}
            color="bg-amber-50"
            subtitle="Scheduled across teams"
          />
          <StatCard
            title="My Personal Notes"
            value={stats.totalNotes}
            icon={<Notebook className="text-blue-600" size={20} />}
            color="bg-blue-50"
            subtitle="Private to you"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ... (Charts and Activity sections same as before) ... */}
           {/* Left Column - Charts */}
           <div className="xl:col-span-2 space-y-4">

            {/* Task Status Chart */}
            <ChartContainer
              title="Task Status Overview"
              icon={<BarChart3 size={18} className="text-gray-600" />}
              isEmpty={taskChartData.length === 0}
              emptyMessage="No tasks available for analysis"
            >
              {taskChartData.length > 0 && (
                <ResponsiveContainer>
                  {activeChart === 'pie' ? (
                    <PieChart>
                      <Pie
                        data={taskChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {taskChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.name] || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  ) : (
                    <BarChart data={taskChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                        {taskChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.name] || '#8884d8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </ChartContainer>

            {/* Workload Distribution */}
            <ChartContainer
              title={isOwner ? "Organization Workload" : "Member Workload"}
              icon={<Users size={18} className="text-gray-600" />}
              isEmpty={!workloadChartData || workloadChartData.length === 0}
              emptyMessage="No workload data available"
            >
              {workloadChartData && workloadChartData.length > 0 && (
                <ResponsiveContainer>
                  <BarChart data={workloadChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="#6366f1" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartContainer>

            {/* Activity Trend */}
            <ChartContainer
              title={isOwner ? "Organization Activity" : "Team Activity Trend"}
              icon={<Activity size={18} className="text-gray-600" />}
              isEmpty={!activityChartData || activityChartData.length === 0}
              emptyMessage="No activity data available"
            >
              {activityChartData && activityChartData.length > 0 && (
                <ResponsiveContainer>
                  <LineChart data={activityChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="created"
                      name="Tasks Created"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      name="Tasks Completed"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartContainer>
          </div>

          {/* Right Column - Activity */}
          <div className="space-y-4">
            {/* Recent Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-primary">Recent Notes</h3>
                <Link
                  to="/notes"
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {recentNotes.length > 0 ? (
                  recentNotes.map(note => (
                    <ActivityItem
                      key={note._id}
                      icon={<FileText size={16} />}
                      title={note.title}
                      subtitle={note.category || 'Personal'}
                      time={new Date(note.updatedAt).toLocaleDateString()}
                      link="/notes"
                      type="note"
                    />
                  ))
                ) : (
                  <div className="text-center py-6">
                    <FileText className="mx-auto text-gray-300 mb-2" size={24} />
                    <p className="text-gray-500 text-sm">No recent notes</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Meetings */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-primary">Upcoming Meetings</h3>
                <Clock className="text-gray-400" size={16} />
              </div>
              <div className="space-y-2">
                {upcomingMeetings.length > 0 ? (
                  upcomingMeetings.map(meeting => (
                    <ActivityItem
                      key={meeting._id}
                      icon={<Users size={16} />}
                      title={meeting.title}
                      subtitle={meeting.team.teamName}
                      time={new Date(meeting.meetingTime).toLocaleDateString()}
                      link={`/team/${meeting.team._id}`}
                      type="meeting"
                    />
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="mx-auto text-gray-300 mb-2" size={24} />
                    <p className="text-gray-500 text-sm">No upcoming meetings</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
