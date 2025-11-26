import { LayoutGrid, Users, BarChart3, MessageSquare, Heart, Settings, LogOut, User, ChevronDown, MapPin, BookOpen, Trophy, Bell, AlertTriangle, Quote, HelpCircle, Calendar, FileText } from 'lucide-react';
import { useState } from 'react';
import Button from './Button';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: any;
  onLogout?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }: SidebarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, badge: null, roles: ['admin', 'hr', 'employee'] },
    { id: 'journey', label: 'My Journey', icon: MapPin, badge: null, roles: ['employee'] },
    { id: 'leaves', label: 'Leave Management', icon: Calendar, badge: null, roles: ['employee'] },
    { id: 'employee-leaves', label: 'Employee Leaves', icon: Calendar, badge: null, roles: ['admin', 'hr'] },
    { id: 'complaints', label: 'File Complaint', icon: AlertTriangle, badge: null, roles: ['employee'] },
    { id: 'upskilling', label: 'AI Upskilling', icon: BookOpen, badge: '3', roles: ['employee'] },
    { id: 'hr-management', label: 'HR Management', icon: User, badge: null, roles: ['admin', 'hr'] },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, badge: null, roles: ['admin', 'hr', 'employee'] },
    { id: 'notifications', label: 'Task Updates', icon: Bell, badge: '7', roles: ['admin', 'hr', 'employee'] },
    { id: 'alerts', label: 'Early Alerts', icon: AlertTriangle, badge: '2', roles: ['admin', 'hr'] },
    { id: 'guidance', label: 'Chanakya Chat', icon: Quote, badge: null, roles: ['admin', 'hr', 'employee'] },
    { id: 'chat', label: 'Team Chat', icon: MessageSquare, badge: '5', roles: ['admin', 'hr', 'employee'] },
    { id: 'employees', label: 'Employees', icon: Users, badge: '120', roles: ['admin', 'hr'] },
    { id: 'analytics', label: 'Power BI', icon: BarChart3, badge: null, roles: ['admin', 'hr'] },
    { id: 'helpdesk', label: 'HR Helpdesk', icon: HelpCircle, badge: '4', roles: ['admin', 'hr', 'employee'] },
    { id: 'wellness', label: 'Wellness', icon: Heart, badge: '3', roles: ['admin', 'hr', 'employee'] },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null, roles: ['admin', 'hr', 'employee'] },
  ];

  const menuItems = allMenuItems.filter(item => 
    !user?.role || item.roles.includes(user.role)
  );

  const userMenuItems = [
    { label: 'Profile', icon: User },
    { label: 'Settings', icon: Settings },
    { label: 'Logout', icon: LogOut },
  ];

  return (
    <div className="hidden md:flex w-72 bg-[#0F2557] min-h-screen text-white flex-col shadow-xl">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3 border-b border-[#1a3a7a]">
        <img 
          src="/Hr.jpg" 
          alt="HR SARTHI Logo" 
          className="w-12 h-12 rounded-full object-cover" 
        />
        <div>
          <h1 className="text-2xl font-bold text-white">HR SARTHI</h1>
          <p className="text-xs text-gray-400">Human Resource Management</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveTab(item.id);
                }
              }}
              aria-pressed={isActive}
              className={`w-full flex items-center justify-between px-4 py-3 mb-2 rounded-xl transition-all group focus-visible:ring-2 focus-visible:ring-blue-400 ${
                isActive
                  ? 'bg-[#4169E1] text-white shadow-lg transform scale-105'
                  : 'text-gray-300 hover:bg-[#1a3a7a] hover:text-white hover:transform hover:scale-105'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-blue-400'} />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  isActive 
                    ? 'bg-white text-[#4169E1]' 
                    : 'bg-[#4169E1] text-white animate-pulse'
                }`}>
                  {item.badge}
                </span>
              )}
            </Button>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-[#1a3a7a]">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#1a3a7a] transition-all"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
              user?.role === 'admin' ? 'bg-red-500' : 
              user?.role === 'hr' ? 'bg-blue-500' : 'bg-green-500'
            }`}>
              {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U'}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">{user ? `${user.firstName} ${user.lastName}` : 'User'}</div>
              <div className="text-xs text-gray-400">
                {user?.email || 'user@example.com'}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  user?.role === 'admin' ? 'bg-red-500' : 
                  user?.role === 'hr' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {user?.role?.toUpperCase() || 'USER'}
                </span>
              </div>
            </div>
            <ChevronDown 
              size={16} 
              className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} 
            />
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1a3a7a] rounded-xl shadow-xl overflow-hidden border border-[#2a4a8a]">
              {userMenuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={index}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2a4a8a] transition-all text-left text-white"
                    onClick={() => {
                      setShowUserMenu(false);
                      if (item.label === 'Logout' && onLogout) {
                        onLogout();
                      } else if (item.label === 'Settings') {
                        setActiveTab('settings');
                      } else if (item.label === 'Profile') {
                        setActiveTab('settings'); // Profile is part of settings
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (item.label === 'Logout' && onLogout) onLogout();
                        else setActiveTab('settings');
                        setShowUserMenu(false);
                      }
                    }}
                  >
                    <Icon size={16} />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
