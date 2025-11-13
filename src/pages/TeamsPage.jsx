import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import TeamCard from '../components/TeamCard';
import CreateTeamModal from '../components/CreateTeamModal';
import { Plus, Users, AlertCircle, Grid, Table, Trash2, Calendar, User, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const res = await api.get('/teams');
        setTeams(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch teams');
      }
      setLoading(false);
    };
    fetchTeams();
  }, []);

  const handleTeamCreated = (newTeam) => {
    setTeams([newTeam, ...teams]);
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to disband this team? This will delete all tasks and meetings.')) {
      try {
        await api.delete(`/teams/${teamId}`);
        setTeams(teams.filter((team) => team._id !== teamId));
      } catch (err) {
        console.error('Failed to delete team', err);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMemberCountText = (members) => {
    const count = members?.length || 0;
    return `${count} member${count !== 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="text-white" size={24} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Teams</h1>
                <p className="text-gray-600 mt-1">
                  {teams.length} team{teams.length !== 1 ? 's' : ''} •
                  <span className="text-gray-900 font-medium ml-1">Collaborate & manage</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full lg:w-auto">
              {/* View Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'table'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Table size={18} />
                </button>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 lg:flex-none bg-gray-900 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                <span className="font-semibold">Create Team</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <p className="text-gray-600">Loading your teams...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load teams</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Teams Content */}
        {!loading && !error && (
          teams.length > 0 ? (
            viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {teams.map((team) => (
                  <TeamCard
                    key={team._id}
                    team={team}
                    onDelete={handleDeleteTeam}
                  />
                ))}
              </div>
            ) : (
              // Table View - With View Team Button
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Team</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Members</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Created</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Status</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {teams.map((team) => (
                        <tr
                          key={team._id}
                          className="hover:bg-gray-50 transition-colors duration-150 group"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Users className="text-white" size={18} />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 group-hover:text-gray-700">
                                  {team.teamName}
                                </p>
                                <p className="text-sm text-gray-500 truncate max-w-xs">
                                  {team.description || 'No description'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <User size={16} className="text-gray-400" />
                              <span className="text-sm text-gray-700">
                                {getMemberCountText(team.members)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar size={14} className="text-gray-400" />
                              <span>{formatDate(team.createdAt)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/team/${team._id}`}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                                title="View Team"
                              >
                                <Eye size={16} />
                              </Link>
                              <button
                                onClick={() => handleDeleteTeam(team._id)}
                                className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-600 cursor-pointer"
                                title="Delete Team"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            // Empty State
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No teams yet</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Create your first team to start collaborating with others on projects and tasks.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold inline-flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Create Your First Team</span>
              </button>
            </div>
          )
        )}
      </div>

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTeamCreated={handleTeamCreated}
      />
    </div>
  );
};

export default TeamsPage;
