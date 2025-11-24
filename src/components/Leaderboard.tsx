import { useState } from 'react';
import { Trophy, Medal, Star, TrendingUp, Award } from 'lucide-react';

interface LeaderboardEntry {
  id: number;
  name: string;
  avatar: string;
  score: number;
  department: string;
  achievements: number;
  trend: 'up' | 'down' | 'same';
  rank: number;
}

export default function Leaderboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [leaderboardData] = useState<LeaderboardEntry[]>([
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'SJ',
      score: 2450,
      department: 'Engineering',
      achievements: 12,
      trend: 'up',
      rank: 1
    },
    {
      id: 2,
      name: 'Mike Chen',
      avatar: 'MC',
      score: 2380,
      department: 'Product',
      achievements: 10,
      trend: 'up',
      rank: 2
    },
    {
      id: 3,
      name: 'Lisa Rodriguez',
      avatar: 'LR',
      score: 2290,
      department: 'Design',
      achievements: 11,
      trend: 'same',
      rank: 3
    },
    {
      id: 4,
      name: 'David Kim',
      avatar: 'DK',
      score: 2150,
      department: 'Analytics',
      achievements: 8,
      trend: 'down',
      rank: 4
    },
    {
      id: 5,
      name: 'Emma Wilson',
      avatar: 'EW',
      score: 2080,
      department: 'Marketing',
      achievements: 9,
      trend: 'up',
      rank: 5
    }
  ]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="text-yellow-500" size={24} />;
      case 2: return <Medal className="text-gray-400" size={24} />;
      case 3: return <Medal className="text-amber-600" size={24} />;
      default: return <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">{rank}</div>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="text-green-500" size={16} />;
      case 'down': return <TrendingUp className="text-red-500 rotate-180" size={16} />;
      default: return <div className="w-4 h-4 bg-gray-300 rounded-full"></div>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default: return 'bg-gradient-to-r from-blue-400 to-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Top Performers</h2>
          <p className="text-gray-600">Gamified rewards and recognition system</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'quarter'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg transition-all capitalize ${
                selectedPeriod === period
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Hall of Fame</h3>
        <div className="flex items-end justify-center gap-4">
          {/* 2nd Place */}
          <div className="text-center">
            <div className="w-20 h-16 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg flex items-end justify-center pb-2">
              <span className="text-white font-bold">2</span>
            </div>
            <div className="mt-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mx-auto">
                {leaderboardData[1]?.avatar}
              </div>
              <p className="text-sm font-medium mt-2">{leaderboardData[1]?.name}</p>
              <p className="text-xs text-gray-500">{leaderboardData[1]?.score} pts</p>
            </div>
          </div>

          {/* 1st Place */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-t-lg flex items-end justify-center pb-2">
              <Trophy className="text-white" size={20} />
            </div>
            <div className="mt-3">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mx-auto border-4 border-yellow-400">
                {leaderboardData[0]?.avatar}
              </div>
              <p className="text-sm font-medium mt-2">{leaderboardData[0]?.name}</p>
              <p className="text-xs text-gray-500">{leaderboardData[0]?.score} pts</p>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="text-center">
            <div className="w-20 h-12 bg-gradient-to-t from-amber-500 to-amber-600 rounded-t-lg flex items-end justify-center pb-2">
              <span className="text-white font-bold">3</span>
            </div>
            <div className="mt-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mx-auto">
                {leaderboardData[2]?.avatar}
              </div>
              <p className="text-sm font-medium mt-2">{leaderboardData[2]?.name}</p>
              <p className="text-xs text-gray-500">{leaderboardData[2]?.score} pts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Complete Rankings</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {leaderboardData.map((entry) => (
            <div key={entry.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  {getRankIcon(entry.rank)}
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {entry.avatar}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{entry.name}</h4>
                      <p className="text-sm text-gray-500">{entry.department}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">{entry.score}</span>
                        {getTrendIcon(entry.trend)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Award size={14} />
                        {entry.achievements} achievements
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <Star className="text-yellow-500 mx-auto mb-2" size={24} />
          <div className="text-lg font-bold text-gray-900">Project Excellence</div>
          <div className="text-sm text-gray-600">500 pts each</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <Trophy className="text-blue-500 mx-auto mb-2" size={24} />
          <div className="text-lg font-bold text-gray-900">Team Collaboration</div>
          <div className="text-sm text-gray-600">300 pts each</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <Award className="text-green-500 mx-auto mb-2" size={24} />
          <div className="text-lg font-bold text-gray-900">Innovation</div>
          <div className="text-sm text-gray-600">750 pts each</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <Medal className="text-purple-500 mx-auto mb-2" size={24} />
          <div className="text-lg font-bold text-gray-900">Mentorship</div>
          <div className="text-sm text-gray-600">400 pts each</div>
        </div>
      </div>
    </div>
  );
}