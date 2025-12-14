import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, Megaphone, X } from 'lucide-react';
import api from '../api/axiosConfig';

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(
    JSON.parse(sessionStorage.getItem('dismissedAnnouncements') || '[]')
  );

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements');
        setAnnouncements(res.data);
      } catch (err) {
        console.error('Failed to load announcements', err);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleDismiss = (id) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    sessionStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
  };

  // Filter out dismissed ones
  const activeAnnouncements = announcements.filter(a => !dismissedIds.includes(a._id));

  if (activeAnnouncements.length === 0) return null;

  // Show only the highest priority / newest one if multiple (to avoid clutter)
  // Or map through all if you want them stacked. Let's stack them.
  return (
    <div className="flex flex-col gap-2 mb-6">
      <AnimatePresence>
        {activeAnnouncements.map((announcement) => {
          const isHigh = announcement.priority === 'high';
          const isMedium = announcement.priority === 'medium';

          return (
            <motion.div
              key={announcement._id}
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={`relative flex items-start gap-3 px-4 py-3 rounded-xl border shadow-sm ${
                isHigh ? 'bg-red-50 border-red-200 text-red-900' :
                isMedium ? 'bg-amber-50 border-amber-200 text-amber-900' :
                'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <div className={`mt-0.5 shrink-0 ${
                isHigh ? 'text-red-600' : isMedium ? 'text-amber-600' : 'text-blue-600'
              }`}>
                {isHigh ? <AlertTriangle size={18} /> :
                 isMedium ? <Info size={18} /> :
                 <Megaphone size={18} />}
              </div>

              <div className="flex-1 text-sm font-medium leading-relaxed">
                {announcement.message}
              </div>

              <button
                onClick={() => handleDismiss(announcement._id)}
                className={`p-1 rounded-full transition-colors ${
                  isHigh ? 'hover:bg-red-100 text-red-500' :
                  isMedium ? 'hover:bg-amber-100 text-amber-500' :
                  'hover:bg-blue-100 text-blue-500'
                }`}
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AnnouncementBanner;
