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

export default function PerformanceChart() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [hoveredDataset, setHoveredDataset] = useState<number | null>(null);
  
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Performance Score',
        data: [72, 85, 82, 95, 88, 91],
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
        label: 'Employee Satisfaction',
        data: [68, 78, 85, 88, 92, 89],
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

  const weeklyData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Performance Score',
        data: [78, 92, 85, 89],
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
        label: 'Employee Satisfaction',
        data: [82, 88, 90, 94],
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
        setHoveredDataset(elements[0].datasetIndex);
      } else {
        setHoveredDataset(null);
      }
    },
  };

  return (
    <div className="bg-[#0F2557] rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Performance & Satisfaction Trends</h3>
          <p className="text-sm text-gray-400 mt-1">Dual metrics tracking over time</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod('weekly')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              selectedPeriod === 'weekly' ? 'bg-[#4169E1] text-white' : 'bg-[#1a3a7a] text-gray-300'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setSelectedPeriod('monthly')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              selectedPeriod === 'monthly' ? 'bg-[#4169E1] text-white' : 'bg-[#1a3a7a] text-gray-300'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`p-3 rounded-lg transition-all ${
          hoveredDataset === 0 ? 'bg-[#4169E1] bg-opacity-20' : 'bg-[#1a3a7a]'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#4169E1] rounded-full"></div>
            <span className="text-sm text-gray-300">Avg Performance</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {selectedPeriod === 'monthly' ? '85.5%' : '86.0%'}
          </div>
        </div>
        <div className={`p-3 rounded-lg transition-all ${
          hoveredDataset === 1 ? 'bg-[#10B981] bg-opacity-20' : 'bg-[#1a3a7a]'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#10B981] rounded-full"></div>
            <span className="text-sm text-gray-300">Avg Satisfaction</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {selectedPeriod === 'monthly' ? '83.3%' : '88.5%'}
          </div>
        </div>
      </div>
      
      <div className="h-48">
        <Line data={selectedPeriod === 'monthly' ? monthlyData : weeklyData} options={options} />
      </div>
    </div>
  );
}
