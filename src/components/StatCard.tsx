import { LucideIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconBgColor?: string;
  trend?: number;
}

export default function StatCard({ icon: Icon, value, label, iconBgColor = 'bg-blue-500', trend }: StatCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const numericValue = typeof value === 'string' ? parseInt(value) || 0 : value;

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const increment = numericValue / 20;
      const counter = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setAnimatedValue(numericValue);
          clearInterval(counter);
        } else {
          setAnimatedValue(Math.floor(current));
        }
      }, 50);
    }, 200);
    return () => clearTimeout(timer);
  }, [numericValue]);

  return (
    <div 
      className={`bg-[#0F2557] rounded-2xl p-6 text-white cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
        isHovered ? 'bg-[#1a3a7a]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-4">
        <div className={`${iconBgColor} bg-opacity-20 p-3 rounded-full transition-all duration-300 ${
          isHovered ? 'scale-110' : ''
        }`}>
          <Icon size={28} className="text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="text-3xl font-bold">{animatedValue}</div>
          <div className="text-gray-300 text-sm mt-1">{label}</div>
          {trend && (
            <div className={`text-xs mt-1 ${
              trend > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% from last month
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
