import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { ClipboardList, User, Calendar, CheckCircle } from 'lucide-react';
import CustomSelect from './CustomSelect';

const statusOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
];

const EditTaskModal = ({ isOpen, onClose, taskToEdit, teamMembers, onTaskUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Pending',
    dueDate: '',
    assignedTo: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        status: taskToEdit.status || 'Pending',
        // Format date for the input
        dueDate: taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '',
        assignedTo: taskToEdit.assignedTo || '',
      });
    }
  }, [taskToEdit]);

  const { title, description, status, dueDate, assignedTo } = formData;

  const handleSelectChange = (name) => (value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // This handler is now just for text inputs
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/tasks/task/${taskToEdit._id}`, formData);
      onTaskUpdated(res.data); // Send updated task back to parent
      setLoading(false);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!taskToEdit) return null;

  const memberOptions = teamMembers.map(name => ({ value: name, label: name }));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Title */}
        <Input
          icon={<ClipboardList size={18} className="text-gray-400" />}
          type="text"
          placeholder="Task title"
          name="title"
          value={title}
          onChange={onChange}
          required
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            placeholder="Task description"
            name="description"
            value={description}
            onChange={onChange}
            rows={4}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CheckCircle size={16} className="inline mr-1" />
              Status
            </label>
            <CustomSelect
              icon={CheckCircle}
              options={statusOptions}
              value={formData.status}
              onChange={handleSelectChange('status')}
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Due Date
            </label>
            <Input
              type="date"
              name="dueDate"
              value={dueDate}
              onChange={onChange}
              className="w-full"
            />
          </div>
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User size={16} className="inline mr-1" />
            Assign To
          </label>
          <CustomSelect
            icon={User}
            options={memberOptions}
            value={formData.assignedTo}
            onChange={handleSelectChange('assignedTo')}
            placeholder="Select a member"
          />
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="flex-1 bg-gray-900 text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTaskModal;
