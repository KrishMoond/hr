import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, User, Award, AlertTriangle } from 'lucide-react';
import apiService from '../services/api';

export default function EmployeeLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [filter, setFilter] = useState('all');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
    loadLeaves();
  }, [selectedEmployee, filter]);

  const loadEmployees = async () => {
    try {
      const data = await apiService.getEmployees();
      // API may return an object with pagination: { employees: [...], total, currentPage }
      const list = Array.isArray(data) ? data : (data && data.employees ? data.employees : []);
      setEmployees(list);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const loadLeaves = async () => {
    try {
      const params = {};
      if (selectedEmployee) params.employee = selectedEmployee;
      if (filter !== 'all') params.status = filter;
      
      const data = await apiService.getLeaves(params);
      setLeaves(data);
    } catch (error) {
      console.error('Failed to load leaves:', error);
    }
  };

  const handleApproval = async (leaveId: string, status: string) => {
    setLoading(true);
    try {
      const updateData = { status };
      if (status === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      
      console.log('Updating leave:', leaveId, updateData);
      const result = await apiService.updateLeaveStatus(leaveId, updateData);
      console.log('Update result:', result);
      
      setShowApprovalModal(false);
      setSelectedLeave(null);
      setRejectionReason('');
      loadLeaves();
      
      alert(`Leave ${status} successfully!`);
    } catch (error) {
      console.error('Failed to update leave status:', error);
      console.error('Error details:', error);
      alert(`Failed to ${status} leave: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="text-green-600" size={16} />;
      case 'rejected': return <XCircle className="text-red-600" size={16} />;
      default: return <Clock className="text-yellow-600" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Employee Leave Management</h2>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Employees</option>
          {employees.map((emp: any) => (
            <option key={emp._id} value={emp.user?._id}>
              {emp.user?.firstName} {emp.user?.lastName} - {emp.employeeId}
            </option>
          ))}
        </select>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Leave Applications */}
      <div className="grid gap-4">
        {leaves.map((leave: any) => (
          <div key={leave._id} className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <User className="text-[#4169E1]" size={20} />
                <div>
                  <h3 className="font-semibold">
                    {leave.employee?.firstName} {leave.employee?.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {leave.type} Leave - {leave.days} days
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize flex items-center gap-1 ${getStatusColor(leave.status)}`}>
                  {getStatusIcon(leave.status)}
                  {leave.status}
                </span>
                {leave.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproval(leave._id, 'approved')}
                      disabled={loading}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLeave(leave);
                        setShowApprovalModal(true);
                      }}
                      disabled={loading}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium">{new Date(leave.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-medium">{new Date(leave.endDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Applied On</p>
                <p className="font-medium">{new Date(leave.createdAt).toLocaleDateString()}</p>
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
                    <AlertTriangle className="text-orange-600" size={16} />
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

            {leave.approvedBy && (
              <div className="text-sm text-gray-500 mt-2">
                {leave.status === 'approved' ? 'Approved' : 'Rejected'} by {leave.approvedBy.firstName} {leave.approvedBy.lastName} 
                {leave.approvedAt && ` on ${new Date(leave.approvedAt).toLocaleDateString()}`}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rejection Modal */}
      {showApprovalModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Leave Application</h3>
            <p className="text-gray-600 mb-4">
              Rejecting leave for {selectedLeave.employee?.firstName} {selectedLeave.employee?.lastName}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleApproval(selectedLeave._id, 'rejected')}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={!rejectionReason.trim() || loading}
              >
                {loading ? 'Processing...' : 'Reject Leave'}
              </button>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedLeave(null);
                  setRejectionReason('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}