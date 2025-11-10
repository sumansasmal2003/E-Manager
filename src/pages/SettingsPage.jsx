import React, { useState } from 'react';
import { Settings, Shield, User } from 'lucide-react';
import IntegrationSettings from '../components/IntegrationSettings';
import AccountSettings from '../components/AccountSettings';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('integrations');

  const getTabClass = (tabName) => {
    return activeTab === tabName
      ? 'bg-gray-900 text-white'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* This page uses the layout from DashboardLayout.jsx */}
      {/* The header "My Settings" is already provided by DashboardLayout */}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('integrations')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${getTabClass('integrations')}`}
              >
                <Shield size={18} />
                <span>Integrations</span>
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${getTabClass('account')}`}
              >
                <User size={18} />
                <span>Account</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'integrations' && (
            <IntegrationSettings />
          )}
          {activeTab === 'account' && (
            <AccountSettings />
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
