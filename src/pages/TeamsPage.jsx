import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import TeamCard from '../components/TeamCard';
import CreateTeamModal from '../components/CreateTeamModal';
import { Plus, Users, AlertCircle } from 'lucide-react';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
            <Users className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Teams</h1>
            <p className="text-gray-600 text-sm mt-1">
              {teams.length} team{teams.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-gray-900 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200"
        >
          <Plus size={20} />
          <span>Create Team</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
          {error}
        </div>
      )}

      {/* Teams Grid */}
      {!loading && !error && (
        teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teams.map((team) => (
              <TeamCard
                key={team._id}
                team={team}
                onDelete={handleDeleteTeam}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
            <p className="text-gray-600 mb-6">Create your first team to start collaborating</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 inline-flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Create Team</span>
            </button>
          </div>
        )
      )}

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
