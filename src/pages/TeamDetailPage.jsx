import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Users, ClipboardList, Calendar, Crown, Link2,
  Trash2, Github, FileText, Activity, FilePieChart, ExternalLink,
  Mail, Briefcase
} from 'lucide-react';

// Context & API
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useConfirm } from '../context/ConfirmContext.jsx';

// Components
import TaskItem from '../components/TaskItem';
import MeetingItem from '../components/MeetingItem';
import TeamNoteCard from '../components/TeamNoteCard';
import TeamActivityEvent from '../components/TeamActivityEvent';

// Modals
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

// --- CUSTOM HOOKS ---

// 1. Permission Logic Hook
const useTeamPermissions = (user) => {
  return useMemo(() => {
    const isOwner = user?.role === 'owner';
    const isEmployee = user?.role === 'employee';
    const isManager = user?.role === 'manager';

    const canHire = isOwner || (isManager && user?.permissions?.canHireEmployees !== false);
    const canRemoveMember = isOwner || (isManager && user?.permissions?.canRemoveMembers === true);

    const check = (action, type) => {
      if (isEmployee) return action === 'edit' && type === 'task'; // Employees can only edit tasks
      if (isOwner) return true;

      // Manager Logic
      const permMap = {
        create: `canCreate${type.charAt(0).toUpperCase() + type.slice(1)}s`,
        delete: `canDelete${type.charAt(0).toUpperCase() + type.slice(1)}s`,
        edit: type === 'task' ? 'canEditTasks' : true // Implicit edit rights for others
      };

      const permKey = permMap[action];
      return typeof permKey === 'boolean' ? permKey : user?.permissions?.[permKey] !== false;
    };

    return { isOwner, isEmployee, isManager, canHire, canRemoveMember, check };
  }, [user]);
};

