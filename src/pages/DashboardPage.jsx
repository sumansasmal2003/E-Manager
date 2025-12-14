import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Notebook, Users, ClipboardList, Calendar, FileText, Plus,
  TrendingUp, Clock, Activity, BarChart3,
  Building, ShieldCheck, Briefcase, Zap, CheckCircle2, ArrowRight, Crown,
  LayoutDashboard, Timer, Megaphone, ChevronRight, MoreHorizontal, User,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend
} from 'recharts';
import CreateAnnouncementModal from '../components/CreateAnnouncementModal';
import AnnouncementsModal from '../components/AnnouncementsModal';
import { motion } from 'framer-motion';
import { useModal } from '../context/ModalContext';
import AiInsights from '../components/AiInsights';

// --- SUBSCRIPTION CARD (Owners Only) ---
const SubscriptionCard = ({ subscription, aiStats }) => {
  const navigate = useNavigate();
  const plan = subscription?.plan || 'free';
  const endDate = subscription?.endDate;
  const usage = aiStats && aiStats.used !== undefined ? aiStats.used : 0;
  const limitDisplay = aiStats?.limit || 10;
  const isUnlimited = limitDisplay === 'Unlimited' || limitDisplay >= 9999;

  const tiers = {
    free: { label: 'Free Tier', bg: 'bg-gradient-to-br from-white to-gray-50', border: 'border-gray-200', iconBg: 'bg-gray-100 text-gray-600', badge: 'bg-gray-100 text-gray-700' },
    professional: { label: 'Professional', bg: 'bg-gradient-to-br from-blue-50 to-white', border: 'border-blue-100', iconBg: 'bg-blue-100 text-blue-600', badge: 'bg-blue-50 text-blue-700' },
    premium: { label: 'Premium', bg: 'bg-gradient-to-br from-purple-50 to-white', border: 'border-purple-100', iconBg: 'bg-purple-100 text-purple-600', badge: 'bg-purple-50 text-purple-700' }
  };
  const current = tiers[plan] || tiers.free;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border p-6 mb-8 shadow-sm ${current.bg} ${current.border}`}>
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex-1 w-full">
          <div className="flex items-start gap-4 mb-4">
            <div className={`p-3 rounded-xl shadow-sm ${current.iconBg}`}><Crown size={24} /></div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-gray-900">{current.label}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.badge}`}>Active</span>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-2"><Timer size={14}/> {plan === 'free' ? 'Free Forever' : `Renews: ${new Date(endDate).toLocaleDateString()}`}</p>
            </div>
          </div>
          {!isUnlimited && (
            <div className="max-w-md">
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-1"><span>AI Usage</span><span>{usage} / {limitDisplay}</span></div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min((usage/limitDisplay)*100, 100)}%` }}></div></div>
            </div>
          )}
        </div>
        {plan !== 'premium' && (
          <button onClick={() => navigate('/billing')} className="px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-black transition-all flex items-center gap-2">
            Upgrade Plan <ArrowRight size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// --- STAT CARD ---
const StatCard = ({ title, value, icon, color, subtitle }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
    <div className="flex justify-between mb-4"><div className={`p-3 rounded-xl ${color} bg-opacity-10`}>{React.cloneElement(icon, { size: 20, className: color.replace('bg-', 'text-').replace('-50', '-600') })}</div></div>
    <div><p className="text-sm font-medium text-gray-500 mb-1">{title}</p><h3 className="text-2xl font-bold text-gray-900">{value}</h3>{subtitle && <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>}</div>
  </motion.div>
);

const ActivityItem = ({ icon, title, subtitle, time, link, type = 'note' }) => {
  const colors = type === 'meeting' ? 'bg-purple-50 text-purple-600' : type === 'task' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600';
  return (
    <Link to={link} className="block group"><div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
      <div className={`p-2.5 rounded-lg border border-transparent ${colors}`}>{React.cloneElement(icon, { size: 18 })}</div>
      <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary">{title}</p><p className="text-xs text-gray-500 truncate">{subtitle}</p></div>
      <div className="flex flex-col items-end"><span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{time}</span><ChevronRight size={14} className="text-gray-300 mt-1 opacity-0 group-hover:opacity-100" /></div>
    </div></Link>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { openModal } = useModal();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isViewNoticesOpen, setIsViewNoticesOpen] = useState(false);

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

  const handleNoteAdded = () => setDataVersion(v => v + 1);
  const handleTeamCreated = () => setDataVersion(v => v + 1);

  const isOwner = user?.role === 'owner';
  const isEmployee = user?.role === 'employee';
  const isManager = user?.role === 'manager';

  const CHART_COLORS = { 'Pending': '#fbbf24', 'In Progress': '#818cf8', 'Completed': '#34d399' };

  // Helper to color attendance status
  const getAttendanceColor = (status) => {
    if (status === 'Present') return 'bg-green-50 text-green-600';
    if (status === 'Absent') return 'bg-red-50 text-red-600';
    if (status === 'Leave') return 'bg-yellow-50 text-yellow-600';
    return 'bg-gray-50 text-gray-600';
  };

  if (loading && !data) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return null;

  const { stats, aiStats, taskChartData, recentNotes, upcomingMeetings, activityChartData, attendanceStatus } = data;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* AI Header */}
        <div className="mb-8"><AiInsights /></div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${isOwner ? 'bg-indigo-600 text-white' : 'bg-white text-blue-600 border'}`}>
                {isOwner ? <Building size={24} /> : isEmployee ? <User size={24} /> : <LayoutDashboard size={24} />}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{isOwner ? 'Org Overview' : isEmployee ? 'My Workspace' : 'Team Dashboard'}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-500">Welcome, <span className="font-medium text-gray-900">{user?.username}</span></span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isOwner ? 'bg-indigo-50 text-indigo-700' : isEmployee ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                    {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => openModal('addNote', { onNoteAdded: handleNoteAdded })} className="btn-secondary px-4 py-2.5 rounded-xl bg-white border hover:bg-gray-50 text-gray-700 flex gap-2 text-sm font-medium"><Plus size={16} /> Note</button>
              <button onClick={() => setIsViewNoticesOpen(true)} className="btn-secondary px-4 py-2.5 rounded-xl bg-white border hover:bg-gray-50 text-gray-700 flex gap-2 text-sm font-medium"><Megaphone size={16} /> Notices</button>
              {isOwner && (
                <>
                  <button onClick={() => openModal('createTeam', { onTeamCreated: handleTeamCreated })} className="btn-secondary px-4 py-2.5 rounded-xl bg-white border hover:bg-gray-50 text-gray-700 flex gap-2 text-sm font-medium"><Users size={16} /> Team</button>
                  <button onClick={() => setIsAnnouncementModalOpen(true)} className="btn-secondary px-4 py-2.5 rounded-xl bg-white border hover:bg-gray-50 text-gray-700 flex gap-2 text-sm font-medium"><Megaphone size={16} /> Broadcast</button>
                  <button onClick={() => navigate('/managers')} className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-bold flex gap-2 shadow-md"><Briefcase size={16} /> Managers</button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {isOwner && <SubscriptionCard subscription={user?.subscription} aiStats={aiStats} />}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* 1. Usage or Attendance */}
          {!isEmployee ? (
             <StatCard title={isOwner ? "Org. AI Usage" : "My Usage"} value={aiStats?.used || 0} icon={<Zap />} color="bg-yellow-50 text-yellow-600" subtitle={`${aiStats?.limit || 0} limit`} />
          ) : (
             <StatCard title="Today's Attendance" value={attendanceStatus || "Not Marked"} icon={attendanceStatus === 'Present' ? <CheckCircle /> : <Clock />} color={getAttendanceColor(attendanceStatus)} subtitle={new Date().toLocaleDateString()} />
          )}

          {/* 2. Tasks */}
          <StatCard title={isEmployee ? "My Tasks" : "Total Tasks"} value={stats.totalTasks} icon={<ClipboardList />} color="bg-indigo-50 text-indigo-600" subtitle={isEmployee ? "Assigned to me" : "Pending & Completed"} />

          {/* 3. Teams */}
          <StatCard title={isEmployee ? "My Teams" : "Active Teams"} value={stats.totalTeams} icon={<Users />} color="bg-emerald-50 text-emerald-600" subtitle={isEmployee ? "Joined" : "Managed"} />

          {/* 4. Meetings */}
          <StatCard title="Upcoming Meetings" value={stats.upcomingMeetings} icon={<Calendar />} color="bg-purple-50 text-purple-600" subtitle="Next 7 days" />

          {/* 5. Notes */}
          <StatCard title="My Notes" value={stats.totalNotes} icon={<Notebook />} color="bg-blue-50 text-blue-600" subtitle="Private" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="xl:col-span-2 space-y-8">
             <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6"><div className="p-2 bg-gray-50 rounded-lg"><BarChart3 size={20} className="text-gray-600"/></div><h3 className="font-bold text-gray-900">{isEmployee ? "My Task Progress" : "Task Status"}</h3></div>
                {taskChartData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={taskChartData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                          {taskChartData.map((entry, i) => <Cell key={i} fill={CHART_COLORS[entry.name] || '#cbd5e1'} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : <div className="h-[300px] flex items-center justify-center text-gray-400">No tasks found</div>}
             </div>

             {/* Activity Line Chart (Simplified for Employee) */}
             <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6"><div className="p-2 bg-gray-50 rounded-lg"><Activity size={20} className="text-gray-600"/></div><h3 className="font-bold text-gray-900">Activity Trend (30 Days)</h3></div>
                {activityChartData.length > 0 ? (
                   <div className="h-[300px]">
                     <ResponsiveContainer>
                       <LineChart data={activityChartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="date" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                          <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="created" stroke="#6366f1" strokeWidth={3} dot={false} />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                ) : <div className="h-[300px] flex items-center justify-center text-gray-400">No activity data</div>}
             </div>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-gray-900 flex gap-2"><FileText size={18} className="text-gray-400"/> Recent Notes</h3><Link to="/notes" className="text-xs font-semibold text-primary hover:underline">View All</Link></div>
              <div className="space-y-3">
                 {recentNotes.length ? recentNotes.map(n => <ActivityItem key={n._id} icon={<FileText />} title={n.title} subtitle={n.category} time={new Date(n.updatedAt).toLocaleDateString()} link="/notes" type="note" />) : <p className="text-gray-500 text-sm">No notes</p>}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-gray-900 flex gap-2"><Clock size={18} className="text-gray-400"/> Meetings</h3><Link to="/calendar" className="text-xs font-semibold text-primary hover:underline">View Calendar</Link></div>
              <div className="space-y-3">
                 {upcomingMeetings.length ? upcomingMeetings.map(m => <ActivityItem key={m._id} icon={<Users />} title={m.title} subtitle={m.team.teamName} time={new Date(m.meetingTime).toLocaleDateString()} link={`/team/${m.team._id}`} type="meeting" />) : <p className="text-gray-500 text-sm">No meetings</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateAnnouncementModal isOpen={isAnnouncementModalOpen} onClose={() => setIsAnnouncementModalOpen(false)} onCreated={() => window.location.reload()} />
      <AnnouncementsModal isOpen={isViewNoticesOpen} onClose={() => setIsViewNoticesOpen(false)} />
    </div>
  );
};

export default DashboardPage;
