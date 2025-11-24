import { useState } from 'react';
import { AlertTriangle, TrendingDown, User, Calendar, Brain, Target } from 'lucide-react';

interface Alert {
  id: number;
  employeeId: number;
  employeeName: string;
  type: 'morale' | 'skills' | 'performance' | 'engagement';
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
  predictedDate: string;
  confidence: number;
}

export default function EarlyAlerts() {
  const [alerts] = useState<Alert[]>([
    {
      id: 1,
      employeeId: 101,
      employeeName: 'John Smith',
      type: 'morale',
      severity: 'high',
      description: 'Declining engagement scores and reduced participation in team activities',
      recommendation: 'Schedule 1-on-1 meeting to discuss concerns and provide support',
      predictedDate: '2024-02-15',
      confidence: 87
    },
    {
      id: 2,
      employeeId: 102,
      employeeName: 'Emily Davis',
      type: 'skills',
      severity: 'medium',
      description: 'Current skills may become outdated with upcoming technology changes',
      recommendation: 'Enroll in React 18 and TypeScript advanced courses',
      predictedDate: '2024-03-01',
      confidence: 73
    },
    {
      id: 3,
      employeeId: 103,
      employeeName: 'Alex Johnson',
      type: 'performance',
      severity: 'medium',
      description: 'Performance metrics showing gradual decline over past 3 months',
      recommendation: 'Provide additional mentoring and set clear performance goals',
      predictedDate: '2024-02-28',
      confidence: 81
    }
  ]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'morale': return TrendingDown;
      case 'skills': return Brain;
      case 'performance': return Target;
      case 'engagement': return User;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'morale': return '#EF4444';
      case 'skills': return '#8B5CF6';
      case 'performance': return '#F59E0B';
      case 'engagement': return '#06B6D4';
      default: return '#6B7280';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-red-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Early Alert System</h2>
        <p className="text-gray-600">AI-powered predictions to prevent employee issues before they occur</p>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-l-red-500">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={20} />
            <div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-600">Active Alerts</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-l-yellow-500">
          <div className="flex items-center gap-3">
            <TrendingDown className="text-yellow-500" size={20} />
            <div>
              <div className="text-2xl font-bold text-gray-900">1</div>
              <div className="text-sm text-gray-600">High Risk</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <Brain className="text-blue-500" size={20} />
            <div>
              <div className="text-2xl font-bold text-gray-900">80%</div>
              <div className="text-sm text-gray-600">Avg Confidence</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-l-green-500">
          <div className="flex items-center gap-3">
            <Target className="text-green-500" size={20} />
            <div>
              <div className="text-2xl font-bold text-gray-900">15</div>
              <div className="text-sm text-gray-600">Prevented Issues</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
            <Brain className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Analysis</h3>
            <p className="text-sm text-gray-600">Based on performance data, engagement metrics, and behavioral patterns</p>
          </div>
        </div>
        <p className="text-gray-700">
          The system has identified <strong>3 employees</strong> at risk of performance decline or disengagement. 
          Early intervention can prevent <strong>67% of potential issues</strong> based on historical data.
        </p>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {alerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            const typeColor = getTypeColor(alert.type);
            
            return (
              <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div 
                    className="p-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: `${typeColor}20` }}
                  >
                    <Icon size={20} style={{ color: typeColor }} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{alert.employeeName}</h4>
                        <p className="text-sm text-gray-600 capitalize">{alert.type} Risk Alert</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-xs rounded-full border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity} risk
                        </span>
                        <span className={`text-sm font-medium ${getConfidenceColor(alert.confidence)}`}>
                          {alert.confidence}% confidence
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-1">Issue Description</h5>
                        <p className="text-sm text-gray-600">{alert.description}</p>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-1">Recommended Action</h5>
                        <p className="text-sm text-gray-600">{alert.recommendation}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          Predicted impact: {alert.predictedDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          Employee ID: {alert.employeeId}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-4">
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm">
                        Take Action
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm">
                        Schedule Meeting
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prevention Metrics */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prevention Success Rate</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
            <div className="text-sm text-gray-600">Issues Prevented</div>
            <div className="text-xs text-gray-500 mt-1">Last 6 months</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">15</div>
            <div className="text-sm text-gray-600">Early Interventions</div>
            <div className="text-xs text-gray-500 mt-1">This quarter</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">4.2</div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
            <div className="text-xs text-gray-500 mt-1">Days to action</div>
          </div>
        </div>
      </div>
    </div>
  );
}