import { useState } from 'react';
import { User, Mail, Phone, MapPin, Star, TrendingUp, Award } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  performance: number;
  satisfaction: number;
  projects: number;
  status: 'online' | 'offline' | 'away';
}

export default function TeamOverview() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Senior Developer',
      department: 'Engineering',
      email: 'sarah.j@company.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      avatar: 'SJ',
      performance: 92,
      satisfaction: 88,
      projects: 5,
      status: 'online'
    },
    {
      id: 2,
      name: 'Mike Chen',
      role: 'Product Manager',
      department: 'Product',
      email: 'mike.c@company.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      avatar: 'MC',
      performance: 87,
      satisfaction: 91,
      projects: 3,
      status: 'away'
    },
    {
      id: 3,
      name: 'Lisa Rodriguez',
      role: 'UX Designer',
      department: 'Design',
      email: 'lisa.r@company.com',
      phone: '+1 (555) 345-6789',
      location: 'Austin, TX',
      avatar: 'LR',
      performance: 95,
      satisfaction: 94,
      projects: 4,
      status: 'online'
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Data Analyst',
      department: 'Analytics',
      email: 'david.k@company.com',
      phone: '+1 (555) 456-7890',
      location: 'Seattle, WA',
      avatar: 'DK',
      performance: 89,
      satisfaction: 85,
      projects: 6,
      status: 'offline'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'away': return 'bg-yellow-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const TeamMemberCard = ({ member }: { member: TeamMember }) => (
    <div 
      className="bg-[#1a3a7a] rounded-lg p-4 hover:bg-[#2a4a8a] transition-all cursor-pointer transform hover:scale-105"
      onClick={() => setSelectedMember(member)}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <div className="w-12 h-12 bg-[#4169E1] rounded-full flex items-center justify-center text-white font-semibold">
            {member.avatar}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-[#1a3a7a]`}></div>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-white">{member.name}</h4>
          <p className="text-sm text-gray-400">{member.role}</p>
          <p className="text-xs text-gray-500">{member.department}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Performance</span>
          <span className={`text-xs font-semibold ${getPerformanceColor(member.performance)}`}>
            {member.performance}%
          </span>
        </div>
        <div className="w-full bg-[#0F2557] rounded-full h-2">
          <div
            className="bg-[#4169E1] h-2 rounded-full transition-all"
            style={{ width: `${member.performance}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
          <div className="flex items-center gap-1">
            <Star size={12} />
            <span>{member.satisfaction}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Award size={12} />
            <span>{member.projects} projects</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#0F2557] rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Team Overview</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 text-xs rounded transition-all ${
              viewMode === 'grid' ? 'bg-[#4169E1] text-white' : 'bg-[#1a3a7a] text-gray-300'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-xs rounded transition-all ${
              viewMode === 'list' ? 'bg-[#4169E1] text-white' : 'bg-[#1a3a7a] text-gray-300'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div 
              key={member.id}
              className="flex items-center gap-4 p-3 bg-[#1a3a7a] rounded-lg hover:bg-[#2a4a8a] transition-all cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-[#4169E1] rounded-full flex items-center justify-center text-white font-semibold">
                  {member.avatar}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-[#1a3a7a]`}></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{member.name}</h4>
                    <p className="text-sm text-gray-400">{member.role} • {member.department}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${getPerformanceColor(member.performance)}`}>
                      {member.performance}%
                    </div>
                    <div className="text-xs text-gray-400">{member.projects} projects</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedMember(null)}>
          <div className="bg-[#0F2557] rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-[#4169E1] rounded-full flex items-center justify-center text-white text-xl font-semibold">
                  {selectedMember.avatar}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(selectedMember.status)} rounded-full border-2 border-[#0F2557]`}></div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedMember.name}</h3>
                <p className="text-gray-400">{selectedMember.role}</p>
                <p className="text-sm text-gray-500">{selectedMember.department}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail size={16} />
                <span className="text-sm">{selectedMember.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone size={16} />
                <span className="text-sm">{selectedMember.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin size={16} />
                <span className="text-sm">{selectedMember.location}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-3 bg-[#1a3a7a] rounded-lg">
                  <div className={`text-2xl font-bold ${getPerformanceColor(selectedMember.performance)}`}>
                    {selectedMember.performance}%
                  </div>
                  <div className="text-xs text-gray-400">Performance</div>
                </div>
                <div className="text-center p-3 bg-[#1a3a7a] rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{selectedMember.satisfaction}%</div>
                  <div className="text-xs text-gray-400">Satisfaction</div>
                </div>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="w-full mt-6 py-2 bg-[#4169E1] text-white rounded-lg hover:bg-[#3559d1] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}