import React, { useState, useEffect } from 'react';
import { CheckSquare, Calendar, MessageSquare, BarChart3, Clock, Target, Award, TrendingUp, Users, Trophy, Heart } from 'lucide-react';
import TaskManagement from './TaskManagement';
import ProductivityInsights from './ProductivityInsights';

interface EmployeeDashboardProps {
  user: any;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user }) => {
  const [stats, setStats] = useState({
    myTasks: 0,
    completedTasks: 0,
    pendingLeaves: 0,
    myProjects: 0,
    upcomingDeadlines: 0,
    performanceScore: 0
  });

  const [recentTasks, setRecentTasks] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    try {
      const api = await import('../services/api');
      
      // Load tasks
      const tasks = await api.default.get('/tasks');
      const myTasks = tasks.filter((t: any) => t.assignedTo._id === user._id);
      
      // Load projects
      const projects = await api.default.get('/projects');
      
      setStats({
        myTasks: myTasks.length,
        completedTasks: myTasks.filter((t: any) => t.status === 'completed').length,
        pendingLeaves: 2, // Mock data
        myProjects: projects.length,
        upcomingDeadlines: myTasks.filter((t: any) => new Date(t.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length,
        performanceScore: 85 // Mock data
      });

      setRecentTasks(myTasks.slice(0, 5));
    } catch (error) {
      console.error('Error loading employee data:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user.firstName}!</h1>
          <p className="text-gray-600">Here's what's happening with your work today</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Performance Score</div>
          <div className="text-2xl font-bold text-green-600">{stats.performanceScore}%</div>
        </div>
      </div>

      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <CheckSquare className="text-blue-600" size={24} />
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">
              {stats.completedTasks}/{stats.myTasks}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.myTasks}</h3>
          <p className="text-gray-600 text-sm">My Tasks</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <Target className="text-green-600" size={24} />
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-50 text-green-600">
              Active
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.myProjects}</h3>
          <p className="text-gray-600 text-sm">My Projects</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-xl">
              <Calendar className="text-yellow-600" size={24} />
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-yellow-50 text-yellow-600">
              Pending
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.pendingLeaves}</h3>
          <p className="text-gray-600 text-sm">Leave Requests</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-xl">
              <Clock className="text-red-600" size={24} />
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-red-50 text-red-600">
              This Week
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.upcomingDeadlines}</h3>
          <p className="text-gray-600 text-sm">Upcoming Deadlines</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all text-center">
            <CheckSquare className="mx-auto mb-2 text-blue-600" size={24} />
            <div className="font-medium text-gray-800">My Tasks</div>
          </button>
          <button className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all text-center">
            <Calendar className="mx-auto mb-2 text-green-600" size={24} />
            <div className="font-medium text-gray-800">Apply Leave</div>
          </button>
          <button className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all text-center">
            <MessageSquare className="mx-auto mb-2 text-purple-600" size={24} />
            <div className="font-medium text-gray-800">Team Chat</div>
          </button>
          <button className="p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all text-center">
            <BarChart3 className="mx-auto mb-2 text-orange-600" size={24} />
            <div className="font-medium text-gray-800">My Progress</div>
          </button>
        </div>
      </div>

      {/* Professional Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TaskManagement />
        <ProductivityInsights />
      </div>

      {/* Recent Tasks & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">My Recent Tasks</h3>
          <div className="space-y-3">
            {recentTasks.slice(0, 5).map((task: any) => (
              <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <div className="font-medium text-sm">{task.title}</div>
                  <div className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">This Week's Schedule</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium text-sm">Team Meeting</div>
                <div className="text-xs text-gray-500">Today, 2:00 PM</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium text-sm">Project Review</div>
                <div className="text-xs text-gray-500">Tomorrow, 10:00 AM</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium text-sm">Performance Review</div>
                <div className="text-xs text-gray-500">Friday, 3:00 PM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;