// 2. Data Fetching Hook
const useTeamData = (teamId) => {
  const [data, setData] = useState({
    team: null,
    tasks: [],
    meetings: [],
    teamNotes: [],
    activity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [team, tasks, meetings, notes, activity] = await Promise.all([
        api.get(`/teams/${teamId}`),
        api.get(`/tasks/${teamId}`),
        api.get(`/meetings/${teamId}`),
        api.get(`/teamnotes/${teamId}`),
        api.get(`/activity/${teamId}`)
      ]);

      setData({
        team: team.data,
        tasks: tasks.data,
        meetings: meetings.data,
        teamNotes: notes.data,
        activity: activity.data
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch team details');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  return { ...data, setData, loading, error, refetch: fetchData };
};

// --- SUB-COMPONENTS (Views) ---

const TasksView = ({ tasks, user, isEmployee, permissions, onEdit, onDelete, onCopy, onAdd }) => {
  // Memoize task sorting and grouping
  const { sortedDateKeys, tasksByDate } = useMemo(() => {
    const visibleTasks = isEmployee ? tasks.filter(t => t.assignedTo === user.username) : tasks;

    const grouped = visibleTasks.reduce((acc, task) => {
      const dateKey = task.dueDate ? task.dueDate.split('T')[0] : 'No Due Date';
      const assignee = task.assignedTo;
      if (!acc[dateKey]) acc[dateKey] = {};
      if (!acc[dateKey][assignee]) acc[dateKey][assignee] = [];
      acc[dateKey][assignee].push(task);
      return acc;
    }, {});

    // Sort tasks within groups
    Object.keys(grouped).forEach(date => {
        Object.keys(grouped[date]).forEach(assignee => {
            grouped[date][assignee].sort((a, b) => (a.status === 'Pending' ? -1 : 1));
        });
    });

    const keys = Object.keys(grouped).sort((a, b) => {
      if (a === 'No Due Date') return 1;
      if (b === 'No Due Date') return -1;
      return new Date(a) - new Date(b);
    });

    return { sortedDateKeys: keys, tasksByDate: grouped };
  }, [tasks, isEmployee, user.username]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-primary">{isEmployee ? 'My Tasks' : 'Team Tasks'}</h2>
        <div className="flex gap-2">
          {!isEmployee && (
            <button onClick={onCopy} className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50">Copy Tasks</button>
          )}
          {permissions.check('create', 'task') && (
            <button onClick={onAdd} className="px-3 py-1.5 bg-primary text-white rounded text-sm hover:bg-gray-800">+ New Task</button>
          )}
        </div>
      </div>
      <div className="p-6">
        {sortedDateKeys.length > 0 ? (
          <div className="space-y-4">
            {sortedDateKeys.map(dateKey => (
              <div key={dateKey} className="border border-gray-200 rounded-lg p-4">
                <div className="font-bold text-gray-700 mb-2">{dateKey}</div>
                {Object.entries(tasksByDate[dateKey]).map(([assignee, tList]) => (
                  <div key={assignee} className="ml-4 mb-2">
                    <div className="text-sm font-semibold text-gray-500 mb-1">{assignee}</div>
                    {tList.map(task => (
                      <TaskItem
                        key={task._id}
                        task={task}
                        onEdit={permissions.check('edit', 'task') ? onEdit : undefined}
                        onDelete={permissions.check('delete', 'task') ? () => onDelete(task._id) : undefined}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : <div className="text-center text-gray-500">No tasks found</div>}
      </div>
    </div>
  );
};

const MeetingsView = ({ meetings, permissions, onEdit, onDelete, onAdd }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
    <div className="flex justify-between mb-4">
      <h2 className="text-lg font-bold">Meetings</h2>
      {permissions.check('create', 'meeting') && <button onClick={onAdd} className="bg-primary text-white px-3 py-1.5 rounded text-sm">New Meeting</button>}
    </div>
    {meetings.map(m => (
      <MeetingItem
        key={m._id}
        meeting={m}
        onEdit={permissions.check('edit', 'meeting') ? onEdit : undefined}
        onDelete={permissions.check('delete', 'meeting') ? onDelete : undefined}
      />
    ))}
  </div>
);

const MembersView = ({ members, permissions, isEmployee, onRemove, onReport }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
    <h2 className="text-lg font-bold mb-4">Team Members</h2>
    <div className="space-y-2">
      {members.map((member, i) => (
        <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">{member.charAt(0)}</div>
            <span>{member}</span>
          </div>
          <div className="flex gap-2">
            {!isEmployee && (
              <>
                <button onClick={() => onReport(member)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Mail size={16}/></button>
                {permissions.canRemoveMember && (
                  <button onClick={() => onRemove(member)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const NotesView = ({ notes, permissions, onEdit, onDelete, onAdd }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-bold">Team Notes</h2>
      {permissions.check('create', 'note') && <button onClick={onAdd} className="bg-primary text-white p-2 rounded-lg hover:bg-gray-800"><Plus size={16} /></button>}
    </div>
    {notes.map(note => (
      <TeamNoteCard
        key={note._id}
        note={note}
        onEdit={permissions.check('edit', 'note') ? onEdit : undefined}
        onDelete={permissions.check('delete', 'note') ? onDelete : undefined}
      />
    ))}
  </div>
);

const ResourcesView = ({ team, permissions, actions }) => {
  const renderSection = (title, items, icon, onAdd, onDelete) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {permissions.check('create', 'resource') && <button onClick={onAdd} className="bg-primary text-white p-2 rounded-lg"><Plus size={16} /></button>}
      </div>
      {items?.map(item => (
        <div key={item._id} className="flex justify-between p-2 hover:bg-gray-50 rounded">
          <a href={item.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary font-medium">{icon}{item.name}</a>
          {permissions.check('delete', 'resource') && <button onClick={() => onDelete(item._id)} className="text-red-500"><Trash2 size={14}/></button>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {renderSection('Figma Files', team.figmaFiles, <Link2 size={16}/>, actions.addFigma, actions.deleteFigma)}
      {renderSection('GitHub Repos', team.githubRepos, <Github size={16}/>, actions.addGithub, actions.deleteGithub)}
      {renderSection('Live Projects', team.liveProjects, <ExternalLink size={16}/>, actions.addLive, actions.deleteLive)}
    </div>
  );
};

// --- MAIN COMPONENT ---

const TeamDetailPage = () => {
  const { teamId } = useParams();
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const { openModal, setModalContext } = useModal();

  // 1. Logic Hooks
  const permissions = useTeamPermissions(user);
  const { team, tasks, meetings, teamNotes, activity, setData, loading, error, refetch } = useTeamData(teamId);

  // 2. UI State
  const [activeTab, setActiveTab] = useState('tasks');
  const [activeModal, setActiveModal] = useState(null); // 'editTask', 'addFigma', etc.

  // 3. Selection State (for edits)
  const [selectedItem, setSelectedItem] = useState(null);

  // --- Handlers ---

  const handleContextUpdate = useCallback(() => {
    if (team) {
      setModalContext({
        teamId: team._id,
        teamMembers: team.members,
        onTaskCreated: (newTasks) => {
          setData(prev => ({ ...prev, tasks: [...newTasks, ...prev.tasks] }));
          refetch(); // Refresh activity
        },
        onMeetingCreated: (newMeeting) => {
          setData(prev => ({
            ...prev,
            meetings: [...prev.meetings, newMeeting].sort((a,b) => new Date(a.meetingTime) - new Date(b.meetingTime))
          }));
          refetch();
        },
        onEmployeeCreated: refetch,
      });
    }
  }, [team, setData, refetch, setModalContext]);

  useEffect(() => { handleContextUpdate(); return () => setModalContext({}); }, [handleContextUpdate]);
  useEffect(() => { refetch(); }, [refetch]);

  // Modal Openers
  const openEdit = (type, item) => { setSelectedItem(item); setActiveModal(`edit${type}`); };
  const closeModal = () => { setActiveModal(null); setSelectedItem(null); };

  // CRUD Actions
  const handleTaskDelete = async (id) => {
    if (await confirm({ title: 'Delete Task?', description: 'Are you sure?', confirmText: 'Delete' })) {
      try { await api.delete(`/tasks/task/${id}`); setData(p => ({...p, tasks: p.tasks.filter(t => t._id !== id)})); refetch(); } catch (e) { console.error(e); }
    }
  };

  const handleMeetingDelete = async (id) => {
    if (await confirm({ title: 'Delete Meeting?', description: 'Confirm?', confirmText: 'Delete' })) {
      await api.delete(`/meetings/meeting/${id}`); setData(p => ({...p, meetings: p.meetings.filter(m => m._id !== id)})); refetch();
    }
  };

  const handleNoteDelete = async (id) => {
    if (await confirm({ title: 'Delete Note?', description: 'Confirm?', confirmText: 'Delete' })) {
      await api.delete(`/teamnotes/note/${id}`); setData(p => ({...p, teamNotes: p.teamNotes.filter(n => n._id !== id)})); refetch();
    }
  };

  const handleResourceDelete = async (type, id) => {
    if (await confirm({ title: 'Remove Resource?', description: 'Confirm?', confirmText: 'Remove' })) {
      const res = await api.delete(`/teams/${teamId}/${type}/${id}`);
      setData(prev => ({ ...prev, team: res.data }));
      refetch();
    }
  };

  const handleRemoveMember = async (name) => {
    if (await confirm({ title: `Remove ${name}?`, description: `This will remove ${name} and DELETE their tasks.`, confirmText: `Remove` })) {
      await api.put(`/teams/${teamId}/remove`, { name });
      refetch();
    }
  };

  const handleSendReport = async (name) => {
    if (await confirm({ title: 'Send Report?', description: `Generate report for ${name}?`, confirmText: 'Send', danger: false })) {
      try { const res = await api.post('/members/send-report', { memberName: name }); alert(res.data.message); } catch (e) { alert(e.response?.data?.message); }
    }
  };

  // --- Render Helpers ---

  if (loading) return <div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (error) return <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">{error}</div>;
  if (!team) return <div className="text-center py-12">Team not found. <Link to="/teams">Back</Link></div>;

  const tabs = [
    { id: 'tasks', name: 'Tasks', icon: ClipboardList, count: tasks.length },
    { id: 'meetings', name: 'Meetings', icon: Calendar, count: meetings.length },
    { id: 'members', name: 'Members', icon: Users, count: team.members.length },
    { id: 'notes', name: 'Team Notes', icon: FileText, count: teamNotes.length },
    { id: 'resources', name: 'Resources', icon: Link2, count: (team.figmaFiles?.length||0) + (team.githubRepos?.length||0) + (team.liveProjects?.length||0) },
    { id: 'activity', name: 'Activity', icon: Activity, count: activity.length }
  ].filter(tab => !permissions.isEmployee || tab.id !== 'activity');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <Link to="/teams" className="inline-flex items-center text-gray-600 hover:text-primary transition-colors"><ArrowLeft size={18} className="mr-2" />Back to all teams</Link>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center"><Users className="text-white" size={24} /></div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-primary">{team.teamName}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-600">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
                {team.owner._id === user._id && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Crown size={10} className="mr-1" />Owner</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {!permissions.isEmployee && (permissions.isOwner || user?.permissions?.canExportReports !== false) && (
              <button onClick={() => setActiveModal('report')} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"><FilePieChart size={18} /><span>Report</span></button>
            )}
            {permissions.canHire && (
              <button onClick={() => openModal('createEmployee', { teamId, onEmployeeCreated: refetch })} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors shadow-sm"><Briefcase size={18} /><span>Hire Employee</span></button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <nav className="flex space-x-4 px-4 overflow-x-auto items-center justify-center scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <Icon size={16} /><span>{tab.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium min-w-[24px] ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}>{tab.count}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          {activeTab === 'tasks' && <TasksView tasks={tasks} user={user} isEmployee={permissions.isEmployee} permissions={permissions} onEdit={(t) => openEdit('Task', t)} onDelete={handleTaskDelete} onCopy={() => setActiveModal('copyTasks')} onAdd={() => openModal('createTask')} />}
          {activeTab === 'meetings' && <MeetingsView meetings={meetings} permissions={permissions} onEdit={(m) => openEdit('Meeting', m)} onDelete={handleMeetingDelete} onAdd={() => openModal('createMeeting')} />}
          {activeTab === 'members' && <MembersView members={team.members} permissions={permissions} isEmployee={permissions.isEmployee} onRemove={handleRemoveMember} onReport={handleSendReport} />}
          {activeTab === 'notes' && <NotesView notes={teamNotes} permissions={permissions} onEdit={(n) => openEdit('Note', n)} onDelete={handleNoteDelete} onAdd={() => setActiveModal('addNote')} />}
          {activeTab === 'resources' && <ResourcesView team={team} permissions={permissions} actions={{ addFigma: () => setActiveModal('addFigma'), deleteFigma: (id) => handleResourceDelete('figma', id), addGithub: () => setActiveModal('addGithub'), deleteGithub: (id) => handleResourceDelete('github', id), addLive: () => setActiveModal('addLive'), deleteLive: (id) => handleResourceDelete('liveproject', id) }} />}
          {activeTab === 'activity' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between mb-4"><h2 className="text-lg font-bold">Activity Feed</h2><button onClick={() => setActiveModal('allActivity')} className="text-sm text-gray-500 hover:text-primary">View all</button></div>
              {activity.map(item => <TeamActivityEvent key={item._id} activity={item} />)}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals Orchestration */}
      <AddTeamNoteModal isOpen={activeModal === 'addNote'} onClose={closeModal} teamId={teamId} onNoteAdded={(n) => { setData(p => ({...p, teamNotes: [n, ...p.teamNotes]})); refetch(); closeModal(); }} />
      <AllActivityModal isOpen={activeModal === 'allActivity'} onClose={closeModal} teamId={teamId} teamName={team?.teamName} />
      <CopyTasksModal isOpen={activeModal === 'copyTasks'} onClose={closeModal} tasks={tasks} teamName={team?.teamName} />
      {team && activeModal === 'editTask' && <EditTaskModal isOpen={true} onClose={closeModal} taskToEdit={selectedItem} teamMembers={team.members} onTaskUpdated={(t) => { setData(p => ({...p, tasks: p.tasks.map(i => i._id === t._id ? t : i)})); refetch(); closeModal(); }} />}
      <AddFigmaModal isOpen={activeModal === 'addFigma'} onClose={closeModal} teamId={teamId} onFigmaLinkAdded={(t) => { setData(p => ({...p, team: t})); closeModal(); }} />
      <AddGithubModal isOpen={activeModal === 'addGithub'} onClose={closeModal} teamId={teamId} onGithubRepoAdded={(t) => { setData(p => ({...p, team: t})); refetch(); closeModal(); }} />
      <EditTeamNoteModal isOpen={activeModal === 'editNote'} onClose={closeModal} note={selectedItem} onNoteUpdated={(n) => { setData(p => ({...p, teamNotes: p.teamNotes.map(i => i._id === n._id ? n : i)})); refetch(); closeModal(); }} />
      {team && <GenerateReportModal isOpen={activeModal === 'report'} onClose={closeModal} teamId={team._id} teamName={team.teamName} />}
      <AddLiveProjectModal isOpen={activeModal === 'addLive'} onClose={closeModal} teamId={teamId} onLiveProjectAdded={(t) => { setData(p => ({...p, team: t})); refetch(); closeModal(); }} />
      {team && activeModal === 'editMeeting' && <EditMeetingModal isOpen={true} onClose={closeModal} meetingToEdit={selectedItem} teamMembers={team.members} onMeetingUpdated={(m) => { setData(p => ({...p, meetings: p.meetings.map(i => i._id === m._id ? m : i)})); refetch(); closeModal(); }} />}
    </div>
  );
};

export default TeamDetailPage;
