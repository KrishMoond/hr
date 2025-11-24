import { useState, useEffect } from 'react';
import { Filter, RefreshCw, User, Award, Calendar, Heart, MessageSquare } from 'lucide-react';

interface Activity {
  id: number;
  text: string;
  timestamp: string;
  progress: number;
  type: 'task' | 'recognition' | 'leave' | 'meeting' | 'wellness' | 'chat';
  user: string;
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([
    { id: 1, text: 'completed a task', timestamp: '2 hours ago', progress: 95, type: 'task', user: 'Rahul' },
    { id: 2, text: 'received recognition', timestamp: '4 hours ago', progress: 88, type: 'recognition', user: 'Neha' },
    { id: 3, text: 'submitted leave request', timestamp: '6 hours ago', progress: 75, type: 'leave', user: 'Priya' },
    { id: 4, text: 'scheduled team meeting', timestamp: '1 day ago', progress: 60, type: 'meeting', user: 'Team Lead' },
    { id: 5, text: 'achieved wellness goal', timestamp: '1 day ago', progress: 45, type: 'wellness', user: 'Amit' },
    { id: 6, text: 'started a chat discussion', timestamp: '2 days ago', progress: 30, type: 'chat', user: 'Sarah' },
  ]);
  
  const [filter, setFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'task': return User;
      case 'recognition': return Award;
      case 'leave': case 'meeting': return Calendar;
      case 'wellness': return Heart;
      case 'chat': return MessageSquare;
      default: return User;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'task': return '#4169E1';
      case 'recognition': return '#10B981';
      case 'leave': return '#F59E0B';
      case 'meeting': return '#8B5CF6';
      case 'wellness': return '#EF4444';
      case 'chat': return '#06B6D4';
      default: return '#4169E1';
    }
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  const refreshActivities = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newActivity: Activity = {
        id: activities.length + 1,
        text: 'joined the team',
        timestamp: 'Just now',
        progress: Math.floor(Math.random() * 100),
        type: 'task',
        user: 'New Employee'
      };
      setActivities([newActivity, ...activities.slice(0, 5)]);
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="bg-[#0F2557] rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#1a3a7a] text-white text-xs px-3 py-1 rounded-full border-none outline-none"
          >
            <option value="all">All</option>
            <option value="task">Tasks</option>
            <option value="recognition">Recognition</option>
            <option value="leave">Leave</option>
            <option value="meeting">Meetings</option>
            <option value="wellness">Wellness</option>
            <option value="chat">Chat</option>
          </select>
          <button
            onClick={refreshActivities}
            disabled={isRefreshing}
            className="p-2 bg-[#4169E1] rounded-full hover:bg-[#3559d1] transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {filteredActivities.map((activity, index) => {
          const Icon = getIcon(activity.type);
          const color = getColor(activity.type);
          
          return (
            <div key={activity.id} className="space-y-2 p-3 rounded-lg hover:bg-[#1a3a7a] transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="p-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon size={12} style={{ color }} />
                  </div>
                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-white">{activity.user}</span> {activity.text}
                  </p>
                </div>
                <span className="text-xs text-gray-400 ml-2">{activity.timestamp}</span>
              </div>
              <div className="flex items-center gap-2 ml-6">
                <div className="flex-1 bg-[#1a3a7a] rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${activity.progress}%`,
                      backgroundColor: color
                    }}
                  ></div>
                </div>
                <span className="text-xs text-gray-400 w-8">{activity.progress}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
