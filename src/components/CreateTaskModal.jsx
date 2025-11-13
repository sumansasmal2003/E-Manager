import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { ClipboardList, User, Plus, Trash2, Calendar } from 'lucide-react'; // <-- ADDED CALENDAR
import CustomSelect from './CustomSelect';

const CreateTaskModal = ({ isOpen, onClose, teamId, members, onTasksCreated }) => {
  const [assignedTo, setAssignedTo] = useState('');
  // 1. Add dueDate to the initial task state
  const [tasks, setTasks] = useState([{ title: '', description: '', dueDate: '' }]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (members && members.length > 0 && isOpen) {
      setAssignedTo(members[0]);
    }
  }, [isOpen, members]);

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  // 2. Add dueDate to new rows
  const addTaskRow = () => {
    setTasks([...tasks, { title: '', description: '', dueDate: '' }]);
  };

  const removeTaskRow = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validTasks = tasks.filter(task => task.title.trim() !== '');

    if (validTasks.length === 0) {
      setError('Please add at least one task with a title.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post(`/tasks/${teamId}/bulk`, {
        assignedTo,
        // Send the full task objects
        tasks: validTasks,
      });

      try {
        onTasksCreated(res.data);
      } catch (clientError) {
        console.error("Error in onTasksCreated:", clientError);
        setError("Tasks created, but failed to update the UI. Please refresh.");
      }

      setLoading(false);
      onClose();

    } catch (err) {
      // This catch block now only handles API errors
      setError(err.response?.data?.message || 'Failed to create tasks');
      setLoading(false);
    }
  };

  // 3. Reset dueDate on close
  const handleClose = () => {
    setTasks([{ title: '', description: '', dueDate: '' }]);
    setError(null);
    onClose();
  };

  const memberOptions = members.map(name => ({ value: name, label: name }));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Tasks">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* ... (Header is unchanged) ... */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Add Tasks for a Member</h3>
          <p className="text-gray-600 text-sm mt-1">
            Assign one or more tasks to a single team member.
          </p>
        </div>

        {/* 1. Assignee Selector (unchanged) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User size={16} className="inline mr-1" />
            Assign All Tasks To
          </label>
          <CustomSelect
            icon={User}
            options={memberOptions}
            value={assignedTo}
            onChange={(value) => setAssignedTo(value)}
            placeholder="Select a member"
          />
        </div>

        {/* 2. Dynamic Task List */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Tasks</label>
          {tasks.map((task, index) => (
            <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-xl border">
              <span className="text-sm font-medium text-gray-600 mt-3">{index + 1}.</span>
              <div className="flex-1 space-y-2">

                <Input
                  icon={<ClipboardList size={18} className="text-gray-400" />}
                  type="text"
                  placeholder="Task Title"
                  value={task.title}
                  onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                  className="bg-white"
                />

                {/* --- 4. ADDED DUE DATE INPUT --- */}
                <Input
                  icon={<Calendar size={18} className="text-gray-400" />}
                  type="date"
                  placeholder="Due Date (Optional)"
                  value={task.dueDate}
                  onChange={(e) => handleTaskChange(index, 'dueDate', e.target.value)}
                  className="bg-white text-sm"
                />

                <textarea
                  placeholder="Task description (optional)"
                  value={task.description}
                  onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 resize-none text-sm"
                />
              </div>

              {tasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTaskRow(index)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg mt-2"
                  title="Remove task"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}

          {/* 3. Add Task Button (unchanged) */}
          <button
            type="button"
            onClick={addTaskRow}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200"
          >
            <Plus size={16} />
            <span>Add Another Task</span>
          </button>
        </div>

        {/* 4. Form Actions (unchanged) */}
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
            {loading ? 'Creating...' : `Create ${tasks.filter(t => t.title).length} Task(s)`}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
