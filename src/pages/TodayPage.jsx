import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import {
  Clock,
  AlertTriangle,
  CalendarCheck,
  FileText,
  Plus,
  Sunrise,
  Send,
  Loader2,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../components/Input';
import { motion } from 'framer-motion';

// --- Sub-component for the Quick Add Note form ---
const QuickAddNote = ({ onNoteAdded }) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/notes', {
        title,
        content: '(Quick-add from Today page)',
        planPeriod: 'This Week',
        category: 'Personal',
      });
      onNoteAdded(res.data);
      setTitle('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add note');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Add to Weekly Plan
      </label>
      <div className="flex items-center space-x-2">
        <Input
          icon={<FileText size={18} className="text-gray-400" />}
          type="text"
          placeholder="New note..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoComplete="off"
          className="flex-1"
        />
        <button
          type="submit"
          disabled={loading}
          className="p-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </form>
  );
};

// --- Main Today Page Component ---
const TodayPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stats/action-items');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch action items');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNoteAdded = (newNote) => {
    setData(prevData => ({
      ...prevData,
      weeklyNotes: [newNote, ...prevData.weeklyNotes],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="text-gray-600">Loading your day...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load your day</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const { todayMeetings = [], actionTasks = { overdue: [], dueToday: [] }, weeklyNotes = [] } = data || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Main Column */}
      <div className="lg:col-span-2 space-y-6">

        {/* Today's Meetings */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="text-blue-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Today's Meetings</h2>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-medium">
              {todayMeetings.length}
            </span>
          </div>
          <div className="space-y-4">
            {todayMeetings.length > 0 ? (
              todayMeetings.map(meeting => (
                <Link to={`/team/${meeting.team._id}`} key={meeting._id} className="block p-4 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors group">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-gray-900 group-hover:text-blue-700">{meeting.title}</span>
                      <p className="text-sm text-gray-500">{meeting.team.teamName}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {new Date(meeting.meetingTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No meetings scheduled for today.</p>
            )}
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="text-red-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Action Items</h2>
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-medium">
              {actionTasks.overdue.length} Overdue
            </span>
            <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-sm font-medium">
              {actionTasks.dueToday.length} Due Today
            </span>
          </div>
          <div className="space-y-4">
            {actionTasks.overdue.length === 0 && actionTasks.dueToday.length === 0 ? (
              <p className="text-gray-500 text-sm">No pressing tasks. Well done!</p>
            ) : (
              <>
                {actionTasks.overdue.map(task => (
                  <Link to={`/team/${task.team}`} key={task._id} className="block p-3 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-red-800 group-hover:text-red-900">{task.title}</p>
                        <p className="text-sm text-red-600">Overdue - {task.assignedTo}</p>
                      </div>
                    </div>
                  </Link>
                ))}
                {actionTasks.dueToday.map(task => (
                  <Link to={`/team/${task.team}`} key={task._id} className="block p-3 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <CalendarCheck size={16} className="text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-amber-800 group-hover:text-amber-900">{task.title}</p>
                        <p className="text-sm text-amber-600">Due Today - {task.assignedTo}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Column */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sticky top-24">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="text-green-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">My Weekly Plan</h2>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
              {weeklyNotes.length}
            </span>
          </div>
          <QuickAddNote onNoteAdded={handleNoteAdded} />
          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
            {weeklyNotes.length > 0 ? (
              weeklyNotes.map(note => (
                <Link to="/notes" key={note._id} className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors group">
                  <p className="font-medium text-gray-800 group-hover:text-gray-900">{note.title}</p>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No notes for this week yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayPage;
