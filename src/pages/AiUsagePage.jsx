import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import {
  BarChart3, Zap, Users, PieChart as PieIcon, Save, Edit2, Loader2, Crown, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Chart Colors
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];

const AiUsagePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // State for inline editing (Owner only)
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai-usage/stats');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLimit = async (managerId) => {
    try {
      const payload = editValue === '' ? null : parseInt(editValue);
      await api.put('/ai-usage/allocate', { managerId, limit: payload });
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update allocation');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-gray-500">No usage data available.</div>;

  // --- MANAGER VIEW ---
  if (data.role === 'manager') {
    // Transform actions for the chart
    const managerChartData = data.actions.map(a => ({
      name: a.action.replace('AI_', '').replace(/_/g, ' '),
      count: a.count
    }));

    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Zap className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">My AI Consumption</h1>
            <p className="text-gray-500 text-sm">Track your daily usage and limits</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Usage Card */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Daily Usage</p>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-5xl font-extrabold text-primary">{data.used}</span>
                <span className="text-xl text-gray-400 font-medium">
                  / {data.limit === 'Shared Pool' ? 'Shared' : data.limit}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((data.used / (typeof data.limit === 'number' ? data.limit : 100)) * 100, 100)}%` }}
                  className={`h-full rounded-full ${
                    data.limit !== 'Shared Pool' && data.used >= data.limit
                      ? 'bg-red-500'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-right">
                {data.limit === 'Shared Pool' ? 'Using organization pool' : 'Personal allocation'}
              </p>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-6">
              <Activity size={18} className="text-gray-400" />
              <h3 className="font-semibold text-primary">Usage Breakdown</h3>
            </div>
            {managerChartData.length > 0 ? (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={managerChartData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                No activity recorded today.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- OWNER VIEW ---
  const { overview, members, ownerActions, plan } = data;

  // 1. Prepare Data for "Usage by Member" Bar Chart
  const memberUsageData = [
    { name: 'You (Owner)', usage: overview.ownerUsage },
    ...members.map(m => ({ name: m.username, usage: m.used }))
  ].sort((a, b) => b.usage - a.usage); // Sort mostly used first

  // 2. Prepare Data for "Action Distribution" Pie Chart
  const actionCounts = {};

  // Helper to aggregate
  const aggregateActions = (actions) => {
    actions.forEach(a => {
      const key = a.action.replace('AI_', '').replace(/_/g, ' ');
      actionCounts[key] = (actionCounts[key] || 0) + a.count;
    });
  };

  aggregateActions(ownerActions);
  members.forEach(m => aggregateActions(m.actions));

  const pieChartData = Object.entries(actionCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">AI Organization Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Manage limits and view real-time consumption</p>
        </div>
        <div className="flex items-center space-x-2 bg-white border px-4 py-2 rounded-lg shadow-sm">
          <Crown size={16} className="text-purple-600" />
          <span className="text-sm font-semibold text-gray-700 uppercase">{plan} Plan</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          <div className="flex items-center space-x-2 mb-2 relative z-10">
            <Zap size={20} className="text-yellow-400" />
            <span className="font-medium opacity-90">Total Capacity</span>
          </div>
          <div className="text-4xl font-bold relative z-10">{overview.totalLimit}</div>
          <div className="text-sm opacity-60 mt-1 relative z-10">Requests / Day</div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Users size={20} className="text-blue-600" />
            <span className="font-medium text-gray-700">Allocated</span>
          </div>
          <div className="text-3xl font-bold text-primary">{overview.reserved}</div>
          <div className="text-sm text-gray-500 mt-1">Credits reserved for managers</div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <PieIcon size={20} className="text-green-600" />
            <span className="font-medium text-gray-700">Shared Pool</span>
          </div>
          <div className={`text-3xl font-bold ${overview.sharedPoolLimit < 5 ? 'text-red-600' : 'text-primary'}`}>
            {overview.sharedPoolLimit}
          </div>
          <div className="text-sm text-gray-500 mt-1">Available for unallocated users</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bar Chart: Usage by Member */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-primary mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-gray-500" />
            Top Users Today
          </h3>
          {memberUsageData.some(m => m.usage > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberUsageData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="usage" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No usage data available yet.
            </div>
          )}
        </div>

        {/* Pie Chart: Action Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-primary mb-6 flex items-center gap-2">
            <Activity size={18} className="text-gray-500" />
            Activity Distribution
          </h3>
          {pieChartData.length > 0 ? (
            <div className="h-64 flex">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No activities recorded today.
            </div>
          )}
        </div>
      </div>

      {/* Allocation Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-primary">Allocation Table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-5 font-semibold">User</th>
                <th className="p-5 font-semibold">Usage Today</th>
                <th className="p-5 font-semibold">Allocation Limit</th>
                <th className="p-5 font-semibold">Top Activity</th>
                <th className="p-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">

              {/* Owner Row */}
              <tr className="bg-gray-50/30">
                <td className="p-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">
                      YOU
                    </div>
                    <span className="font-medium text-primary">Owner (You)</span>
                  </div>
                </td>
                <td className="p-5">
                  <span className="font-mono font-medium">{overview.ownerUsage}</span>
                </td>
                <td className="p-5 text-gray-400 italic text-sm">
                  Shared Pool Access
                </td>
                <td className="p-5">
                  {ownerActions.length > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {ownerActions.sort((a,b) => b.count - a.count)[0].action.replace('AI_', '').replace(/_/g, ' ')}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>
                <td className="p-5"></td>
              </tr>

              {/* Manager Rows */}
              {members.map(mgr => (
                <tr key={mgr._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-5">
                    <div className="font-medium text-primary">{mgr.username}</div>
                  </td>

                  {/* Usage Bar Column */}
                  <td className="p-5 w-1/4">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm w-8">{mgr.used}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            mgr.used >= (mgr.limit || overview.sharedPoolLimit)
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min((mgr.used / (mgr.limit || overview.sharedPoolLimit || 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Allocation Editor */}
                  <td className="p-5">
                    {editingId === mgr._id ? (
                      <div className="flex items-center space-x-2 animate-in fade-in zoom-in duration-200">
                        <input
                          type="number"
                          className="w-24 border border-gray-300 rounded-lg p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="Shared"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveLimit(mgr._id)}
                          className="bg-green-100 text-green-700 p-1.5 rounded-lg hover:bg-green-200 transition-colors"
                          title="Save"
                        >
                          <Save size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        mgr.limit === null
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-blue-50 text-blue-700 font-medium'
                      }`}>
                        {mgr.limit === null ? 'Shared Pool' : `${mgr.limit} / day`}
                      </span>
                    )}
                  </td>

                  {/* Top Activity */}
                  <td className="p-5">
                    {mgr.actions.length > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {mgr.actions.sort((a,b) => b.count - a.count)[0].action.replace('AI_', '').replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-5 text-right">
                    <button
                      onClick={() => {
                        setEditingId(mgr._id);
                        setEditValue(mgr.limit === null ? '' : mgr.limit);
                      }}
                      className="text-gray-400 hover:text-primary p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Edit Limit"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {members.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No managers found. Hire a manager to start allocating limits.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AiUsagePage;
