import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useState } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function EngagementChart() {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  
  const engagementData = {
    labels: ['High Engagement', 'Medium Engagement', 'Low Engagement'],
    datasets: [
      {
        data: [45, 35, 20],
        backgroundColor: ['#4169E1', '#6B9FED', '#8AB3F0'],
        borderColor: ['#4169E1', '#6B9FED', '#8AB3F0'],
        borderWidth: 2,
        hoverBorderWidth: 4,
        cutout: '70%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0F2557',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#4169E1',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      },
    },
    onHover: (event: any, elements: any) => {
      if (elements.length > 0) {
        setHoveredSegment(elements[0].index);
      } else {
        setHoveredSegment(null);
      }
    },
  };

  const legendItems = [
    { label: 'High', percentage: 45, color: '#4169E1' },
    { label: 'Medium', percentage: 35, color: '#6B9FED' },
    { label: 'Low', percentage: 20, color: '#8AB3F0' },
  ];

  return (
    <div className="bg-[#0F2557] rounded-2xl p-6 text-white">
      <h3 className="text-lg font-semibold mb-6">Employee Engagement</h3>
      <div className="flex items-center justify-between">
        <div className="relative w-40 h-40">
          <Doughnut data={engagementData} options={options} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold">75%</div>
              <div className="text-xs text-gray-400">Overall</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {legendItems.map((item, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-2 p-2 rounded transition-all cursor-pointer ${
                hoveredSegment === index ? 'bg-[#1a3a7a]' : ''
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-300">
                {item.label}: {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
