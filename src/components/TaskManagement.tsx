import { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Plus, X } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  progress: number;
}

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Complete Q4 Performance Reviews',
      assignee: 'Sarah Johnson',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2024-01-15',
      progress: 75
    },
    {
      id: 2,
      title: 'Update Employee Handbook',
      assignee: 'Mike Chen',
      status: 'pending',
      priority: 'medium',
      dueDate: '2024-01-20',
      progress: 0
    },
    {
      id: 3,
      title: 'Organize Team Building Event',
      assignee: 'Lisa Rodriguez',
      status: 'completed',
      priority: 'low',
      dueDate: '2024-01-10',
      progress: 100
    },
    {
      id: 4,
      title: 'Conduct Exit Interviews',
      assignee: 'David Kim',
      status: 'overdue',
      priority: 'high',
      dueDate: '2024-01-05',
      progress: 30
    }
  ]);

  const [showAddTask, setShowAddTask] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-400" size={16} />;
      case 'in-progress':
        return <Clock className="text-blue-400" size={16} />;
      case 'overdue':
        return <AlertCircle className="text-red-400" size={16} />;
      default:
        return <Clock className="text-gray-400" size={16} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in-progress': return 'text-blue-400';
      case 'overdue': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  const updateTaskProgress = (taskId: number, newProgress: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            progress: newProgress,
            status: newProgress === 100 ? 'completed' : task.status
          }
        : task
    ));
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    overdue: tasks.filter(t => t.status === 'overdue').length
  };

  return (
    <div className="bg-[#0F2557] rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Task Management</h3>
        <button
          onClick={() => setShowAddTask(!showAddTask)}
          className="p-2 bg-[#4169E1] rounded-full hover:bg-[#3559d1] transition-all"
        >
          {showAddTask ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{taskStats.total}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{taskStats.completed}</div>
          <div className="text-xs text-gray-400">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{taskStats.inProgress}</div>
          <div className="text-xs text-gray-400">In Progress</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{taskStats.overdue}</div>
          <div className="text-xs text-gray-400">Overdue</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        {['all', 'pending', 'in-progress', 'completed', 'overdue'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 text-xs rounded-full transition-all capitalize ${
              filter === status 
                ? 'bg-[#4169E1] text-white' 
                : 'bg-[#1a3a7a] text-gray-300 hover:bg-[#2a4a8a]'
            }`}
          >
            {status.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {filteredTasks.map((task) => (
          <div key={task.id} className="p-4 bg-[#1a3a7a] rounded-lg hover:bg-[#2a4a8a] transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(task.status)}
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                </div>
                <p className="text-xs text-gray-400">Assigned to: {task.assignee}</p>
                <p className="text-xs text-gray-400">Due: {task.dueDate}</p>
              </div>
              <span className={`text-xs font-medium ${getStatusColor(task.status)} capitalize`}>
                {task.status.replace('-', ' ')}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Progress</span>
                <span className="text-xs text-gray-400">{task.progress}%</span>
              </div>
              <div className="w-full bg-[#0F2557] rounded-full h-2">
                <div
                  className="bg-[#4169E1] h-2 rounded-full transition-all duration-300 cursor-pointer"
                  style={{ width: `${task.progress}%` }}
                  onClick={() => {
                    const newProgress = task.progress < 100 ? task.progress + 25 : 0;
                    updateTaskProgress(task.id, Math.min(newProgress, 100));
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No tasks found for the selected filter.</p>
        </div>
      )}
    </div>
  );
}