import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit, Calendar } from 'lucide-react';

const NoteCard = ({ note, onDelete, onEdit }) => {
  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const getPlanPeriodColor = (period) => {
    const colors = {
      'General': 'bg-gray-100 text-gray-700',
      'This Week': 'bg-blue-100 text-blue-700',
      'This Month': 'bg-green-100 text-green-700',
      'This Year': 'bg-purple-100 text-purple-700',
    };
    return colors[period] || colors['General'];
  };

  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 space-y-4 group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="flex justify-between items-start space-x-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{note.title}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <Calendar size={12} className="text-gray-400" />
            <span className="text-xs text-gray-500">{formattedDate}</span>
          </div>
        </div>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(note._id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Plan Period Badge */}
      <div className="flex justify-between items-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanPeriodColor(note.planPeriod)}`}>
          {note.planPeriod}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
          {note.content}
        </p>
      </div>
    </motion.div>
  );
};

export default NoteCard;
