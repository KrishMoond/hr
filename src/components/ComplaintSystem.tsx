import { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Eye, MessageSquare } from 'lucide-react';
import apiService from '../services/api';

export default function ComplaintSystem() {
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'workplace',
    priority: 'medium',
    isAnonymous: false
  });

  useEffect(() => {
    loadComplaints();
  }, [filter]);

  const loadComplaints = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await apiService.getComplaints(params);
      setComplaints(data);
    } catch (error) {
      console.error('Failed to load complaints:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.fileComplaint(formData);
      setShowForm(false);
      setFormData({ title: '', description: '', category: 'workplace', priority: 'medium', isAnonymous: false });
      loadComplaints();
    } catch (error) {
      console.error('Failed to file complaint:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'investigating': return 'text-blue-600 bg-blue-100';
      case 'under-review': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Complaint System</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#4169E1] text-white rounded-lg hover:bg-[#3559d1]"
        >
          <Plus size={20} />
          File Complaint
        </button>
      </div>

      <div className="flex gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Complaints</option>
          <option value="submitted">Submitted</option>
          <option value="under-review">Under Review</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="grid gap-4">
        {complaints.map((complaint: any) => (
          <div key={complaint._id} className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-[#4169E1] mt-1" size={20} />
                <div>
                  <h3 className="font-semibold">{complaint.title}</h3>
                  <p className="text-sm text-gray-600 capitalize">{complaint.category}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getPriorityColor(complaint.priority)}`}>
                  {complaint.priority}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">{complaint.description}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Filed on {new Date(complaint.createdAt).toLocaleDateString()}</span>
              {complaint.updates?.length > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare size={16} />
                  {complaint.updates.length} updates
                </span>
              )}
            </div>

            {complaint.resolution && (
              <div className="mt-4 bg-green-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-green-800">Resolution:</p>
                <p className="text-green-700">{complaint.resolution}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">File a Complaint</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="workplace">Workplace Issue</option>
                  <option value="harassment">Harassment</option>
                  <option value="discrimination">Discrimination</option>
                  <option value="management">Management</option>
                  <option value="facilities">Facilities</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({...formData, isAnonymous: e.target.checked})}
                />
                <label htmlFor="anonymous" className="text-sm">File anonymously</label>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#4169E1] text-white py-2 rounded-lg hover:bg-[#3559d1]"
                >
                  Submit Complaint
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