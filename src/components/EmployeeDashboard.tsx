import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Clock, Target, Award, Calendar, CheckCircle, 
  AlertTriangle, Users, BookOpen, Heart, Zap, Star,
  ArrowUp, ArrowDown, MoreHorizontal, Bell, Coffee
} from 'lucide-react';
import api from '../services/api';
import io from 'socket.io-client';

interface EmployeeDashboardProps {
  user: any;
  isLightTheme: boolean;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user, isLightTheme }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: 'task', title: 'Completed UI Design Review', time: '2 hours ago', status: 'completed' },
    { id: 2, type: 'goal', title: 'Monthly sales target 80% achieved', time: '1 day ago', status: 'progress' },
    { id: 3, type: 'learning', title: 'React Advanced Patterns - Module 3', time: '2 days ago', status: 'completed' },
    { id: 4, type: 'wellness', title: 'Completed 30-min meditation session', time: '3 days ago', status: 'completed' }
  ]);

  const [upcomingItems, setUpcomingItems] = useState([
    { id: 1, type: 'meeting', title: 'Sprint Planning', time: 'Today 2:00 PM', priority: 'high' },
    { id: 2, type: 'deadline', title: 'Project Alpha Delivery', time: 'Tomorrow', priority: 'critical' },
    { id: 3, type: 'review', title: 'Performance Review', time: 'Friday 3:00 PM', priority: 'medium' },
    { id: 4, type: 'training', title: 'Leadership Workshop', time: 'Next Monday', priority: 'low' }
  ]);

  useEffect(() => {
    loadDashboardData();
    setupSocketConnection();
    
    return () => {
      if (window.socket) {
        window.socket.disconnect();
      }
    };
  }, [user._id]);

  const loadDashboardData = async () => {
    try {
      const data = await api.getDashboardAnalytics();
      setDashboardData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const setupSocketConnection = () => {
    const socket = io('http://localhost:5000');
    window.socket = socket;
    
    socket.emit('join-user', user._id);
    
    socket.on('metrics:update', (data) => {
      setDashboardData((prev: any) => {
        if (!prev) return prev;
        
        const updated = { ...prev };
        const { metric, value } = data;
        
        // Update the appropriate section based on metric
        if (metric === 'productivityScore') {
          updated.productivity.score = value;
        } else if (metric.startsWith('tasks')) {
          const taskMetric = metric.replace('tasks', '').toLowerCase();
          updated.tasks[taskMetric] = value;
        } else if (metric.startsWith('goals')) {
          const goalMetric = metric.replace('goals', '').toLowerCase();
          updated.goals[goalMetric] = value;
        } else if (metric.startsWith('wellness')) {
          const wellnessMetric = metric.replace('wellness', '').toLowerCase();
          updated.wellness[wellnessMetric] = value;
        } else if (metric.startsWith('unread')) {
          const notifType = metric.replace('unread', '').toLowerCase();
          updated.notifications[notifType] = value;
        }
        
        return updated;
      });
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const MetricCard = ({ icon: Icon, title, value, subtitle, trend, color }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );

  const ProgressRing = ({ percentage, size = 60, strokeWidth = 6 }: any) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            className="text-blue-500 transition-all duration-300"
          />
        </svg>
        <span className="absolute text-sm font-semibold text-gray-700">{percentage}%</span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${
            isLightTheme ? 'text-gray-900' : 'text-white'
          }`}>
            {getGreeting()}, {user.firstName}! 👋
          </h1>
          <p className={`mt-1 ${
            isLightTheme ? 'text-gray-600' : 'text-gray-300'
          }`}>Here's your personalized workspace overview</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={`text-sm ${
              isLightTheme ? 'text-gray-500' : 'text-gray-300'
            }`}>Today's Focus</div>
            <div className={`text-lg font-semibold ${
              isLightTheme ? 'text-blue-600' : 'text-blue-400'
            }`}>87% Productive</div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user.firstName[0]}{user.lastName[0]}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={TrendingUp}
          title="Productivity Score"
          value={dashboardData.productivity?.score || 0}
          subtitle={`+${dashboardData.productivity?.trend || 0}% this week`}
          trend={dashboardData.productivity?.trend}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <MetricCard
          icon={Target}
          title="Tasks Completed"
          value={`${dashboardData.tasks?.completed || 0}/${dashboardData.tasks?.total || 0}`}
          subtitle={`${dashboardData.tasks?.thisWeek || 0} completed this week`}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <MetricCard
          icon={Award}
          title="Goals Progress"
          value={`${dashboardData.goals?.progress || 0}%`}
          subtitle={`${dashboardData.goals?.completed || 0}/${dashboardData.goals?.monthly || 0} monthly goals`}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <MetricCard
          icon={Heart}
          title="Wellness Score"
          value={dashboardData.wellness?.score || 0}
          subtitle={`${dashboardData.wellness?.streak || 0} day streak`}
          color="bg-gradient-to-br from-pink-500 to-pink-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Performance Overview</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <ProgressRing percentage={dashboardData.productivity?.score || 0} />
                <div className="mt-3">
                  <div className="font-semibold text-gray-900">Productivity</div>
                  <div className="text-sm text-gray-500">This month</div>
                </div>
              </div>
              
              <div className="text-center">
                <ProgressRing percentage={dashboardData.goals?.progress || 0} />
                <div className="mt-3">
                  <div className="font-semibold text-gray-900">Goal Achievement</div>
                  <div className="text-sm text-gray-500">Monthly targets</div>
                </div>
              </div>
              
              <div className="text-center">
                <ProgressRing percentage={dashboardData.learning?.progress || 0} />
                <div className="mt-3">
                  <div className="font-semibold text-gray-900">Learning Progress</div>
                  <div className="text-sm text-gray-500">Active courses</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activities</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'task' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'goal' ? 'bg-purple-100 text-purple-600' :
                    activity.type === 'learning' ? 'bg-green-100 text-green-600' :
                    'bg-pink-100 text-pink-600'
                  }`}>
                    {activity.type === 'task' && <CheckCircle size={20} />}
                    {activity.type === 'goal' && <Target size={20} />}
                    {activity.type === 'learning' && <BookOpen size={20} />}
                    {activity.type === 'wellness' && <Heart size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{activity.title}</div>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="text-blue-500" size={20} />
                  <span className="text-gray-700">Hours This Week</span>
                </div>
                <span className="font-semibold text-gray-900">{dashboardData.productivity?.weeklyHours || 0}h</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-red-500" size={20} />
                  <span className="text-gray-700">Overdue Tasks</span>
                </div>
                <span className="font-semibold text-red-600">{dashboardData.tasks?.overdue || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Star className="text-yellow-500" size={20} />
                  <span className="text-gray-700">Recognition Points</span>
                </div>
                <span className="font-semibold text-gray-900">{dashboardData.recognition?.points || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="text-purple-500" size={20} />
                  <span className="text-gray-700">Team Rank</span>
                </div>
                <span className="font-semibold text-gray-900">#{dashboardData.recognition?.rank || 0}</span>
              </div>
            </div>
          </div>

          {/* Upcoming Items */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming</h3>
              <Bell className="text-gray-400" size={20} />
            </div>
            <div className="space-y-3">
              {upcomingItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    item.priority === 'critical' ? 'bg-red-500' :
                    item.priority === 'high' ? 'bg-orange-500' :
                    item.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wellness Corner */}
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                <Coffee className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Wellness Break</h3>
                <p className="text-sm text-gray-600">Time for a 5-min break!</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Today's Activities</span>
                <span className="font-medium text-gray-900">{dashboardData.wellness?.activities || 0}/5</span>
              </div>
              <div className="w-full bg-pink-200 rounded-full h-2">
                <div 
                  className="bg-pink-500 h-2 rounded-full transition-all"
                  style={{ width: `${((dashboardData.wellness?.activities || 0) / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;