import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit, User, Calendar } from 'lucide-react';

const TeamNoteCard = ({ note, onEdit, onDelete }) => {
  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

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
          <h3 className="text-lg font-semibold text-primary truncate">{note.title}</h3>
          <div className="flex items-center space-x-4 mt-1">
            <div className="flex items-center space-x-2">
              <User size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">
                by {note.createdBy?.username || 'Owner'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">{formattedDate}</span>
            </div>
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

      {/* Content */}
      <div className="space-y-2">
        <div
          className="prose prose-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      </div>
    </motion.div>
  );
};

export default TeamNoteCard;
