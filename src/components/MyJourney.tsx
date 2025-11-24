import { useState } from 'react';
import { MapPin, Calendar, Award, Briefcase, Star } from 'lucide-react';

interface JourneyItem {
  id: number;
  type: 'project' | 'role' | 'reward' | 'milestone';
  title: string;
  description: string;
  date: string;
  location?: string;
  status: 'completed' | 'current' | 'upcoming';
}

export default function MyJourney() {
  const [journeyData] = useState<JourneyItem[]>([
    {
      id: 1,
      type: 'role',
      title: 'Senior Developer',
      description: 'Promoted to Senior Developer role in Engineering team',
      date: '2024-01-15',
      location: 'New York Office',
      status: 'current'
    },
    {
      id: 2,
      type: 'project',
      title: 'HR Dashboard Project',
      description: 'Led development of comprehensive HR management system',
      date: '2023-11-20',
      status: 'completed'
    },
    {
      id: 3,
      type: 'reward',
      title: 'Employee of the Month',
      description: 'Recognized for outstanding performance and team collaboration',
      date: '2023-10-01',
      status: 'completed'
    },
    {
      id: 4,
      type: 'milestone',
      title: '2 Years at Company',
      description: 'Completed 2 successful years with consistent growth',
      date: '2023-08-15',
      status: 'completed'
    },
    {
      id: 5,
      type: 'project',
      title: 'AI Integration Initiative',
      description: 'Upcoming project to integrate AI capabilities',
      date: '2024-02-01',
      status: 'upcoming'
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'project': return Briefcase;
      case 'role': return Star;
      case 'reward': return Award;
      case 'milestone': return Calendar;
      default: return MapPin;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'project': return '#4169E1';
      case 'role': return '#10B981';
      case 'reward': return '#F59E0B';
      case 'milestone': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'current': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Journey</h2>
        <p className="text-gray-600">Track your career path, projects, and achievements</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="relative">
          {journeyData.map((item, index) => {
            const Icon = getIcon(item.type);
            const color = getColor(item.type);
            
            return (
              <div key={item.id} className="flex gap-4 pb-8 relative">
                {/* Timeline Line */}
                {index < journeyData.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                )}
                
                {/* Icon */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {item.date}
                    </div>
                    {item.location && (
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {item.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">5</div>
          <div className="text-sm text-gray-600">Total Projects</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">3</div>
          <div className="text-sm text-gray-600">Rewards Earned</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-purple-600">2</div>
          <div className="text-sm text-gray-600">Years Experience</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">1</div>
          <div className="text-sm text-gray-600">Current Role</div>
        </div>
      </div>
    </div>
  );
}