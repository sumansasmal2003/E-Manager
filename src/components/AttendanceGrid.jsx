import React, { useMemo } from 'react';
import {
  format,
  getDaysInMonth,
  startOfMonth,
  addDays,
  getDay,
} from 'date-fns';
import { Loader2, Lock, MinusCircle, CheckCircle, XCircle, Umbrella, Clock, User } from 'lucide-react';

const NOT_SET = 'Due';

// Enhanced Interactive Cell Component
const InteractiveCell = React.memo(({ memberName, dateString, status, onStatusChange, isSaving, isDisabled, message }) => {
  const getStatusConfig = (s) => {
    const configs = {
      Present: {
        color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
        icon: <CheckCircle size={14} className="text-green-600" />
      },
      Absent: {
        color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
        icon: <XCircle size={14} className="text-red-600" />
      },
      Leave: {
        color: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100',
        icon: <Umbrella size={14} className="text-yellow-600" />
      },
      Holiday: {
        color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
        icon: <Clock size={14} className="text-blue-600" />
      },
      Due: {
        color: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
        icon: <MinusCircle size={14} className="text-gray-600" />
      }
    };
    return configs[s] || configs.Due;
  };

  if (isDisabled) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 border border-gray-200" title={message}>
        <Lock size={14} className="text-gray-400" />
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 border border-gray-200">
        <Loader2 size={14} className="animate-spin text-gray-500" />
      </div>
    );
  }

  const config = getStatusConfig(status);

  return (
    <select
      value={status}
      onChange={(e) => onStatusChange(memberName, dateString, e.target.value)}
      className={`w-full h-full text-sm font-medium border rounded-lg focus:ring-2 focus:ring-primary transition-all duration-200 cursor-pointer appearance-none text-center ${config.color}`}
    >
      <option value={NOT_SET} disabled>Select</option>
      <option value="Present">Present</option>
      <option value="Absent">Absent</option>
      <option value="Leave">Leave</option>
      <option value="Holiday">Holiday</option>
    </select>
  );
});

// Main Enhanced Grid Component
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
    return {
      daysInMonth: Array.from({ length: days }, (_, i) => i + 1),
      monthStartDate: start
    };
  }, [currentMonth]);

  // Enhanced header rendering
  const renderHeader = () => (
    <thead className="sticky top-0 z-20">
      <tr className="bg-gray-50">
        <th className="sticky left-0 z-30 bg-gray-100 p-4 border-b border-r border-gray-300 text-left text-sm font-semibold text-primary min-w-[220px]">
          <div className="flex items-center space-x-3">
            <User size={18} className="text-gray-600" />
            <span>Team Member</span>
          </div>
        </th>
        {daysInMonth.map(day => {
          const date = addDays(monthStartDate, day - 1);
          const dayOfWeek = getDay(date);
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

          return (
            <th
              key={day}
              className={`p-3 border-b border-l border-gray-300 text-center min-w-[120px] w-30 ${
                isWeekend
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-gray-50 text-gray-600'
              } ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}
            >
              <div className="space-y-1">
                <div className="text-xs font-medium uppercase tracking-wide">
                  {format(date, 'EEE')}
                </div>
                <div className={`text-lg font-bold ${isToday ? 'text-primary' : ''}`}>
                  {day}
                </div>
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );

  // Enhanced body rendering
  const renderBody = () => (
    <tbody>
      {members.map((member, index) => (
        <tr key={member.name} className="group hover:bg-gray-50 transition-colors duration-200">
          <td className="sticky left-0 z-20 p-4 border-b border-r border-gray-200 bg-white group-hover:bg-gray-50 min-w-[220px]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <User size={14} className="text-gray-600" />
              </div>
              <div>
                <div className="font-semibold text-primary text-sm">{member.name}</div>
                <div className="text-xs text-gray-500">
                  {memberProfileMap.get(member.name)?.joiningDate
                    ? `Joined ${format(new Date(memberProfileMap.get(member.name).joiningDate), 'MMM yyyy')}`
                    : 'Member'
                  }
                </div>
              </div>
            </div>
          </td>
          {daysInMonth.map(day => {
            const cellDate = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              day
            );
            cellDate.setHours(0, 0, 0, 0);

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
            const isToday = dateString === format(new Date(), 'yyyy-MM-dd');

            return (
              <td
                key={day}
                className={`h-16 min-w-[120px] w-30 p-0 border-b border-l border-gray-200 ${
                  isToday ? 'bg-blue-50' : ''
                }`}
              >
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
      ))}
    </tbody>
  );

  return (
    <div className="border border-gray-300 rounded-xl overflow-auto shadow-sm bg-white" style={{ maxHeight: '70vh' }}>
      <table className="min-w-full border-collapse">
        {renderHeader()}
        {renderBody()}
      </table>
    </div>
  );
};

export default AttendanceGrid;
