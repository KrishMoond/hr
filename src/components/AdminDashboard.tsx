import React, { useState, useEffect } from 'react';
import { Users, Briefcase, AlertTriangle, TrendingUp, Calendar, MessageSquare, FileText, BarChart3 } from 'lucide-react';
import PerformanceChart from './PerformanceChart';
import EngagementChart from './EngagementChart';

interface AdminDashboardProps {
  user: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeProjects: 0,
    pendingComplaints: 0,
    pendingLeaves: 0,
    completionRate: 0,
    employeeGrowth: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const api = await import('../services/api');
      
      // Load various data
      const employees = await api.default.get('/auth/users');
      const projects = await api.default.get('/projects');
      const complaints = await api.default.getComplaints();
      
      setStats({
        totalEmployees: employees.length,
        activeProjects: projects.filter((p: any) => p.status === 'active').length,
        pendingComplaints: complaints.filter((c: any) => c.status === 'open').length,
        pendingLeaves: 5, // Mock data
        completionRate: 78,
        employeeGrowth: 12
      });

      // Mock recent activities
      setRecentActivities([
        { id: 1, type: 'employee', message: 'New employee Sarah Johnson joined', time: '2 hours ago' },
        { id: 2, type: 'project', message: 'Project "Mobile App" completed', time: '4 hours ago' },
        { id: 3, type: 'complaint', message: 'New complaint filed by John Doe', time: '6 hours ago' },
        { id: 4, type: 'leave', message: 'Leave request approved for Emma Wilson', time: '1 day ago' }
      ]);

      setAlerts([
        { id: 1, type: 'urgent', message: '3 employees have pending performance reviews', priority: 'high' },
        { id: 2, type: 'warning', message: '2 projects are behind schedule', priority: 'medium' },
        { id: 3, type: 'info', message: 'Monthly report generation due tomorrow', priority: 'low' }
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'employee': return <Users className="h-4 w-4 text-blue-600" />;
      case 'project': return <Briefcase className="h-4 w-4 text-green-600" />;
      case 'complaint': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'leave': return <Calendar className="h-4 w-4 text-yellow-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview of your organization</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-gray-500">Employee Growth</div>
            <div className="text-2xl font-bold text-green-600">+{stats.employeeGrowth}%</div>
          </div>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="text-blue-600" size={24} />
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-50 text-green-600">
              +{stats.employeeGrowth}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.totalEmployees}</h3>
          <p className="text-gray-600 text-sm">Total Employees</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <Briefcase className="text-green-600" size={24} />
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">
              Active
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.activeProjects}</h3>
          <p className="text-gray-600 text-sm">Active Projects</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-xl">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-red-50 text-red-600">
              Urgent
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.pendingComplaints}</h3>
          <p className="text-gray-600 text-sm">Pending Complaints</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-xl">
              <Calendar className="text-yellow-600" size={24} />
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-yellow-50 text-yellow-600">
              Review
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.pendingLeaves}</h3>
          <p className="text-gray-600 text-sm">Pending Leaves</p>
        </div>
      </div>

      {/* Management Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Management Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all text-center">
            <Users className="mx-auto mb-2 text-blue-600" size={24} />
            <div className="font-medium text-gray-800">Manage Employees</div>
          </button>
          <button className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all text-center">
            <Briefcase className="mx-auto mb-2 text-green-600" size={24} />
            <div className="font-medium text-gray-800">Projects</div>
          </button>
          <button className="p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-all text-center">
            <AlertTriangle className="mx-auto mb-2 text-red-600" size={24} />
            <div className="font-medium text-gray-800">Complaints</div>
          </button>
          <button className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all text-center">
            <BarChart3 className="mx-auto mb-2 text-purple-600" size={24} />
            <div className="font-medium text-gray-800">Analytics</div>
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart />
        <EngagementChart />
      </div>

      {/* Recent Activities & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.map((activity: any) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <div className="font-medium text-sm">{activity.message}</div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Priority Alerts</h3>
          <div className="space-y-3">
            {alerts.map((alert: any) => (
              <div key={alert.id} className={`p-3 border-l-4 rounded-lg ${getAlertColor(alert.priority)}`}>
                <div className="font-medium text-sm">{alert.message}</div>
                <div className="text-xs text-gray-500 mt-1 capitalize">{alert.priority} priority</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;