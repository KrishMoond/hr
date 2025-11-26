import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Plus, Filter, Award, AlertCircle } from 'lucide-react';
import apiService from '../services/api';
import LeaveSummary from './LeaveSummary';

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [leaveBalances, setLeaveBalances] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    type: 'annual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    loadLeaves();
    loadUserData();
  }, [filter]);

  const loadUserData = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      
      // Load leave balances directly
      const balances = await apiService.getLeaveBalances();
      setLeaveBalances(balances);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadLeaves = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await apiService.getLeaves(params);
      setLeaves(data);
    } catch (error) {
      console.error('Failed to load leaves:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.applyLeave(formData);
      setShowForm(false);
      setFormData({ type: 'annual', startDate: '', endDate: '', reason: '' });
      loadLeaves();
      loadUserData(); // Refresh balances
    } catch (error) {
      console.error('Failed to apply leave:', error);
    }
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  const getLeaveTypeInfo = (type: string) => {
    const info = {
      annual: { limit: 14, name: 'Annual Leave' },
      sick: { limit: 10, name: 'Sick Leave' },
      personal: { limit: 5, name: 'Personal Leave' },
      emergency: { limit: 0, name: 'Emergency Leave' }
    };
    return info[type] || { limit: 0, name: type };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Leave Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#4169E1] text-white rounded-lg hover:bg-[#3559d1]"
        >
          <Plus size={20} />
          Apply Leave
        </button>
      </div>

      {/* Leave Balances */}
      {leaveBalances && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-blue-600" size={20} />
              <h3 className="font-semibold text-blue-800">Annual Leave</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">{leaveBalances.annual || 0}</p>
            <p className="text-sm text-blue-600">days remaining</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-green-600" size={20} />
              <h3 className="font-semibold text-green-800">Sick Leave</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">{leaveBalances.sick || 0}</p>
            <p className="text-sm text-green-600">days remaining</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-purple-600" size={20} />
              <h3 className="font-semibold text-purple-800">Personal Leave</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600">{leaveBalances.personal || 0}</p>
            <p className="text-sm text-purple-600">days remaining</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Award className="text-yellow-600" size={20} />
              <h3 className="font-semibold text-yellow-800">Bonus Leave</h3>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{leaveBalances.bonus || 0}</p>
            <p className="text-sm text-yellow-600">bonus days earned</p>
          </div>
        </div>
      )}

      {/* Leave Summary */}
      <LeaveSummary />

      <div className="flex gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Leaves</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="grid gap-4">
        {leaves.map((leave: any) => (
          <div key={leave._id} className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="text-[#4169E1]" size={20} />
                <div>
                  <h3 className="font-semibold capitalize">{leave.type} Leave</h3>
                  <p className="text-sm text-gray-600">{leave.days} days</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(leave.status)}`}>
                {leave.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium">{new Date(leave.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-medium">{new Date(leave.endDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Reason</p>
              <p className="text-gray-800">{leave.reason}</p>
            </div>

            {/* Salary Impact */}
            {leave.status === 'approved' && (
              <div className={`p-3 rounded-lg mb-4 ${
                leave.paid ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
              }`}>
                <div className="flex items-center gap-2">
                  {leave.paid ? (
                    <CheckCircle className="text-green-600" size={16} />
                  ) : (
                    <AlertCircle className="text-orange-600" size={16} />
                  )}
                  <p className={`text-sm font-medium ${
                    leave.paid ? 'text-green-700' : 'text-orange-700'
                  }`}>
                    {leave.paid ? 'Paid Leave - No Salary Deduction' : `Unpaid Days: ${leave.unpaidDays}`}
                  </p>
                </div>
                {!leave.paid && leave.deductionAmount > 0 && (
                  <p className="text-sm text-orange-600 mt-1">
                    Salary Deduction: ₹{leave.deductionAmount}
                  </p>
                )}
              </div>
            )}

            {leave.rejectionReason && (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-600">Rejection Reason: {leave.rejectionReason}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Apply for Leave</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Leave Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="annual">Annual Leave (Available: {leaveBalances?.annual || 0})</option>
                  <option value="sick">Sick Leave (Available: {leaveBalances?.sick || 0})</option>
                  <option value="personal">Personal Leave (Available: {leaveBalances?.personal || 0})</option>
                  <option value="emergency">Emergency Leave (No limit)</option>
                </select>
                {leaveBalances?.bonus > 0 && (
                  <p className="text-sm text-yellow-600 mt-1">
                    + {leaveBalances.bonus} bonus days available
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  required
                />
              </div>

              {/* Leave Impact Preview */}
              {formData.startDate && formData.endDate && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Leave Impact:</p>
                  <p className="text-sm text-gray-600">Duration: {calculateDays()} days</p>
                  {leaveBalances && (
                    <div className="text-sm text-gray-600">
                      {(() => {
                        const days = calculateDays();
                        const available = leaveBalances[formData.type] || 0;
                        const bonus = leaveBalances.bonus || 0;
                        const total = available + bonus;
                        
                        if (days <= available) {
                          return <p className="text-green-600">✓ Fully covered by {formData.type} leave</p>;
                        } else if (days <= total) {
                          return (
                            <div>
                              <p className="text-yellow-600">⚠ Will use {available} {formData.type} + {days - available} bonus days</p>
                            </div>
                          );
                        } else {
                          const unpaid = days - total;
                          return (
                            <div>
                              <p className="text-red-600">⚠ {unpaid} unpaid days - salary will be deducted</p>
                              <p className="text-xs text-red-500">Uses all available leave + bonus days</p>
                            </div>
                          );
                        }
                      })()
                      }
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#4169E1] text-white py-2 rounded-lg hover:bg-[#3559d1]"
                >
                  Submit Application
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}