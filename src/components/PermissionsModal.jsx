import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../api/axiosConfig';
import { Loader2, Shield } from 'lucide-react';

const PermissionToggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
    <div className="pr-4">
      <h4 className="text-sm font-semibold text-primary">{label}</h4>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-primary' : 'bg-gray-200'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

const PermissionsModal = ({ isOpen, onClose, manager }) => {
  const [permissions, setPermissions] = useState({
    canCreateTasks: true,
    canCreateMeetings: true,
    canCreateNotes: true,
    canDeleteTasks: true,
    canDeleteMeetings: true,
    canDeleteNotes: true,
    canExportReports: false,
    canCreateResources: true,
    canDeleteResources: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (manager && manager.permissions) {
      // Merge defaults with actual permissions
      setPermissions(prev => ({ ...prev, ...manager.permissions }));
    }
  }, [manager]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put(`/user/managers/${manager._id}/permissions`, { permissions });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Permissions: ${manager?.username}`}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3">
          <Shield className="text-blue-600 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-blue-700">
            Control exactly what <strong>{manager?.username}</strong> can do.
          </p>
        </div>

        <div className="space-y-6">
          {/* CREATION Group */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Creation Rights</h3>
            <div className="bg-white rounded-xl border border-gray-200 px-4">
              <PermissionToggle
                label="Create Tasks"
                description="Allow creating new tasks."
                checked={permissions.canCreateTasks}
                onChange={(val) => setPermissions(prev => ({ ...prev, canCreateTasks: val }))}
              />
              <PermissionToggle
                label="Schedule Meetings"
                description="Allow scheduling new meetings."
                checked={permissions.canCreateMeetings}
                onChange={(val) => setPermissions(prev => ({ ...prev, canCreateMeetings: val }))}
              />
              <PermissionToggle
                label="Create Notes"
                description="Allow adding new team notes."
                checked={permissions.canCreateNotes}
                onChange={(val) => setPermissions(prev => ({ ...prev, canCreateNotes: val }))}
              />
            </div>
          </div>

          {/* DELETION Group */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Destructive Rights</h3>
            <div className="bg-white rounded-xl border border-gray-200 px-4">
              <PermissionToggle
                label="Delete Tasks"
                description="Allow permanently deleting tasks."
                checked={permissions.canDeleteTasks}
                onChange={(val) => setPermissions(prev => ({ ...prev, canDeleteTasks: val }))}
              />
              <PermissionToggle
                label="Delete Meetings"
                description="Allow cancelling meetings."
                checked={permissions.canDeleteMeetings}
                onChange={(val) => setPermissions(prev => ({ ...prev, canDeleteMeetings: val }))}
              />
              <PermissionToggle
                label="Delete Notes"
                description="Allow removing notes."
                checked={permissions.canDeleteNotes}
                onChange={(val) => setPermissions(prev => ({ ...prev, canDeleteNotes: val }))}
              />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Resources</h3>
            <div className="bg-white rounded-xl border border-gray-200 px-4">
              <PermissionToggle
                label="Add Resources"
                description="Allow adding Figma, GitHub, and Project links."
                checked={permissions.canCreateResources}
                onChange={(val) => setPermissions(prev => ({ ...prev, canCreateResources: val }))}
              />
              <PermissionToggle
                label="Delete Resources"
                description="Allow removing resource links."
                checked={permissions.canDeleteResources}
                onChange={(val) => setPermissions(prev => ({ ...prev, canDeleteResources: val }))}
              />
            </div>
          </div>

          {/* REPORTING Group */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reporting</h3>
            <div className="bg-white rounded-xl border border-gray-200 px-4">
              <PermissionToggle
                label="Export Reports"
                description="Allow downloading PDF/CSV data."
                checked={permissions.canExportReports}
                onChange={(val) => setPermissions(prev => ({ ...prev, canExportReports: val }))}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-primary text-white font-medium py-2.5 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PermissionsModal;
