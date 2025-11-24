import { useState } from 'react';
import { Heart, Activity, Target, Calendar, TrendingUp, Award, Users, Plus, CheckCircle } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface WellnessGoal {
  id: number;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  category: 'fitness' | 'mental' | 'nutrition' | 'sleep';
  deadline: string;
  participants: number;
}

interface WellnessActivity {
  id: number;
  name: string;
  type: 'challenge' | 'program' | 'event';
  participants: number;
  duration: string;
  status: 'active' | 'upcoming' | 'completed';
  description: string;
}

export default function WellnessSection() {
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'activities' | 'analytics'>('overview');
  
  const [wellnessGoals] = useState<WellnessGoal[]>([
    {
      id: 1,
      title: 'Daily Steps Challenge',
      description: 'Walk 10,000 steps daily for better health',
      target: 10000,
      current: 7500,
      unit: 'steps',
      category: 'fitness',
      deadline: '2024-01-31',
      participants: 45
    },
    {
      id: 2,
      title: 'Meditation Minutes',
      description: 'Practice mindfulness for mental wellness',
      target: 30,
      current: 22,
      unit: 'minutes',
      category: 'mental',
      deadline: '2024-01-31',
      participants: 28
    },
    {
      id: 3,
      title: 'Water Intake Goal',
      description: 'Stay hydrated with 8 glasses daily',
      target: 8,
      current: 6,
      unit: 'glasses',
      category: 'nutrition',
      deadline: '2024-01-31',
      participants: 67
    },
    {
      id: 4,
      title: 'Quality Sleep',
      description: 'Get 7-8 hours of quality sleep',
      target: 8,
      current: 6.5,
      unit: 'hours',
      category: 'sleep',
      deadline: '2024-01-31',
      participants: 52
    }
  ]);

  const [wellnessActivities] = useState<WellnessActivity[]>([
    {
      id: 1,
      name: 'Yoga Sessions',
      type: 'program',
      participants: 25,
      duration: '4 weeks',
      status: 'active',
      description: 'Weekly yoga sessions for flexibility and stress relief'
    },
    {
      id: 2,
      name: 'Mental Health Workshop',
      type: 'event',
      participants: 80,
      duration: '2 hours',
      status: 'upcoming',
      description: 'Learn stress management and mindfulness techniques'
    },
    {
      id: 3,
      name: 'Fitness Challenge',
      type: 'challenge',
      participants: 120,
      duration: '30 days',
      status: 'active',
      description: 'Team-based fitness competition with rewards'
    }
  ]);

  const wellnessStats = {
    totalParticipants: 120,
    activePrograms: 8,
    completedGoals: 156,
    averageEngagement: 78
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fitness': return 'bg-blue-500';
      case 'mental': return 'bg-purple-500';
      case 'nutrition': return 'bg-green-500';
      case 'sleep': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fitness': return Activity;
      case 'mental': return Heart;
      case 'nutrition': return Target;
      case 'sleep': return Calendar;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  // Chart data
  const wellnessProgressData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Fitness',
        data: [65, 72, 78, 85],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Mental Health',
        data: [58, 68, 75, 82],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Nutrition',
        data: [70, 75, 80, 88],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const participationData = {
    labels: ['Fitness', 'Mental Health', 'Nutrition', 'Sleep'],
    datasets: [
      {
        data: [45, 28, 67, 52],
        backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981', '#6366F1'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Employee Wellness</h2>
          <p className="text-gray-600">Promote health and well-being in the workplace</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#4169E1] text-white rounded-lg hover:bg-[#3559d1] transition-all">
          <Plus size={20} />
          New Program
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1 shadow-sm">
        <div className="flex gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: Heart },
            { id: 'goals', label: 'Goals', icon: Target },
            { id: 'activities', label: 'Activities', icon: Activity },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#4169E1] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{wellnessStats.totalParticipants}</div>
                  <div className="text-sm text-gray-600">Total Participants</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="text-green-600" size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{wellnessStats.activePrograms}</div>
                  <div className="text-sm text-gray-600">Active Programs</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Award className="text-purple-600" size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{wellnessStats.completedGoals}</div>
                  <div className="text-sm text-gray-600">Completed Goals</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <TrendingUp className="text-yellow-600" size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{wellnessStats.averageEngagement}%</div>
                  <div className="text-sm text-gray-600">Engagement Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-4">
              {wellnessActivities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(activity.status)}`}></div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.name}</h4>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{activity.participants} participants</div>
                    <div className="text-xs text-gray-500">{activity.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wellnessGoals.map((goal) => {
            const Icon = getCategoryIcon(goal.category);
            const progress = (goal.current / goal.target) * 100;
            
            return (
              <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getCategoryColor(goal.category)} bg-opacity-20`}>
                      <Icon className={`${getCategoryColor(goal.category).replace('bg-', 'text-')}`} size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                  </div>
                  {progress >= 100 && (
                    <CheckCircle className="text-green-500" size={20} />
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium text-gray-900">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getCategoryColor(goal.category)}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{goal.participants} participants</span>
                    <span className="text-gray-600">Due: {goal.deadline}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="space-y-6">
          {wellnessActivities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(activity.status)}`}></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{activity.name}</h3>
                    <p className="text-gray-600">{activity.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{activity.participants}</div>
                    <div>Participants</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{activity.duration}</div>
                    <div>Duration</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-medium capitalize ${
                      activity.status === 'active' ? 'text-green-600' :
                      activity.status === 'upcoming' ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {activity.status}
                    </div>
                    <div>Status</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Wellness Progress Trends</h3>
            <div className="h-64">
              <Line data={wellnessProgressData} options={chartOptions} />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Participation</h3>
            <div className="h-64">
              <Doughnut data={participationData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}