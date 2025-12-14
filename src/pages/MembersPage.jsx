import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Link } from 'react-router-dom';
import { User, Loader2, AlertCircle, Users, Search, X as XIcon, Shield, Lock, Unlock } from 'lucide-react';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';
import PermissionsModal from '../components/PermissionsModal';

const MembersPage = () => {
  const { user } = useAuth();
  const { confirm } = useConfirm();

  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);

  const isOwner = user?.role === 'owner';
  const isEmployee = user?.role === 'employee';

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/members');
      setMembers(res.data);
      setFilteredMembers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch members');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [searchTerm, members]);

  const handleDeleteMember = async (e, memberName) => {
    e.preventDefault();
    e.stopPropagation();

    const isConfirmed = await confirm({
      title: `Remove ${memberName}?`,
      description: `This will remove ${memberName} from ALL teams.`,
      confirmText: 'Delete Member',
      danger: true
    });

    if (isConfirmed) {
      try {
        await api.delete(`/members/${encodeURIComponent(memberName)}`);
        const updated = members.filter(m => m.name !== memberName);
        setMembers(updated);
        setFilteredMembers(updated);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete member");
      }
    }
  };

  const handleToggleStatus = async (e, member) => {
    e.preventDefault();
    e.stopPropagation();

    const action = member.isActive ? 'Suspend' : 'Activate';
    const isConfirmed = await confirm({
      title: `${action} Employee?`,
      description: member.isActive
        ? `Suspend ${member.name}? They will not be able to log in.`
        : `Activate ${member.name}? They will regain access.`,
      confirmText: `Yes, ${action}`,
      danger: member.isActive
    });

    if (isConfirmed) {
      try {
        await api.put(`/members/${member.userId}/suspend`);
        const updatedMembers = members.map(m =>
          m.userId === member.userId ? { ...m, isActive: !m.isActive } : m
        );
        setMembers(updatedMembers);
        setFilteredMembers(updatedMembers);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to update status");
      }
    }
  };

  const handleOpenPermissions = (e, member) => {
    e.preventDefault();
    e.stopPropagation();
    if (member.userId) {
      setSelectedUser({
        _id: member.userId,
        username: member.name,
        permissions: member.permissions,
        role: member.role
      });
      setIsPermModalOpen(true);
    }
  };

  // --- Card Content Component (DRY) ---
  const MemberCardContent = ({ member }) => (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm ${!isEmployee ? 'hover:shadow-lg transition-all duration-300 group-hover:border-gray-300' : ''} h-full flex flex-col relative overflow-hidden`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className={`w-12 h-12 bg-primary rounded-xl flex items-center justify-center ${!isEmployee ? 'group-hover:bg-gray-800' : ''} transition-colors duration-200 flex-shrink-0`}>
          <span className="text-white text-2xl font-medium">{member.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-primary truncate">{member.name}</h3>
          <p className="text-sm text-gray-500 truncate" title={member.teams.join(', ')}>{member.teams.join(', ')}</p>

          {member.role === 'employee' && (
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">
                Employee
              </span>
              {!member.isActive && (
                 <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800">
                   Suspended
                 </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hide "View Profile" link for Employees */}
      {!isEmployee && (
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium group-hover:text-primary transition-colors">View Profile</span>
            <div className="w-2 h-2 bg-gray-300 rounded-full group-hover:bg-primary transition-colors duration-200" />
          </div>
        </div>
      )}
    </div>
  );

  if (loading) return <div className="min-h-96 flex flex-col items-center justify-center py-12"><Loader2 className="animate-spin text-primary mb-4" size={32} /><p className="text-gray-600">Loading members...</p></div>;
  if (error) return <div className="flex items-center space-x-3 p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 max-w-2xl mx-auto"><AlertCircle size={24} className="flex-shrink-0" /><div><p className="font-medium">Unable to load members</p><p className="text-sm mt-1">{error}</p></div></div>;

  return (
    <div className="space-y-8">
      <PermissionsModal
        isOpen={isPermModalOpen}
        onClose={() => { setIsPermModalOpen(false); fetchMembers(); }}
        manager={selectedUser}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-primary hidden">Team Members</h1></div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center space-x-2 text-gray-600 shadow-sm"><Users size={20} /><span className="font-medium">{members.length}</span><span className="text-sm">total members</span></div>
      </div>

      <div className="max-w-md"><Input icon={<Search size={18} className="text-gray-400" />} type="text" placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full" /></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <div key={member.name} className="relative group">
              {/* Conditional Link: Static Div for Employees, Link for Owners */}
              {isEmployee ? (
                <div className="block h-full cursor-default">
                   <MemberCardContent member={member} />
                </div>
              ) : (
                <Link to={`/members/details?name=${encodeURIComponent(member.name)}`} className="block h-full">
                   <MemberCardContent member={member} />
                </Link>
              )}

              {/* Actions: Owner Only */}
              {isOwner && (
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                  {member.userId && (
                    <>
                      <button onClick={(e) => handleToggleStatus(e, member)} className={`p-1.5 rounded-lg shadow-sm border border-gray-100 ${member.isActive ? 'bg-white text-gray-400 hover:text-orange-600 hover:bg-orange-50' : 'bg-red-50 text-red-600 hover:bg-green-50 hover:text-green-600'}`} title={member.isActive ? "Suspend" : "Activate"}>
                        {member.isActive ? <Unlock size={16} /> : <Lock size={16} />}
                      </button>
                      <button onClick={(e) => handleOpenPermissions(e, member)} className="p-1.5 bg-white text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg shadow-sm border border-gray-100" title="Manage Permissions">
                        <Shield size={16} />
                      </button>
                    </>
                  )}
                  <button onClick={(e) => handleDeleteMember(e, member.name)} className="p-1.5 bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg shadow-sm border border-gray-100" title="Remove Member">
                    <XIcon size={16} />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12"><Users size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-semibold text-primary mb-2">{searchTerm ? 'No members found' : 'No members available'}</h3></div>
        )}
      </div>
    </div>
  );
};

export default MembersPage;
