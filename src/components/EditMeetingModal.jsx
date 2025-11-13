import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { Calendar, Video, Users, Clock, Zap } from 'lucide-react';
import CustomMultiSelect from './CustomMultiSelect';

// Helper to format ISO date string for datetime-local input
const formatDateTimeForInput = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate); // This correctly parses the UTC string into the user's local time

  // Manually build the string in 'YYYY-MM-DDTHH:mm' format
  // This uses the user's local date and time components, not UTC
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  // This is the format required by <input type="datetime-local" />
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const EditMeetingModal = ({ isOpen, onClose, meetingToEdit, teamMembers, onMeetingUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    agenda: '',
    meetingTime: '',
    meetingLink: '',
  });
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zoomLoading, setZoomLoading] = useState(false);

  // Populate form when meetingToEdit changes
  useEffect(() => {
    if (meetingToEdit) {
      setFormData({
        title: meetingToEdit.title || '',
        agenda: meetingToEdit.agenda || '',
        meetingTime: formatDateTimeForInput(meetingToEdit.meetingTime),
        meetingLink: meetingToEdit.meetingLink || '',
      });
      setParticipants(meetingToEdit.participants || []);
    }
  }, [meetingToEdit]);

  const { title, agenda, meetingTime, meetingLink } = formData;
  const isZoomDisabled = !title || !meetingTime || zoomLoading;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalParticipants = participants.length === 0 ? teamMembers : participants;

    try {
      const res = await api.put(`/meetings/meeting/${meetingToEdit._id}`, {
        ...formData,
        participants: finalParticipants,
      });

      onMeetingUpdated(res.data);
      setLoading(false);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update meeting');
      setLoading(false);
    }
  };

  const handleGenerateZoom = async () => {
    if (isZoomDisabled) return;
    setZoomLoading(true);
    setError(null);
    try {
      const res = await api.post('/meetings/generate-zoom', { title, meetingTime });
      setFormData({ ...formData, meetingLink: res.data.join_url });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate Zoom link');
    }
    setZoomLoading(false);
  };

  const handleParticipantChange = (selectedValues) => {
    setParticipants(selectedValues);
  };

  const memberOptions = teamMembers.map(name => ({ value: name, label: name }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Meeting">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          icon={<Calendar size={18} className="text-gray-400" />}
          type="text"
          placeholder="Meeting title"
          name="title"
          value={title}
          onChange={onChange}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Agenda</label>
          <textarea
            placeholder="Describe the meeting agenda..."
            name="agenda"
            value={agenda}
            onChange={onChange}
            rows={4}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Time</label>
            <Input
              type="datetime-local"
              name="meetingTime"
              value={meetingTime}
              onChange={onChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Participants</label>
            <CustomMultiSelect
              icon={Users}
              options={memberOptions}
              value={participants}
              onChange={handleParticipantChange}
              placeholder="Select participants"
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
              name="meetingLink"
              placeholder="Click 'Generate Zoom' or paste a link"
              value={meetingLink}
              onChange={onChange}
              required
            />
            <div title={isZoomDisabled ? 'Please enter a title and meeting time' : 'Generate Zoom Link'}>
              <motion.button
                type="button"
                onClick={handleGenerateZoom}
                disabled={isZoomDisabled}
                className="px-4 py-3 bg-gray-900 text-white rounded-lg flex items-center space-x-2"
              >
                {zoomLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Zap size={16} />}
              </motion.button>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg">
            Cancel
          </button>
          <motion.button type="submit" disabled={loading} className="flex-1 bg-gray-900 text-white font-medium py-3 px-4 rounded-lg">
            {loading ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default EditMeetingModal;
