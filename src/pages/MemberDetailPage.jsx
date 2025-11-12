import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
  Loader2,
  AlertCircle,
  User,
  ClipboardList,
  Calendar,
  Activity,
  ArrowLeft,
  Edit
} from 'lucide-react';
import TaskItem from '../components/TaskItem'; //
import MeetingItem from '../components/MeetingItem'; //
import TeamActivityEvent from '../components/TeamActivityEvent'; //
import EditTaskModal from '../components/EditTaskModal'; // <-- 1. IMPORT THE MODAL
import EditMemberProfileModal from '../components/EditMemberProfileModal';
import format from 'date-fns/format';

const MemberDetailPage = () => {
  const [searchParams] = useSearchParams();
  const memberName = searchParams.get('name');

  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');

  // --- 2. ADD STATE FOR MODALS AND TEAM DATA ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [allTeams, setAllTeams] = useState([]); // To store team.members array

  useEffect(() => {
    if (!memberName) {
      setError('No member name specified.');
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        // We fetch teams and member details in parallel
        const [detailsRes, teamsRes] = await Promise.all([
          api.get(`/members/details?name=${encodeURIComponent(memberName)}`),
          api.get('/teams') // Fetch all teams to get member lists for the edit modal
        ]);

        setData(detailsRes.data);
        setProfile(detailsRes.data.profile);
        setAllTeams(teamsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch member details');
      }
      setLoading(false);
    };

    fetchDetails();
  }, [memberName]);

  // --- 3. ADD HANDLER FUNCTIONS ---
  const handleOpenEditModal = (task) => {
    setCurrentTask(task);
    setIsEditModalOpen(true);
  };

  const handleTaskUpdated = (updatedTask) => {
    // Update the task in our local state
    setData(prevData => ({
      ...prevData,
      tasks: prevData.tasks.map(task =>
        task._id === updatedTask._id ? updatedTask : task
      )
    }));
    setIsEditModalOpen(false);
    // Note: We could re-fetch activities here if needed
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/task/${taskId}`);
        // Remove the task from our local state
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

  // Find the members list for the specific team of the task being edited
  const getTeamMembersForTask = (task) => {
    if (!task || !allTeams) return [];
    const team = allTeams.find(t => t._id === task.team._id);
    return team ? team.members : [];
  };

  const handleProfileUpdated = (newProfile) => {
    setProfile(newProfile);
  };

  // --- (Loading and Error states are unchanged) ---
  if (loading) {
    return (
      <div className="min-h-96 flex flex-col items-center justify-center py-12">
        <Loader2 className="animate-spin text-gray-900 mb-4" size={32} />
        <p className="text-gray-600">Loading member details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-3 p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 max-w-2xl mx-auto">
        <AlertCircle size={24} className="flex-shrink-0" />
        <div>
          <p className="font-medium">Unable to load member details</p>
          <p className="text-sm mt-1">{error}</p>
          <Link
            to="/members"
            className="inline-flex items-center text-red-700 hover:text-red-800 font-medium mt-3"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to all members
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { tasks = [], meetings = [], activities = [] } = data;

  const tabs = [
    { id: 'tasks', name: 'Tasks', count: tasks.length, icon: ClipboardList },
    { id: 'meetings', name: 'Meetings', count: meetings.length, icon: Calendar },
    { id: 'activity', name: 'Activity', count: activities.length, icon: Activity },
  ];

  return (
    <div className="space-y-8">
      {/* --- (Header is unchanged) --- */}
      <div className="flex flex-col space-y-6">
        <Link
          to="/members"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to all members
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-3xl font-medium">
                {memberName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{memberName}</h1>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  title="Edit profile"
                >
                  <Edit size={16} />
                </button>
              </div>

              {/* --- 9. DISPLAY NEW DATES --- */}
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>
                    Joined: {profile?.joiningDate
                      ? format(new Date(profile.joiningDate), 'MMMM dd, yyyy')
                      : 'Not set'}
                  </span>
                </div>
                {profile?.endingDate && (
                  <div className="flex items-center space-x-2 text-sm text-red-600">
                    <Calendar size={16} />
                    <span>
                      Left: {format(new Date(profile.endingDate), 'MMMM dd, yyyy')}
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-center min-w-[100px]">
              <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
              <div className="text-sm text-gray-600">Tasks</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-center min-w-[100px]">
              <div className="text-2xl font-bold text-gray-900">{meetings.length}</div>
              <div className="text-sm text-gray-600">Meetings</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-center min-w-[100px]">
              <div className="text-2xl font-bold text-gray-900">{activities.length}</div>
              <div className="text-sm text-gray-600">Activities</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- (Tabs are unchanged) --- */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={18} />
                <span>{tab.name}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
      </div>

      {/* --- Tab Content --- */}
      <div className="min-h-96">
        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Assigned Tasks</h2>
              <span className="text-sm text-gray-600">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-4">
              {tasks.length > 0 ? (
                tasks.map(task => (
                  <div key={task._id} className="bg-white border border-gray-200 rounded-xl p-6">
                    <p className="text-sm font-medium text-gray-500 mb-3">
                      From Team: <Link to={`/team/${task.team._id}`} className="text-gray-900 hover:text-gray-700 font-semibold">{task.team.teamName}</Link>
                    </p>
                    <TaskItem
                      task={task}
                      onEdit={handleOpenEditModal}   // <-- 4. USE REAL HANDLER
                      onDelete={handleDeleteTask} // <-- 4. USE REAL HANDLER
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
                  <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks assigned</h3>
                  <p className="text-gray-600">This member doesn't have any assigned tasks yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- (Meetings and Activity tabs are unchanged) --- */}
        {activeTab === 'meetings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Scheduled Meetings</h2>
              <span className="text-sm text-gray-600">
                {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-4">
              {meetings.length > 0 ? (
                meetings.map(meeting => (
                  <div key={meeting._id} className="bg-white border border-gray-200 rounded-xl p-6">
                    <MeetingItem meeting={meeting} />
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
                  <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No meetings scheduled</h3>
                  <p className="text-gray-600">This member doesn't have any scheduled meetings.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <span className="text-sm text-gray-600">
                {activities.length} activit{activities.length !== 1 ? 'ies' : 'y'}
              </span>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-100">
                {activities.length > 0 ? (
                  activities.map(item => (
                    <div key={item._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                      <TeamActivityEvent activity={item} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Activity size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent activity</h3>
                    <p className="text-gray-600">This member hasn't been mentioned in any activity logs.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <EditMemberProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* --- 5. ADD THE MODAL TO THE PAGE --- */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        taskToEdit={currentTask}
        // We find the correct member list for the specific task
        teamMembers={getTeamMembersForTask(currentTask)}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
};

export default MemberDetailPage;
