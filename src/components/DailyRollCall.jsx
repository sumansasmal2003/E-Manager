import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Loader2,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Users,
  Calendar
} from 'lucide-react';
import api from '../api/axiosConfig';
import StatusSelect from './StatusSelect';

// Constants
const STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LEAVE: 'Leave',
  HOLIDAY: 'Holiday',
  NOT_SET: 'Due'
};

const getTodayString = () => format(new Date(), 'yyyy-MM-dd');

// Custom hook for attendance management
const useAttendance = () => {
  const [state, setState] = useState({
    members: [],
    records: new Map(),
    loading: true,
    saving: new Map(),
    error: null
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const today = getTodayString();
      const [membersRes, recordsRes] = await Promise.all([
        api.get('/attendance/members'),
        api.get(`/attendance/date?date=${today}`)
      ]);

      const recordsMap = new Map();
      if (recordsRes.data) {
        recordsRes.data.forEach(record => {
          recordsMap.set(record.member, record.status);
        });
      }

      setState(prev => ({
        ...prev,
        members: membersRes.data || [],
        records: recordsMap,
        loading: false
      }));

    } catch (err) {
      console.error('Failed to fetch attendance data:', err);
      setState(prev => ({
        ...prev,
        error: err.response?.data?.message || 'Unable to load attendance data. Please try again.',
        loading: false
      }));
    }
  }, []);

  const updateStatus = useCallback(async (memberName, status) => {
    if (status === STATUS.NOT_SET) return;

    // Optimistic update
    setState(prev => ({
      ...prev,
      saving: new Map(prev.saving).set(memberName, true),
      records: new Map(prev.records).set(memberName, status)
    }));

    try {
      await api.post('/attendance', {
        date: getTodayString(),
        member: memberName,
        status,
      });
    } catch (err) {
      console.error(`Failed to update ${memberName}'s status:`, err);

      // Revert on error
      setState(prev => ({
        ...prev,
        error: `Failed to save ${memberName}'s attendance. Please try again.`
      }));

      // Refetch to restore correct state
      setTimeout(fetchData, 1000);
    } finally {
      setState(prev => {
        const newSaving = new Map(prev.saving);
        newSaving.delete(memberName);
        return { ...prev, saving: newSaving };
      });
    }
  }, [fetchData]);

  return {
    ...state,
    fetchData,
    updateStatus
  };
};

const LoadingState = () => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 h-64 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="animate-spin text-blue-600 mx-auto mb-3" size={28} />
      <p className="text-sm font-medium text-gray-600">Loading Daily Roll Call</p>
      <p className="text-xs text-gray-500 mt-1">Please wait while we load the attendance data</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="bg-red-50 rounded-xl border border-red-200 p-6">
    <div className="flex items-start gap-3">
      <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">Unable to Load Data</p>
        <p className="text-sm text-red-700 mt-1">{error}</p>
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12 px-6">
    <Users className="mx-auto text-gray-300 mb-4" size={48} />
    <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Members</h3>
    <p className="text-gray-500 text-sm max-w-sm mx-auto">
      Get started by adding team members to track their daily attendance and manage schedules.
    </p>
  </div>
);

const MemberRow = React.memo(({ member, status, isSaving, onStatusChange }) => {
  const initials = member.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  return (
    <div className="group p-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors duration-150">
      {/* Member Information */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center border border-blue-200/50 flex-shrink-0">
          <span className="text-sm font-semibold text-blue-700">
            {initials}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {member.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {member.department || 'General Team'}
          </p>
        </div>
      </div>

      {/* Status Selector */}
      <div className="flex-shrink-0 w-[160px]">
        {isSaving ? (
          <div className="flex items-center justify-center h-10 bg-gray-50 rounded-lg border border-gray-200">
            <Loader2 className="animate-spin text-gray-400" size={18} />
          </div>
        ) : (
          <StatusSelect
            status={status || STATUS.NOT_SET}
            onChange={(newStatus) => onStatusChange(member.name, newStatus)}
            size="medium"
          />
        )}
      </div>
    </div>
  );
});

const DailyRollCall = () => {
  const {
    members,
    records,
    loading,
    saving,
    error,
    fetchData,
    updateStatus
  } = useAttendance();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate attendance statistics
  const stats = useMemo(() => {
    const total = members.length;
    const present = Array.from(records.values()).filter(
      status => status === STATUS.PRESENT
    ).length;
    const marked = Array.from(records.values()).filter(
      status => status !== STATUS.NOT_SET
    ).length;

    return { total, present, marked };
  }, [members, records]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <UserCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Daily Roll Call</h1>
              <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5">
                <Calendar size={14} />
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <div className="font-semibold text-gray-900">{stats.present} / {stats.total}</div>
              <div className="text-gray-500">Present</div>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">{stats.marked} / {stats.total}</div>
              <div className="text-gray-500">Marked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Member List */}
      <div className="max-h-[480px] overflow-y-auto">
        {members.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {members.map(member => (
              <MemberRow
                key={member.name}
                member={member}
                status={records.get(member.name)}
                isSaving={saving.get(member.name)}
                onStatusChange={updateStatus}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Last updated: {format(new Date(), 'h:mm a')}
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={12} />
            Auto-saves changes
          </span>
        </div>
      </div>
    </div>
  );
};

export default DailyRollCall;
