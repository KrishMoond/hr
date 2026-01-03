import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, X, TrendingUp, BarChart3, Flame, MapPin } from 'lucide-react';
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyAttendance();
  }, [selectedMonth, selectedYear]);

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyAttendance({
        month: selectedMonth,
        year: selectedYear
      });
      setAttendance(response.attendance || []);
      setStats(response.stats || stats);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-700 bg-green-100 border-green-200';
      case 'absent': return 'text-red-700 bg-red-100 border-red-200';
      case 'on-leave': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'half-day': return 'text-blue-700 bg-blue-100 border-blue-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-5 w-5" />;
      case 'absent': return <X className="h-5 w-5" />;
      case 'on-leave': return <MapPin className="h-5 w-5" />;
      case 'half-day': return <Clock className="h-5 w-5" />;
      default: return null;
    }
  };

  const getTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendance.find(a => a.date.split('T')[0] === today);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateWorkingTime = (checkIn: string) => {
    const start = new Date(checkIn);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const calculateStreak = () => {
    let streak = 0;
    const sortedAttendance = [...attendance]
      .filter(a => a.status === 'present' || a.status === 'half-day')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (let i = 0; i < sortedAttendance.length; i++) {
      const date = new Date(sortedAttendance[i].date);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (date.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const todayAttendance = getTodayAttendance();
  const attendancePercentage = stats.totalDays > 0 ? ((stats.present + stats.halfDay * 0.5) / stats.totalDays * 100) : 0;
  const streak = calculateStreak();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">My Attendance</h3>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          {months.map((month, index) => (
            <option key={index} value={index + 1}>{month.slice(0, 3)}</option>
          ))}
        </select>
      </div>

      {/* Today's Status */}
      <div className="mb-4">
        {todayAttendance ? (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`p-2 rounded-lg ${getStatusColor(todayAttendance.status)}`}>
              {getStatusIcon(todayAttendance.status)}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 capitalize">
                {todayAttendance.status.replace('-', ' ')}
              </div>
              {todayAttendance.checkIn && (
                <div className="text-xs text-gray-500">
                  {formatTime(todayAttendance.checkIn)} • {calculateWorkingTime(todayAttendance.checkIn)}
                </div>
              )}
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 text-orange-600">
                <Flame className="h-3 w-3" />
                <span className="text-xs font-medium">{streak}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-3 text-gray-400 text-sm">Not marked today</div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-700">{stats.present}</div>
          <div className="text-xs text-green-600">Present</div>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-700">{attendancePercentage.toFixed(0)}%</div>
          <div className="text-xs text-blue-600">Rate</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>This month</span>
          <span>{stats.present}/{stats.totalDays}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(attendancePercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Recent Days */}
      <div>
        <div className="text-xs font-medium text-gray-600 mb-2">Recent</div>
        <div className="space-y-1">
          {attendance.slice(0, 3).map((record) => {
            const isToday = record.date.split('T')[0] === new Date().toISOString().split('T')[0];
            return (
              <div key={record._id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(record.status).split(' ')[1]}`}></div>
                  <span className="text-xs text-gray-700">
                    {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {isToday && <span className="ml-1 text-blue-600 font-medium">Today</span>}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {record.hoursWorked > 0 ? `${record.hoursWorked.toFixed(1)}h` : '-'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement */}
      {attendancePercentage >= 90 && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <TrendingUp className="h-3 w-3" />
            <span className="text-xs font-medium">Great attendance! 🎉</span>
          </div>
        </div>
      )}
    </div>
  );
}
