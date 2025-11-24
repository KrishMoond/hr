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
import { Clock, Target, TrendingUp, Activity } from 'lucide-react';

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

export default function ProductivityInsights() {
  const [timeframe, setTimeframe] = useState('week');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Task Completion Rate',
        data: [85, 92, 88, 94, 90, 78, 82],
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
        label: 'Work Hours Efficiency',
        data: [78, 85, 82, 89, 87, 75, 80],
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

  const monthlyData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Task Completion Rate',
        data: [88, 91, 89, 93],
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
        label: 'Work Hours Efficiency',
        data: [82, 86, 84, 88],
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

  const getCurrentData = () => {
    return timeframe === 'week' ? weeklyData : monthlyData;
  };

  const getInsights = () => {
    if (timeframe === 'week') {
      return {
        completion: { value: '87%', trend: '+5%', peak: 'Thursday' },
        efficiency: { value: '82%', trend: '+7%', peak: 'Thursday' },
        bestDay: 'Thursday',
        improvement: 'Weekend productivity could be optimized'
      };
    } else {
      return {
        completion: { value: '90%', trend: '+5%', peak: 'Week 4' },
        efficiency: { value: '85%', trend: '+7%', peak: 'Week 4' },
        bestDay: 'Week 4',
        improvement: 'Consistent upward trend observed'
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
            return `${context.dataset.label}: ${context.parsed.y}%`;
          },
          afterBody: function(context: any) {
            if (context.length > 0) {
              const dataIndex = context[0].dataIndex;
              setHoveredPoint(dataIndex);
              return timeframe === 'week' 
                ? ['', 'Peak performance day!'] 
                : ['', 'Strong weekly performance'];
            }
            return [];
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(26, 58, 122, 0.3)',
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
    onHover: (event: any, elements: any) => {
      if (elements.length > 0) {
        setHoveredPoint(elements[0].index);
      } else {
        setHoveredPoint(null);
      }
    },
  };

  const insights = getInsights();

  return (
    <div className="bg-[#0F2557] rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Productivity Insights</h3>
          <p className="text-sm text-gray-400 mt-1">Task completion vs work efficiency</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              timeframe === 'week' ? 'bg-[#4169E1] text-white' : 'bg-[#1a3a7a] text-gray-300'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              timeframe === 'month' ? 'bg-[#4169E1] text-white' : 'bg-[#1a3a7a] text-gray-300'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`p-3 rounded-lg transition-all ${
          hoveredPoint !== null ? 'bg-[#4169E1] bg-opacity-20' : 'bg-[#1a3a7a]'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-[#4169E1]" />
            <span className="text-xs text-gray-300">Avg Completion</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">{insights.completion.value}</span>
            <span className="text-xs text-green-400">{insights.completion.trend}</span>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg transition-all ${
          hoveredPoint !== null ? 'bg-[#10B981] bg-opacity-20' : 'bg-[#1a3a7a]'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-[#10B981]" />
            <span className="text-xs text-gray-300">Avg Efficiency</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">{insights.efficiency.value}</span>
            <span className="text-xs text-green-400">{insights.efficiency.trend}</span>
          </div>
        </div>
      </div>

      <div className="h-48 mb-4">
        <Line data={getCurrentData()} options={options} />
      </div>

      <div className="bg-[#1a3a7a] rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={14} className="text-blue-400" />
          <span className="text-sm font-medium">Key Insight</span>
        </div>
        <p className="text-xs text-gray-300">
          Peak performance: <span className="text-blue-400 font-medium">{insights.bestDay}</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">{insights.improvement}</p>
      </div>
    </div>
  );
}