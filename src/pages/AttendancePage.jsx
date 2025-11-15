import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axiosConfig';
import {
  Loader2,
  AlertCircle,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Umbrella,
  Download,
  Filter,
  MinusCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import ExportAttendanceModal from '../components/ExportAttendanceModal';
import CustomSelect from '../components/CustomSelect';
import AttendanceGrid from '../components/AttendanceGrid'; // <-- Import new grid

const NOT_SET = 'Due';

const filterOptions = [
  { value: 'all', label: 'All Status (Today)' },
  { value: 'Present', label: 'Present (Today)' },
  { value: 'Absent', label: 'Absent (Today)' },
  { value: 'Leave', label: 'Leave (Today)' },
  { value: 'Holiday', label: 'Holiday (Today)' },
  { value: 'Due', label: 'Due (Today)' },
];

const AttendancePage = () => {
  const [members, setMembers] = useState([]);
  const [memberProfileMap, setMemberProfileMap] = useState(new Map());
  const [dailyRecordsMap, setDailyRecordsMap] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [saving, setSaving] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch all members (with profile data) once
  useEffect(() => {
    const fetchMembers = async () => {
      setLoadingMembers(true);
      setLoadingError(null);
      try {
        const res = await api.get('/attendance/members');
        setMembers(res.data);

        const profileMap = new Map();
        res.data.forEach(member => {
          profileMap.set(member.name, {
            joiningDate: member.joiningDate,
            endingDate: member.endingDate,
          });
        });
        setMemberProfileMap(profileMap);

      } catch (err) {
        setLoadingError(err.response?.data?.message || 'Failed to fetch team members.');
      }
      setLoadingMembers(false);
    };
    fetchMembers();
  }, []);

  // Fetch monthly attendance records
  useEffect(() => {
    if (members.length === 0) return;

    const handleSetSundayAsHoliday = async (date) => {
      try {
        await api.post('/attendance/bulk-holiday', { date });
      } catch (err) {
        console.error("Failed to auto-set Sunday as holiday", err);
      }
    };

    const fetchMonthlyRecords = async () => {
      setLoadingRecords(true);
      setLoadingError(null);
      setUpdateError(null);

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth(); // 0-indexed

      // Auto-set Sundays
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const sundayPromises = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        if (date.getDay() === 0) { // 0 is Sunday
          sundayPromises.push(handleSetSundayAsHoliday(format(date, 'yyyy-MM-dd')));
        }
      }
      await Promise.all(sundayPromises);

      try {
        const res = await api.get(`/attendance?year=${year}&month=${month}`);

        const recordsMap = {};
        res.data.forEach(record => {
          const dateString = format(new Date(record.date), 'yyyy-MM-dd');
          if (!recordsMap[dateString]) {
            recordsMap[dateString] = {};
          }
          recordsMap[dateString][record.member] = record.status;
        });

        setDailyRecordsMap(recordsMap);
      } catch (err) {
        setLoadingError(err.response?.data?.message || 'Failed to fetch attendance data.');
      }
      setLoadingRecords(false);
    };

    fetchMonthlyRecords();
  }, [currentMonth, members]);

  // Handle status change from the grid
  const handleStatusChange = async (memberName, dateString, status) => {
    if (status === NOT_SET) return;
    const saveKey = `${memberName}-${dateString}`;
    setSaving(prev => ({ ...prev, [saveKey]: true }));
    setUpdateError(null);

    setDailyRecordsMap(prev => ({
      ...prev,
      [dateString]: {
        ...prev[dateString],
        [memberName]: status,
      },
    }));

    try {
      await api.post('/attendance', {
        date: dateString,
        member: memberName,
        status,
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      setUpdateError(`Failed to save ${memberName}'s status. Please try again.`);
      // Revert optimistic update on error
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      api.get(`/attendance?year=${year}&month=${month}`).then(res => {
         const recordsMap = {};
        res.data.forEach(record => {
          const dateString = format(new Date(record.date), 'yyyy-MM-dd');
          if (!recordsMap[dateString]) {
            recordsMap[dateString] = {};
          }
          recordsMap[dateString][record.member] = record.status;
        });
        setDailyRecordsMap(recordsMap);
      });
    } finally {
      setSaving(prev => ({ ...prev, [saveKey]: false }));
    }
  };

  // Calculate stats for TODAY
  const todayString = format(new Date(), 'yyyy-MM-dd');
  const todayRecords = dailyRecordsMap[todayString] || {};

  const stats = useMemo(() => {
    const s = { Present: 0, Absent: 0, Leave: 0, Holiday: 0, Due: 0, total: members.length };
    members.forEach(member => {
      const status = todayRecords[member.name] || NOT_SET;
      if (s[status] !== undefined) {
        s[status]++;
      } else {
        s[NOT_SET]++;
      }
    });
    return s;
  }, [members, todayRecords]);

  // Filter members for the grid based on *today's* status
  const filteredMembers = members.filter(member => {
    if (statusFilter === 'all') return true;
    const todayStatus = todayRecords[member.name] || NOT_SET;
    return todayStatus === statusFilter;
  });

  const formattedMonth = format(currentMonth, 'MMMM yyyy');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Attendance Management</h1>
          <p className="text-gray-600">Track and manage team attendance in a monthly grid.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            <Download size={18} />
            <span>Export Report</span>
          </button>

          {/* --- UPDATED: Month Navigator with Today --- */}
          <div className="flex items-center justify-between p-2 bg-white border border-gray-300 rounded-lg">
            <div className="flex items-center">
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="p-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Go to Today"
              >
                Today
              </button>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-semibold text-gray-900 text-center w-32">
                {formattedMonth}
              </span>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banners */}
      {loadingError && (
        <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span className="font-medium">{loadingError}</span>
        </div>
      )}
      {updateError && (
        <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span className="font-medium">{updateError}</span>
        </div>
      )}

      {/* Today's Stats */}
      <div className="pb-4 border-b border-gray-200">
         <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Stats ({format(new Date(), 'MMMM dd')})</h2>
         <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.Present}</p>
                <p className="text-sm text-gray-600">Present</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.Absent}</p>
                <p className="text-sm text-gray-600">Absent</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="text-red-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.Leave}</p>
                <p className="text-sm text-gray-600">On Leave</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Umbrella className="text-yellow-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.Holiday}</p>
                <p className="text-sm text-gray-600">Holiday</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="text-blue-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.Due}</p>
                <p className="text-sm text-gray-600">Due</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <MinusCircle className="text-gray-600" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (Grid) */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Monthly Attendance Grid</h2>
              <p className="text-gray-600 mt-1">Filter grid rows based on <span className='font-bold'>today's</span> status.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-400" />
              <CustomSelect
                options={filterOptions}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
              />
            </div>
          </div>
        </div>

        {/* Member Grid */}
        {loadingMembers ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="animate-spin text-gray-900" size={32} />
            <p className="text-gray-600">Loading team members...</p>
          </div>
        ) : loadingRecords ? (
           <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="animate-spin text-gray-900" size={32} />
            <p className="text-gray-600">Loading attendance records...</p>
          </div>
        ) : (
          <div className="p-2 sm:p-4">
            {filteredMembers.length > 0 ? (
              <AttendanceGrid
                currentMonth={currentMonth}
                members={filteredMembers} // Pass filtered members
                attendanceData={dailyRecordsMap}
                memberProfileMap={memberProfileMap}
                onStatusChange={handleStatusChange}
                saving={saving}
              />
            ) : (
              <div className="text-center py-16">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {statusFilter === 'all' ? 'No team members' : 'No members found'}
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  {statusFilter === 'all'
                    ? 'Add members to your teams to start tracking attendance.'
                    : `No members with '${statusFilter}' status found for today.`
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <ExportAttendanceModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        members={members}
      />
    </div>
  );
};

export default AttendancePage;
