import { useState, useEffect, lazy, Suspense } from 'react';
import { Users, MessageSquare, Trophy, Heart, Bell, Filter, Search, X, Menu, Lightbulb } from 'lucide-react';
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
import WorkforceTrends from './components/WorkforceTrends';
import ProductivityInsights from './components/ProductivityInsights';
import MyJourney from './components/MyJourney';
import AIUpskilling from './components/AIUpskilling';
import Leaderboard from './components/Leaderboard';
import TaskNotifications from './components/TaskNotifications';
import EarlyAlerts from './components/EarlyAlerts';
import ChanakyaGuidance from './components/ChanakyaGuidance';
import HRHelpdesk from './components/HRHelpdesk';
import ComplaintManagement from './components/ComplaintManagement';
import EnhancedComplaintManagement from './components/EnhancedComplaintManagement';
import UnifiedLeaveManagement from './components/UnifiedLeaveManagement';
import HRManagement from './components/HRManagement';
import SettingsSection from './components/SettingsSection';
import MobileDrawer from './components/MobileDrawer';
import PayrollManagement from './components/PayrollManagement';
import AttendanceTracking from './components/AttendanceTracking';
import RecruitmentPortal from './components/RecruitmentPortal';
import ProjectManagement from './components/ProjectManagement';
import EnhancedProjectManagement from './components/EnhancedProjectManagement';
import EnhancedEmployeeProjects from './components/EnhancedEmployeeProjects';
import TaskDashboard from './components/TaskDashboard';

