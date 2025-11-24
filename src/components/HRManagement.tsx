import { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import apiService from '../services/api';

export default function HRManagement() {
  const [activeTab, setActiveTab] = useState('leaves');
  const [leaves, setLeaves] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'leaves') {
        const data = await apiService.getLeaves();
        setLeaves(data);
      } else {
        const data = await apiService.getComplaints();
        setComplaints(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleLeaveAction = async (leaveId: string, status: string, rejectionReason?: string) => {
    try {
      await apiService.updateLeaveStatus(leaveId, { status, rejectionReason });
      loadData();
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to update leave:', error);
    }
  };

  const handleComplaintAction = async (complaintId: string, status: string, resolution?: string) => {
    try {
      await apiService.updateComplaint(complaintId, { status, resolution });
      loadData();
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to update complaint:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': case 'resolved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'investigating': case 'under-review': return 'text-blue-600 bg-blue-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">HR Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'leaves' ? 'bg-[#4169E1] text-white' : 'bg-gray-200'}`}
          >
            Leave Requests
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'complaints' ? 'bg-[#4169E1] text-white' : 'bg-gray-200'}`}
          >
            Complaints
          </button>
        </div>
      </div>

      {activeTab === 'leaves' && (
        <div className="grid gap-4">
          {leaves.map((leave: any) => (
            <div key={leave._id} className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="text-[#4169E1]" size={20} />
                  <div>
                    <h3 className="font-semibold">{leave.employee?.firstName} {leave.employee?.lastName}</h3>
                    <p className="text-sm text-gray-600 capitalize">{leave.type} Leave - {leave.days} days</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(leave.status)}`}>
                  {leave.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </p>
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

              {leave.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleLeaveAction(leave._id, 'approved')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => setSelectedItem(leave)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="grid gap-4">
          {complaints.map((complaint: any) => (
            <div key={complaint._id} className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-[#4169E1] mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold">{complaint.title}</h3>
                    <p className="text-sm text-gray-600">
                      {complaint.isAnonymous ? 'Anonymous' : `${complaint.employee?.firstName} ${complaint.employee?.lastName}`}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{complaint.category} - {complaint.priority} priority</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4">{complaint.description}</p>
              
              <div className="text-sm text-gray-500 mb-4">
                Filed on {new Date(complaint.createdAt).toLocaleDateString()}
              </div>

              {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleComplaintAction(complaint._id, 'under-review')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Under Review
                  </button>
                  <button
                    onClick={() => handleComplaintAction(complaint._id, 'investigating')}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    Investigate
                  </button>
                  <button
                    onClick={() => setSelectedItem(complaint)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Resolve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rejection/Resolution Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {activeTab === 'leaves' ? 'Reject Leave' : 'Resolve Complaint'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const reason = formData.get('reason') as string;
              
              if (activeTab === 'leaves') {
                handleLeaveAction(selectedItem._id, 'rejected', reason);
              } else {
                handleComplaintAction(selectedItem._id, 'resolved', reason);
              }
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  {activeTab === 'leaves' ? 'Rejection Reason' : 'Resolution'}
                </label>
                <textarea
                  name="reason"
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#4169E1] text-white py-2 rounded-lg hover:bg-[#3559d1]"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
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