import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig'; //
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
  Lock, // <-- Import Lock icon
  MinusCircle
} from 'lucide-react';
import format from 'date-fns/format';
import Input from '../components/Input'; //
import ExportAttendanceModal from '../components/ExportAttendanceModal';
import CustomSelect from '../components/CustomSelect';

const NOT_SET = 'Due';

const filterOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'Present', label: 'Present' },
  { value: 'Absent', label: 'Absent' },
  { value: 'Leave', label: 'Leave' },
  { value: 'Holiday', label: 'Holiday' },
  { value: 'Due', label: 'Due' },
];

const statusOptions = [
  { value: 'Present', label: 'Mark Present' },
  { value: 'Absent', label: 'Mark Absent' },
  { value: 'Leave', label: 'Mark Leave' },
  { value: 'Holiday', label: 'Mark Holiday' },
  { value: NOT_SET, label: 'Select Status...', disabled: true },
];

const getTodayString = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

const StatusBadge = ({ status, size = "medium" }) => {
  // ... (This component is unchanged from your provided code)
  const statusConfig = {
    Present: { color: 'bg-green-500', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: CheckCircle },
    Absent: { color: 'bg-red-500', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: XCircle },
    Leave: { color: 'bg-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: Umbrella },
    Holiday: { color: 'bg-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: Clock },
    'Due': { color: 'bg-gray-400', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', icon: MinusCircle },
  };
  const config = statusConfig[status] || statusConfig.Present;
  const Icon = config.icon;
  if (size === "small") {
    return (<div className={`w-3 h-3 rounded-full ${config.color} border-2 border-white shadow-sm`} title={status} />);
  }

  return (
    <span className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-medium border ${config.bg} ${config.border} ${config.text}`}>
      <Icon size={16} />
      <p>{status}</p>
    </span>
  );
};

const AttendancePage = () => {
  // --- UPDATED: members state now holds objects ---
  const [members, setMembers] = useState([]); // Will be [{ name, joiningDate, endingDate }, ...]
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [saving, setSaving] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch all members (with profile data) once on component mount
  useEffect(() => {
    const fetchMembers = async () => {
      setLoadingMembers(true);
      setLoadingError(null);
      try {
        const res = await api.get('/attendance/members');
        setMembers(res.data);
      } catch (err) {
        setLoadingError(err.response?.data?.message || 'Failed to fetch team members.');
      }
      setLoadingMembers(false);
    };
    fetchMembers();
  }, []);

  // Fetch attendance records whenever the date or member list changes
  useEffect(() => {
    if (members.length === 0) return;

    const fetchDailyRecords = async () => {
      setLoadingRecords(true);
      setLoadingError(null);
      setUpdateError(null);

      try {
        const res = await api.get(`/attendance/date?date=${selectedDate}`);

        const recordsMap = {};
        members.forEach(member => {
          // --- THIS IS THE FIX ---
          // Default to "Not Set" instead of "Present"
          recordsMap[member.name] = NOT_SET;
        });

        res.data.forEach(record => {
          if (recordsMap[record.member] !== undefined) {
            recordsMap[record.member] = record.status;
          }
        });

        setAttendanceRecords(recordsMap);
      } catch (err) {
        setLoadingError(err.response?.data?.message || 'Failed to fetch attendance data.');
      }
      setLoadingRecords(false);
    };

    fetchDailyRecords();
  }, [selectedDate, members]);

  // Handle changing a member's status
  const handleStatusChange = async (member, status) => {
    if (status === NOT_SET) return;
    const saveKey = `${member.name}-${selectedDate}`;
    setSaving(prev => ({ ...prev, [saveKey]: true }));
    setUpdateError(null);

    // Optimistic UI update
    setAttendanceRecords(prev => ({ ...prev, [member.name]: status }));

    try {
      await api.post('/attendance', {
        date: selectedDate,
        member: member.name,
        status,
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      setUpdateError(`Failed to save ${member.name}'s status. Please try again.`);
      setAttendanceRecords(prev => ({ ...prev, [member.name]: attendanceRecords[member.name] }));
    } finally {
      setSaving(prev => ({ ...prev, [saveKey]: false }));
    }
  };

  // Get attendance statistics
  const getAttendanceStats = () => {
    const stats = { Present: 0, Absent: 0, Leave: 0, Holiday: 0, total: members.length };
    Object.values(attendanceRecords).forEach(status => {
      if (stats[status] !== undefined) {
        stats[status]++;
      } else {
        stats['Due']++; // Fallback for any other unexpected status
      }
    });
    return stats;
  };

  // --- UPDATED: Filter members by name ---
  const filteredMembers = members.filter(member => {
    if (statusFilter === 'all') return true;
    return attendanceRecords[member.name] === statusFilter;
  });

  const stats = getAttendanceStats();
  const formattedDate = format(new Date(selectedDate), 'EEEE, MMMM dd, yyyy');

  return (
    <div className="space-y-8">
      {/* ... (Header and Error sections are unchanged) ... */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Attendance Management</h1>
          <p className="text-gray-600">Track and manage team attendance in real-time</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setIsExportModalOpen(true)} // <-- CHANGE onClick
            className="flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            <Download size={18} />
            <span>Export Report</span>
          </button>
          <div className="relative">
            <Input
              icon={<Calendar size={18} className="text-gray-400" />}
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="min-w-[200px]"
            />
          </div>
        </div>
      </div>
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

      {/* ... (Statistics Cards are unchanged) ... */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Present Card */}
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
        {/* Absent Card */}
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
        {/* Leave Card */}
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
        {/* Holiday Card */}
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
              <p className="text-2xl font-bold text-gray-900">{stats['Due']}</p>
              <p className="text-sm text-gray-600">Due</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <MinusCircle className="text-gray-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* ... (Header and Filter are unchanged) ... */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Team Attendance</h2>
              <p className="text-gray-600 mt-1">{formattedDate}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center space-x-2">
                <Filter size={18} className="text-gray-400" />
                <CustomSelect
                  options={filterOptions}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                />
              </div>
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600">
                {filteredMembers.length} of {members.length} members
              </div>
            </div>
          </div>
        </div>

        {/* Member List */}
        {loadingMembers || loadingRecords ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="animate-spin text-gray-900" size={32} />
            <p className="text-gray-600">
              {loadingMembers ? 'Loading team members...' : 'Loading attendance records...'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
                // --- THIS IS THE NEW LOGIC ---
                const { name, joiningDate, endingDate } = member;
                const status = attendanceRecords[name] || NOT_SET;
                const saveKey = `${name}-${selectedDate}`;

                // Convert selectedDate (string) to a Date object at start of day
                const selectedDay = new Date(selectedDate);
                selectedDay.setHours(0, 0, 0, 0);

                let isDisabled = false;
                let message = null;

                // Check joining date
                if (joiningDate) {
                  const joinDay = new Date(joiningDate);
                  joinDay.setHours(0, 0, 0, 0);
                  if (selectedDay < joinDay) {
                    isDisabled = true;
                    message = "Not Joined Yet";
                  }
                }

                // Check ending date
                if (endingDate) {
                  const endDay = new Date(endingDate);
                  endDay.setHours(0, 0, 0, 0);
                  if (selectedDay > endDay) {
                    isDisabled = true;
                    message = "Journey Ended";
                  }
                }
                // --- END NEW LOGIC ---

                return (
                  <div
                    key={name}
                    className={`p-6 transition-colors duration-150 ${isDisabled ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Member Info */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDisabled ? 'bg-gray-200' : 'bg-gray-900'}`}>
                          <span className={`text-2xl font-medium ${isDisabled ? 'text-gray-500' : 'text-white'}`}>
                            {name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className={`text-lg font-semibold truncate ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                            {name}
                          </h3>
                          <p className="text-sm text-gray-600">Team Member</p>
                        </div>
                      </div>

                      {/* Status Controls */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="sm:hidden">
                          {!isDisabled && <StatusBadge status={status} />}
                        </div>

                        <div className="flex items-center space-x-3">
                          {saving[saveKey] ? (
                            <div className="flex items-center space-x-2 text-gray-500">
                              <Loader2 size={16} className="animate-spin" />
                              <span className="text-sm">Saving...</span>
                            </div>
                          ) : (
                            <>
                              {/* --- NEW LOGIC: Show message or dropdown --- */}
                              {isDisabled ? (
                                <div className="flex items-center space-x-2 text-gray-500">
                                  <Lock size={16} />
                                  <span className="text-sm font-medium">{message}</span>
                                </div>
                              ) : (
                                <>
                                  <div className="hidden sm:block">
                                    <StatusBadge status={status} />
                                  </div>
                                  <CustomSelect
                                    options={statusOptions}
                                    // If status is "Not Set", show the placeholder
                                    value={status === NOT_SET ? NOT_SET : status}
                                    onChange={(newStatus) => handleStatusChange(member, newStatus)}
                                  />
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // ... (No members found message is unchanged) ...
              <div className="text-center py-16">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {statusFilter === 'all' ? 'No team members' : 'No members found'}
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  {statusFilter === 'all'
                    ? 'Add members to your teams to start tracking attendance.'
                    : `No members with ${statusFilter.toLowerCase()} status found.`
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ... (Quick Actions Footer is unchanged) ... */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Quick Actions</h3>
            <p className="text-sm text-gray-600">Mark all filtered members at once (this will not affect locked members)</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['Present', 'Absent', 'Leave', 'Holiday'].map(action => (
              <button
                key={action}
                onClick={() => {
                  filteredMembers.forEach(member => {
                    // --- UPDATED: Only update if not disabled ---
                    const selectedDay = new Date(selectedDate);
                    selectedDay.setHours(0, 0, 0, 0);
                    let isDisabled = false;
                    if (member.joiningDate) {
                      const joinDay = new Date(member.joiningDate);
                      joinDay.setHours(0, 0, 0, 0);
                      if (selectedDay < joinDay) isDisabled = true;
                    }
                    if (member.endingDate) {
                      const endDay = new Date(member.endingDate);
                      endDay.setHours(0, 0, 0, 0);
                      if (selectedDay > endDay) isDisabled = true;
                    }

                    if (!isDisabled && attendanceRecords[member.name] !== action) {
                      handleStatusChange(member, action);
                    }
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors duration-200"
              >
                Mark All as {action}
              </button>
            ))}
          </div>
        </div>
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
