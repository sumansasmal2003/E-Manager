import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { Calendar, Video, Users, Clock, Zap } from 'lucide-react';
import CustomMultiSelect from './CustomMultiSelect';

const CreateMeetingModal = ({ isOpen, onClose, teamId, members, onMeetingCreated }) => {
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zoomLoading, setZoomLoading] = useState(false);

  const isZoomDisabled = !title || !meetingTime || zoomLoading;

  const handleParticipantChange = (selectedValues) => {
    setParticipants(selectedValues);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!teamId) {
      setError('Could not find a team. Please open this from a Team page.');
      setLoading(false);
      return;
    }

    const finalParticipants = participants.length === 0 ? members : participants;

    const localDate = new Date(meetingTime);
    const meetingTimeISO = localDate.toISOString();

    try {
      const res = await api.post(`/meetings/${teamId}`, {
        title,
        agenda,
        meetingTime: meetingTimeISO,
        meetingLink,
        participants: finalParticipants,
      });

      if (onMeetingCreated) {
        onMeetingCreated(res.data);
      }

      setLoading(false);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule meeting');
      setLoading(false);
    }
  };

  const handleGenerateZoom = async () => {
    if (!title || !meetingTime) {
      setError('Please set a title and meeting time first.');
      return;
    }

    setZoomLoading(true);
    setError(null);
    try {
      const localDate = new Date(meetingTime);
      const meetingTimeISO = localDate.toISOString();
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const res = await api.post('/meetings/generate-zoom', {
        title: title,
        meetingTime: meetingTimeISO,
        timeZone: userTimezone
      });

      setMeetingLink(res.data.join_url);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate Zoom link');
    }
    setZoomLoading(false);
  };

  const handleClose = () => {
    setTitle('');
    setAgenda('');
    setMeetingTime('');
    setMeetingLink('');
    setParticipants([]);
    setError(null);
    setLoading(false);
    setZoomLoading(false);
    onClose();
  };

  // --- THIS IS THE FIX ---
  // If `members` is undefined, use an empty array as a fallback.
  const memberOptions = (members || []).map(name => ({ value: name, label: name }));
  // --- END OF FIX ---

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Schedule New Meeting">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Video className="text-gray-400" size={24} />
          </div>
          <p className="text-gray-600 text-sm">
            Schedule a new meeting for your team
          </p>
        </div>

        <Input
          icon={<Calendar size={18} className="text-gray-400" />}
          type="text"
          placeholder="Meeting title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoComplete="off"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agenda
          </label>
          <textarea
            placeholder="Describe the meeting agenda..."
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-primary placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock size={16} className="inline mr-1" />
              Meeting Time
            </label>
            <Input
              type="datetime-local"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users size={16} className="inline mr-1" />
              Participants
            </label>
            <CustomMultiSelect
              icon={Users}
              options={memberOptions}
              value={participants}
              onChange={handleParticipantChange}
              placeholder={!members ? "Open from a team page" : "Select participants"}
              disabled={!members || members.length === 0}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to invite all members.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Meeting Link</label>
          <div className="flex items-center space-x-2">
            <Input
              icon={<Video size={18} className="text-gray-400" />}
              type="text"
              placeholder="Click 'Generate Zoom' or paste a link"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              required
              autoComplete="off"
              className="flex-1"
            />
            <div title={isZoomDisabled ? 'Please enter a title and meeting time first' : 'Generate Zoom Link'}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleGenerateZoom}
                disabled={isZoomDisabled}
                className="px-4 py-3 bg-primary text-white rounded-lg flex items-center space-x-2 hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {zoomLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Zap size={16} />
                )}
                <span>Zoom</span>
              </motion.button>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading || !members}
            className="flex-1 bg-primary text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Scheduling...</span>
              </div>
            ) : (
              'Schedule Meeting'
            )}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateMeetingModal;
