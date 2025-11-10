import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Notebook,
  Users,
  ClipboardList,
  Calendar,
  FileText,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import AddNoteModal from '../components/AddNoteModal';
import CreateTeamModal from '../components/CreateTeamModal';

// Enhanced Stat Card Component
const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-105 transition-transform duration-200`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center space-x-1 text-sm px-2 py-1 rounded-full ${
          trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <TrendingUp size={14} className={trend < 0 ? 'rotate-180' : ''} />
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

// Activity Item Component
const ActivityItem = ({ icon, title, subtitle, time, link, type = 'note' }) => (
  <Link
    to={link}
    className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 group transition-all duration-200 border border-transparent hover:border-gray-100"
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
      type === 'note' ? 'bg-blue-100 text-blue-600' :
      type === 'meeting' ? 'bg-purple-100 text-purple-600' :
      'bg-gray-100 text-gray-600'
    }`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-700">
        {title}
      </p>
      <p className="text-xs text-gray-500 truncate">{subtitle}</p>
    </div>
    <div className="text-right">
      <p className="text-xs text-gray-400">{time}</p>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <MoreHorizontal size={14} className="text-gray-400" />
      </div>
    </div>
  </Link>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);
  const [activeChart, setActiveChart] = useState('pie'); // 'pie' or 'bar'

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/stats/overview');
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch overview');
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
    setDataVersion(v => v + 1);
  };

  const handleTeamCreated = (newTeam) => {
    setDataVersion(v => v + 1);
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="text-red-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, taskChartData, recentNotes, upcomingMeetings } = data;

  // Enhanced chart colors
  const CHART_COLORS = {
    'Pending': '#f59e0b', // amber-500
    'In Progress': '#6366f1', // indigo-500
    'Completed': '#10b981', // emerald-500
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                  <ClipboardList className="text-white" size={28} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, <span className="text-gray-900 font-semibold">{user?.username}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full lg:w-auto">
              <button
                onClick={() => setIsNoteModalOpen(true)}
                className="flex-1 lg:flex-none bg-white border border-gray-200 text-gray-900 px-6 py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Plus size={18} />
                <span className="font-semibold">New Note</span>
              </button>
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="flex-1 lg:flex-none bg-gray-900 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Users size={18} />
                <span className="font-semibold">New Team</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Notes"
            value={stats.totalNotes}
            icon={<Notebook className="text-blue-600" size={24} />}
            color="bg-blue-100"
            trend={12}
            subtitle="+2 this week"
          />
          <StatCard
            title="Active Teams"
            value={stats.totalTeams}
            icon={<Users className="text-green-600" size={24} />}
            color="bg-green-100"
            trend={8}
            subtitle="+1 recently"
          />
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={<ClipboardList className="text-purple-600" size={24} />}
            color="bg-purple-100"
            trend={-3}
            subtitle="2 completed"
          />
          <StatCard
            title="Upcoming Meetings"
            value={stats.upcomingMeetings}
            icon={<Calendar className="text-amber-600" size={24} />}
            color="bg-amber-100"
            trend={25}
            subtitle="Next: Today"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column: Charts */}
          <div className="xl:col-span-2 space-y-6">
            {/* Chart Container */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Task Status Overview</h3>
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveChart('pie')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      activeChart === 'pie'
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Pie
                  </button>
                  <button
                    onClick={() => setActiveChart('bar')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      activeChart === 'bar'
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Bar
                  </button>
                </div>
              </div>

              {taskChartData.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    {activeChart === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={taskChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
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
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {taskChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.name] || '#8884d8'} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClipboardList className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">No tasks found to display chart.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Activity */}
          <div className="space-y-6">
            {/* Recent Notes */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Notes</h3>
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
                      icon={<FileText size={18} />}
                      title={note.title}
                      subtitle={note.category || 'Personal'}
                      time={new Date(note.updatedAt).toLocaleDateString()}
                      link="/notes"
                      type="note"
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-500 text-sm">No recent notes</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Meetings */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h3>
                <Clock className="text-gray-400" size={18} />
              </div>
              <div className="space-y-2">
                {upcomingMeetings.length > 0 ? (
                  upcomingMeetings.map(meeting => (
                    <ActivityItem
                      key={meeting._id}
                      icon={<Users size={18} />}
                      title={meeting.title}
                      subtitle={meeting.team.teamName}
                      time={new Date(meeting.meetingTime).toLocaleDateString()}
                      link={`/team/${meeting.team._id}`}
                      type="meeting"
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-500 text-sm">No upcoming meetings</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onNoteAdded={handleNoteAdded}
      />
      <CreateTeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onTeamCreated={handleTeamCreated}
      />
    </div>
  );
};

export default DashboardPage;
