import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, AlertCircle, CheckCircle, MessageSquare, BarChart3, User } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  progress: number;
  actualHours: number;
  estimatedHours: number;
  project: { title: string };
  assignedTo: { firstName: string; lastName: string };
  assignedBy: { firstName: string; lastName: string };
  dailyUpdates: Array<{
    date: string;
    update: string;
    hoursWorked: number;
    blockers?: string;
    nextDayPlan?: string;
  }>;
  hasUpdateToday?: boolean;
  needsUpdate?: boolean;
}

interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  pendingUpdates: number;
  completionRate: number;
}

const TaskDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'daily' | 'analytics'>('all');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showDailyUpdate, setShowDailyUpdate] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>('');

  const [dailyUpdate, setDailyUpdate] = useState({
    update: '',
    hoursWorked: 0,
    blockers: '',
    nextDayPlan: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchDailyTasks();
    fetchAnalytics();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyTasks = async () => {
    try {
      const response = await fetch('/api/tasks/my/daily', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setDailyTasks(data);
    } catch (error) {
      console.error('Error fetching daily tasks:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/tasks/analytics/overview', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const submitDailyUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/tasks/${selectedTask}/daily-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dailyUpdate)
      });

      if (response.ok) {
        setShowDailyUpdate(false);
        setDailyUpdate({ update: '', hoursWorked: 0, blockers: '', nextDayPlan: '' });
        fetchDailyTasks();
        fetchAnalytics();
        alert('Daily update submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting daily update:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchTasks();
        fetchDailyTasks();
        fetchAnalytics();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'completed';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Task Dashboard</h2>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalTasks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.completedTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.inProgressTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overdueTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Updates</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.pendingUpdates}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'daily'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Daily Updates ({dailyTasks.filter(t => t.needsUpdate).length})
          </button>
        </nav>
      </div>

      {/* All Tasks Tab */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task._id} className={`bg-white rounded-lg shadow p-6 border-l-4 ${getPriorityColor(task.priority)}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    {isOverdue(task.dueDate, task.status) && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Due: {formatDate(task.dueDate)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {task.actualHours}h / {task.estimatedHours}h
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {task.project.title}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="ml-6">
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Daily Updates Tab */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          {dailyTasks.map((task) => (
            <div key={task._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    {task.hasUpdateToday ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Updated Today
                      </span>
                    ) : task.needsUpdate ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Update Required
                      </span>
                    ) : null}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    Project: {task.project.title}
                  </div>

                  {/* Latest Update */}
                  {task.dailyUpdates.length > 0 && (
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Latest Update:</div>
                      <div className="text-sm text-gray-600">
                        {task.dailyUpdates[task.dailyUpdates.length - 1].update}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(task.dailyUpdates[task.dailyUpdates.length - 1].date)} - 
                        {task.dailyUpdates[task.dailyUpdates.length - 1].hoursWorked}h worked
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-6">
                  <button
                    onClick={() => {
                      setSelectedTask(task._id);
                      setShowDailyUpdate(true);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      task.hasUpdateToday
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {task.hasUpdateToday ? 'Update Again' : 'Add Update'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Daily Update Modal */}
      {showDailyUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Update</h3>
            
            <form onSubmit={submitDailyUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What did you work on today? *
                </label>
                <textarea
                  required
                  rows={3}
                  value={dailyUpdate.update}
                  onChange={(e) => setDailyUpdate(prev => ({ ...prev, update: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Describe your progress, achievements, and activities..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hours Worked *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="24"
                  step="0.5"
                  value={dailyUpdate.hoursWorked}
                  onChange={(e) => setDailyUpdate(prev => ({ ...prev, hoursWorked: parseFloat(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blockers/Issues (Optional)
                </label>
                <textarea
                  rows={2}
                  value={dailyUpdate.blockers}
                  onChange={(e) => setDailyUpdate(prev => ({ ...prev, blockers: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Any obstacles or challenges you faced..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tomorrow's Plan (Optional)
                </label>
                <textarea
                  rows={2}
                  value={dailyUpdate.nextDayPlan}
                  onChange={(e) => setDailyUpdate(prev => ({ ...prev, nextDayPlan: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="What do you plan to work on tomorrow..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDailyUpdate(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;