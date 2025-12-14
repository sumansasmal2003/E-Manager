import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../api/axiosConfig';
import { Megaphone, AlertTriangle, Info, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const AnnouncementsModal = ({ isOpen, onClose }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchAnnouncements = async () => {
        setLoading(true);
        try {
          // This endpoint returns all active announcements
          const res = await api.get('/announcements');
          setAnnouncements(res.data);
        } catch (err) {
          console.error("Failed to fetch announcements", err);
        } finally {
          setLoading(false);
        }
      };
      fetchAnnouncements();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Company Announcements">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-gray-400" size={24} />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Megaphone className="mx-auto mb-2 opacity-50" size={32} />
            <p>No active announcements at this time.</p>
          </div>
        ) : (
          announcements.map((announcement) => {
            const isHigh = announcement.priority === 'high';
            const isMedium = announcement.priority === 'medium';

            return (
              <div
                key={announcement._id}
                className={`p-4 rounded-xl border ${
                  isHigh ? 'bg-red-50 border-red-100' :
                  isMedium ? 'bg-amber-50 border-amber-100' :
                  'bg-blue-50 border-blue-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 shrink-0 ${
                    isHigh ? 'text-red-600' : isMedium ? 'text-amber-600' : 'text-blue-600'
                  }`}>
                    {isHigh ? <AlertTriangle size={20} /> :
                     isMedium ? <Info size={20} /> :
                     <Megaphone size={20} />}
                  </div>

                  <div className="flex-1">
                    <p className={`text-sm font-medium leading-relaxed ${
                       isHigh ? 'text-red-900' : isMedium ? 'text-amber-900' : 'text-blue-900'
                    }`}>
                      {announcement.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                      <Calendar size={12} />
                      <span>Posted {format(new Date(announcement.createdAt), 'MMM d, yyyy')}</span>
                      <span>•</span>
                      <span>Expires {format(new Date(announcement.expiresAt), 'MMM d')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default AnnouncementsModal;
