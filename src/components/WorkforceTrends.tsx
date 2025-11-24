import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useState } from 'react';
import { Users, UserPlus, UserMinus, Calendar } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function WorkforceTrends() {
  const [selectedView, setSelectedView] = useState('headcount');

  const headcountData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Total Employees',
        data: [98, 102, 105, 108, 112, 115, 118, 120, 122, 125, 123, 120],
        borderColor: '#4169E1',
        backgroundColor: 'rgba(65, 105, 225, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#4169E1',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Active Employees',
        data: [95, 98, 102, 105, 108, 112, 115, 117, 119, 122, 120, 118],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const hiringData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'New Hires',
        data: [8, 6, 9, 7, 8, 5, 6, 4, 3, 5, 2, 1],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Departures',
        data: [4, 2, 6, 3, 4, 2, 3, 2, 1, 2, 4, 6],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const departmentData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Engineering',
        data: [35, 36, 38, 40, 42, 43, 44, 45, 46, 47, 46, 45],
        borderColor: '#4169E1',
        backgroundColor: 'rgba(65, 105, 225, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#4169E1',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Sales & Marketing',
        data: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 34, 33],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Operations',
        data: [20, 21, 21, 22, 22, 23, 24, 24, 25, 26, 25, 24],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false,
      },
      {
        label: 'HR & Admin',
        data: [18, 19, 19, 18, 19, 19, 19, 19, 18, 18, 18, 18],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const getCurrentData = () => {
    switch (selectedView) {
      case 'headcount': return headcountData;
      case 'hiring': return hiringData;
      case 'departments': return departmentData;
      default: return headcountData;
    }
  };

  const getViewStats = () => {
    switch (selectedView) {
      case 'headcount':
        return [
          { label: 'Total Employees', value: '120', change: '+22%', icon: Users, color: '#4169E1' },
          { label: 'Active Employees', value: '118', change: '+24%', icon: Users, color: '#10B981' },
        ];
      case 'hiring':
        return [
          { label: 'New Hires (YTD)', value: '64', change: '-15%', icon: UserPlus, color: '#8B5CF6' },
          { label: 'Departures (YTD)', value: '39', change: '+8%', icon: UserMinus, color: '#EF4444' },
        ];
      case 'departments':
        return [
          { label: 'Largest Dept', value: 'Engineering (45)', change: '+29%', icon: Users, color: '#4169E1' },
          { label: 'Fastest Growing', value: 'Sales (33)', change: '+32%', icon: Users, color: '#10B981' },
        ];
      default:
        return [
          { label: 'Total Employees', value: '120', change: '+22%', icon: Users, color: '#4169E1' },
          { label: 'Active Employees', value: '118', change: '+24%', icon: Users, color: '#10B981' },
        ];
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#6B7280',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1F2937',
        bodyColor: '#1F2937',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
        },
      },
    },
  };

  const views = [
    { id: 'headcount', label: 'Headcount', icon: Users },
    { id: 'hiring', label: 'Hiring Trends', icon: Calendar },
    { id: 'departments', label: 'By Department', icon: Users },
  ];

  const stats = getViewStats();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Workforce Trends</h3>
          <p className="text-sm text-gray-600 mt-1">Employee growth and department distribution</p>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 mb-6">
        {views.map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedView === view.id
                  ? 'bg-[#4169E1] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon size={16} />
              {view.label}
            </button>
          );
        })}
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon size={16} style={{ color: stat.color }} />
                </div>
                <span className="text-sm text-gray-600">{stat.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="h-80">
        <Line data={getCurrentData()} options={options} />
      </div>
    </div>
  );
}