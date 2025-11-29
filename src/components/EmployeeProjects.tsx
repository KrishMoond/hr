import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Target, CheckCircle, Play, Pause, MessageSquare } from 'lucide-react';
import api from '../services/api';
import ProjectChat from './ProjectChat';

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
}

const EmployeeProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectChat, setSelectedProjectChat] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadProjects();
    getCurrentUser();
  }, []);

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
      setProjects(projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
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
      critical: 'text-red-600 bg-red-50',
      high: 'text-orange-600 bg-orange-50',
      medium: 'text-yellow-600 bg-yellow-50',
      low: 'text-green-600 bg-green-50'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return React.createElement(Play, { size: 16, className: "text-green-600" });
      case 'completed':
        return React.createElement(CheckCircle, { size: 16, className: "text-gray-600" });
      case 'on-hold':
        return React.createElement(Pause, { size: 16, className: "text-yellow-600" });
      default:
        return React.createElement(Clock, { size: 16, className: "text-blue-600" });
    }
  };

  if (loading) {
    return (
      React.createElement('div', { className: "flex items-center justify-center h-64" },
        React.createElement('div', { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169E1]" })
      )
    );
  }

  return (
    React.createElement('div', { className: "max-w-6xl mx-auto space-y-8" },
      React.createElement('div', { className: "flex items-center justify-between mb-8" },
        React.createElement('div', null,
          React.createElement('h2', { className: "text-2xl font-bold text-gray-800" }, "My Projects"),
          React.createElement('p', { className: "text-gray-600 mt-1" }, "Projects you're currently assigned to")
        ),
        React.createElement('div', { className: "text-sm text-gray-500 bg-white px-3 py-1 rounded-full border" },
          `${projects.length} project${projects.length !== 1 ? 's' : ''}`
        )
      ),
      
      projects.length === 0 ? (
        React.createElement('div', { className: "bg-white rounded-xl p-8 text-center shadow-md border border-gray-200 max-w-md mx-auto" },
          React.createElement(Target, { className: "mx-auto h-12 w-12 text-gray-400 mb-4" }),
          React.createElement('h3', { className: "text-lg font-medium text-gray-900 mb-2" }, "No Projects Assigned"),
          React.createElement('p', { className: "text-gray-500" }, "You're not currently assigned to any projects.")
        )
      ) : (
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto" },
          projects.map((project) =>
            React.createElement('div', { 
              key: project._id, 
              className: "bg-white rounded-xl p-5 shadow-md border border-gray-200 hover:shadow-lg transition-all h-80 flex flex-col" 
            },
              React.createElement('div', { className: "flex items-start justify-between mb-3" },
                React.createElement('div', { className: "flex-1 min-w-0" },
                  React.createElement('h3', { className: "text-base font-semibold text-gray-900 mb-2 leading-tight truncate" }, project.title),
                  React.createElement('p', { className: "text-sm text-gray-600 leading-snug line-clamp-2" }, project.description)
                ),
                React.createElement('div', { className: "flex items-center gap-2 ml-4" },
                  getStatusIcon(project.status),
                  React.createElement('span', { className: `w-3 h-3 rounded-full ${getStatusColor(project.status)}` })
                )
              ),
              
              React.createElement('div', { className: "mt-auto" },
                React.createElement('div', { className: "space-y-2 mb-4" },
                  React.createElement('div', { className: "flex items-center justify-between text-sm" },
                    React.createElement('span', { className: "text-gray-500" }, "Progress"),
                    React.createElement('span', { className: "font-medium text-gray-900" }, `${project.progress}%`)
                  ),
                  React.createElement('div', { className: "w-full bg-gray-200 rounded-full h-2" },
                    React.createElement('div', {
                      className: "bg-[#4169E1] h-2 rounded-full transition-all",
                      style: { width: `${project.progress}%` }
                    })
                  )
                ),
                
                React.createElement('div', { className: "space-y-1.5 mb-3" },
                  React.createElement('div', { className: "flex items-center gap-2 text-xs text-gray-600" },
                    React.createElement(Calendar, { size: 12 }),
                    React.createElement('span', null, `${new Date(project.startDate).toLocaleDateString()} - ${new Date(project.endDate).toLocaleDateString()}`)
                  ),
                  React.createElement('div', { className: "flex items-center gap-2 text-xs text-gray-600" },
                    React.createElement(Users, { size: 12 }),
                    React.createElement('span', null, `${project.teamMembers.length} member${project.teamMembers.length !== 1 ? 's' : ''}`)
                  )
                ),
                
                React.createElement('div', { className: "flex items-center justify-between" },
                  React.createElement('span', { className: `px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}` },
                    project.priority.toUpperCase()
                  ),
                  React.createElement('div', { className: "flex items-center gap-2" },
                    React.createElement('button', {
                      onClick: () => setSelectedProjectChat(project),
                      className: "p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors",
                      title: "Team Chat"
                    },
                      React.createElement(MessageSquare, { className: "h-4 w-4" })
                    ),
                    React.createElement('div', { className: "text-xs text-gray-500" },
                      `PM: ${project.projectManager.firstName} ${project.projectManager.lastName}`
                    )
                  )
                ),
                
                project.tags && project.tags.length > 0 && (
                  React.createElement('div', { className: "mt-3 flex flex-wrap gap-1" },
                    project.tags.slice(0, 3).map((tag, index) =>
                      React.createElement('span', { 
                        key: index, 
                        className: "px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md" 
                      }, tag)
                    ),
                    project.tags.length > 3 && (
                      React.createElement('span', { className: "px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-md" },
                        `+${project.tags.length - 3} more`
                      )
                    )
                  )
                )
              )
            )
          )
        )
      ),
      
      selectedProjectChat && currentUser && (
        React.createElement(ProjectChat, {
          projectId: selectedProjectChat._id,
          projectTitle: selectedProjectChat.title,
          currentUser: currentUser,
          onClose: () => setSelectedProjectChat(null)
        })
      )
    )
  );
};

export default EmployeeProjects;