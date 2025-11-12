import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Link } from 'react-router-dom';
import { User, Loader2, AlertCircle, Users, Search } from 'lucide-react';
import Input from '../components/Input'; // Assuming you have this

const MembersPage = () => {
  const [members, setMembers] = useState([]); // Will hold [{name, teams}]
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
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

    fetchMembers();
  }, []);

  // Updated useEffect to filter by member.name
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

  if (loading) {
    return (
      <div className="min-h-96 flex flex-col items-center justify-center py-12">
        <Loader2 className="animate-spin text-gray-900 mb-4" size={32} />
        <p className="text-gray-600">Loading team members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-3 p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 max-w-2xl mx-auto">
        <AlertCircle size={24} className="flex-shrink-0" />
        <div>
          <p className="font-medium">Unable to load members</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {/* This title is provided by DashboardLayout, but good to have */}
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 hidden">Team Members</h1>
          <p className="text-gray-600 hidden">
            Manage and view all members across your teams
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center space-x-2 text-gray-600">
          <Users size={20} />
          <span className="font-medium">{members.length}</span>
          <span className="text-sm">total members</span>
        </div>
      </div>

      {/* Search Bar - Using your Input component for consistency */}
      <div className="max-w-md">
        <Input
          icon={<Search size={18} className="text-gray-400" />}
          type="text"
          placeholder="Search members by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <Link
              key={member.name}
              to={`/members/details?name=${encodeURIComponent(member.name)}`}
              className="group"
            >
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:border-gray-300 h-full flex flex-col">
                <div className="flex items-center space-x-4 mb-4">

                  {/* --- NEW: Member Initial --- */}
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center group-hover:bg-gray-800 transition-colors duration-200 flex-shrink-0">
                    <span className="text-white text-2xl font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-gray-700 transition-colors">
                      {member.name}
                    </h3>

                    {/* --- NEW: Team List --- */}
                    <p className="text-sm text-gray-500 truncate" title={member.teams.join(', ')}>
                      {member.teams.join(', ')}
                    </p>

                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">View Full Profile</span>
                    <div className="w-2 h-2 bg-gray-900 rounded-full group-hover:scale-110 transition-transform duration-200" />
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No members found' : 'No members available'}
            </h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              {searchTerm
                ? 'Try adjusting your search terms to find what you\'re looking for.'
                : 'Team members will appear here once they are added to a team.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersPage;
