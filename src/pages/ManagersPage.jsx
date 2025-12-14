import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import {
  Users, Plus, Search, Trash2, Mail, Calendar, Briefcase,
  Loader2, AlertCircle, ShieldCheck, Shield, Lock, Unlock
} from 'lucide-react';
import { format } from 'date-fns';
import Input from '../components/Input';
import CreateManagerModal from '../components/CreateManagerModal';
import PermissionsModal from '../components/PermissionsModal';
import { useConfirm } from '../context/ConfirmContext';

const ManagersPage = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- NEW STATES for Permissions ---
  const [selectedManager, setSelectedManager] = useState(null);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  // ----------------------------------

  const { confirm } = useConfirm();

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/user/managers');

      // FIX: Filter the response to ONLY include users with role 'manager'
      // This removes employees from the list
      const onlyManagers = res.data.filter(user => user.role === 'manager');

      setManagers(onlyManagers);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch managers');
    }
    setLoading(false);
  };

  const handleToggleStatus = async (manager) => {
    const action = manager.isActive ? 'Suspend' : 'Activate';
    const confirmed = await confirm({
      title: `${action} Manager?`,
      description: manager.isActive
        ? `Are you sure you want to suspend ${manager.username}? They will no longer be able to log in.`
        : `Are you sure you want to activate ${manager.username}? They will regain access to their dashboard.`,
      confirmText: `Yes, ${action}`,
      danger: manager.isActive
    });

    if (confirmed) {
      try {
        await api.put(`/user/managers/${manager._id}/suspend`);

        setManagers(managers.map(m =>
          m._id === manager._id ? { ...m, isActive: !m.isActive } : m
        ));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update status');
      }
    }
  };

  const handleManagerCreated = (newManager) => {
    setManagers([newManager, ...managers]);
  };

  const handleDelete = async (managerId, username) => {
    const confirmed = await confirm({
      title: `Remove Manager ${username}?`,
      description: `WARNING: This will delete the manager's account AND ALL teams, tasks, and data they have created.`,
      confirmText: 'Yes, Delete Everything',
      danger: true
    });

    if (confirmed) {
      try {
        await api.delete(`/user/managers/${managerId}`);
        setManagers(managers.filter(m => m._id !== managerId));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete manager');
      }
    }
  };

  const handleOpenPermissions = (manager) => {
    setSelectedManager(manager);
    setIsPermModalOpen(true);
  };

  const filteredManagers = managers.filter(m =>
    m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
        <AlertCircle size={24} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CreateManagerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onManagerCreated={handleManagerCreated}
      />

      <PermissionsModal
        isOpen={isPermModalOpen}
        onClose={() => {
          setIsPermModalOpen(false);
          fetchManagers();
        }}
        manager={selectedManager}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <Briefcase className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">My Managers</h1>
            <p className="text-gray-600 mt-1">
              {managers.length} active manager{managers.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus size={20} />
          <span className="font-semibold">Hire Manager</span>
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          icon={<Search size={18} className="text-gray-400" />}
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid */}
      {filteredManagers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredManagers.map((manager) => (
            <div key={manager._id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-700">
                    {manager.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary text-lg">{manager.username}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      <ShieldCheck size={10} className="mr-1" />
                      Manager
                    </span>
                  </div>
                </div>

                <div className="flex space-x-1">
                  <button
                    onClick={() => handleToggleStatus(manager)}
                    className={`p-2 rounded-lg transition-colors ${
                      manager.isActive
                        ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={manager.isActive ? "Suspend Account" : "Activate Account"}
                  >
                    {manager.isActive ? <Lock size={18} /> : <Unlock size={18} />}
                  </button>

                  <button
                    onClick={() => handleOpenPermissions(manager)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Manage Permissions"
                  >
                    <Shield size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(manager._id, manager.username)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Manager"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={16} className="mr-3 text-gray-400" />
                  {manager.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={16} className="mr-3 text-gray-400" />
                  Joined {manager.createdAt ? format(new Date(manager.createdAt), 'MMM dd, yyyy') : 'Just now'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Briefcase className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-primary mb-2">No managers found</h3>
          <p className="text-gray-600">
            {searchTerm ? "Try adjusting your search terms." : "Start by hiring your first manager."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ManagersPage;
