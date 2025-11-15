import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig';
// --- 1. IMPORT ZAP (for AI) and LOADER ---
import { ClipboardList, User, Plus, Trash2, Calendar, Zap, Loader2, ArrowDown } from 'lucide-react';
import CustomSelect from './CustomSelect';

const CreateTaskModal = ({ isOpen, onClose, teamId, members, onTasksCreated }) => {
  const [assignedTo, setAssignedTo] = useState('');
  const [tasks, setTasks] = useState([{ title: '', description: '', dueDate: '' }]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- 2. ADD STATE FOR AI FEATURE ---
  const [complexTask, setComplexTask] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  // --- END AI STATE ---

  useEffect(() => {
    if (members && members.length > 0 && isOpen) {
      setAssignedTo(members[0]);
    } else if (isOpen) {
      setAssignedTo('');
    }
  }, [isOpen, members]);

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  const addTaskRow = () => {
    setTasks([...tasks, { title: '', description: '', dueDate: '' }]);
  };

  const removeTaskRow = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  // --- 3. ADD AI GENERATION HANDLER ---
  const handleAIGenerate = async () => {
    if (!complexTask.trim()) {
      setAiError('Please enter a complex task to break down.');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setError(null);
    try {
      const res = await api.post('/tasks/generate-subtasks', {
        taskTitle: complexTask
      });

      // res.data is the array: [{ title: '...', description: '...' }]
      if (res.data && res.data.length > 0) {
        // Format the AI response to match our state structure
        const newTasks = res.data.map(task => ({
          title: task.title,
          description: task.description,
          dueDate: '' // Default due date
        }));
        setTasks(newTasks); // Overwrite the task list
      } else {
        // If AI returns empty, just add the complex task itself
        setTasks([{ title: complexTask, description: '', dueDate: '' }]);
      }
    } catch (err) {
      setAiError(err.response?.data?.message || 'Failed to generate sub-tasks');
      // If AI fails, just add the complex task as a single item
      setTasks([{ title: complexTask, description: '', dueDate: '' }]);
    }
    setAiLoading(false);
  };
  // --- END AI HANDLER ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!teamId || !assignedTo) {
      setError('Could not find a team or member. Please open this from a Team page.');
      setLoading(false);
      return;
    }

    const validTasks = tasks.filter(task => task.title.trim() !== '');

    if (validTasks.length === 0) {
      setError('Please add at least one task with a title.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post(`/tasks/${teamId}/bulk`, {
        assignedTo,
        tasks: validTasks,
      });

      if (onTasksCreated) {
        onTasksCreated(res.data);
      }

      setLoading(false);
      onClose();

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tasks');
      setLoading(false);
    }
  };

  // --- 4. UPDATE handleClose ---
  const handleClose = () => {
    setTasks([{ title: '', description: '', dueDate: '' }]);
    setError(null);
    // Reset AI state
    setComplexTask('');
    setAiError(null);
    setAiLoading(false);
    onClose();
  };

  const memberOptions = (members || []).map(name => ({ value: name, label: name }));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Tasks">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* --- 5. ADD AI INPUT SECTION --- */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <label className="block text-sm font-medium text-gray-700">
            Breakdown Task with AI (Optional)
          </label>
          <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="w-full flex-1">
              <Input
                icon={<Zap size={18} className="text-gray-400" />}
                type="text"
                placeholder="e.g., Build new landing page"
                value={complexTask}
                onChange={(e) => setComplexTask(e.target.value)}
                className="bg-white"
                disabled={aiLoading}
              />
            </div>
            <motion.button
              type="button"
              onClick={handleAIGenerate}
              disabled={aiLoading}
              className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center space-x-2 bg-gray-900 text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50"
              whileHover={{ scale: aiLoading ? 1 : 1.05 }}
              whileTap={{ scale: aiLoading ? 1 : 0.95 }}
            >
              {aiLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Zap size={18} />
              )}
              <span>{aiLoading ? 'Generating...' : 'Generate'}</span>
            </motion.button>
          </div>
          <AnimatePresence>
            {aiError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-600 pt-1"
              >
                {aiError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center text-gray-400">
          <ArrowDown size={16} />
        </div>
        {/* --- END AI INPUT SECTION --- */}


        {/* --- 6. MODIFY EXISTING TASK FORM --- */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User size={16} className="inline mr-1" />
            Assign All Tasks To
          </label>
          <CustomSelect
            icon={User}
            options={memberOptions}
            value={assignedTo}
            onChange={(value) => setAssignedTo(value)}
            placeholder={!members ? "Open from a team page" : "Select a member"}
            disabled={!members || members.length === 0}
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Tasks to be Created
          </label>

          <AnimatePresence>
            {tasks.map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-start space-x-2 p-3 bg-gray-50 rounded-xl border"
              >
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

                <button
                  type="button"
                  onClick={() => removeTaskRow(index)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg mt-2"
                  title="Remove task"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <button
            type="button"
            onClick={addTaskRow}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200"
          >
            <Plus size={16} />
            <span>Add Another Task Manually</span>
          </button>
        </div>

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
            disabled={loading || !members}
            className="flex-1 bg-gray-900 text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : `Create ${tasks.filter(t => t.title).length} Task(s)`}
          </motion.button>
        </div>
        {/* --- END OF MODIFICATIONS --- */}
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
