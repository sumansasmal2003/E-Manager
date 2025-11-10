import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, Plus, Users, ClipboardList, Calendar, Crown, User,
  ChevronDown, ChevronUp, Copy, Check, Link2, Trash2, Github, X,
  FileText, Activity // <-- ADD THIS
} from 'lucide-react';

import AddMemberModal from '../components/AddMemberModal';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskItem from '../components/TaskItem';
import CreateMeetingModal from '../components/CreateMeetingModal';
import MeetingItem from '../components/MeetingItem';
import EditTaskModal from '../components/EditTaskModal';
import AddFigmaModal from '../components/AddFigmaModal';
import AddGithubModal from '../components/AddGithubModal';
import TeamNoteCard from '../components/TeamNoteCard';
import AddTeamNoteModal from '../components/AddTeamNoteModal';
import EditTeamNoteModal from '../components/EditTeamNoteModal';
import TeamActivityEvent from '../components/TeamActivityEvent';

const TeamDetailPage = () => {
  const { teamId } = useParams();
  const { user } = useAuth();

  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFigmaModalOpen, setIsFigmaModalOpen] = useState(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [expandedAssignees, setExpandedAssignees] = useState(new Set());
  const [copied, setCopied] = useState(false);
  const [teamNotes, setTeamNotes] = useState([]);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false);
  const [currentTeamNote, setCurrentTeamNote] = useState(null);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

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

  const handleMemberAdded = (updatedTeam) => {
    setTeam(updatedTeam);
    refreshActivities();
  };

  const handleTaskCreated = (newTask) => {
    setTasks(prevTasks => [newTask, ...prevTasks]);
    refreshActivities();
  };

  const handleMeetingCreated = (newMeeting) => {
    const sortedMeetings = [...meetings, newMeeting].sort(
      (a, b) => new Date(a.meetingTime) - new Date(b.meetingTime)
    );
    setMeetings(sortedMeetings);
    refreshActivities();
  };

  // Group tasks by assignee
  const tasksByAssignee = tasks.reduce((acc, task) => {
    const assignee = task.assignedTo;
    if (!acc[assignee]) {
      acc[assignee] = [];
    }
    acc[assignee].push(task);
    return acc;
  }, {});

  // Sort tasks within each group
  for (const assignee in tasksByAssignee) {
    tasksByAssignee[assignee].sort((a, b) => {
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }

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
    try {
      await api.delete(`/tasks/task/${taskId}`);
      setTasks(tasks.filter(task => task._id !== taskId));
      refreshActivities();
    } catch (err) {
      console.error("Failed to delete task", err);
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const toggleAssignee = (assignee) => {
    setExpandedAssignees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assignee)) {
        newSet.delete(assignee);
      } else {
        newSet.add(assignee);
      }
      return newSet;
    });
  };

  const formatTasksForCopy = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let formattedText = `📋 ${team.teamName} - Team Tasks\n`;
  formattedText += `📅 ${currentDate}\n\n`;

  Object.entries(tasksByAssignee).forEach(([assignee, assigneeTasks], index) => {
    formattedText += `👤 ${assignee}\n\n`;

    assigneeTasks.forEach((task, taskIndex) => {
      formattedText += `${taskIndex + 1}. ${task.title}`;

      if (task.description) {
        formattedText += `   ${task.description}\n`;
      }

      if (task.priority && task.priority !== 'Medium') {
        formattedText += `   Priority: ${task.priority}\n`;
      }

      // Add space between tasks
      if (taskIndex < assigneeTasks.length - 1) {
        formattedText += '\n';
      }
    });

    // Add separator between assignees (except after the last one)
    if (index < Object.keys(tasksByAssignee).length - 1) {
      formattedText += '\n────────────────────────\n';
    }
  });

  return formattedText;
};

  const handleCopyTasks = async () => {
    try {
      const tasksText = formatTasksForCopy();
      await navigator.clipboard.writeText(tasksText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = formatTasksForCopy();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFigmaLinkAdded = (updatedTeam) => {
    setTeam(updatedTeam);
  };

  const handleDeleteFigmaLink = async (linkId) => {
    if (!window.confirm('Are you sure you want to remove this Figma link?')) {
      return;
    }

    try {
      const res = await api.delete(`/teams/${teamId}/figma/${linkId}`);
      setTeam(res.data);
      refreshActivities();
    } catch (err) {
      console.error("Failed to delete Figma link", err);
      setError(err.response?.data?.message || 'Failed to delete link');
    }
  };

  const handleGithubRepoAdded = (updatedTeam) => {
    setTeam(updatedTeam);
    refreshActivities();
  };

  const handleDeleteGithubRepo = async (repoId) => {
    if (!window.confirm('Are you sure you want to remove this GitHub repo?')) {
      return;
    }

    try {
      const res = await api.delete(`/teams/${teamId}/github/${repoId}`);
      setTeam(res.data);
      refreshActivities();
    } catch (err) {
      console.error("Failed to delete GitHub repo", err);
      setError(err.response?.data?.message || 'Failed to delete repo');
    }
  };

  const handleRemoveMember = async (name) => {
    const confirmMessage = `Are you sure you want to remove ${name}?\n\nThis action will also DELETE all tasks assigned to them and REMOVE them from all future meetings.`;

    // Using window.confirm as it's used elsewhere in your project
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // We don't need the response, we'll re-fetch for simplicity
      await api.put(`/teams/${teamId}/remove`, { name });

      // Re-fetch all data to get updated task and meeting lists
      fetchTeamData();
      refreshActivities();

    } catch (err) {
      console.error("Failed to remove member", err);
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleTeamNoteAdded = (newNote) => {
    setTeamNotes([newNote, ...teamNotes]);
    refreshActivities();

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
    if (!window.confirm('Are you sure you want to delete this team note?')) {
      return;
    }
    try {
      await api.delete(`/teamnotes/note/${noteId}`);
      setTeamNotes(teamNotes.filter(note => note._id !== noteId));
      refreshActivities();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete note');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
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

  if (!team) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Team not found</h3>
        <p className="text-gray-600 mb-4">The team you're looking for doesn't exist.</p>
        <Link
          to="/teams"
          className="inline-flex items-center text-gray-700 hover:text-gray-900 font-medium"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to teams
        </Link>
      </div>
    );
  }

  const isOwner = team.owner._id === user._id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <Link
          to="/teams"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to all teams
        </Link>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{team.teamName}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-600">
                  {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                </span>
                {isOwner && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Crown size={10} className="mr-1" />
                    Owner
                  </span>
                )}
              </div>
            </div>
          </div>
          {isOwner && (
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="w-full lg:w-auto bg-gray-900 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200"
            >
              <Plus size={20} />
              <span>Add Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Members, Figma, GitHub */}
        <div className="xl:col-span-1 space-y-6">
          {/* Team Members Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="text-gray-700" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Owned by: <span className="font-medium text-gray-900">{team.owner.username}</span>
              </p>
            </div>
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              <div className="space-y-3 pr-2">
                {team.members.map((memberName, index) => (
                <div
                  key={index}
                  className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {memberName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{memberName}</span>
                  </div>

                  {/* Show remove button only if user is owner */}
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

          {/* Figma Files Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Link2 className="text-gray-700" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">Figma Files</h2>
              </div>
              <button
                onClick={() => setIsFigmaModalOpen(true)}
                className="bg-gray-900 text-white p-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              <div className="space-y-3 pr-2">
                {team.figmaFiles && team.figmaFiles.length > 0 ? (
                  team.figmaFiles.map((file) => (
                    <div
                      key={file._id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <a
                        href={file.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Link2 size={16} className="text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-900">{file.name}</span>
                      </a>
                      <button
                        onClick={() => handleDeleteFigmaLink(file._id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
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
                <h2 className="text-lg font-semibold text-gray-900">GitHub Repos</h2>
              </div>
              <button
                onClick={() => setIsGithubModalOpen(true)}
                className="bg-gray-900 text-white p-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              <div className="space-y-3 pr-2">
                {team.githubRepos && team.githubRepos.length > 0 ? (
                  team.githubRepos.map((repo) => (
                    <div
                      key={repo._id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <a
                        href={repo.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Github size={16} className="text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-900">{repo.name}</span>
                      </a>
                      <button
                        onClick={() => handleDeleteGithubRepo(repo._id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
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
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="text-gray-700" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">Team Notes</h2>
              </div>
              <button
                onClick={() => setIsAddNoteModalOpen(true)}
                className="bg-gray-900 text-white p-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200"
              >
                <Plus size={16} />
              </button>
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
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="text-gray-700" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Activity Feed</h2>
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
        </div>

        {/* Right Column: Tasks & Meetings */}
        <div className="xl:col-span-2 space-y-6">
          {/* Tasks Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-2">
                  <ClipboardList className="text-gray-700" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">Team Tasks</h2>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm font-medium">
                    {tasks.length}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleCopyTasks}
                    disabled={tasks.length === 0}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy Tasks</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="w-full sm:w-auto bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200"
                  >
                    <Plus size={16} />
                    <span>New Task</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Tasks Container */}
            <div className="p-6 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              {tasks.length > 0 ? (
                <div className="space-y-8">
                  {Object.entries(tasksByAssignee).map(([assignee, assigneeTasks]) => {
                    const isExpanded = expandedAssignees.has(assignee);
                    const visibleTasks = isExpanded ? assigneeTasks : assigneeTasks.slice(0, 3);
                    const hasMoreTasks = assigneeTasks.length > 3;

                    return (
                      <div key={assignee} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Assignee Header */}
                        <button
                          onClick={() => toggleAssignee(assignee)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User size={16} className="text-gray-600" />
                            </div>
                            <div className="text-left">
                              <h3 className="font-semibold text-gray-900">{assignee}</h3>
                              <p className="text-sm text-gray-600">
                                {assigneeTasks.length} task{assigneeTasks.length !== 1 ? 's' : ''}
                                {hasMoreTasks && !isExpanded && ` • ${assigneeTasks.length - 3} more`}
                              </p>
                            </div>
                          </div>
                          {hasMoreTasks && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">
                                {isExpanded ? 'Show less' : 'Show all'}
                              </span>
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          )}
                        </button>

                        {/* Tasks List */}
                        <div className="divide-y divide-gray-100">
                          {visibleTasks.map(task => (
                            <div key={task._id} className="p-4 hover:bg-gray-50 transition-colors">
                              <TaskItem
                                task={task}
                                onEdit={handleOpenEditModal}
                                onDelete={handleDeleteTask}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClipboardList className="mx-auto text-gray-400 mb-3" size={32} />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No tasks yet</h3>
                  <p className="text-sm text-gray-600">Create the first task for this team</p>
                </div>
              )}
            </div>
          </div>

          {/* Meetings Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="text-gray-700" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h2>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm font-medium">
                  {meetings.length}
                </span>
              </div>
              <button
                onClick={() => setIsMeetingModalOpen(true)}
                className="w-full sm:w-auto bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200"
              >
                <Plus size={16} />
                <span>New Meeting</span>
              </button>
            </div>

            {/* Scrollable Meetings Container */}
            <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              <div className="space-y-4 pr-2">
                {meetings.length > 0 ? (
                  meetings.map(meeting => (
                    <MeetingItem key={meeting._id} meeting={meeting} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto text-gray-400 mb-3" size={32} />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No meetings scheduled</h3>
                    <p className="text-sm text-gray-600">Schedule your first team meeting</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        teamId={teamId}
        onMemberAdded={handleMemberAdded}
      />

      {team && (
        <CreateTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          teamId={teamId}
          members={team.members}
          onTaskCreated={handleTaskCreated}
        />
      )}

      {team && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          taskToEdit={currentTask}
          teamMembers={team.members}
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      {team && (
        <CreateMeetingModal
          isOpen={isMeetingModalOpen}
          onClose={() => setIsMeetingModalOpen(false)}
          teamId={teamId}
          members={team.members}
          onMeetingCreated={handleMeetingCreated}
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
      <AddTeamNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        teamId={teamId}
        onNoteAdded={handleTeamNoteAdded}
      />

      <EditTeamNoteModal
        isOpen={isEditNoteModalOpen}
        onClose={() => setIsEditNoteModalOpen(false)}
        note={currentTeamNote}
        onNoteUpdated={handleTeamNoteUpdated}
      />
    </div>
  );
};

export default TeamDetailPage;
