import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, Plus, Users, ClipboardList, Calendar, Crown, User,
  ChevronDown, ChevronUp, Link2, Trash2, Github, X,
  FileText, Activity, FilePieChart, ExternalLink, Mail, Loader2,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useModal } from '../context/ModalContext';
import TaskItem from '../components/TaskItem';
import MeetingItem from '../components/MeetingItem';
import TeamNoteCard from '../components/TeamNoteCard';
import TeamActivityEvent from '../components/TeamActivityEvent';
import { useConfirm } from '../context/ConfirmContext.jsx';
import AllActivityModal from '../components/AllActivityModal';
import EditTaskModal from '../components/EditTaskModal';
import EditTeamNoteModal from '../components/EditTeamNoteModal';
import EditMeetingModal from '../components/EditMeetingModal';
import CopyTasksModal from '../components/CopyTasksModal';
import GenerateReportModal from '../components/GenerateReportModal';
import AddFigmaModal from '../components/AddFigmaModal';
import AddGithubModal from '../components/AddGithubModal';
import AddLiveProjectModal from '../components/AddLiveProjectModal';
import AddTeamNoteModal from '../components/AddTeamNoteModal';
import AddMemberModal from '../components/AddMemberModal';

const TeamDetailPage = () => {
  const { teamId } = useParams();
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const { openModal, setModalContext } = useModal();

  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('tasks');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFigmaModalOpen, setIsFigmaModalOpen] = useState(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLiveProjectModalOpen, setIsLiveProjectModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isEditMeetingModalOpen, setIsEditMeetingModalOpen] = useState(false);
  const [isAllActivityModalOpen, setIsAllActivityModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const [currentTask, setCurrentTask] = useState(null);
  const [expandedDates, setExpandedDates] = useState(new Set(['No Due Date']));
  const [teamNotes, setTeamNotes] = useState([]);
  const [currentTeamNote, setCurrentTeamNote] = useState(null);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [sendingReport, setSendingReport] = useState(null);

  // --- PERMISSION HELPERS ---
  const isOwner = user?.role === 'owner';

  const canCreate = (type) => {
    if (isOwner) return true;
    if (type === 'task') return user?.permissions?.canCreateTasks !== false;
    if (type === 'meeting') return user?.permissions?.canCreateMeetings !== false;
    if (type === 'note') return user?.permissions?.canCreateNotes !== false;
    if (type === 'resource') return user?.permissions?.canCreateResources !== false;
    return true;
  };

  const canDelete = (type) => {
    if (isOwner) return true;
    if (type === 'resource') return user?.permissions?.canDeleteResources !== false;
    // Task/Meeting/Note delete logic is handled inside their specific items/modals usually,
    // but we handle resources directly here.
    return true;
  };
  // --------------------------

  useEffect(() => {
    if (team) {
      setModalContext({
        teamId: team._id,
        teamMembers: team.members,
        onTaskCreated: (newTasks) => handleTasksCreated(newTasks),
        onMeetingCreated: (newMeeting) => handleMeetingCreated(newMeeting),
        onMemberAdded: (updatedTeam) => handleMemberAdded(updatedTeam),
      });
    }
    return () => setModalContext({});
  }, [team, setModalContext]);


  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const [teamRes, tasksRes, meetingsRes, notesRes, activityRes] = await Promise.all([
        api.get(`/teams/${teamId}`),
        api.get(`/tasks/${teamId}`),
        api.get(`/meetings/${teamId}`),
        api.get(`/teamnotes/${teamId}`),
        api.get(`/activity/${teamId}`)
      ]);
      setTeam(teamRes.data);
      setTasks(tasksRes.data);
      setMeetings(meetingsRes.data);
      setTeamNotes(notesRes.data);
      setActivity(activityRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch team details');
    }
    setLoading(false);
    setActivityLoading(false);
  };

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isTyping = e.target.tagName === 'INPUT' ||
                       e.target.tagName === 'TEXTAREA' ||
                       e.target.isContentEditable;

      // Only allow shortcut if user has permission
      if (e.key.toLowerCase() === 'c' && !isTyping && canCreate('task')) {
        e.preventDefault();
        openModal('createTask');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openModal, user]); // Added user dependency for permission check

  const handleMemberAdded = (updatedTeam) => {
    setTeam(updatedTeam);
    refreshActivities();
  };

  const handleTasksCreated = (newTasks) => {
    setTasks(prevTasks => [...newTasks, ...prevTasks]);
    refreshActivities();
  };

  const handleMeetingCreated = (newMeeting) => {
    const sortedMeetings = [...meetings, newMeeting].sort(
      (a, b) => new Date(a.meetingTime) - new Date(b.meetingTime)
    );
    setMeetings(sortedMeetings);
    refreshActivities();
  };

  const handleTeamNoteAdded = (newNote) => {
    setTeamNotes([newNote, ...teamNotes]);
    refreshActivities();
    setIsAddNoteModalOpen(false);
  };

  // Group tasks by date logic
  const tasksByDate = tasks.reduce((acc, task) => {
    const dateKey = task.dueDate ? task.dueDate.split('T')[0] : 'No Due Date';
    const assignee = task.assignedTo;

    if (!acc[dateKey]) {
      acc[dateKey] = {};
    }
    if (!acc[dateKey][assignee]) {
      acc[dateKey][assignee] = [];
    }

    acc[dateKey][assignee].push(task);
    acc[dateKey][assignee].sort((a, b) => {
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
      return 0;
    });

    return acc;
  }, {});

  const sortedDateKeys = Object.keys(tasksByDate).sort((a, b) => {
    if (a === 'No Due Date') return 1;
    if (b === 'No Due Date') return -1;
    return new Date(a) - new Date(b);
  });

  const toggleDate = (dateKey) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey);
      } else {
        newSet.add(dateKey);
      }
      return newSet;
    });
  };

  const handleOpenEditModal = (task) => {
    setCurrentTask(task);
    setIsEditModalOpen(true);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(task =>
      task._id === updatedTask._id ? updatedTask : task
    ));
    setIsEditModalOpen(false);
    refreshActivities();
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = await confirm({
      title: 'Delete Task?',
      description: 'Are you sure you want to delete this task?',
      confirmText: 'Delete'
    });
    if (confirmed) {
      try {
        await api.delete(`/tasks/task/${taskId}`);
        setTasks(tasks.filter(task => task._id !== taskId));
        refreshActivities();
      } catch (err) {
        console.error("Failed to delete task", err);
        setError(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const handleCopyTasks = () => {
    setIsCopyModalOpen(true);
  };

  const handleFigmaLinkAdded = (updatedTeam) => {
    setTeam(updatedTeam);
  };

  const handleDeleteFigmaLink = async (linkId) => {
    const confirmed = await confirm({
      title: 'Remove Link?',
      description: 'Are you sure you want to remove this Figma link?',
      confirmText: 'Remove'
    });

    if (confirmed) {
      try {
        const res = await api.delete(`/teams/${teamId}/figma/${linkId}`);
        setTeam(res.data);
        refreshActivities();
      } catch (err) {
        console.error("Failed to delete Figma link", err);
        setError(err.response?.data?.message || 'Failed to delete link');
      }
    }
  };

  const handleGithubRepoAdded = (updatedTeam) => {
    setTeam(updatedTeam);
    refreshActivities();
  };

  const handleDeleteGithubRepo = async (repoId) => {
    const confirmed = await confirm({
      title: 'Remove Repo?',
      description: 'Are you sure you want to remove this GitHub repo?',
      confirmText: 'Remove'
    });

    if (confirmed) {
      try {
        const res = await api.delete(`/teams/${teamId}/github/${repoId}`);
        setTeam(res.data);
        refreshActivities();
      } catch (err) {
        console.error("Failed to delete GitHub repo", err);
        setError(err.response?.data?.message || 'Failed to delete repo');
      }
    }
  };

  const handleRemoveMember = async (name) => {
    const confirmed = await confirm({
      title: `Remove ${name}?`,
      description: `This will DELETE all tasks assigned to ${name} and REMOVE them from all future meetings.`,
      confirmText: `Remove ${name}`
    });

    if (confirmed) {
      try {
        await api.put(`/teams/${teamId}/remove`, { name });
        fetchTeamData();
        refreshActivities();

      } catch (err) {
        console.error("Failed to remove member", err);
        setError(err.response?.data?.message || 'Failed to remove member');
      }
    }
  };

  const handleOpenEditTeamNoteModal = (note) => {
    setCurrentTeamNote(note);
    setIsEditNoteModalOpen(true);
  };

  const handleTeamNoteUpdated = (updatedNote) => {
    setTeamNotes(
      teamNotes.map(note => (note._id === updatedNote._id ? updatedNote : note))
    );
    refreshActivities();
  };

  const handleDeleteTeamNote = async (noteId) => {
    const confirmed = await confirm({
      title: 'Delete Note?',
      description: 'Are you sure you want to delete this team note?',
      confirmText: 'Delete'
    });
    if (confirmed) {
      try {
        await api.delete(`/teamnotes/note/${noteId}`);
        setTeamNotes(teamNotes.filter(note => note._id !== noteId));
        refreshActivities();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete note');
      }
    }
  };

  const refreshActivities = async () => {
    try {
      setActivityLoading(true);
      const activityRes = await api.get(`/activity/${teamId}`);
      setActivity(activityRes.data);
    } catch (err) {
      console.warn('Could not refresh activity feed', err);
    }
    setActivityLoading(false);
  };

  const handleLiveProjectAdded = (updatedTeam) => {
    setTeam(updatedTeam);
    refreshActivities();
  };

  const handleDeleteLiveProject = async (linkId) => {
    const confirmed = await confirm({
      title: 'Remove Project Link?',
      description: 'Are you sure you want to remove this project link?',
      confirmText: 'Remove'
    });

    if (confirmed) {
      try {
        const res = await api.delete(`/teams/${teamId}/liveproject/${linkId}`);
        setTeam(res.data);
        refreshActivities();
      } catch (err) {
        console.error("Failed to delete project link", err);
        setError(err.response?.data?.message || 'Failed to delete link');
      }
    }
  };

  const handleOpenEditMeetingModal = (meeting) => {
    setCurrentMeeting(meeting);
    setIsEditMeetingModalOpen(true);
  };

  const handleMeetingUpdated = (updatedMeeting) => {
    setMeetings(meetings.map(m =>
      m._id === updatedMeeting._id ? updatedMeeting : m
    ));
    refreshActivities();
    setIsEditMeetingModalOpen(false);
  };

  const handleDeleteMeeting = async (meetingId) => {
    const confirmed = await confirm({
      title: 'Delete Meeting?',
      description: 'Are you sure you want to delete this upcoming meeting?',
      confirmText: 'Delete'
    });
    if (confirmed) {
      try {
        await api.delete(`/meetings/meeting/${meetingId}`);
        setMeetings(meetings.filter(m => m._id !== meetingId));
        refreshActivities();
      } catch (err) {
        console.error("Failed to delete meeting", err);
        setError(err.response?.data?.message || 'Failed to delete meeting');
      }
    }
  };

  const handleSendMemberReport = async (memberName, memberEmail) => {
    if (!memberEmail) {
      alert("This member does not have an email address on file. Please add one from their profile page.");
      return;
    }

    const confirmed = await confirm({
      title: 'Send Report?',
      description: `This will generate a PDF report and email it to ${memberName} at ${memberEmail}.`,
      confirmText: 'Send Email',
      danger: false
    });

    if (confirmed) {
      setSendingReport(memberName);
      try {
        const res = await api.post('/members/send-report', { memberName });
        alert(res.data.message);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to send report');
      }
      setSendingReport(null);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

  if (!team) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-primary mb-2">Team not found</h3>
        <p className="text-gray-600 mb-4">The team you're looking for doesn't exist.</p>
        <Link
          to="/teams"
          className="inline-flex items-center text-gray-700 hover:text-primary font-medium"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to teams
        </Link>
      </div>
    );
  }

  // --- Logic Checks ---
  const isTeamOwner = team.owner._id === user._id; // Checks if current user is the Creator/Manager of this team

  const resourceCount = (team?.figmaFiles?.length || 0) +
                        (team?.githubRepos?.length || 0) +
                        (team?.liveProjects?.length || 0);

  const mainTabs = [
    { id: 'tasks', name: 'Tasks', icon: ClipboardList, count: tasks.length },
    { id: 'meetings', name: 'Meetings', icon: Calendar, count: meetings.length },
    { id: 'members', name: 'Members', icon: Users, count: team?.members?.length || 0 },
    { id: 'notes', name: 'Team Notes', icon: FileText, count: teamNotes.length },
    { id: 'resources', name: 'Resources', icon: Link2, count: resourceCount },
    { id: 'activity', name: 'Activity', icon: Activity, count: activity.length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <Link
          to="/teams"
          className="inline-flex items-center text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to all teams
        </Link>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-primary">{team.teamName}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-600">
                  {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                </span>
                {isTeamOwner && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Crown size={10} className="mr-1" />
                    Owner
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 w-full lg:w-auto">
            {/* Show Report button ONLY if allowed (default false for managers) */}
            {(isOwner || user?.permissions?.canExportReports !== false) && (
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="w-full lg:w-auto bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
              >
                <FilePieChart size={20} />
                <span>Generate Report</span>
              </button>
            )}

            {/* ADD MEMBER: Only Org Owner */}
            {isOwner && (
              <button
                onClick={() => openModal('addMember', {
                  teamId,
                  onMemberAdded: handleMemberAdded
                })}
                className="flex items-center space-x-2 text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <UserPlus size={16} />
                <span>Add Member</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA (Full Width) */}
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <nav className="flex space-x-4 px-4 overflow-x-auto items-center justify-center">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium min-w-[24px] ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Tasks Section */}
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <ClipboardList className="text-gray-700" size={20} />
                      <h2 className="text-lg font-semibold text-primary">Team Tasks</h2>
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm font-medium">
                        {tasks.length}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <button
                        onClick={handleCopyTasks}
                        disabled={tasks.length === 0}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ClipboardList size={16} />
                        <span>Copy Tasks...</span>
                      </button>

                      {/* --- CREATE TASK BUTTON --- */}
                      {canCreate('task') && (
                        <button
                          onClick={() => openModal('createTask')}
                          className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
                        >
                          <Plus size={16} />
                          <span>New Task</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  {tasks.length > 0 ? (
                    <div className="space-y-8">
                      {sortedDateKeys.map(dateKey => {
                        const tasksForDate = tasksByDate[dateKey];
                        const isExpanded = expandedDates.has(dateKey);
                        // ... (date formatting same as before) ...
                        const formattedDate = dateKey === 'No Due Date'
                          ? 'No Due Date'
                          : new Date(dateKey).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              timeZone: 'UTC'
                            });
                        const totalTasksForDate = Object.values(tasksForDate).reduce(
                          (sum, memberTasks) => sum + memberTasks.length, 0
                        );

                        return (
                          <div key={dateKey} className="border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => toggleDate(dateKey)}
                              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <Calendar size={16} className="text-gray-600" />
                                <h3 className="font-semibold text-primary">{formattedDate}</h3>
                                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                  {totalTasksForDate} task{totalTasksForDate !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 hidden sm:block">
                                  {isExpanded ? 'Collapse' : 'Expand'}
                                </span>
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="divide-y divide-gray-100">
                                    {Object.entries(tasksForDate).map(([assignee, assigneeTasks]) => (
                                      <div key={assignee} className="p-4">
                                        <div className="flex items-center space-x-3 mb-3">
                                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-medium text-gray-600">
                                              {assignee.charAt(0).toUpperCase()}
                                            </span>
                                          </div>
                                          <h4 className="font-medium text-gray-800">{assignee}</h4>
                                        </div>
                                        <div className="space-y-3 pl-11">
                                          {assigneeTasks.map(task => (
                                            <TaskItem
                                              key={task._id}
                                              task={task}
                                              onEdit={handleOpenEditModal}
                                              onDelete={() => handleDeleteTask(task._id)}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ClipboardList className="mx-auto text-gray-400 mb-3" size={32} />
                      <h3 className="text-sm font-medium text-primary mb-1">No tasks yet</h3>
                      <p className="text-sm text-gray-600">Create the first task for this team</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Meetings Section */}
          {activeTab === 'meetings' && (
            <motion.div
              key="meetings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-gray-700" size={20} />
                    <h2 className="text-lg font-semibold text-primary">Upcoming Meetings</h2>
                  </div>

                  {/* --- CREATE MEETING BUTTON --- */}
                  {canCreate('meeting') && (
                    <button
                      onClick={() => openModal('createMeeting')}
                      className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
                    >
                      <Plus size={16} />
                      <span>New Meeting</span>
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  <div className="space-y-4 pr-2">
                    {meetings.length > 0 ? (
                      meetings.map(meeting => (
                        <MeetingItem
                          key={meeting._id}
                          meeting={meeting}
                          onEdit={handleOpenEditMeetingModal}
                          onDelete={handleDeleteMeeting}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="mx-auto text-gray-400 mb-3" size={32} />
                        <h3 className="text-sm font-medium text-primary mb-1">No meetings scheduled</h3>
                        <p className="text-sm text-gray-600">Schedule your first team meeting</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Members Section */}
          {activeTab === 'members' && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="text-gray-700" size={20} />
                  <h2 className="text-lg font-semibold text-primary">Team Members</h2>
                </div>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Owned by: <span className="font-medium text-primary">{team.owner.username}</span>
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  <div className="space-y-3 pr-2">
                    {team.members.map((memberName, index) => (
                      <div
                        key={index}
                        className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Link
                          to={`/members/details?name=${encodeURIComponent(memberName)}`}
                          className="flex-1 flex items-center space-x-3 min-w-0"
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-gray-600">
                              {memberName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-primary truncate" title={memberName}>
                            {memberName}
                          </span>
                        </Link>

                        <div className="flex items-center flex-shrink-0 ml-2 z-10">
                          {/* Send Report */}
                          {(isOwner || user?.permissions?.canExportReports !== false) && (
                            <button
                              onClick={() => handleSendMemberReport(memberName)}
                              disabled={sendingReport === memberName}
                              title={sendingReport === memberName ? "Sending..." : "Send PDF Report"}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                              {sendingReport === memberName ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Mail size={16} />
                              )}
                            </button>
                          )}

                          {/* DELETE MEMBER: Only Organization Owner */}
                          {isOwner && (
                            <button
                              onClick={() => handleRemoveMember(memberName)}
                              title={`Remove ${memberName}`}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {team.members.length === 0 && (
                      <div className="text-center py-4">
                        <Users className="mx-auto text-gray-400 mb-2" size={24} />
                        <p className="text-sm text-gray-600">No members yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Team Notes Section */}
          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="text-gray-700" size={20} />
                    <h2 className="text-lg font-semibold text-primary">Team Notes</h2>
                  </div>

                  {/* --- CREATE NOTE BUTTON --- */}
                  {canCreate('note') && (
                    <button
                      onClick={() => setIsAddNoteModalOpen(true)}
                      className="bg-primary text-white p-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  <div className="space-y-4 pr-2">
                    {teamNotes.length > 0 ? (
                      teamNotes.map((note) => (
                        <TeamNoteCard
                          key={note._id}
                          note={note}
                          onEdit={handleOpenEditTeamNoteModal}
                          onDelete={handleDeleteTeamNote}
                        />
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <FileText className="mx-auto text-gray-400 mb-2" size={24} />
                        <p className="text-sm text-gray-600">No team notes yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Resources Section */}
          {activeTab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Figma Files Section */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <Link2 className="text-gray-700" size={20} />
                    <h2 className="text-lg font-semibold text-primary">Figma Files</h2>
                  </div>

                  {/* ADD FIGMA */}
                  {canCreate('resource') && (
                    <button
                      onClick={() => setIsFigmaModalOpen(true)}
                      className="bg-primary text-white p-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
                <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  <div className="space-y-3 pr-2">
                    {team.figmaFiles && team.figmaFiles.length > 0 ? (
                      team.figmaFiles.map((file) => (
                        <div
                          key={file._id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <a href={file.link} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <Link2 size={16} className="text-gray-600" />
                            </div>
                            <span className="font-medium text-primary">{file.name}</span>
                          </a>

                          {/* DELETE RESOURCE */}
                          {canDelete('resource') && (
                            <button
                              onClick={() => handleDeleteFigmaLink(file._id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <Link2 className="mx-auto text-gray-400 mb-2" size={24} />
                        <p className="text-sm text-gray-600">No Figma files added</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* GitHub Repos Section */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <Github className="text-gray-700" size={20} />
                    <h2 className="text-lg font-semibold text-primary">GitHub Repos</h2>
                  </div>

                  {/* ADD GITHUB */}
                  {canCreate('resource') && (
                    <button
                      onClick={() => setIsGithubModalOpen(true)}
                      className="bg-primary text-white p-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
                <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  <div className="space-y-3 pr-2">
                    {team.githubRepos && team.githubRepos.length > 0 ? (
                      team.githubRepos.map((repo) => (
                        <div key={repo._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                          <a href={repo.link} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <Github size={16} className="text-gray-600" />
                            </div>
                            <span className="font-medium text-primary">{repo.name}</span>
                          </a>

                          {/* DELETE RESOURCE */}
                          {canDelete('resource') && (
                            <button
                              onClick={() => handleDeleteGithubRepo(repo._id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <Github className="mx-auto text-gray-400 mb-2" size={24} />
                        <p className="text-sm text-gray-600">No repos linked yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Projects Section */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="text-gray-700" size={20} />
                    <h2 className="text-lg font-semibold text-primary">Live Projects</h2>
                  </div>

                  {/* ADD LIVE PROJECT */}
                  {canCreate('resource') && (
                    <button
                      onClick={() => setIsLiveProjectModalOpen(true)}
                      className="bg-primary text-white p-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
                <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  <div className="space-y-3 pr-2">
                    {team.liveProjects && team.liveProjects.length > 0 ? (
                      team.liveProjects.map((project) => (
                        <div key={project._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                          <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <ExternalLink size={16} className="text-gray-600" />
                            </div>
                            <span className="font-medium text-primary">{project.name}</span>
                          </a>

                          {/* DELETE RESOURCE */}
                          {canDelete('resource') && (
                            <button
                              onClick={() => handleDeleteLiveProject(project._id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <ExternalLink className="mx-auto text-gray-400 mb-2" size={24} />
                        <p className="text-sm text-gray-600">No live projects linked yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Activity Section */}
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="text-gray-700" size={20} />
                    <h2 className="text-lg font-semibold text-primary">Activity Feed</h2>
                  </div>
                  <button
                    onClick={() => setIsAllActivityModalOpen(true)}
                    className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                  >
                    View all
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  <div className="space-y-2 pr-2 divide-y divide-gray-100">
                    {activityLoading ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">Loading feed...</p>
                      </div>
                    ) : activity.length > 0 ? (
                      activity.map((item) => (
                        <TeamActivityEvent key={item._id} activity={item} />
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <Activity className="mx-auto text-gray-400 mb-2" size={24} />
                        <p className="text-sm text-gray-600">No activity yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- MODALS (Unchanged) --- */}
      <AddMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        teamId={teamId}
        onMemberAdded={handleMemberAdded}
      />

      <AddTeamNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        teamId={teamId}
        onNoteAdded={handleTeamNoteAdded}
      />

      <AllActivityModal
        isOpen={isAllActivityModalOpen}
        onClose={() => setIsAllActivityModalOpen(false)}
        teamId={teamId}
        teamName={team?.teamName}
      />

      <CopyTasksModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        tasks={tasks}
        teamName={team?.teamName}
      />

      {team && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          taskToEdit={currentTask}
          teamMembers={team.members}
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      <AddFigmaModal
        isOpen={isFigmaModalOpen}
        onClose={() => setIsFigmaModalOpen(false)}
        teamId={teamId}
        onFigmaLinkAdded={handleFigmaLinkAdded}
      />

      <AddGithubModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        teamId={teamId}
        onGithubRepoAdded={handleGithubRepoAdded}
      />

      <EditTeamNoteModal
        isOpen={isEditNoteModalOpen}
        onClose={() => setIsEditNoteModalOpen(false)}
        note={currentTeamNote}
        onNoteUpdated={handleTeamNoteUpdated}
      />

      {team && (
        <GenerateReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          teamId={team._id}
          teamName={team.teamName}
        />
      )}

      <AddLiveProjectModal
        isOpen={isLiveProjectModalOpen}
        onClose={() => setIsLiveProjectModalOpen(false)}
        teamId={teamId}
        onLiveProjectAdded={handleLiveProjectAdded}
      />

      {team && (
        <EditMeetingModal
          isOpen={isEditMeetingModalOpen}
          onClose={() => setIsEditMeetingModalOpen(false)}
          meetingToEdit={currentMeeting}
          teamMembers={team.members}
          onMeetingUpdated={handleMeetingUpdated}
        />
      )}
    </div>
  );
};

export default TeamDetailPage;
