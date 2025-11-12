// src/components/CopyTasksModal.jsx

import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import { motion } from 'framer-motion';
import { Calendar, Clipboard, Check } from 'lucide-react';

// This is the formatting logic, moved from TeamDetailPage.jsx
// It formats a given list of tasks for a specific title.
const formatTaskData = (tasksToFormat, title) => {
  const tasksByAssignee = tasksToFormat.reduce((acc, task) => {
    const assignee = task.assignedTo;
    if (!acc[assignee]) {
      acc[assignee] = [];
    }
    acc[assignee].push(task);
    return acc;
  }, {});

  let formattedText = `📋 ${title}\n\n`;

  if (tasksToFormat.length === 0) {
    formattedText += 'No tasks found for this date.';
    return formattedText;
  }

  Object.entries(tasksByAssignee).forEach(([assignee, assigneeTasks], index) => {
    formattedText += `👤 ${assignee}\n\n`;

    assigneeTasks.forEach((task, taskIndex) => {
      formattedText += `${taskIndex + 1}. ${task.title}`;
      if (task.description) {
        formattedText += `   ${task.description}\n`;
      }
      // Add space between tasks
      if (taskIndex < assigneeTasks.length - 1) {
        formattedText += '\n';
      }
    });

    if (index < Object.keys(tasksByAssignee).length - 1) {
      formattedText += '\n────────────────────────\n';
    }
  });

  return formattedText;
};

const CopyTasksModal = ({ isOpen, onClose, tasks, teamName }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const handleCopyClick = async (e) => {
    e.preventDefault();
    setError(null);
    setCopied(false);

    if (!selectedDate) {
      setError('Please select a date to copy tasks for.');
      return;
    }

    // Filter the tasks based on the selected date
    const filteredTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      // Get 'YYYY-MM-DD' from the ISO string to match the input
      const taskDueDate = task.dueDate.split('T')[0];
      return taskDueDate === selectedDate;
    });

    // Format the date for the title
    const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC', // Use UTC to match the date input
    });

    const title = `${teamName} - Tasks for ${formattedDate}`;
    const tasksText = formatTaskData(filteredTasks, title);

    try {
      await navigator.clipboard.writeText(tasksText);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        handleClose(); // Close modal on success
      }, 2000);
    } catch (err) {
      setError('Failed to copy tasks to clipboard.');
    }
  };

  const handleClose = () => {
    setSelectedDate('');
    setError(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Copy Tasks by Date">
      <form onSubmit={handleCopyClick} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          icon={<Calendar size={18} className="text-gray-400" />}
          type="date"
          placeholder="Select a date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          required
        />

        <motion.button
          type="submit"
          disabled={copied}
          className={`w-full flex items-center justify-center space-x-2 font-medium py-3 px-4 rounded-lg transition-all duration-200 ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2'
          }`}
          whileHover={{ scale: copied ? 1 : 1.02 }}
          whileTap={{ scale: copied ? 1 : 0.98 }}
        >
          {copied ? (
            <>
              <Check size={18} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Clipboard size={18} />
              <span>Copy Tasks</span>
            </>
          )}
        </motion.button>
      </form>
    </Modal>
  );
};

export default CopyTasksModal;
