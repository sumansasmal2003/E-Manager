import React, { useMemo } from 'react';
import {
  format,
  getDaysInMonth,
  startOfMonth,
  addDays,
  getDay,
} from 'date-fns';
import { Loader2, Lock, MinusCircle, CheckCircle, XCircle, Umbrella, Clock } from 'lucide-react';

const NOT_SET = 'Due';

// --- Interactive Cell Sub-Component ---
// This is the small dropdown for each cell in the grid
const InteractiveCell = React.memo(({ memberName, dateString, status, onStatusChange, isSaving, isDisabled, message }) => {
  const getStatusConfig = (s) => {
    switch (s) {
      case 'Present':
        return { color: 'bg-green-100 text-green-800 border-green-300', icon: <CheckCircle size={14} /> };
      case 'Absent':
        return { color: 'bg-red-100 text-red-800 border-red-300', icon: <XCircle size={14} /> };
      case 'Leave':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <Umbrella size={14} /> };
      case 'Holiday':
        return { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: <Clock size={14} /> };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: <MinusCircle size={14} /> };
    }
  };

  if (isDisabled) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50" title={message}>
        <Lock size={14} className="text-gray-400" />
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 size={16} className="animate-spin text-gray-500" />
      </div>
    );
  }

  const config = getStatusConfig(status);

  return (
    <select
      value={status}
      onChange={(e) => onStatusChange(memberName, dateString, e.target.value)}
      className={`w-full h-full text-sm font-medium border-0 focus:ring-2 focus:ring-gray-900 transition-colors cursor-pointer appearance-none text-center ${config.color}`}
    >
      <option value={NOT_SET} disabled>Select</option>
      <option value="Present">Present</option>
      <option value="Absent">Absent</option>
      <option value="Leave">Leave</option>
      <option value="Holiday">Holiday</option>
    </select>
  );
});

// --- Main Grid Component ---
const AttendanceGrid = ({
  currentMonth,
  members,
  attendanceData,
  memberProfileMap,
  onStatusChange,
  saving,
}) => {
  // Memoize date calculations
  const { daysInMonth, monthStartDate } = useMemo(() => {
    const days = getDaysInMonth(currentMonth);
    const start = startOfMonth(currentMonth);
    return { daysInMonth: Array.from({ length: days }, (_, i) => i + 1), monthStartDate: start };
  }, [currentMonth]);

  // Generate header cells
  const renderHeader = () => (
    <tr className="bg-gray-50">
      <th className="sticky left-0 z-10 bg-gray-100 p-2 border-b border-gray-300 text-left text-sm font-semibold text-gray-900 min-w-[200px]">
        Member
      </th>
      {daysInMonth.map(day => {
        const date = addDays(monthStartDate, day - 1);
        const dayOfWeek = getDay(date); // 0 = Sunday, 6 = Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        return (
          <th
            key={day}
            // --- MODIFICATION: Increased width ---
            className={`p-2 border-b border-l border-gray-300 text-center text-sm font-medium min-w-[112px] w-28 ${
              isWeekend ? 'bg-gray-200 text-gray-700' : 'bg-gray-50 text-gray-600'
            }`}
          >
            <div className="text-xs">{format(date, 'E')}</div>
            {/* --- MODIFICATION: Increased font size --- */}
            <div className="text-base">{day}</div>
          </th>
        );
      })}
    </tr>
  );

  // Generate body rows
  const renderBody = () => (
    members.map(member => (
      <tr key={member.name} className="hover:bg-gray-50 group">
        <td className="sticky left-0 z-10 p-2 border-b border-gray-200 bg-white group-hover:bg-gray-50 min-w-[200px]">
          <div className="font-medium text-gray-900">{member.name}</div>
        </td>
        {daysInMonth.map(day => {
          const cellDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
          );
          cellDate.setHours(0, 0, 0, 0); // Normalize

          const dateString = format(cellDate, 'yyyy-MM-dd');
          const saveKey = `${member.name}-${dateString}`;
          const profile = memberProfileMap.get(member.name);

          let isDisabled = false;
          let message = null;

          if (profile?.joiningDate) {
            const joinDay = new Date(profile.joiningDate);
            joinDay.setHours(0, 0, 0, 0);
            if (cellDate < joinDay) {
              isDisabled = true;
              message = "Not Joined Yet";
            }
          }
          if (profile?.endingDate) {
            const endDay = new Date(profile.endingDate);
            endDay.setHours(0, 0, 0, 0);
            if (cellDate > endDay) {
              isDisabled = true;
              message = "Journey Ended";
            }
          }

          const status = attendanceData[dateString]?.[member.name] || NOT_SET;

          return (
            // --- MODIFICATION: Increased height and width ---
            <td key={day} className="h-16 min-w-[112px] w-28 p-0 border-b border-l border-gray-200">
              <InteractiveCell
                memberName={member.name}
                dateString={dateString}
                status={status}
                onStatusChange={onStatusChange}
                isSaving={saving[saveKey]}
                isDisabled={isDisabled}
                message={message}
              />
            </td>
          );
        })}
      </tr>
    ))
  );

  return (
    <div className="border border-gray-300 rounded-xl overflow-auto shadow-sm" style={{ maxHeight: '70vh' }}>
      <table className="min-w-full border-collapse">
        <thead className="sticky top-0 z-20">
          {renderHeader()}
        </thead>
        <tbody>
          {renderBody()}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceGrid;
