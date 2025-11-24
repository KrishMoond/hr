import { useState, useEffect } from 'react';
import { Users, MessageSquare, Trophy, Heart, Bell, Filter, Search, X } from 'lucide-react';
import Login from './components/Login';
import apiService from './services/api';
import socketService from './services/socket';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import PerformanceChart from './components/PerformanceChart';
import EngagementChart from './components/EngagementChart';
import RecentActivity from './components/RecentActivity';
import TaskManagement from './components/TaskManagement';
import TeamOverview from './components/TeamOverview';
import EmployeesSection from './components/EmployeesSection';
import ChatSection from './components/ChatSection';
import WellnessSection from './components/WellnessSection';
import SettingsSection from './components/SettingsSection';
import AnalyticsChart from './components/AnalyticsChart';
import WorkforceTrends from './components/WorkforceTrends';
import ProductivityInsights from './components/ProductivityInsights';
import MyJourney from './components/MyJourney';
import AIUpskilling from './components/AIUpskilling';
import Leaderboard from './components/Leaderboard';
import TaskNotifications from './components/TaskNotifications';
import EarlyAlerts from './components/EarlyAlerts';
import ChanakyaGuidance from './components/ChanakyaGuidance';
import HRHelpdesk from './components/HRHelpdesk';
import LeaveManagement from './components/LeaveManagement';
import ComplaintSystem from './components/ComplaintSystem';
import HRManagement from './components/HRManagement';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState({
    employees: { value: 120, trend: 8.5 },
    chats: { value: 25, trend: -2.1 },
    recognitions: { value: 8, trend: 15.3 },
    wellness: { value: 3, trend: -12.5 }
  });

  const notificationList = [
    { id: 1, text: 'New employee onboarding completed', time: '5 min ago', type: 'success' },
    { id: 2, text: 'Performance review due for 3 employees', time: '1 hour ago', type: 'warning' },
    { id: 3, text: 'Wellness program enrollment opened', time: '2 hours ago', type: 'info' },
  ];

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await apiService.getCurrentUser();
          setUser(userData.user);
          socketService.connect();
        } catch (error) {
          console.log('Token invalid, clearing storage');
          localStorage.removeItem('token');
          apiService.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Load dashboard analytics
  useEffect(() => {
    if (user) {
      loadDashboardData();
      const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const analytics = await apiService.getDashboardAnalytics();
      setStats({
        employees: { value: analytics.overview.totalEmployees, trend: analytics.trends.employeeGrowth },
        chats: { value: analytics.overview.activeChats, trend: analytics.trends.chatActivity },
        recognitions: { value: analytics.overview.totalEmployees, trend: analytics.trends.ticketResolution },
        wellness: { value: analytics.overview.activeWellnessPrograms, trend: analytics.trends.wellnessParticipation }
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    socketService.connect();
    loadDashboardData();
  };

  const handleLogout = () => {
    apiService.logout();
    socketService.disconnect();
    setUser(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Implement search functionality here
  };

  const clearNotifications = () => {
    setNotifications(0);
    setShowNotifications(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8EDF5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4169E1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HR SARTHI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-[#E8EDF5]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.firstName}!</h1>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full capitalize">{user.role}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-3 bg-[#4169E1] rounded-full text-white hover:bg-[#3559d1] transition"
                    >
                      <Bell size={20} />
                      {notifications > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {notifications}
                        </span>
                      )}
                    </button>
                    
                    {showNotifications && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-[#0F2557] rounded-lg shadow-lg z-50">
                        <div className="p-4 border-b border-[#1a3a7a]">
                          <div className="flex items-center justify-between">
                            <h3 className="text-white font-semibold">Notifications</h3>
                            <button 
                              onClick={clearNotifications}
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              Clear all
                            </button>
                          </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notificationList.map((notification) => (
                            <div key={notification.id} className="p-3 border-b border-[#1a3a7a] hover:bg-[#1a3a7a] transition-colors">
                              <p className="text-sm text-gray-300">{notification.text}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                  >
                    Logout
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                  icon={Users} 
                  value={stats.employees.value} 
                  label="Employees" 
                  trend={stats.employees.trend}
                />
                <StatCard 
                  icon={MessageSquare} 
                  value={stats.chats.value} 
                  label="Active Chats" 
                  trend={stats.chats.trend}
                />
                <StatCard 
                  icon={Trophy} 
                  value={stats.recognitions.value} 
                  label="Recognitions" 
                  trend={stats.recognitions.trend}
                />
                <StatCard 
                  icon={Heart} 
                  value={stats.wellness.value} 
                  label="Wellness Alerts" 
                  trend={stats.wellness.trend}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <PerformanceChart />
                <EngagementChart />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ProductivityInsights />
                <div className="bg-[#0F2557] rounded-2xl p-6 text-white">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full p-3 bg-[#4169E1] rounded-lg hover:bg-[#3559d1] transition-all text-left">
                      <div className="font-medium">Schedule Team Meeting</div>
                      <div className="text-sm text-gray-300">Plan your next team sync</div>
                    </button>
                    <button className="w-full p-3 bg-[#1a3a7a] rounded-lg hover:bg-[#2a4a8a] transition-all text-left">
                      <div className="font-medium">Generate Report</div>
                      <div className="text-sm text-gray-300">Create performance summary</div>
                    </button>
                    <button className="w-full p-3 bg-[#1a3a7a] rounded-lg hover:bg-[#2a4a8a] transition-all text-left">
                      <div className="font-medium">Send Announcement</div>
                      <div className="text-sm text-gray-300">Broadcast to all employees</div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <TaskManagement />
                <TeamOverview />
              </div>

              <div className="mb-8">
                <RecentActivity />
              </div>
            </>
          )}

          {activeTab === 'journey' && <MyJourney />}
          {activeTab === 'upskilling' && <AIUpskilling />}
          {activeTab === 'leaderboard' && <Leaderboard />}
          {activeTab === 'notifications' && <TaskNotifications />}
          {activeTab === 'alerts' && <EarlyAlerts />}
          {activeTab === 'guidance' && <ChanakyaGuidance />}
          {activeTab === 'chat' && <ChatSection />}
          {activeTab === 'employees' && <EmployeesSection />}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Power BI Dashboard</h2>
                <p className="text-gray-600">Comprehensive analytics and insights with interactive dual-series charts</p>
              </div>
              
              {/* Advanced Analytics Charts */}
              <div className="grid grid-cols-1 gap-6">
                <AnalyticsChart />
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <WorkforceTrends />
              </div>
              
              {/* Additional Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PerformanceChart />
                <EngagementChart />
              </div>
            </div>
          )}
          {activeTab === 'helpdesk' && <HRHelpdesk />}
          {activeTab === 'wellness' && <WellnessSection />}
          {activeTab === 'leaves' && <LeaveManagement />}
          {activeTab === 'complaints' && <ComplaintSystem />}
          {activeTab === 'hr-management' && <HRManagement />}
          {activeTab === 'settings' && <SettingsSection />}
        </div>
      </main>
    </div>
  );
}

export default App;
