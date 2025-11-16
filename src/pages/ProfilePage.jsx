import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, Calendar, Building, Globe, MapPin, Briefcase, Edit,
  Loader2, Shield, Users, Phone
} from 'lucide-react';
import { format } from 'date-fns';

// Enhanced InfoItem component with better styling
const InfoItem = ({ icon, label, value, isLink = false }) => {
  const Icon = icon;
  const content = (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
        <Icon size={18} className="text-gray-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-sm font-normal text-gray-900">
          {value || <span className="text-gray-400">Not provided</span>}
        </p>
      </div>
    </div>
  );

  if (isLink && value) {
    const href = value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-50 p-3 rounded-lg transition-colors">
        {content}
      </a>
    );
  }

  return <div className="p-3">{content}</div>;
};

const ProfilePage = () => {
  const {
    user,
    loading,
    companyName,
    companyAddress,
    companyWebsite,
    ceoName,
    hrName,
    hrEmail
  } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="animate-spin text-gray-600 mb-4 mx-auto" size={32} />
          <p className="text-gray-500 text-sm">Loading profile information</p>
        </div>
      </div>
    );
  }

  const joinedOn = user.createdAt
    ? format(new Date(user.createdAt), 'MMMM dd, yyyy')
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your personal and company information</p>
        </div>
        <Link
          to="/settings"
          className="flex items-center space-x-2 bg-gray-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          <Edit size={16} />
          <span>Edit Profile</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{user.username}</h2>
              <p className="text-gray-600 text-sm">{user.email}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Member since</span>
                <span className="text-sm font-medium text-gray-900">{joinedOn}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Status</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                  <Shield size={12} className="mr-1" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">Role</span>
                <span className="text-sm font-medium text-gray-900">Team Leader</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/settings"
                className="flex items-center space-x-3 p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <User size={16} />
                <span>Update Profile</span>
              </Link>
              <Link
                to="/teams"
                className="flex items-center space-x-3 p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Users size={16} />
                <span>Manage Teams</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Building size={20} className="text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                icon={Building}
                label="Company Name"
                value={companyName}
              />
              <InfoItem
                icon={Globe}
                label="Website"
                value={companyWebsite}
                isLink={true}
              />
              <InfoItem
                icon={MapPin}
                label="Address"
                value={companyAddress}
              />
              <InfoItem
                icon={Briefcase}
                label="CEO"
                value={ceoName}
              />
            </div>
          </div>

          {/* HR Contacts */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Users size={20} className="text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">HR Contacts</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                icon={User}
                label="HR Manager"
                value={hrName}
              />
              <InfoItem
                icon={Mail}
                label="HR Email"
                value={hrEmail}
                isLink={hrEmail && `mailto:${hrEmail}`}
              />
              <InfoItem
                icon={Phone}
                label="HR Phone"
                value={"+1 (555) 123-4567"}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
