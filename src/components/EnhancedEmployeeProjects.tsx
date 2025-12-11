import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, Clock, Target, CheckCircle, Play, Pause, MessageSquare, 
  Filter, Search, Grid, List, BarChart3, Plus, FileText, Star, AlertCircle,
  ChevronDown, ChevronRight, Settings, Download, Share2, Eye, Edit3
} from 'lucide-react';
import api from '../services/api';
import ProjectChat from './ProjectChat';

interface Task {
  _id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  assignedTo: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate: string;
  budget?: number;
  tags?: string[];
  projectManager: {
    firstName: string;
    lastName: string;
  };
  teamMembers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
  }>;
  progress: number;
  tasks?: Task[];
}

const EnhancedEmployeeProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectChat, setSelectedProjectChat] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProjects();
    getCurrentUser();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, statusFilter, priorityFilter]);

  const getCurrentUser = async () => {
    try {
      const data = await api.getCurrentUser();
      setCurrentUser(data.user);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const projects = await api.get('/projects');
      const projectsWithTasks = await Promise.all(
        projects.map(async (project: Project) => {
          try {
            const tasks = await api.getTasks({ projectId: project._id });
            return { ...project, tasks: tasks || [] };
          } catch {
            return { ...project, tasks: [] };
          }
        })
      );
      setProjects(projectsWithTasks);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    setFilteredProjects(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-500',
      planning: 'bg-blue-500',
      'on-hold': 'bg-yellow-500',
      completed: 'bg-gray-500',
      cancelled: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-400';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'text-red-600 bg-red-50 border-red-200',
      high: 'text-orange-600 bg-orange-50 border-orange-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-green-600 bg-green-50 border-green-200'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getTaskStatusColor = (status: string) => {
    const colors = {
      'todo': 'bg-gray-100 text-gray-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const updateTaskStatus = async (projectId: string, taskId: string, newStatus: string) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      loadProjects(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const getProjectStats = () => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const overdue = projects.filter(p => new Date(p.endDate) < new Date() && p.status !== 'completed').length;
    
    return { total, active, completed, overdue };
  };

  const stats = getProjectStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169E1]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Projects</h2>
          <p className="text-gray-600 mt-1">Manage your assigned projects and tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Target className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Projects</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Play className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <CheckCircle className="text-gray-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              <p className="text-sm text-gray-600">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {showFilters && (
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Projects */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Target className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Projects Found</h3>
          <p className="text-gray-500">
            {projects.length === 0 
              ? "You're not currently assigned to any projects."
              : "No projects match your current filters."
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className={`bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all ${
                viewMode === 'list' ? 'p-6' : 'p-5'
              }`}
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{project.title}</h3>
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setSelectedProjectChat(project)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Team Chat"
                  >
                    <MessageSquare size={16} />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <Settings size={16} />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-gray-900">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#4169E1] h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Project Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} />
                    <span>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}>
                    {project.priority.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={14} />
                    <span>{project.teamMembers.length} members</span>
                  </div>
                  <span className="text-gray-600">
                    PM: {project.projectManager.firstName} {project.projectManager.lastName}
                  </span>
                </div>
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-md">
                      +{project.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Tasks Section */}
              {project.tasks && project.tasks.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={() => setExpandedProject(expandedProject === project._id ? null : project._id)}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    <span>Tasks ({project.tasks.length})</span>
                    {expandedProject === project._id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {expandedProject === project._id && (
                    <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                      {project.tasks.map((task) => (
                        <div key={task._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={task.status === 'completed'}
                              onChange={(e) => updateTaskStatus(project._id, task._id, e.target.checked ? 'completed' : 'todo')}
                              disabled={task.status === 'completed'}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span className={`text-sm truncate ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                              {task.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getTaskStatusColor(task.status)}`}>
                              {task.status.replace('-', ' ')}
                            </span>
                            {task.dueDate && (
                              <span className="text-xs text-gray-500">
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Project Chat Modal */}
      {selectedProjectChat && currentUser && (
        <ProjectChat
          projectId={selectedProjectChat._id}
          projectTitle={selectedProjectChat.title}
          currentUser={currentUser}
          onClose={() => setSelectedProjectChat(null)}
        />
      )}
    </div>
  );
};

export default EnhancedEmployeeProjects;