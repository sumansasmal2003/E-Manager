import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import api from '../api/axiosConfig';
import { Loader2 } from 'lucide-react';
import format from 'date-fns/format';

// This component fetches its *own* data for the day
const AttendanceModal = ({ isOpen, onClose, selectedDate, members }) => {
  const [records, setRecords] = useState({}); // { memberName: 'Present', ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formattedDate = format(selectedDate, 'MMMM dd, yyyy');

  // Fetch the records for THIS day only
  const fetchDailyRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // We'll just re-use the monthly endpoint, it's fine.
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const res = await api.get(`/attendance?year=${year}&month=${month}`);

      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      // Filter records for the selected date
      const dailyRecords = res.data.filter(
        record => format(new Date(record.date), 'yyyy-MM-dd') === dateStr
      );

      // Convert to a simple { member: status } map for easy lookup
      const recordsMap = {};
      members.forEach(member => {
        const record = dailyRecords.find(r => r.member === member);
        recordsMap[member] = record ? record.status : 'Present'; // Default to Present
      });

      setRecords(recordsMap);
    } catch (err) {
      setError('Failed to load attendance data for this day.');
    }
    setLoading(false);
  }, [selectedDate, members]);

  useEffect(() => {
    fetchDailyRecords();
  }, [fetchDailyRecords]);

  // This fires when a dropdown is changed
  const handleStatusChange = async (member, status) => {
    // Optimistic UI update
    setRecords(prev => ({ ...prev, [member]: status }));

    try {
      // Send to backend
      await api.post('/attendance', {
        date: selectedDate.toISOString(),
        member,
        status,
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(`Failed to save ${member}'s status. Please try again.`);
      // Revert optimistic update on error
      fetchDailyRecords();
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Present') return 'bg-green-100 text-green-800 border-green-300';
    if (status === 'Absent') return 'bg-red-100 text-red-800 border-red-300';
    if (status === 'Leave') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (status === 'Holiday') return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Attendance for ${formattedDate}`}>
      {loading && (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="animate-spin" size={24} />
        </div>
      )}

      {!loading && error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      {!loading && !error && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {members.map(member => (
            <div
              key={member}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <span className="font-medium text-primary">{member}</span>
              <select
                value={records[member] || 'Present'}
                onChange={(e) => handleStatusChange(member, e.target.value)}
                className={`text-sm font-medium border rounded-md focus:ring-2 focus:ring-primary transition-colors ${getStatusColor(
                  records[member] || 'Present'
                )}`}
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default AttendanceModal;
