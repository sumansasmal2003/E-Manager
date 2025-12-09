import React from 'react';
import {
  Plus, Trash2, Edit, ClipboardList, Calendar, User,
  FileText, Link2, Github, UserMinus
} from 'lucide-react';
import { format } from 'date-fns';

// Helper to get an icon based on the action type
const getActivityIcon = (actionType) => {
  switch (actionType) {
    case 'TASK_CREATED':
      return <ClipboardList className="text-blue-500" size={16} />;
    case 'TASK_UPDATED':
      return <Edit className="text-yellow-500" size={16} />;
    case 'TASK_DELETED':
      return <Trash2 className="text-red-500" size={16} />;
    case 'MEMBER_ADDED':
      return <User className="text-green-500" size={16} />;
    case 'MEMBER_REMOVED':
      return <UserMinus className="text-red-500" size={16} />;
    case 'MEETING_SCHEDULED':
      return <Calendar className="text-purple-500" size={16} />;
    case 'NOTE_CREATED':
      return <FileText className="text-green-500" size={16} />;
    case 'NOTE_DELETED':
      return <Trash2 className="text-red-500" size={16} />;
    case 'FIGMA_LINK_ADDED':
    case 'GITHUB_REPO_ADDED':
      return <Link2 className="text-gray-500" size={16} />;
    case 'FIGMA_LINK_DELETED':
    case 'GITHUB_REPO_DELETED':
      return <Trash2 className="text-red-500" size={16} />;
    default:
      return <Plus className="text-gray-500" size={16} />;
  }
};

// Simple time-ago function
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
};

const TeamActivityEvent = ({ activity }) => {
  const activityTime = new Date(activity.createdAt);

  return (
    <div className="flex items-start space-x-3 py-3">
      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        {getActivityIcon(activity.actionType)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 leading-snug">
          <span className="font-medium text-primary">{activity.user?.username || 'User'}</span>
          {' '}{activity.details}
        </p>
        <span
          className="text-xs text-gray-500"
          title={format(activityTime, 'MMMM dd, yyyy \'at\' h:mm a')}
        >
          {timeAgo(activityTime)}
        </span>
      </div>
    </div>
  );
};

export default TeamActivityEvent;