// Lazy-loaded heavy components
const ChatSection = lazy(() => import('./components/ChatSection'));
const EmployeesSection = lazy(() => import('./components/EmployeesSection'));
const WellnessSection = lazy(() => import('./components/WellnessSection'));
const AnalyticsChart = lazy(() => import('./components/AnalyticsChart'));
import EmployeeDashboard from './components/EmployeeDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(true);
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
          // pass user id to socket connector if available
          socketService.connect(userData.user._id);
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
      // Load real data from API
      const employeeCount = await apiService.getEmployeeCount();
      const chats = await apiService.getChats().catch(() => []);
      const ticketsRes = await apiService.getTickets().catch(() => null);
      const wellness = await apiService.getWellnessPrograms().catch(() => []);

      // ticketsRes may be an object { tickets, total, ... } or an array
      const ticketsArray = Array.isArray(ticketsRes) ? ticketsRes : (ticketsRes && Array.isArray(ticketsRes.tickets) ? ticketsRes.tickets : []);

      const resolvedCount = ticketsArray.filter((t: any) => t && t.status === 'resolved').length;

      setStats({
        employees: { value: (employeeCount && typeof employeeCount.count === 'number') ? employeeCount.count : 0, trend: 8.5 },
        chats: { value: Array.isArray(chats) ? chats.length : 0, trend: 12.3 },
        recognitions: { value: resolvedCount, trend: 15.3 },
        wellness: { value: Array.isArray(wellness) ? wellness.length : 0, trend: 5.2 }
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Fallback to default values
      setStats({
        employees: { value: 0, trend: 0 },
        chats: { value: 0, trend: 0 },
        recognitions: { value: 0, trend: 0 },
        wellness: { value: 0, trend: 0 }
      });
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    socketService.connect(userData._id || userData.id || userData.user?._id);
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

  // Reset notification counter when user opens notification panel
  useEffect(() => {
    if (showNotifications && notifications > 0) {
      const timer = setTimeout(() => {
        setNotifications(0);
      }, 1000); // Reset after 1 second of viewing
      return () => clearTimeout(timer);
    }
  }, [showNotifications, notifications]);

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

  const toggleTheme = () => {
    setIsLightTheme(!isLightTheme);
  };

  return (
    <div className={`flex min-h-screen transition-all duration-300 ${
      isLightTheme ? 'bg-[#E8EDF5]' : 'bg-gray-900'
    }`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#0F2557] z-40 h-14 flex items-center justify-between text-white px-3" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="p-3 rounded-md" aria-label="Open menu">
            <Menu />
          </button>
          <div className="font-semibold text-sm">HR SARTHI</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNotifications(!showNotifications)} className="p-3 rounded-md" aria-label="Notifications">
            <Bell />
          </button>
          <button onClick={handleLogout} className="px-3 py-2 bg-red-500 rounded text-sm">Logout</button>
        </div>
      </div>
      <MobileDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setMobileMenuOpen(false); }} user={user} />

      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-sm ${
            isLightTheme 
              ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
          }`}
        >
          <Lightbulb size={16} />
        </button>
      </div>

      <main className={`flex-1 min-h-screen transition-colors ${isLightTheme ? 'bg-gray-50' : 'bg-gray-900'}`} style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))' }}>
        <div className={`max-w-6xl mx-auto px-6 py-8 transition-colors ${isLightTheme ? '' : 'text-white'}`}>
          {activeTab === 'dashboard' && (
            <>
              {user.role === 'employee' ? (
                <EmployeeDashboard user={user} isLightTheme={isLightTheme} />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <h1 className={`text-3xl font-bold ${
                        isLightTheme ? 'text-gray-800' : 'text-white'
                      }`}>Welcome, {user.firstName}!</h1>
                      <span className="px-4 py-2 bg-[#4169E1] text-white text-sm rounded-full capitalize font-medium shadow-sm">{user.role}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <button 
                          onClick={() => setShowNotifications(!showNotifications)}
                          className="relative p-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                        >
                          <Bell size={18} />
                          {notifications > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                              {notifications}
                            </span>
                          )}
                        </button>
                        
                        {showNotifications && (
                          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                            <div className="p-4 border-b border-gray-100">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800">Notifications</h3>
                                <button 
                                  onClick={clearNotifications}
                                  className="text-xs text-[#4169E1] hover:text-[#3559d1] font-medium"
                                >
                                  Clear all
                                </button>
                              </div>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {notificationList.map((notification) => (
                                <div key={notification.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                  <p className="text-sm text-gray-700 font-medium">{notification.text}</p>
                                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium shadow-sm"
                      >
                        Logout
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <Users className="text-[#4169E1]" size={24} />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          stats.employees.trend > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                        }`}>
                          {stats.employees.trend > 0 ? '+' : ''}{stats.employees.trend}%
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.employees.value}</h3>
                      <p className="text-gray-600 text-sm font-medium">Total Employees</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-green-50 rounded-xl">
                          <MessageSquare className="text-green-600" size={24} />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          stats.chats.trend > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                        }`}>
                          {stats.chats.trend > 0 ? '+' : ''}{stats.chats.trend}%
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.chats.value}</h3>
                      <p className="text-gray-600 text-sm font-medium">Active Chats</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-yellow-50 rounded-xl">
                          <Trophy className="text-yellow-600" size={24} />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          stats.recognitions.trend > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                        }`}>
                          {stats.recognitions.trend > 0 ? '+' : ''}{stats.recognitions.trend}%
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.recognitions.value}</h3>
                      <p className="text-gray-600 text-sm font-medium">Resolved Tickets</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-red-50 rounded-xl">
                          <Heart className="text-red-500" size={24} />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          stats.wellness.trend > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                        }`}>
                          {stats.wellness.trend > 0 ? '+' : ''}{stats.wellness.trend}%
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.wellness.value}</h3>
                      <p className="text-gray-600 text-sm font-medium">Wellness Programs</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                      <PerformanceChart />
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                      <EngagementChart />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                      <ProductivityInsights />
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-100" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                      <h3 className="text-lg font-semibold mb-6 text-gray-800">Quick Actions</h3>
                      <div className="space-y-4">
                        <button className="w-full p-4 bg-[#4169E1] rounded-xl hover:bg-[#3559d1] transition-all text-left text-white">
                          <div className="font-medium">Schedule Team Meeting</div>
                          <div className="text-sm text-blue-100 mt-1">Plan your next team sync</div>
                        </button>
                        <button className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left border border-gray-100">
                          <div className="font-medium text-gray-800">Generate Report</div>
                          <div className="text-sm text-gray-600 mt-1">Create performance summary</div>
                        </button>
                        <button className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left border border-gray-100">
                          <div className="font-medium text-gray-800">Send Announcement</div>
                          <div className="text-sm text-gray-600 mt-1">Broadcast to all employees</div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="bg-white rounded-2xl border border-gray-100" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                      <TaskManagement />
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100" style={{boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                      <TeamOverview />
                    </div>
                  </div>

                  <div className="mb-8">
                    <RecentActivity />
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'admin-dashboard' && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <h1 className={`text-3xl font-bold ${
                    isLightTheme ? 'text-gray-800' : 'text-white'
                  }`}>Welcome, {user.firstName}!</h1>
                  <span className="px-4 py-2 bg-[#4169E1] text-white text-sm rounded-full capitalize font-medium shadow-sm">{user.role}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                    >
                      <Bell size={18} />
                      {notifications > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                          {notifications}
                        </span>
                      )}
                    </button>
                    
                    {showNotifications && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800">Notifications</h3>
                            <button 
                              onClick={clearNotifications}
                              className="text-xs text-[#4169E1] hover:text-[#3559d1] font-medium"
                            >
                              Clear all
                            </button>
                          </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notificationList.map((notification) => (
                            <div key={notification.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                              <p className="text-sm text-gray-700 font-medium">{notification.text}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium shadow-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Users className="text-[#4169E1]" size={24} />
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      stats.employees.trend > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                    }`}>
                      {stats.employees.trend > 0 ? '+' : ''}{stats.employees.trend}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.employees.value}</h3>
                  <p className="text-gray-600 text-sm">Total Employees</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-50 rounded-xl">
                      <MessageSquare className="text-green-600" size={24} />
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      stats.chats.trend > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                    }`}>
                      {stats.chats.trend > 0 ? '+' : ''}{stats.chats.trend}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.chats.value}</h3>
                  <p className="text-gray-600 text-sm">Active Chats</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-yellow-50 rounded-xl">
                      <Trophy className="text-yellow-600" size={24} />
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      stats.recognitions.trend > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                    }`}>
                      {stats.recognitions.trend > 0 ? '+' : ''}{stats.recognitions.trend}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.recognitions.value}</h3>
                  <p className="text-gray-600 text-sm">Recognitions</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-red-50 rounded-xl">
                      <Heart className="text-red-500" size={24} />
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      stats.wellness.trend > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                    }`}>
                      {stats.wellness.trend > 0 ? '+' : ''}{stats.wellness.trend}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.wellness.value}</h3>
                  <p className="text-gray-600 text-sm">Wellness Alerts</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <PerformanceChart />
                <EngagementChart />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ProductivityInsights />
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full p-4 bg-[#4169E1] rounded-xl hover:bg-[#3559d1] transition-all text-left text-white shadow-sm">
                      <div className="font-medium">Schedule Team Meeting</div>
                      <div className="text-sm text-blue-100 mt-1">Plan your next team sync</div>
                    </button>
                    <button className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left border border-gray-100">
                      <div className="font-medium text-gray-800">Generate Report</div>
                      <div className="text-sm text-gray-600 mt-1">Create performance summary</div>
                    </button>
                    <button className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left border border-gray-100">
                      <div className="font-medium text-gray-800">Send Announcement</div>
                      <div className="text-sm text-gray-600 mt-1">Broadcast to all employees</div>
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
          {activeTab === 'chat' && (
            <Suspense fallback={<div>Loading chat...</div>}>
              <ChatSection user={user} />
            </Suspense>
          )}
          {activeTab === 'employees' && (
            <Suspense fallback={<div>Loading employees...</div>}>
              <EmployeesSection setActiveTab={setActiveTab} />
            </Suspense>
          )}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Power BI Dashboard</h2>
                <p className="text-gray-600">Comprehensive analytics and insights with interactive dual-series charts</p>
              </div>
              
              {/* Advanced Analytics Charts - lazy loaded */}
              <div className="grid grid-cols-1 gap-6">
                <Suspense fallback={<div>Loading analytics...</div>}>
                  <AnalyticsChart />
                </Suspense>
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
          {activeTab === 'wellness' && (
            <Suspense fallback={<div>Loading wellness...</div>}>
              <WellnessSection />
            </Suspense>
          )}
          {activeTab === 'helpdesk' && <HRHelpdesk />}
          {activeTab === 'leaves' && <UnifiedLeaveManagement user={user} />}
          {activeTab === 'complaints' && <EnhancedComplaintManagement />}
          {activeTab === 'hr-management' && <HRManagement />}
          {activeTab === 'payroll' && <PayrollManagement />}
          {activeTab === 'attendance' && <AttendanceTracking />}
          {activeTab === 'recruitment' && <RecruitmentPortal />}
          {activeTab === 'projects' && <EnhancedProjectManagement />}
          {activeTab === 'my-projects' && <EnhancedEmployeeProjects />}
          {activeTab === 'settings' && <SettingsSection />}
        </div>
      </main>
    </div>
  );
}

export default App;
