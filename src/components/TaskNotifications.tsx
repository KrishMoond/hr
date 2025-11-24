import { useState } from 'react';
import { Bell, Clock, User, CheckCircle, AlertCircle, Play } from 'lucide-react';

interface TaskNotification {
  id: number;
  title: string;
  description: string;
  type: 'new_project' | 'deadline' | 'update' | 'completed';
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  assignee?: string;
  project?: string;
  isRead: boolean;
}

export default function TaskNotifications() {
  const [notifications, setNotifications] = useState<TaskNotification[]>([
    {
      id: 1,
      title: 'New Project: AI Dashboard Integration',
      description: 'You have been assigned to lead the AI dashboard integration project. Start date: Tomorrow',
      type: 'new_project',
      priority: 'high',
      timestamp: '5 minutes ago',
      assignee: 'Sarah Johnson',
      project: 'AI Dashboard',
      isRead: false
    },
    {
      id: 2,
      title: 'Deadline Reminder: HR System Testing',
      description: 'Testing phase for HR system ends in 2 days. Please complete your assigned test cases.',
      type: 'deadline',
      priority: 'high',
      timestamp: '1 hour ago',
      project: 'HR System',
      isRead: false
    },
    {
      id: 3,
      title: 'Project Update: Mobile App Development',
      description: 'New requirements added to the mobile app project. Review the updated specifications.',
      type: 'update',
      priority: 'medium',
      timestamp: '3 hours ago',
      project: 'Mobile App',
      isRead: true
    },
    {
      id: 4,
      title: 'Task Completed: Database Migration',
      description: 'Database migration has been successfully completed by the DevOps team.',
      type: 'completed',
      priority: 'low',
      timestamp: '1 day ago',
      project: 'Infrastructure',
      isRead: true
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_project': return Play;
      case 'deadline': return Clock;
      case 'update': return Bell;
      case 'completed': return CheckCircle;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'new_project': return 'bg-blue-100 text-blue-800';
      case 'deadline': return 'bg-red-100 text-red-800';
      case 'update': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Task Updates</h2>
          <p className="text-gray-600">Stay updated with project notifications and deadlines</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {unreadCount} unread
          </span>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <Play className="text-blue-500" size={20} />
            <div>
              <div className="font-semibold text-gray-900">New Projects</div>
              <div className="text-sm text-gray-600">2 projects to start</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-l-red-500">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <div>
              <div className="font-semibold text-gray-900">Urgent Deadlines</div>
              <div className="text-sm text-gray-600">1 task due soon</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-l-green-500">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={20} />
            <div>
              <div className="font-semibold text-gray-900">Completed</div>
              <div className="text-sm text-gray-600">3 tasks finished</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {notifications.map((notification) => {
            const Icon = getIcon(notification.type);
            
            return (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Icon size={16} className="text-gray-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{notification.timestamp}</span>
                      {notification.project && (
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {notification.project}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(notification.type)}`}>
                        {notification.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          {[
            { label: 'New project assignments', enabled: true },
            { label: 'Deadline reminders', enabled: true },
            { label: 'Project updates', enabled: false },
            { label: 'Task completions', enabled: true },
          ].map((pref, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-700">{pref.label}</span>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  pref.enabled ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pref.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}