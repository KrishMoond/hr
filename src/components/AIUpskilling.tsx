import { useState } from 'react';
import { BookOpen, Clock, Star, TrendingUp, Play, CheckCircle } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  recommended: boolean;
  category: string;
}

export default function AIUpskilling() {
  const [courses] = useState<Course[]>([
    {
      id: 1,
      title: 'Advanced React Development',
      description: 'Master modern React patterns and hooks for scalable applications',
      duration: '8 hours',
      difficulty: 'Advanced',
      progress: 0,
      recommended: true,
      category: 'Frontend'
    },
    {
      id: 2,
      title: 'TypeScript Fundamentals',
      description: 'Learn type-safe JavaScript development with TypeScript',
      duration: '6 hours',
      difficulty: 'Intermediate',
      progress: 45,
      recommended: true,
      category: 'Programming'
    },
    {
      id: 3,
      title: 'Leadership & Team Management',
      description: 'Develop essential leadership skills for senior roles',
      duration: '12 hours',
      difficulty: 'Intermediate',
      progress: 0,
      recommended: true,
      category: 'Soft Skills'
    },
    {
      id: 4,
      title: 'Cloud Architecture Basics',
      description: 'Introduction to cloud computing and AWS services',
      duration: '10 hours',
      difficulty: 'Beginner',
      progress: 100,
      recommended: false,
      category: 'Cloud'
    }
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Frontend': return '#4169E1';
      case 'Programming': return '#10B981';
      case 'Soft Skills': return '#8B5CF6';
      case 'Cloud': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">AI-Powered Upskilling</h2>
        <p className="text-gray-600">Personalized learning recommendations based on your role and career goals</p>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <TrendingUp className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Recommendation</h3>
            <p className="text-sm text-gray-600">Based on your current role and industry trends</p>
          </div>
        </div>
        <p className="text-gray-700 mb-3">
          As a Senior Developer, focusing on <strong>Advanced React Development</strong> and <strong>Leadership Skills</strong> 
          will prepare you for tech lead opportunities and align with current market demands.
        </p>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">React</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">Leadership</span>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">TypeScript</span>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-all">
            {course.recommended && (
              <div className="flex items-center gap-2 mb-3">
                <Star className="text-yellow-500 fill-current" size={16} />
                <span className="text-sm font-medium text-yellow-700">AI Recommended</span>
              </div>
            )}
            
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{course.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                {course.duration}
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(course.difficulty)}`}>
                {course.difficulty}
              </span>
              <div 
                className="px-2 py-1 text-xs rounded-full text-white"
                style={{ backgroundColor: getCategoryColor(course.category) }}
              >
                {course.category}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium text-gray-900">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
              {course.progress === 100 ? (
                <>
                  <CheckCircle size={16} />
                  Completed
                </>
              ) : course.progress > 0 ? (
                <>
                  <Play size={16} />
                  Continue Learning
                </>
              ) : (
                <>
                  <BookOpen size={16} />
                  Start Course
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Learning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">4</div>
          <div className="text-sm text-gray-600">Courses Available</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">1</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-purple-600">36h</div>
          <div className="text-sm text-gray-600">Total Learning Time</div>
        </div>
      </div>
    </div>
  );
}