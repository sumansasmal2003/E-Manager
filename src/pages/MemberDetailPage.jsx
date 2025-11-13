import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig';
import {
  Loader2, AlertCircle, User, ClipboardList, Calendar, Activity, ArrowLeft, Edit,
  Users as UsersIcon, Mail, MoreVertical, TrendingUp, FileText, Clock,
  CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import TaskItem from '../components/TaskItem';
import MeetingItem from '../components/MeetingItem';
import TeamActivityEvent from '../components/TeamActivityEvent';
import EditTaskModal from '../components/EditTaskModal';
import EditMemberProfileModal from '../components/EditMemberProfileModal';
import format from 'date-fns/format';
import { Users, Plus } from 'lucide-react';
import AddOneOnOneModal from '../components/AddOneOnOneModal';
import OneOnOneCard from '../components/OneOnOneCard';
import { useConfirm } from '../context/ConfirmContext.jsx';

const MemberDetailPage = () => {
  const [searchParams] = useSearchParams();
  const memberName = searchParams.get('name');
  const { confirm } = useConfirm();

  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [oneOnOnes, setOneOnOnes] = useState([]);
  const [isOneOnOneModalOpen, setIsOneOnOneModalOpen] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [allTeams, setAllTeams] = useState([]);

  // Stats calculations
  const calculateStats = () => {
    if (!data) return {};

    const tasks = data.tasks || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'Pending').length;
    const overdueTasks = tasks.filter(task =>
      task.status === 'pending' && new Date(task.dueDate) < new Date()
    ).length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate: Math.round(completionRate)
    };
  };

  const stats = calculateStats();

  useEffect(() => {
    if (!memberName) {
      setError('No member name specified.');
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const [detailsRes, teamsRes, oneOnOnesRes] = await Promise.all([
          api.get(`/members/details?name=${encodeURIComponent(memberName)}`),
          api.get('/teams'),
          api.get(`/oneonones/member/${encodeURIComponent(memberName)}`)
        ]);

        setData(detailsRes.data);
        setProfile(detailsRes.data.profile);
        setAllTeams(teamsRes.data);
        setOneOnOnes(oneOnOnesRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch member details');
      }
      setLoading(false);
    };

    fetchDetails();
  }, [memberName]);

  const handleSendMemberReport = async () => {
    if (!profile || !profile.email) {
      alert("This member does not have an email on file. Please add one first by clicking the edit icon.");
      return;
    }

    const confirmed = await confirm({
      title: 'Send Report?',
      description: `This will generate a PDF report and email it to ${profile.name} at ${profile.email}.`,
      confirmText: 'Send Email',
      danger: false
    });

    if (confirmed) {
      setIsSendingReport(true);
      setError(null);
      try {
        const res = await api.post('/members/send-report', { memberName: profile.name });
        alert(res.data.message);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to send report');
      }
      setIsSendingReport(false);
    }
  };

  const handleOpenEditModal = (task) => {
    setCurrentTask(task);
    setIsEditModalOpen(true);
  };

  const handleOneOnOneCreated = (newOneOnOne) => {
    setOneOnOnes([newOneOnOne, ...oneOnOnes]);
    setIsOneOnOneModalOpen(false);
  };

  const handleOneOnOneUpdated = (updatedOneOnOne) => {
    setOneOnOnes(oneOnOnes.map(o => o._id === updatedOneOnOne._id ? updatedOneOnOne : o));
  };

  const handleOneOnOneDeleted = (deletedId) => {
    setOneOnOnes(oneOnOnes.filter(o => o._id !== deletedId));
  };

  const handleTaskUpdated = (updatedTask) => {
    setData(prevData => ({
      ...prevData,
      tasks: prevData.tasks.map(task =>
        task._id === updatedTask._id ? updatedTask : task
      )
    }));
    setIsEditModalOpen(false);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/task/${taskId}`);
        setData(prevData => ({
          ...prevData,
          tasks: prevData.tasks.filter(task => task._id !== taskId)
        }));
      } catch (err) {
        console.error("Failed to delete task", err);
        setError(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const getTeamMembersForTask = (task) => {
    if (!task || !allTeams) return [];
    const team = allTeams.find(t => t._id === task.team._id);
    return team ? team.members : [];
  };

  const handleProfileUpdated = (newProfile) => {
    setProfile(newProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Loader2 className="animate-spin text-gray-900 mb-4 mx-auto" size={32} />
          <p className="text-gray-600">Loading member details...</p>
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
          <div className="flex items-start space-x-4 p-6 bg-white rounded-2xl border border-red-200 shadow-lg">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle size={24} className="text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Unable to load member</h3>
              <p className="text-gray-600 text-sm mb-3">{error}</p>
              <Link
                to="/members"
                className="inline-flex items-center text-gray-700 hover:text-gray-900 font-medium text-sm"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to all members
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  const { tasks = [], meetings = [], activities = [] } = data;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'tasks', name: 'Tasks', count: tasks.length, icon: ClipboardList },
    { id: 'meetings', name: 'Meetings', count: meetings.length, icon: Calendar },
    { id: 'oneonones', name: '1-on-1s', count: oneOnOnes.length, icon: Users },
    { id: 'activity', name: 'Activity', count: activities.length, icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6 mb-6 sm:mb-8"
        >
          <Link
            to="/members"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm bg-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl border border-gray-200 shadow-sm hover:shadow-md w-fit"
          >
            <ArrowLeft size={16} className="mr-2" />
            <span className="hidden sm:inline">Back to all members</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6 lg:gap-8">
                {/* Member Info */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 w-full lg:flex-1">
                  <div className="flex justify-center sm:justify-start">
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white text-xl sm:text-2xl font-bold">
                          {memberName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <button
                        onClick={() => setIsProfileModalOpen(true)}
                        className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors duration-200 shadow-lg"
                        title="Edit profile"
                      >
                        <Edit size={12} className="sm:w-3 sm:h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 break-words">
                        {memberName}
                      </h1>
                    </div>

                    {/* Member Details */}
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6 justify-center sm:justify-start">
                      <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg w-fit">
                        <Calendar size={14} className="flex-shrink-0" />
                        <span className="text-xs sm:text-sm">
                          Joined: {profile?.joiningDate
                            ? format(new Date(profile.joiningDate), 'MMM dd, yyyy')
                            : 'Not set'}
                        </span>
                      </div>

                      {profile?.email && (
                        <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg w-fit">
                          <Mail size={14} className="flex-shrink-0" />
                          <a
                            href={`mailto:${profile.email}`}
                            className="text-gray-900 hover:text-gray-700 font-medium text-xs sm:text-sm break-all"
                          >
                            {profile.email}
                          </a>
                        </div>
                      )}

                      {profile?.endingDate && (
                        <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg w-fit">
                          <Calendar size={14} className="flex-shrink-0" />
                          <span className="text-xs sm:text-sm">
                            Left: {format(new Date(profile.endingDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                      <button
                        onClick={handleSendMemberReport}
                        disabled={isSendingReport || !profile?.email}
                        className="bg-gray-900 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl flex items-center space-x-2 hover:bg-gray-800 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
                      >
                        {isSendingReport ? (
                          <Loader2 size={16} className="animate-spin sm:w-4 sm:h-4" />
                        ) : (
                          <FileText size={16} className="sm:w-4 sm:h-4" />
                        )}
                        <span className="text-sm sm:text-base">Send Report</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 w-full lg:w-auto lg:min-w-[280px]">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900">{stats.totalTasks}</div>
                    <div className="text-xs text-blue-700 font-medium">Total Tasks</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-900">{stats.completedTasks}</div>
                    <div className="text-xs text-green-700 font-medium">Completed</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-900">{stats.pendingTasks}</div>
                    <div className="text-xs text-amber-700 font-medium">Pending</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-900">{stats.overdueTasks}</div>
                    <div className="text-xs text-red-700 font-medium">Overdue</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 sm:mb-8 overflow-hidden"
        >
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} className="sm:w-4 sm:h-4" />
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium min-w-[20px] sm:min-w-[24px] ${
                      activeTab === tab.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-96"
        >
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 sm:space-y-6"
              >
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Completion Rate Card */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Task Completion</h3>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {stats.completionRate}%
                      </div>
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${
                        stats.completionRate >= 80 ? 'bg-green-100' :
                        stats.completionRate >= 50 ? 'bg-amber-100' : 'bg-red-100'
                      }`}>
                        {stats.completionRate >= 80 ?
                          <CheckCircle className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" /> :
                          stats.completionRate >= 50 ?
                          <AlertTriangle className="text-amber-600 w-5 h-5 sm:w-6 sm:h-6" /> :
                          <XCircle className="text-red-600 w-5 h-5 sm:w-6 sm:h-6" />
                        }
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          stats.completionRate >= 80 ? 'bg-green-500' :
                          stats.completionRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${stats.completionRate}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {stats.completedTasks} of {stats.totalTasks} tasks completed
                    </p>
                  </div>

                  {/* Recent Activity Summary */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Activity</h3>
                    <div className="space-y-2 sm:space-y-3">
                      {activities.slice(0, 3).map((activity) => (
                        <div key={activity._id} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <Activity size={14} className="text-gray-400 flex-shrink-0 sm:w-4 sm:h-4" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(activity.createdAt), 'MMM dd, HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))}
                      {activities.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No recent activity
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 text-center">
                    <Calendar className="mx-auto text-blue-600 mb-2 sm:mb-3 w-5 h-5 sm:w-6 sm:h-6" />
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{meetings.length}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Meetings</div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 text-center">
                    <Users className="mx-auto text-green-600 mb-2 sm:mb-3 w-5 h-5 sm:w-6 sm:h-6" />
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{oneOnOnes.length}</div>
                    <div className="text-xs sm:text-sm text-gray-600">1-on-1s</div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 text-center">
                    <Clock className="mx-auto text-purple-600 mb-2 sm:mb-3 w-5 h-5 sm:w-6 sm:h-6" />
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{activities.length}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Activities</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <h2 className="text-xl font-semibold text-gray-900">Assigned Tasks</h2>
                  <span className="text-sm text-gray-600">
                    {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {tasks.length > 0 ? (
                    tasks.map(task => (
                      <div key={task._id} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <p className="text-sm font-medium text-gray-500 mb-3">
                          From Team: <Link to={`/team/${task.team._id}`} className="text-gray-900 hover:text-gray-700 font-semibold">{task.team.teamName}</Link>
                        </p>
                        <TaskItem
                          task={task}
                          onEdit={handleOpenEditModal}
                          onDelete={handleDeleteTask}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 sm:py-12 bg-white border border-gray-200 rounded-2xl">
                      <ClipboardList size={40} className="mx-auto text-gray-300 mb-3 sm:mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks assigned</h3>
                      <p className="text-gray-600 text-sm sm:text-base">This member doesn't have any assigned tasks yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Meetings Tab */}
            {activeTab === 'meetings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <h2 className="text-xl font-semibold text-gray-900">Scheduled Meetings</h2>
                  <span className="text-sm text-gray-600">
                    {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {meetings.length > 0 ? (
                    meetings.map(meeting => (
                      <div key={meeting._id} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <MeetingItem meeting={meeting} />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 sm:py-12 bg-white border border-gray-200 rounded-2xl">
                      <Calendar size={40} className="mx-auto text-gray-300 mb-3 sm:mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No meetings scheduled</h3>
                      <p className="text-gray-600 text-sm sm:text-base">This member doesn't have any scheduled meetings.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 1-on-1s Tab */}
            {activeTab === 'oneonones' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                  <h2 className="text-xl font-semibold text-gray-900">1-on-1 Records</h2>
                  <button
                    onClick={() => setIsOneOnOneModalOpen(true)}
                    className="bg-gray-900 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl flex items-center space-x-2 hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
                  >
                    <Plus size={16} />
                    <span>Schedule 1-on-1</span>
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {oneOnOnes.length > 0 ? (
                    oneOnOnes.map(oneOnOne => (
                      <OneOnOneCard
                        key={oneOnOne._id}
                        oneOnOne={oneOnOne}
                        onUpdated={handleOneOnOneUpdated}
                        onDeleted={handleOneOnOneDeleted}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 sm:py-12 bg-white border border-gray-200 rounded-2xl">
                      <Users size={40} className="mx-auto text-gray-300 mb-3 sm:mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No 1-on-1s scheduled</h3>
                      <p className="text-gray-600 text-sm sm:text-base">Schedule your first 1-on-1 to keep track of notes and action items.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                  <span className="text-sm text-gray-600">
                    {activities.length} activit{activities.length !== 1 ? 'ies' : 'y'}
                  </span>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="max-h-[500px] sm:max-h-[600px] overflow-y-auto divide-y divide-gray-100">
                    {activities.length > 0 ? (
                      activities.map(item => (
                        <div key={item._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200">
                          <TeamActivityEvent activity={item} />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 sm:py-12">
                        <Activity size={40} className="mx-auto text-gray-300 mb-3 sm:mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent activity</h3>
                        <p className="text-gray-600 text-sm sm:text-base">This member hasn't been mentioned in any activity logs.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modals */}
      <EditMemberProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onProfileUpdated={handleProfileUpdated}
      />

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        taskToEdit={currentTask}
        teamMembers={getTeamMembersForTask(currentTask)}
        onTaskUpdated={handleTaskUpdated}
      />

      <AddOneOnOneModal
        isOpen={isOneOnOneModalOpen}
        onClose={() => setIsOneOnOneModalOpen(false)}
        memberName={memberName}
        onOneOnOneCreated={handleOneOnOneCreated}
      />
    </div>
  );
};

export default MemberDetailPage;
