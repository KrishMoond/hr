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
import { TrendingUp, TrendingDown, Activity, Users } from 'lucide-react';

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

export default function AnalyticsChart() {
  const [selectedMetric, setSelectedMetric] = useState('productivity');
  const [timeRange, setTimeRange] = useState('6months');

  const productivityData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Team Productivity',
        data: [78, 82, 85, 88, 92, 89],
        borderColor: '#4169E1',
        backgroundColor: 'rgba(65, 105, 225, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#4169E1',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Individual Performance',
        data: [72, 75, 80, 85, 87, 91],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const engagementData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Employee Engagement',
        data: [65, 70, 75, 78, 82, 85],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Job Satisfaction',
        data: [70, 72, 78, 80, 85, 88],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const retentionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Employee Retention',
        data: [92, 94, 91, 95, 93, 96],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Turnover Rate',
        data: [8, 6, 9, 5, 7, 4],
        borderColor: '#06B6D4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#06B6D4',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const getCurrentData = () => {
    switch (selectedMetric) {
      case 'productivity': return productivityData;
      case 'engagement': return engagementData;
      case 'retention': return retentionData;
      default: return productivityData;
    }
  };

  const getMetricStats = () => {
    switch (selectedMetric) {
      case 'productivity':
        return {
          primary: { value: '89%', trend: '+7%', label: 'Team Productivity', color: '#4169E1' },
          secondary: { value: '91%', trend: '+19%', label: 'Individual Performance', color: '#10B981' }
        };
      case 'engagement':
        return {
          primary: { value: '85%', trend: '+20%', label: 'Employee Engagement', color: '#8B5CF6' },
          secondary: { value: '88%', trend: '+18%', label: 'Job Satisfaction', color: '#F59E0B' }
        };
      case 'retention':
        return {
          primary: { value: '96%', trend: '+4%', label: 'Employee Retention', color: '#EF4444' },
          secondary: { value: '4%', trend: '-4%', label: 'Turnover Rate', color: '#06B6D4' }
        };
      default:
        return {
          primary: { value: '89%', trend: '+7%', label: 'Team Productivity', color: '#4169E1' },
          secondary: { value: '91%', trend: '+19%', label: 'Individual Performance', color: '#10B981' }
        };
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
          color: '#9CA3AF',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 37, 87, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#4169E1',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const suffix = selectedMetric === 'retention' && context.datasetIndex === 1 ? '%' : '%';
            return `${context.dataset.label}: ${context.parsed.y}${suffix}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: selectedMetric === 'retention' ? 100 : 100,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#9CA3AF',
          callback: function(value: any) {
            return value + '%';
          }
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
        },
      },
    },
  };

  const metrics = [
    { id: 'productivity', label: 'Productivity', icon: Activity },
    { id: 'engagement', label: 'Engagement', icon: Users },
    { id: 'retention', label: 'Retention', icon: TrendingUp },
  ];

  const stats = getMetricStats();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Advanced Analytics</h3>
          <p className="text-sm text-gray-600 mt-1">Comprehensive workforce metrics and trends</p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-2 mb-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedMetric === metric.id
                  ? 'bg-[#4169E1] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon size={16} />
              {metric.label}
            </button>
          );
        })}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stats.primary.color }}
              ></div>
              <span className="text-sm text-gray-600">{stats.primary.label}</span>
            </div>
            <div className={`flex items-center gap-1 text-xs ${
              stats.primary.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.primary.trend.startsWith('+') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {stats.primary.trend}
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{stats.primary.value}</div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stats.secondary.color }}
              ></div>
              <span className="text-sm text-gray-600">{stats.secondary.label}</span>
            </div>
            <div className={`flex items-center gap-1 text-xs ${
              stats.secondary.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.secondary.trend.startsWith('+') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {stats.secondary.trend}
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{stats.secondary.value}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <Line data={getCurrentData()} options={options} />
      </div>
    </div>
  );
}