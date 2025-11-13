import React from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Trash2, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeamCard = ({ team, onDelete }) => {
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(team._id);
  };

  const isOwner = team.owner && team.owner._id === team.currentUser?._id;

  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{team.teamName}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <Users size={14} className="text-gray-400" />
            <span className="text-sm text-gray-500">
              {team.members.length} member{team.members.length !== 1 ? 's' : ''}
            </span>
            {isOwner && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Crown size={10} className="mr-1" />
                Owner
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 duration-200">
          <button
            onClick={handleDeleteClick}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Disband team"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Owner Info */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Owned by: <span className="font-medium text-gray-900">{team.owner.username}</span>
        </p>
      </div>

      {/* Action Link */}
      <Link
        to={`/team/${team._id}`}
        className="inline-flex items-center text-gray-700 font-medium hover:text-gray-900 transition-colors group/link"
      >
        <span>View Team</span>
        <ArrowRight size={16} className="ml-2 group-hover/link:translate-x-1 transition-transform duration-200" />
      </Link>
    </motion.div>
  );
};

export default TeamCard;
