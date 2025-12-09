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
  ChevronRight,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import ExportAttendanceModal from '../components/ExportAttendanceModal';
import CustomSelect from '../components/CustomSelect';
import AttendanceGrid from '../components/AttendanceGrid';

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

  // Enhanced stats with monthly data
  const [monthlyStats, setMonthlyStats] = useState({
    Present: 0,
    Absent: 0,
    Leave: 0,
    Holiday: 0,
    Due: 0,
    totalDays: 0,
    attendanceRate: 0
  });

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

  // Enhanced monthly stats calculation
  const calculateMonthlyStats = useCallback((recordsMap, month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const stats = {
      Present: 0,
      Absent: 0,
      Leave: 0,
      Holiday: 0,
      Due: 0,
      totalDays: monthDays.length,
      attendanceRate: 0
    };

    monthDays.forEach(day => {
      const dateString = format(day, 'yyyy-MM-dd');
      const dayRecords = recordsMap[dateString] || {};

      members.forEach(member => {
        const status = dayRecords[member.name] || NOT_SET;
        if (stats[status] !== undefined) {
          stats[status]++;
        }
      });
    });

    // Calculate attendance rate (Present / (Present + Absent + Leave))
    const totalMarked = stats.Present + stats.Absent + stats.Leave;
    stats.attendanceRate = totalMarked > 0 ? (stats.Present / totalMarked) * 100 : 0;

    return stats;
  }, [members]);

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
      const month = currentMonth.getMonth();

      // Auto-set Sundays
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const sundayPromises = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        if (date.getDay() === 0) {
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

        // Calculate monthly stats
        const monthlyStats = calculateMonthlyStats(recordsMap, currentMonth);
        setMonthlyStats(monthlyStats);
      } catch (err) {
        setLoadingError(err.response?.data?.message || 'Failed to fetch attendance data.');
      }
      setLoadingRecords(false);
    };

    fetchMonthlyRecords();
  }, [currentMonth, members, calculateMonthlyStats]);

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

  const todayStats = useMemo(() => {
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
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Calendar className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-2">Attendance Management</h1>
            <p className="text-gray-600">Track and manage team attendance with comprehensive analytics</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center justify-center space-x-3 bg-primary text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-sm"
          >
            <Download size={18} />
            <span>Export Report</span>
          </button>

          {/* Enhanced Month Navigator */}
          <div className="flex items-center bg-white border border-gray-300 rounded-lg p-2 shadow-sm">
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
              title="Go to Today"
            >
              Today
            </button>
            <div className="flex items-center border-l border-gray-300 pl-2 ml-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-semibold text-primary text-center w-32 px-4">
                {formattedMonth}
              </span>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banners */}
      <div className="space-y-4">
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
      </div>

      {/* Enhanced Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Stats */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="text-gray-600" size={20} />
            <div>
              <h2 className="text-lg font-semibold text-primary">Today's Overview</h2>
              <p className="text-sm text-gray-600">{format(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">{todayStats.Present}</p>
                  <p className="text-sm text-gray-600">Present</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">{todayStats.Absent}</p>
                  <p className="text-sm text-gray-600">Absent</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="text-red-600" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">{todayStats.Leave}</p>
                  <p className="text-sm text-gray-600">On Leave</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Umbrella className="text-yellow-600" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Overview */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="text-gray-600" size={20} />
            <div>
              <h2 className="text-lg font-semibold text-primary">Monthly Overview</h2>
              <p className="text-sm text-gray-600">{formattedMonth} Performance</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">{monthlyStats.Present}</p>
                  <p className="text-sm text-gray-600">Present Days</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">{monthlyStats.totalDays}</p>
                  <p className="text-sm text-gray-600">Total Days</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-blue-600" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">{monthlyStats.attendanceRate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-purple-600" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (Grid) */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Users className="text-gray-600" size={20} />
              <div>
                <h2 className="text-xl font-semibold text-primary">Monthly Attendance Grid</h2>
                <p className="text-gray-600 mt-1">
                  Filter grid rows based on <span className="font-bold text-primary">today's</span> status
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg">
              <CustomSelect
                options={filterOptions}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                placeholder="Filter by status..."
              />
            </div>
          </div>
        </div>

        {/* Member Grid */}
        {loadingMembers ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-gray-600">Loading team members...</p>
          </div>
        ) : loadingRecords ? (
           <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-gray-600">Loading attendance records...</p>
          </div>
        ) : (
          <div className="p-2 sm:p-4">
            {filteredMembers.length > 0 ? (
              <AttendanceGrid
                currentMonth={currentMonth}
                members={filteredMembers}
                attendanceData={dailyRecordsMap}
                memberProfileMap={memberProfileMap}
                onStatusChange={handleStatusChange}
                saving={saving}
              />
            ) : (
              <div className="text-center py-16">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">
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
