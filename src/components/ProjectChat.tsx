import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Activity, Clock, CheckCircle, BarChart3, CheckSquare } from 'lucide-react';
import socketService from '../services/socket';

interface Message {
  _id: string;
  sender: { firstName: string; lastName: string; _id: string };
  content: string;
  messageType: 'message' | 'status_update' | 'file_share';
  statusUpdate?: {
    oldStatus: string;
    newStatus: string;
    progress: number;
  };
  timestamp: string;
}

interface ProjectChatProps {
  projectId: string;
  projectTitle: string;
  currentUser: any;
  onClose: () => void;
}

const ProjectChat: React.FC<ProjectChatProps> = ({ projectId, projectTitle, currentUser, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', progress: 0 });
  const [tasks, setTasks] = useState<any[]>([]);
  const [showTaskProgress, setShowTaskProgress] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskProgress, setTaskProgress] = useState({ progress: 0, comment: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChat();
    loadTasks();
    joinProjectRoom();
    
    // Listen for new messages and task updates
    socketService.on('new-project-message', handleNewMessage);
    socketService.on('task-progress-update', handleTaskUpdate);
    
    return () => {
      socketService.off('new-project-message', handleNewMessage);
      socketService.off('task-progress-update', handleTaskUpdate);
      socketService.emit('leave-project', projectId);
    };
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChat = async () => {
    try {
      const api = await import('../services/api');
      const chat = await api.default.get(`/project-chat/${projectId}`);
      setMessages(chat.messages || []);
      setParticipants(chat.participants || []);
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const joinProjectRoom = () => {
    socketService.emit('join-project', projectId);
  };

  const loadTasks = async () => {
    try {
      const api = await import('../services/api');
      const projectTasks = await api.default.get(`/tasks?project=${projectId}`);
      setTasks(projectTasks.filter((task: any) => task.assignedTo._id === currentUser._id));
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleNewMessage = (data: any) => {
    if (data.projectId === projectId) {
      setMessages(prev => [...prev, data.message]);
    }
  };

  const handleTaskUpdate = (data: any) => {
    const taskMessage = {
      _id: Date.now().toString(),
      sender: { firstName: data.updatedBy.split(' ')[0], lastName: data.updatedBy.split(' ')[1] || '', _id: 'system' },
      content: `Updated task "${data.taskTitle}" progress to ${data.progress}%${data.comment ? ': ' + data.comment : ''}`,
      messageType: 'task_update',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, taskMessage]);
    loadTasks();
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const api = await import('../services/api');
      await api.default.post(`/project-chat/${projectId}/message`, {
        content: newMessage,
        messageType: 'message'
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendStatusUpdate = async () => {
    if (!statusUpdate.status) return;

    try {
      const api = await import('../services/api');
      await api.default.post(`/project-chat/${projectId}/message`, {
        content: `Updated project status to ${statusUpdate.status}`,
        messageType: 'status_update',
        statusUpdate: {
          newStatus: statusUpdate.status,
          progress: statusUpdate.progress
        }
      });
      setShowStatusUpdate(false);
      setStatusUpdate({ status: '', progress: 0 });
    } catch (error) {
      console.error('Error sending status update:', error);
    }
  };

  const updateTaskProgress = async () => {
    if (!selectedTask) return;

    try {
      const api = await import('../services/api');
      await api.default.put(`/tasks/${selectedTask._id}/progress`, {
        progress: taskProgress.progress,
        comment: taskProgress.comment,
        status: taskProgress.progress === 100 ? 'completed' : 'in-progress'
      });
      setShowTaskProgress(false);
      setSelectedTask(null);
      setTaskProgress({ progress: 0, comment: '' });
      loadTasks();
    } catch (error) {
      console.error('Error updating task progress:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="h-4 w-4 text-green-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'on-hold': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{projectTitle} - Team Chat</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>{participants.length} members</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTaskProgress(true)}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              My Tasks
            </button>
            <button
              onClick={() => setShowStatusUpdate(true)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Update Status
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ×
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div key={message._id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                {message.sender.firstName[0]}{message.sender.lastName[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {message.sender.firstName} {message.sender.lastName}
                  </span>
                  <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                </div>
                
                {message.messageType === 'status_update' ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(message.statusUpdate?.newStatus || '')}
                      <span className="font-medium text-blue-800">Status Update</span>
                    </div>
                    <p className="text-sm text-blue-700">{message.content}</p>
                    {message.statusUpdate?.progress && (
                      <div className="mt-2">
                        <div className="text-xs text-blue-600 mb-1">
                          Progress: {message.statusUpdate.progress}%
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${message.statusUpdate.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : message.messageType === 'task_update' ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Task Progress</span>
                    </div>
                    <p className="text-sm text-green-700">{message.content}</p>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm">{message.content}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* My Tasks Modal */}
        {showTaskProgress && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
              <h4 className="text-lg font-semibold mb-4">My Tasks</h4>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task._id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm">{task.title}</h5>
                      <span className={`px-2 py-1 text-xs rounded ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Progress: {task.progress || 0}%
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setTaskProgress({ progress: task.progress || 0, comment: '' });
                        }}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowTaskProgress(false)}
                className="w-full mt-4 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Task Progress Update Modal */}
        {selectedTask && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <h4 className="text-lg font-semibold mb-4">Update Task Progress</h4>
              <p className="text-sm text-gray-600 mb-4">{selectedTask.title}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taskProgress.progress}
                    onChange={(e) => setTaskProgress({...taskProgress, progress: parseInt(e.target.value)})}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Comment (optional)</label>
                  <textarea
                    value={taskProgress.comment}
                    onChange={(e) => setTaskProgress({...taskProgress, comment: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Add a comment about your progress..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateTaskProgress}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusUpdate && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <h4 className="text-lg font-semibold mb-4">Update Project Status</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate({...statusUpdate, status: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select status</option>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={statusUpdate.progress}
                    onChange={(e) => setStatusUpdate({...statusUpdate, progress: parseInt(e.target.value)})}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowStatusUpdate(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendStatusUpdate}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectChat;