import React from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, Edit, Trash2, User, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useConfirm } from '../context/ConfirmContext';

const TaskItem = ({ task, onEdit, onDelete }) => {
  const { confirm } = useConfirm();
  const getStatusConfig = (status) => {
    const configs = {
      'Completed': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        bgColor: 'bg-green-50'
      },
      'In Progress': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Clock,
        bgColor: 'bg-blue-50'
      },
      'Pending': {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: AlertCircle,
        bgColor: 'bg-gray-50'
      },
    };
    return configs[status] || configs['Pending'];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Urgent': 'text-red-600 bg-red-50 border-red-200',
      'High': 'text-orange-600 bg-orange-50 border-orange-200',
      'Medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'Low': 'text-green-600 bg-green-50 border-green-200'
    };
    return colors[priority] || colors['Medium'];
  };

  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;

  const handleDeleteClick = async (e) => {
    e.stopPropagation();

    const confirmed = await confirm({
      title: 'Delete Task?',
      description: `Are you sure you want to delete the task "${task.title}"? This cannot be undone.`,
      confirmText: 'Delete Task',
      danger: true
    });

    if (confirmed && onDelete) {
      onDelete(task._id);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(task);
    }
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;

    const today = new Date();
    const due = new Date(dueDate);
    const isOverdue = due < today && task.status !== 'Completed';

    return {
      display: due.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      isOverdue,
      isToday: due.toDateString() === today.toDateString()
    };
  };

  const dueDateInfo = formatDueDate(task.dueDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header with Title and Actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-primary leading-tight break-words pr-2">
                {task.title}
              </h3>
            </div>

            {/* Actions - Always visible on desktop, visible on hover for mobile */}
            <div className="flex items-center gap-1 opacity-0 lg:opacity-100 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
              {onEdit && (
                <button
                  onClick={handleEditClick}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit task"
                >
                  <Edit size={16} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDeleteClick}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="max-w-full">
              <p className="text-sm text-gray-600 leading-relaxed break-words line-clamp-3">
                {task.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Assignee */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600 flex-shrink-0">
              <User size={14} className="text-gray-400 flex-shrink-0" />
              <span className="font-medium text-gray-700 truncate max-w-[120px]">
                {task.assignedTo}
              </span>
            </div>

            {/* Due Date */}
            {dueDateInfo && (
              <div className={`flex items-center gap-1.5 text-sm flex-shrink-0 ${
                dueDateInfo.isOverdue ? 'text-red-600' :
                dueDateInfo.isToday ? 'text-blue-600' : 'text-gray-600'
              }`}>
                <Calendar size={14} className={dueDateInfo.isOverdue ? 'text-red-500' : 'text-gray-400'} />
                <span className={dueDateInfo.isOverdue ? 'font-medium' : ''}>
                  {dueDateInfo.isToday ? 'Today' :
                   dueDateInfo.isOverdue ? 'Overdue' : dueDateInfo.display}
                </span>
              </div>
            )}

            {/* Priority */}
            {task.priority && task.priority !== 'Medium' && (
              <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border flex-shrink-0 ${getPriorityColor(task.priority)}`}>
                <Flag size={12} />
                <span className="font-medium">{task.priority}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status and Mobile Actions */}
        <div className="flex items-center justify-between lg:justify-end lg:flex-col lg:items-end gap-3 lg:gap-2">
          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border flex-shrink-0 ${statusConfig.color}`}>
            <StatusIcon size={14} />
            {task.status}
          </span>

          {/* Mobile Actions - Only visible on mobile */}
          <div className="flex items-center gap-1 lg:hidden flex-shrink-0">
            {onEdit && (
              <button
                onClick={handleEditClick}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit task"
              >
                <Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Indicator for In Progress tasks */}
      {task.status === 'In Progress' && (
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: '65%' }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default TaskItem;
