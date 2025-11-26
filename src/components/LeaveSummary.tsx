import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Award, AlertCircle } from 'lucide-react';
import apiService from '../services/api';

export default function LeaveSummary() {
  const [leaveStats, setLeaveStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaveStats();
  }, []);

  const loadLeaveStats = async () => {
    try {
      const [leaves, balances] = await Promise.all([
        apiService.getLeaves(),
        apiService.getLeaveBalances()
      ]);

      const currentYear = new Date().getFullYear();
      const yearLeaves = leaves.filter(leave => 
        new Date(leave.createdAt).getFullYear() === currentYear
      );

      const stats = {
        totalTaken: yearLeaves.filter(l => l.status === 'approved').length,
        pending: leaves.filter(l => l.status === 'pending').length,
        rejected: leaves.filter(l => l.status === 'rejected').length,
        balances,
        recentLeaves: leaves.slice(0, 3)
      };

      setLeaveStats(stats);
    } catch (error) {
      console.error('Failed to load leave stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
  }

  if (!leaveStats) {
    return <div className="text-center text-gray-500">Failed to load leave statistics</div>;
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calendar className="text-[#4169E1]" size={20} />
        Leave Summary
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{leaveStats.totalTaken}</div>
          <div className="text-sm text-blue-600">Taken This Year</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{leaveStats.pending}</div>
          <div className="text-sm text-yellow-600">Pending</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{leaveStats.rejected}</div>
          <div className="text-sm text-red-600">Rejected</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {(leaveStats.balances?.annual || 0) + (leaveStats.balances?.sick || 0) + (leaveStats.balances?.personal || 0)}
          </div>
          <div className="text-sm text-green-600">Available</div>
        </div>
      </div>

      {leaveStats.balances?.bonus > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <Award className="text-yellow-600" size={20} />
            <div>
              <h4 className="font-semibold text-yellow-800">Bonus Leaves Earned!</h4>
              <p className="text-sm text-yellow-700">
                You have {leaveStats.balances.bonus} bonus leave days for consistent attendance.
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h4 className="font-medium mb-3">Recent Applications</h4>
        <div className="space-y-2">
          {leaveStats.recentLeaves.map((leave: any) => (
            <div key={leave._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <span className="font-medium capitalize">{leave.type}</span>
                <span className="text-sm text-gray-600 ml-2">
                  {new Date(leave.startDate).toLocaleDateString()}
                </span>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {leave.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}