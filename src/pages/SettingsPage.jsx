import React, { useState } from 'react';
import { Settings, Shield, User, Link2, Cat } from 'lucide-react';
import IntegrationSettings from '../components/IntegrationSettings';
import AccountSettings from '../components/AccountSettings';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('integrations');

  const tabs = [
    {
      id: 'integrations',
      name: 'Integrations',
      icon: Shield,
      component: IntegrationSettings,
      description: 'Connect third-party services'
    },
    {
      id: 'account',
      name: 'Account',
      icon: User,
      component: AccountSettings,
      description: 'Manage your profile and security'
    }
  ];

  const activeTabConfig = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabConfig?.component;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
            <Settings className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account preferences and integrations</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 sticky top-24">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} />
                    <div className="text-left flex-1">
                      <div className="font-medium">{tab.name}</div>
                      <div className={`text-xs ${isActive ? 'text-gray-200' : 'text-gray-500'}`}>
                        {tab.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 min-h-[600px]">
            <div className="p-1">
              {ActiveComponent && <ActiveComponent />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
