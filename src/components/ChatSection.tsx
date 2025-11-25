import { useState, useRef, useEffect } from 'react';
import { Send, Search, MessageSquare, Users, Check, CheckCheck } from 'lucide-react';
import apiService from '../services/api';
import socketService from '../services/socket';

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  receiver: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  isActive: boolean;
}

interface Conversation {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  isActive: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ChatSectionProps {
  user?: any;
}

export default function ChatSection({ user }: ChatSectionProps = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [readReceipts, setReadReceipts] = useState<Set<string>>(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (user?._id) {
      socketService.connect(user._id);

      // Listen for new messages
      socketService.onNewMessage((newMsg: Message) => {
        setMessages(prev => [...prev, newMsg]);
        // Auto-mark incoming messages as read
        if (newMsg.receiver._id === user._id) {
          apiService.markMessageAsRead(newMsg._id).catch(err => 
            console.error('Failed to mark message as read:', err)
          );
        }
      });

      // Listen for read receipts
      socketService.onMessageRead((data: any) => {
        setReadReceipts(prev => new Set(prev).add(data.messageId));
        // Update messages to show as read
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId ? { ...msg, isRead: true } : msg
        ));
      });

      return () => {
        socketService.offNewMessage();
      };
    }
  }, [user?._id]);

  useEffect(() => {
    // reload users and conversations whenever user changes (e.g., switch account)
    if (user?._id) {
      loadData();
    }
  }, [user?._id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, conversationsData] = await Promise.all([
        apiService.getUsers(),
        apiService.getConversations()
      ]);
      setUsers(usersData);
      setConversations(conversationsData);
    } catch (error) {
      console.error('Failed to load chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      const messagesData = await apiService.getMessages(userId);
      setMessages(messagesData);
      
      // Mark all incoming messages as read
      if (user?._id) {
        apiService.markAllMessagesAsRead(userId).catch(err => 
          console.error('Failed to mark all messages as read:', err)
        );
      }
      setReadReceipts(new Set(messagesData.filter(m => m.isRead).map(m => m._id)));
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleUserSelect = (selectedUser: User | Conversation) => {
    setSelectedUser(selectedUser);
    loadMessages(selectedUser._id);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedUser && user?._id) {
      try {
        const message = await apiService.sendMessage(selectedUser._id, newMessage);
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        
        // Update conversations list
        loadData();
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredUsers = users.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!user?._id) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center text-gray-500">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
          <p>Please log in to use chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Users/Conversations Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Team Chat</h2>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Conversations</h4>
              {conversations.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => handleUserSelect(conv)}
                  className={`flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer ${
                    selectedUser?._id === conv._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {conv.firstName[0]}{conv.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">
                        {conv.firstName} {conv.lastName}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All Users */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">All Users</h4>
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                onClick={() => handleUserSelect(u)}
                className={`flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer ${
                  selectedUser?._id === u._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  {u.isActive && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                  <p className="text-sm text-gray-600">{u.department}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedUser.department}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isSender = message.sender._id === user._id;
                return (
                  <div
                    key={message._id}
                    className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative ${
                        isSender
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      {!isSender && (
                        <p className="text-xs font-semibold mb-1 text-blue-600">
                          {message.sender.firstName} {message.sender.lastName}
                        </p>
                      )}
                      <p className="text-sm break-words mb-1">{message.content}</p>
                      <div
                        className={`flex items-center justify-between text-xs gap-2 ${
                          isSender ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        <span>
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {isSender && (
                          <div className="flex items-center">
                            {readReceipts.has(message._id) || message.isRead ? (
                              <CheckCheck size={14} className="text-blue-200" title="Seen" />
                            ) : (
                              <Check size={14} className="text-blue-300" title="Sent" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a user to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}