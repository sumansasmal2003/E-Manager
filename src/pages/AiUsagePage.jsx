// src/pages/AiUsagePage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Zap, FileText, ClipboardList, Brain, Calendar, Loader2, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../api/axiosConfig';

// --- (StatCard component is unchanged) ---
const StatCard = ({ title, value, icon, color, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      {loading ? (
        <div className="h-9 bg-gray-200 rounded-md animate-pulse w-1/2"></div>
      ) : (
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      )}
    </div>
  </motion.div>
);

const AiUsagePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map AI actionType to human-readable names
  const actionTypeMap = {
    'AI_GET_ANSWER': 'Chat Queries',
    'AI_CREATE_TASK': 'Create Task',
    'AI_UPDATE_TASKS': 'Update Task',
    'AI_DELETE_TASKS': 'Delete Task',
    'AI_SCHEDULE_MEETING': 'Schedule Meeting',
    'AI_UPDATE_MEETING': 'Update Meeting',
    'AI_DELETE_MEETING': 'Delete Meeting',
    'AI_ADD_NOTE': 'Create Note',
    'AI_UPDATE_NOTE': 'Update Note',
    'AI_DELETE_NOTE': 'Delete Note',
    'AI_GENERATE_SUBTASKS': 'Generate Subtasks',
    'AI_MEMBER_REPORT': 'Member Reports',
    'AI_TALKING_POINTS': 'Talking Points',
    'AI_DAILY_BRIEFING': 'Daily Briefings',
    'AI_TEAM_REPORT': 'Team Reports',
    'AI_WORD_PUZZLE': 'Game Puzzles',
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#14b8a6', '#d946ef'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/ai-usage/stats');

        // Format data for charts
        const formattedDistribution = res.data.actionDistribution.map((item, index) => ({
          ...item,
          name: actionTypeMap[item.name] || item.name, // Make it readable
          fill: COLORS[index % COLORS.length],
        }));

        setData({
          ...res.data,
          actionDistribution: formattedDistribution
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch AI usage statistics.');
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-gray-900" size={32} />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="mx-auto text-red-600" size={40} />
        <h3 className="mt-4 text-lg font-semibold text-red-800">Failed to load statistics</h3>
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  // Empty State (if data is loaded but empty)
  if (!data || data.stats.totalActions === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <Zap className="mx-auto text-gray-300" size={48} />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No AI Usage Yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Start using the AI Chat (Ctrl+J) or AI-powered features to see your statistics here.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
          <BarChart3 className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">AI Usage Statistics</h1>
          <p className="text-gray-600">Monitor how you leverage your AI assistant</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total AI Actions"
          value={data.stats.totalActions}
          icon={<Zap className="text-indigo-600" size={24} />}
          color="bg-indigo-100"
          loading={loading}
        />
        <StatCard
          title="Chat Queries"
          value={data.stats.chatQueries}
          icon={<Brain className="text-blue-600" size={24} />}
          color="bg-blue-100"
          loading={loading}
        />
        <StatCard
          title="Tasks Managed by AI"
          value={data.stats.tasksManaged}
          icon={<ClipboardList className="text-green-600" size={24} />}
          color="bg-green-100"
          loading={loading}
        />
        <StatCard
          title="Items Created by AI"
          value={data.stats.itemsCreated}
          icon={<FileText className="text-amber-600" size={24} />}
          color="bg-amber-100"
          loading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Usage Over Time (Line Chart) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Interaction Trend (Last 30 Days)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart
                data={data.usageOverTime}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="queries"
                  name="Chat Queries"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="actions"
                  name="Write Actions"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Action Distribution (Pie Chart) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Action Distribution</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.actionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {data.actionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AiUsagePage;
