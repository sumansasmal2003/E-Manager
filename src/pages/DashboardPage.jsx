import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Notebook, Users, ClipboardList, Calendar, ArrowRight, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center space-x-4 shadow-sm">
    <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

// Chart Colors
const COLORS = {
  'Pending': '#fbbf24', // amber-400
  'In Progress': '#3b82f6', // blue-500
  'Completed': '#22c55e', // green-500
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { stats, taskChartData, recentNotes, upcomingMeetings } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <h2 className="text-2xl font-semibold text-gray-800">
        Welcome back, <span className="text-gray-900 font-bold">{user?.username}</span>!
      </h2>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Total Notes"
          value={stats.totalNotes}
          icon={<Notebook className="text-blue-600" size={24} />}
          color="bg-blue-100"
        />
        <StatCard
          title="Total Teams"
          value={stats.totalTeams}
          icon={<Users className="text-green-600" size={24} />}
          color="bg-green-100"
        />
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={<ClipboardList className="text-purple-600" size={24} />}
          color="bg-purple-100"
        />
        <StatCard
          title="Upcoming Meetings"
          value={stats.upcomingMeetings}
          icon={<Calendar className="text-amber-600" size={24} />}
          color="bg-amber-100"
        />
      </div>

      {/* Main Content Grid (Chart and Lists) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Task Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Overview</h3>
          {taskChartData.length > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
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
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">No tasks found to display chart.</p>
          )}
        </div>

        {/* Right Column: Activity */}
        <div className="space-y-6">
          {/* Recent Notes */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notes</h3>
            <div className="space-y-3">
              {recentNotes.length > 0 ? (
                recentNotes.map(note => (
                  <Link
                    key={note._id}
                    to="/notes"
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 group"
                  >
                    <FileText className="text-gray-400" size={16} />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">
                      {note.title}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent notes.</p>
              )}
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Meetings</h3>
            <div className="space-y-3">
              {upcomingMeetings.length > 0 ? (
                upcomingMeetings.map(meeting => (
                  <Link
                    key={meeting._id}
                    to={`/team/${meeting.team._id}`}
                    className="p-2 rounded-lg hover:bg-gray-50 group block"
                  >
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {meeting.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {meeting.team.teamName} - {new Date(meeting.meetingTime).toLocaleDateString()}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-500">No upcoming meetings.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
