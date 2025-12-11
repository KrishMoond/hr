import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Plus, Filter, Search, Eye, CheckCircle, XCircle, 
  AlertTriangle, TrendingUp, Users, FileText, Award, Edit, Trash2
} from 'lucide-react';
import apiService from '../services/api';

interface Leave {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  paid: boolean;
  unpaidDays?: number;
  deductionAmount?: number;
  createdAt: string;
  approvedBy?: {
    firstName: string;
    lastName: string;
  };
  rejectionReason?: string;
}

interface UnifiedLeaveManagementProps {
  user: any;
}

const UnifiedLeaveManagement: React.FC<UnifiedLeaveManagementProps> = ({ user }) => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [formData, setFormData] = useState({
    type: 'annual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'hr';

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterLeaves();
  }, [leaves, searchTerm, statusFilter, typeFilter]);

  const loadData = async () => {
    try {
      const leavesData = await apiService.getLeaves();
      const filteredData = isAdmin ? leavesData : leavesData.filter((l: Leave) => l.employee._id === user._id);
      setLeaves(filteredData);
      calculateStats(filteredData);

      if (!isAdmin) {
        const balances = await apiService.getLeaveBalances();
        setLeaveBalances(balances);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (leaveData: Leave[]) => {
    const stats = {
      total: leaveData.length,
      pending: leaveData.filter(l => l.status === 'pending').length,
      approved: leaveData.filter(l => l.status === 'approved').length,
      rejected: leaveData.filter(l => l.status === 'rejected').length
    };
    setStats(stats);
  };

  const filterLeaves = () => {
    let filtered = leaves;

    if (searchTerm) {
      filtered = filtered.filter(leave =>
        leave.employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(leave => leave.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(leave => leave.type === typeFilter);
    }

    setFilteredLeaves(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.applyLeave(formData);
      setShowForm(false);
      setFormData({ type: 'annual', startDate: '', endDate: '', reason: '' });
      loadData();
    } catch (error) {
      console.error('Failed to apply leave:', error);
    }
  };

  const handleStatusUpdate = async (leaveId: string, status: string, rejectionReason?: string) => {
    try {
      await apiService.updateLeaveStatus(leaveId, { status, rejectionReason });
      loadData();
      setSelectedLeave(null);
    } catch (error) {
      console.error('Failed to update leave status:', error);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Leave Management' : 'My Leaves'}
          </h2>
          <p className="text-gray-600 mt-1">
            {isAdmin ? 'Manage and track employee leave requests' : 'Apply for and track your leave requests'}
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Apply Leave
          </button>
        )}
      </div>

      {/* Employee Leave Balances */}
      {!isAdmin && leaveBalances && (
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Filter & Search</h3>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          {isAdmin && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by employee name or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Types</option>
              <option value="annual">Annual</option>
              <option value="sick">Sick</option>
              <option value="personal">Personal</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaves List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Leave Requests</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredLeaves.map((leave) => (
            <div key={leave._id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {isAdmin && (
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {leave.employee.firstName[0]}{leave.employee.lastName[0]}
                      </div>
                    </div>
                  )}
                  <div>
                    {isAdmin && (
                      <h4 className="text-lg font-medium text-gray-900">
                        {leave.employee.firstName} {leave.employee.lastName}
                      </h4>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="capitalize font-medium">{leave.type} Leave</span>
                      <span>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</span>
                      <span>{leave.days} days</span>
                    </div>
                    <p className="text-gray-800 mt-1">{leave.reason}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    {getStatusIcon(leave.status)}
                    <span className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </div>
                  
                  {isAdmin && leave.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusUpdate(leave._id, 'approved')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setSelectedLeave(leave)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {leave.paid === false && leave.deductionAmount && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-700">
                    Unpaid Days: {leave.unpaidDays} | Salary Deduction: ₹{leave.deductionAmount}
                  </p>
                </div>
              )}
              
              {leave.rejectionReason && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">Rejection Reason: {leave.rejectionReason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Apply Leave Form */}
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
                  <option value="emergency">Emergency Leave</option>
                </select>
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

              {formData.startDate && formData.endDate && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Duration: {calculateDays()} days</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
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

      {/* Rejection Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Leave Request</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const reason = (e.target as any).reason.value;
              handleStatusUpdate(selectedLeave._id, 'rejected', reason);
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Rejection Reason</label>
                <textarea
                  name="reason"
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  required
                  placeholder="Please provide a reason for rejection..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                >
                  Reject Leave
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLeave(null)}
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
};

export default UnifiedLeaveManagement;