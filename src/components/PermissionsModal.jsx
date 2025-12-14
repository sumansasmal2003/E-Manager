import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../api/axiosConfig';
import { Loader2, Shield, Sparkles, Layout, Bell, Calendar, Gamepad2, CheckSquare, Server, SmilePlus, NotebookTabs } from 'lucide-react';
import { FaFileExport, FaUserCheck, FaUserMinus } from 'react-icons/fa'
import { BiTask, BiTaskX, BiEdit } from "react-icons/bi"; // Added BiEdit
import { SiGooglemeet } from "react-icons/si";
import { MdSpeakerNotesOff } from "react-icons/md";

const PermissionToggle = ({ label, description, checked, onChange, icon }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
    <div className="pr-4 flex items-start gap-3">
      {icon && <div className="mt-0.5 text-gray-500">{icon}</div>}
      <div>
        <h4 className="text-sm font-semibold text-primary">{label}</h4>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
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
    canEditTasks: true, // --- NEW ---
    canCreateMeetings: true,
    canCreateNotes: true,
    canDeleteTasks: true,
    canDeleteMeetings: true,
    canDeleteNotes: true,
    canExportReports: false,
    canCreateResources: true,
    canDeleteResources: true,
    canHireEmployees: true,
    canRemoveMembers: false,
    canUseAI: true,
    canViewCalendar: true,
    canAccessGameSpace: true,
    canViewNotifications: true,
    canMarkAttendance: false,
    canViewSystemLog: false
  });
  const [loading, setLoading] = useState(false);

  const isEmployee = manager?.role === 'employee';

  useEffect(() => {
    if (manager && manager.permissions) {
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
            Control what <strong>{manager?.username}</strong> can do.
          </p>
        </div>

        <div className="space-y-6">

          {/* AI & FEATURES (Visible to Everyone) */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Feature Access</h3>
            <div className="bg-white rounded-xl border border-gray-200 px-4">
              <PermissionToggle
                label="Allow AI Features"
                description="Access to AI Chat, Briefings, and Reports."
                checked={permissions.canUseAI}
                onChange={(val) => setPermissions(prev => ({ ...prev, canUseAI: val }))}
                icon={<Sparkles size={18} className="text-purple-500"/>}
              />
              <PermissionToggle
                label="Calendar Access"
                description="View and interact with the team calendar."
                checked={permissions.canViewCalendar}
                onChange={(val) => setPermissions(prev => ({ ...prev, canViewCalendar: val }))}
                icon={<Calendar size={18} />}
              />
              <PermissionToggle
                label="Game Space"
                description="Access to the break room games."
                checked={permissions.canAccessGameSpace}
                onChange={(val) => setPermissions(prev => ({ ...prev, canAccessGameSpace: val }))}
                icon={<Gamepad2 size={18} />}
              />
              <PermissionToggle
                label="Notifications"
                description="View system notifications."
                checked={permissions.canViewNotifications}
                onChange={(val) => setPermissions(prev => ({ ...prev, canViewNotifications: val }))}
                icon={<Bell size={18} />}
              />
              {!isEmployee && (
                <PermissionToggle
                  label="System Log Access"
                  description="View audit logs and system activity."
                  checked={permissions.canViewSystemLog}
                  onChange={(val) => setPermissions(prev => ({ ...prev, canViewSystemLog: val }))}
                  icon={<Server size={18} />}
                />
              )}
            </div>
          </div>

          {/* MANAGERS ONLY SECTIONS */}
          {!isEmployee && (
            <>
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Team Management</h3>
                <div className="bg-white rounded-xl border border-gray-200 px-4">
                  <PermissionToggle label="Hire Employees" description="Allow adding new members/employees." checked={permissions.canHireEmployees} onChange={(val) => setPermissions(prev => ({ ...prev, canHireEmployees: val }))} icon={<SmilePlus size={18} />} />
                  <PermissionToggle label="Remove Members" description="Allow removing members from the team." checked={permissions.canRemoveMembers} onChange={(val) => setPermissions(prev => ({ ...prev, canRemoveMembers: val }))} icon={<FaUserMinus size={18} />} />
                  <PermissionToggle
                    label="Mark Attendance"
                    description="Allow updating attendance status for members."
                    checked={permissions.canMarkAttendance}
                    onChange={(val) => setPermissions(prev => ({ ...prev, canMarkAttendance: val }))}
                    icon={< FaUserCheck size={18} />}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Creation & Editing Rights</h3>
                <div className="bg-white rounded-xl border border-gray-200 px-4">
                  <PermissionToggle label="Create Tasks" description="Allow creating new tasks." checked={permissions.canCreateTasks} onChange={(val) => setPermissions(prev => ({ ...prev, canCreateTasks: val }))} icon={< BiTask size={18} />} />
                  <PermissionToggle label="Edit Tasks" description="Allow editing existing tasks." checked={permissions.canEditTasks} onChange={(val) => setPermissions(prev => ({ ...prev, canEditTasks: val }))} icon={< BiEdit size={18} />} />
                  <PermissionToggle label="Schedule Meetings" description="Allow scheduling meetings." checked={permissions.canCreateMeetings} onChange={(val) => setPermissions(prev => ({ ...prev, canCreateMeetings: val }))} icon={<SiGooglemeet size={18} />} />
                  <PermissionToggle label="Create Notes" description="Allow adding team notes." checked={permissions.canCreateNotes} onChange={(val) => setPermissions(prev => ({ ...prev, canCreateNotes: val }))}  icon={<NotebookTabs size={18} />}/>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Destructive Rights</h3>
                <div className="bg-white rounded-xl border border-gray-200 px-4">
                  <PermissionToggle label="Delete Tasks" description="Allow deleting tasks." checked={permissions.canDeleteTasks} onChange={(val) => setPermissions(prev => ({ ...prev, canDeleteTasks: val }))} icon={<BiTaskX size={18} />} />
                  <PermissionToggle label="Delete Meetings" description="Allow cancelling meetings." checked={permissions.canDeleteMeetings} onChange={(val) => setPermissions(prev => ({ ...prev, canDeleteMeetings: val }))} icon={<SiGooglemeet size={18} />} />
                  <PermissionToggle label="Delete Notes" description="Allow removing notes." checked={permissions.canDeleteNotes} onChange={(val) => setPermissions(prev => ({ ...prev, canDeleteNotes: val }))} icon={<MdSpeakerNotesOff size={18} />} />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reporting</h3>
                <div className="bg-white rounded-xl border border-gray-200 px-4">
                  <PermissionToggle label="Export Reports" description="Allow downloading PDF/CSV." checked={permissions.canExportReports} onChange={(val) => setPermissions(prev => ({ ...prev, canExportReports: val }))} icon={<FaFileExport size={18} />} />
                </div>
              </div>
            </>
          )}

        </div>

        <div className="pt-4 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 bg-primary text-white font-medium py-2.5 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PermissionsModal;
