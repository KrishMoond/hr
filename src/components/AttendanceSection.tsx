import { useState, useEffect } from 'react';
import { Calendar, Users, Clock, CheckCircle, X, Plus } from 'lucide-react';
import apiService from '../services/api';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  position?: string;
  department?: string;
}

interface AttendanceRecord {
  _id: string;
  employee: Employee;
  date: string;
  status: 'present' | 'absent' | 'on-leave' | 'half-day';
  checkIn?: string;
  checkOut?: string;
  hoursWorked: number;
  notes?: string;
  markedBy: { firstName: string; lastName: string };
}

export default function AttendanceSection() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [attendanceForm, setAttendanceForm] = useState({
    status: 'present' as const,
    checkIn: '',
    checkOut: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, [selectedDate]);

  const fetchEmployees = async () => {
    try {
      const response = await apiService.getEmployees();
      // Normalize employees: backend may return combined data with a `user` field
      const raw = response.employees || [];
      const normalized = raw.map((item: any) => {
        const user = item.user || item;
        return {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          position: user.position,
          department: user.department,
          // keep employee-specific fields if present
          employeeId: item.employeeId,
          joinDate: item.joinDate,
          salary: item.salary,
          performance: item.performance,
          status: item.status,
          skills: item.skills || []
        };
      });

      setEmployees(normalized);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAttendance({ date: selectedDate });
      setAttendance(response.attendance || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async () => {
    if (!selectedEmployee) return;

    try {
      // Convert time-only values (HH:MM) to full ISO datetimes using selectedDate
      const buildISO = (time?: string) => {
        if (!time) return undefined;
        // if already ISO-like, return as-is
        if (time.includes('T')) return time;
        return `${selectedDate}T${time}:00`;
      };

      const payload: any = {
        employee: selectedEmployee._id,
        date: selectedDate,
        status: attendanceForm.status,
        notes: attendanceForm.notes || undefined
      };

      if (attendanceForm.checkIn) payload.checkIn = buildISO(attendanceForm.checkIn);
      if (attendanceForm.checkOut) payload.checkOut = buildISO(attendanceForm.checkOut);

      await apiService.markAttendance(payload);
      
      setShowMarkModal(false);
      setSelectedEmployee(null);
      setAttendanceForm({ status: 'present', checkIn: '', checkOut: '', notes: '' });
      fetchAttendance();
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      // show detailed message when available
      const msg = error?.message || (error?.response && error.response.data && error.response.data.message) || 'Error marking attendance';
      alert(msg);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'on-leave': return 'bg-yellow-500';
      case 'half-day': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4" />;
      case 'absent': return <X className="h-4 w-4" />;
      case 'on-leave': return <Calendar className="h-4 w-4" />;
      case 'half-day': return <Clock className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getAttendanceForEmployee = (employeeId: string) => {
    return attendance.find(a => a.employee._id === employeeId);
  };

  const stats = {
    total: employees.length,
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    onLeave: attendance.filter(a => a.status === 'on-leave').length,
    halfDay: attendance.filter(a => a.status === 'half-day').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Attendance Management</h2>
          <p className="text-gray-600">Mark and track employee attendance</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-gray-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <X className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.onLeave}</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Half Day</p>
              <p className="text-2xl font-bold text-blue-600">{stats.halfDay}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Employee Attendance - {new Date(selectedDate).toLocaleDateString()}</h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((employee) => {
                  const empAttendance = getAttendanceForEmployee(employee._id);
                  return (
                    <tr key={employee._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {(employee.firstName && employee.firstName[0]) || ''}{(employee.lastName && employee.lastName[0]) || ''}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.firstName || ''} {employee.lastName || ''}
                            </div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{employee.department || 'N/A'}</td>
                      <td className="px-6 py-4">
                        {empAttendance ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(empAttendance.status)}`}>
                            {getStatusIcon(empAttendance.status)}
                            {empAttendance.status}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Not marked</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {empAttendance?.checkIn ? new Date(empAttendance.checkIn).toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {empAttendance?.checkOut ? new Date(empAttendance.checkOut).toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {empAttendance?.hoursWorked ? `${empAttendance.hoursWorked.toFixed(1)}h` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee);
                            if (empAttendance) {
                              setAttendanceForm({
                                status: empAttendance.status,
                                checkIn: empAttendance.checkIn ? new Date(empAttendance.checkIn).toTimeString().slice(0, 5) : '',
                                checkOut: empAttendance.checkOut ? new Date(empAttendance.checkOut).toTimeString().slice(0, 5) : '',
                                notes: empAttendance.notes || ''
                              });
                            }
                            setShowMarkModal(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4" />
                          {empAttendance ? 'Edit' : 'Mark'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Attendance Modal */}
      {showMarkModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Mark Attendance - {selectedEmployee.firstName} {selectedEmployee.lastName}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={attendanceForm.status}
                  onChange={(e) => setAttendanceForm({...attendanceForm, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="on-leave">On Leave</option>
                  <option value="half-day">Half Day</option>
                </select>
              </div>
              
              {attendanceForm.status === 'present' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Check In</label>
                    <input
                      type="time"
                      value={attendanceForm.checkIn}
                      onChange={(e) => setAttendanceForm({...attendanceForm, checkIn: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Check Out</label>
                    <input
                      type="time"
                      value={attendanceForm.checkOut}
                      onChange={(e) => setAttendanceForm({...attendanceForm, checkOut: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={attendanceForm.notes}
                  onChange={(e) => setAttendanceForm({...attendanceForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Optional notes..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowMarkModal(false);
                  setSelectedEmployee(null);
                  setAttendanceForm({ status: 'present', checkIn: '', checkOut: '', notes: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={markAttendance}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}