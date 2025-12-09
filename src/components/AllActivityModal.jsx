import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../api/axiosConfig';
import { Loader2, AlertCircle, Activity } from 'lucide-react';
import TeamActivityEvent from './TeamActivityEvent'; // Re-use your existing component

const AllActivityModal = ({ isOpen, onClose, teamId, teamName }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchAllActivity = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await api.get(`/activity/${teamId}/all`);
          setActivities(res.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load activity');
        }
        setLoading(false);
      };

      fetchAllActivity();
    }
  }, [isOpen, teamId]); // Re-fetch if the modal is opened for a new teamId

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Full Activity Log: ${teamName}`}>
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        {loading && (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <AlertCircle className="text-red-500 mb-2" size={32} />
            <p className="font-medium text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && activities.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Activity className="text-gray-400 mb-2" size={32} />
            <p className="font-medium text-gray-700">No Activity Found</p>
            <p className="text-sm text-gray-500">This team has no activity log yet.</p>
          </div>
        )}

        {!loading && !error && activities.length > 0 && (
          <div className="space-y-2 divide-y divide-gray-100">
            {activities.map((item) => (
              <TeamActivityEvent key={item._id} activity={item} />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AllActivityModal;
