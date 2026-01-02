import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, X, TrendingUp } from 'lucide-react';
import apiService from '../services/api';

interface AttendanceRecord {
  _id: string;
  date: string;
  status: 'present' | 'absent' | 'on-leave' | 'half-day';
  checkIn?: string;
  checkOut?: string;
  hoursWorked: number;
  notes?: string;
}

interface AttendanceStats {
  totalDays: number;
  present: number;
  absent: number;
  onLeave: number;
  halfDay: number;
  totalHours: number;
}

export default function MyAttendanceWidget() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalDays: 0,
    present: 0,
    absent: 0,
    onLeave: 0,
    halfDay: 0,
    totalHours: 0
  });

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const [nowTime, setNowTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

  // Live clock and periodic refresh for today's attendance
  useEffect(() => {
    const t = setInterval(() => setNowTime(new Date()), 1000);
    const refresh = setInterval(() => {
      fetchMyAttendance();
    }, 60000); // refresh every minute to keep in sync with current time

    return () => {
      clearInterval(t);
      clearInterval(refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyAttendance({
        month: selectedMonth,
        year: selectedYear
      });

      setAttendance(response?.attendance ?? []);
      setStats(response?.stats ?? stats);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-100';
      case 'absent':
        return 'text-red-600 bg-red-100';
      case 'on-leave':
        return 'text-yellow-600 bg-yellow-100';
      case 'half-day':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4" />;
      case 'absent':
        return <X className="h-4 w-4" />;
      case 'on-leave':
        return <Calendar className="h-4 w-4" />;
      case 'half-day':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendance.find(
      (a) => a.date.split('T')[0] === today
    );
  };

  const todayAttendance = getTodayAttendance();
  const attendancePercentage =
    stats.totalDays > 0
      ? ((stats.present + stats.halfDay * 0.5) / stats.totalDays) * 100
      : 0;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          My Attendance
        </h3>

        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={() => {
              const now = new Date();
              setSelectedMonth(now.getMonth() + 1);
              setSelectedYear(now.getFullYear());
              fetchMyAttendance();
            }}
            className="ml-2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            title="Sync calendar to current time"
          >
            Sync to Now
          </button>
        </div>
      </div>

      {/* Today's Status */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-600 mb-2">
          Today&apos;s Status
        </h4>

        <div className="text-xs text-gray-400 mb-2">Current time: {nowTime.toLocaleTimeString()}</div>

        {todayAttendance ? (
          <div
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${getStatusColor(
              todayAttendance.status
            )}`}
          >
            {getStatusIcon(todayAttendance.status)}
            <span className="font-medium capitalize">
              {todayAttendance.status.replace('-', ' ')}
            </span>
            {todayAttendance.checkIn && (
              <span className="text-sm">
                •{' '}
                {new Date(
                  todayAttendance.checkIn
                ).toLocaleTimeString()}
              </span>
            )}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">
            Not marked yet
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.present}
          </div>
          <div className="text-xs text-gray-500">
            Present Days
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {attendancePercentage.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">
            Attendance Rate
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalHours.toFixed(1)}h
          </div>
          <div className="text-xs text-gray-500">
            Total Hours
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.onLeave}
          </div>
          <div className="text-xs text-gray-500">
            Leave Days
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Monthly Progress
          </span>
          <span className="text-sm text-gray-500">
            {stats.present}/{stats.totalDays} days
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
            style={{ width: `${attendancePercentage}%` }}
          />
        </div>
      </div>

      {/* Recent Attendance */}
     <div>
  <h4 className="text-sm font-medium text-gray-600 mb-3">
    Recent Days
  </h4>

  <div className="space-y-2 max-h-32 overflow-y-auto">
    {attendance.slice(0, 5).map((record) => {
      const isToday =
        record.date.split('T')[0] === new Date().toISOString().split('T')[0];

      return (
        <div
          key={record._id}
          className={`flex items-center justify-between py-1 ${
            isToday ? 'bg-gray-50 rounded px-2' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`p-1 rounded ${getStatusColor(record.status)}`}
            >
              {getStatusIcon(record.status)}
            </div>

            <span className="text-sm text-gray-700">
              {new Date(record.date).toLocaleDateString()}
            </span>
          </div>

          <div className="text-xs text-gray-500">
            {record.hoursWorked > 0 &&
              `${record.hoursWorked.toFixed(1)}h`}
          </div>
        </div>
      );
    })}
  </div>
</div>
      {/* Performance Indicator */}
      {attendancePercentage >= 90 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">
              Excellent Attendance!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
