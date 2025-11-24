import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Plus, Filter } from 'lucide-react';
import apiService from '../services/api';

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    type: 'annual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    loadLeaves();
  }, [filter]);

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
    } catch (error) {
      console.error('Failed to apply leave:', error);
    }
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
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
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