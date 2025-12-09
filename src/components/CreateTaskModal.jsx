import React, { useState, useEffect, useCallback } from 'react';
import { useModal } from '../context/ModalContext';
import Modal from './Modal';
import { Plus, Loader2, Info, X, Zap, Sparkles, Brain, User } from 'lucide-react';
import api from '../api/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from './CustomSelect';

// --- FIX 1: Accept props to get the callback ---
const CreateTaskModal = ({ onTasksCreated }) => {
  const { modalState, closeModal, modalContext } = useModal();
  const { teamId } = modalContext;

  const [tasks, setTasks] = useState([{ title: '', description: '', dueDate: null }]);
  const [assignedTo, setAssignedTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [teamMembers, setTeamMembers] = useState([]);
  const [isFetchingMembers, setIsFetchingMembers] = useState(false);

  const [isEstimating, setIsEstimating] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [subtaskLoading, setSubtaskLoading] = useState(false);
  const [complexTaskTitle, setComplexTaskTitle] = useState('');

  useEffect(() => {
    if (modalState.createTask && teamId) {
      const fetchTeamMembers = async () => {
        setIsFetchingMembers(true);
        setError(null);
        try {
          const res = await api.get(`/teams/${teamId}`);
          setTeamMembers(res.data.members || []);
        } catch (err) {
          console.error("Failed to fetch team members", err);
          setError("Failed to load team members.");
        }
        setIsFetchingMembers(false);
      };
      fetchTeamMembers();
    }
  }, [modalState.createTask, teamId]);

  const resetForm = useCallback(() => {
    setTasks([{ title: '', description: '', dueDate: null }]);
    setAssignedTo('');
    setLoading(false);
    setError(null);
    setEstimate(null);
    setIsEstimating(false);
    setComplexTaskTitle('');
    setSubtaskLoading(false);
    setTeamMembers([]);
    setIsFetchingMembers(false);
  }, []);

  const handleClose = () => {
    closeModal('createTask');
    setTimeout(resetForm, 300);
  };

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
    if (field === 'title' && index === 0) {
      setEstimate(null);
    }
  };

  const addTaskRow = () => {
    setTasks([...tasks, { title: '', description: '', dueDate: null }]);
  };
  const removeTaskRow = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const handleGetEstimate = async () => {
    const title = tasks[0]?.title;
    if (!title) {
      setError('Please enter a task title first.');
      return;
    }
    setIsEstimating(true);
    setEstimate(null);
    setError(null);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await api.post('/tasks/estimate', {
        title,
        teamId,
        timezone,
      });
      setEstimate(res.data);
    } catch (err) {
      setEstimate({ reasoning: "Sorry, I couldn't generate an estimate." });
    }
    setIsEstimating(false);
  };

  const handleGenerateSubtasks = async () => {
    if (!complexTaskTitle) {
      setError('Please enter a complex task title first.');
      return;
    }
    setSubtaskLoading(true);
    setError(null);
    try {
      const res = await api.post('/tasks/generate-subtasks', {
        taskTitle: complexTaskTitle,
      });
      setTasks([
        { title: complexTaskTitle, description: 'Main objective', dueDate: null },
        ...res.data.map(subtask => ({
          title: subtask.title,
          description: subtask.description,
          dueDate: null,
        }))
      ]);
      setComplexTaskTitle('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate sub-tasks.');
    }
    setSubtaskLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const tasksToSubmit = tasks
      .filter(task => task.title.trim() !== '')
      .map(task => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      }));

    if (!assignedTo || tasksToSubmit.length === 0) {
      setError('Please assign the tasks and add at least one task title.');
      setLoading(false);
      return;
    }

    try {
      // 1. Capture the response
      const res = await api.post(`/tasks/${teamId}/bulk`, {
        assignedTo,
        tasks: tasksToSubmit,
      });

      // --- FIX 2: Update the parent state immediately ---
      if (onTasksCreated) {
        onTasksCreated(res.data);
      }

      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tasks');
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={modalState.createTask} onClose={handleClose} title="Create New Task(s)">
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Have a complex task?
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={complexTaskTitle}
              onChange={(e) => setComplexTaskTitle(e.target.value)}
              placeholder="e.g., 'Launch new marketing campaign'"
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg"
            />
            <button
              type="button"
              onClick={handleGenerateSubtasks}
              disabled={subtaskLoading}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {subtaskLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              <span className="text-sm font-medium">Break Down</span>
            </button>
          </div>
        </div>

        <div className="h-px bg-gray-200"></div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign To
          </label>
          <CustomSelect
            icon={User}
            options={teamMembers}
            value={assignedTo}
            onChange={setAssignedTo}
            placeholder={isFetchingMembers ? "Loading members..." : "Select a team member"}
            disabled={isFetchingMembers || teamMembers.length === 0}
          />
          {!isFetchingMembers && teamMembers.length === 0 && !error && (
             <p className="text-xs text-gray-500 mt-1">No members found in this team.</p>
          )}
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Tasks (add multiple rows)
          </label>
          {tasks.map((task, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="p-4 border border-gray-200 rounded-lg space-y-3 relative bg-white"
            >
              {tasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTaskRow(index)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                >
                  <X size={16} />
                </button>
              )}

              <input
                type="text"
                placeholder="Task Title"
                value={task.title}
                onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg"
                required
              />

              <textarea
                placeholder="Description (optional)"
                value={task.description}
                onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              />

              {index === 0 && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={task.dueDate || ''}
                        onChange={(e) => handleTaskChange(index, 'dueDate', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleGetEstimate}
                      disabled={isEstimating || !tasks[0]?.title.trim()}
                      className="flex-shrink-0 flex items-center justify-center space-x-2 w-full sm:w-auto px-3 py-2 mt-2 sm:mt-0 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                    >
                      {isEstimating ? <Loader2 className="animate-spin" size={16} /> : <Brain size={16} />}
                      <span>{isEstimating ? 'Estimating...' : 'Get AI Estimate'}</span>
                    </button>
                  </div>

                  <AnimatePresence>
                    {estimate && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: '12px' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg"
                      >
                        <div className="flex items-start space-x-2.5">
                          <Brain size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-indigo-800">
                              {estimate.reasoning}
                            </p>
                            {estimate.suggestedDate && (
                              <button
                                type="button"
                                onClick={() => handleTaskChange(0, 'dueDate', estimate.suggestedDate)}
                                className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                              >
                                Apply Suggested Date: {estimate.suggestedDate}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <button
          type="button"
          onClick={addTaskRow}
          className="w-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg py-2"
        >
          + Add Another Task
        </button>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || isFetchingMembers}
            className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            <span>Create Task(s)</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
