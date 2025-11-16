import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, Calendar, Building, Globe, MapPin, Briefcase, Edit,
  Loader2 // <-- 1. Import the Loader icon
} from 'lucide-react';
import { format } from 'date-fns';

// A small helper component to keep the UI clean
const InfoItem = ({ icon, label, value, isLink = false }) => {
  const Icon = icon;
  const content = (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
        <Icon size={18} className="text-gray-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900 truncate">
          {value || <span className="text-gray-400 italic">Not set</span>}
        </p>
      </div>
    </div>
  );

  if (isLink && value) {
    // Make sure the link has a protocol
    const href = value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-50 p-3 rounded-lg">
        {content}
      </a>
    );
  }

  return <div className="p-3">{content}</div>;
};

const ProfilePage = () => {
  // 2. Get the 'loading' state from the AuthContext
  const {
    user,
    loading, // <-- Get the loading state
    companyName,
    companyAddress,
    companyWebsite,
    ceoName,
    hrName,
    hrEmail
  } = useAuth();

  // 3. Add a check for the loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="animate-spin text-gray-900 mb-4 mx-auto" size={32} />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }
  // --- End of new code ---

  // Safely format the date, providing a fallback if it's null/undefined
  const joinedOn = user.createdAt
    ? format(new Date(user.createdAt), 'MMMM dd, yyyy')
    : null; // Will show "Not set" in the InfoItem

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* --- Main Profile Header --- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white text-3xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{user.username}</h1>
              <p className="text-gray-600 truncate">{user.email}</p>
            </div>
          </div>
          <Link
            to="/settings"
            className="flex-shrink-0 flex items-center justify-center space-x-2 bg-gray-900 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 transition-all duration-200 w-full sm:w-auto"
          >
            <Edit size={18} />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- Personal & Contact Card --- */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
          <div className="space-y-4">
            <InfoItem
              icon={User}
              label="Username"
              value={user.username}
            />
            <InfoItem
              icon={Mail}
              label="Email Address"
              value={user.email}
            />
            <InfoItem
              icon={Calendar}
              label="Joined On"
              value={joinedOn}
            />
          </div>
        </div>

        {/* --- Company & Contacts Card --- */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              icon={Building}
              label="Company Name"
              value={companyName}
            />
            <InfoItem
              icon={Globe}
              label="Company Website"
              value={companyWebsite}
              isLink={true}
            />
            <InfoItem
              icon={MapPin}
              label="Company Address"
              value={companyAddress}
            />
            <InfoItem
              icon={Briefcase}
              label="CEO"
              value={ceoName}
            />
            <InfoItem
              icon={User}
              label="HR Contact"
              value={hrName}
            />
            <InfoItem
              icon={Mail}
              label="HR Email"
              value={hrEmail}
              isLink={hrEmail && `mailto:${hrEmail}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
