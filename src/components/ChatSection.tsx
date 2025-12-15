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
        // remove listeners and disconnect to ensure a fresh socket when user changes
        try {
          socketService.off('new-message');
          socketService.off('message-read');
        } catch (err) {}
        socketService.disconnect();
      };
    }
  }, [user?._id]);

  useEffect(() => {
    // reload users and conversations whenever user changes (e.g., switch account)
    if (user?._id) {
      // clear previous selection/messages to avoid showing stale data
      setSelectedUser(null);
      setMessages([]);
      setReadReceipts(new Set());
      loadData();
    }
  }, [user?._id]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Use allSettled so one failing call won't keep the UI stuck loading
      const results = await Promise.allSettled([
        apiService.getUsers(),
        apiService.getConversations()
      ]);

      const usersResult = results[0];
      const convResult = results[1];

      if (usersResult.status === 'fulfilled' && Array.isArray(usersResult.value)) {
        setUsers(usersResult.value);
      } else {
        console.error('Failed to load users:', usersResult);
        setUsers([]);
      }

      if (convResult.status === 'fulfilled' && Array.isArray(convResult.value)) {
        setConversations(convResult.value);
      } else {
        console.error('Failed to load conversations:', convResult);
        setConversations([]);
      }
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
    <div className="flex h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
      {/* Users/Conversations Sidebar */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Team Chat</h2>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent transition-all shadow-sm"
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
                  className={`flex items-center gap-3 p-4 hover:bg-white rounded-xl cursor-pointer transition-all transform hover:scale-105 ${
                    selectedUser?._id === conv._id ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-l-[#4169E1] shadow-sm' : 'hover:shadow-sm'
                  }`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4169E1] to-[#3559d1] rounded-xl flex items-center justify-center text-white font-semibold shadow-sm">
                    {conv.firstName[0]}{conv.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">
                        {conv.firstName} {conv.lastName}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 animate-pulse shadow-sm">
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
                className={`flex items-center gap-3 p-4 hover:bg-white rounded-xl cursor-pointer transition-all transform hover:scale-105 ${
                  selectedUser?._id === u._id ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-l-[#4169E1] shadow-sm' : 'hover:shadow-sm'
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-sm">
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  {u.isActive && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse shadow-sm"></div>
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
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4169E1] to-[#3559d1] rounded-xl flex items-center justify-center text-white font-semibold shadow-sm">
                  {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">{selectedUser.department}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/30 to-white">
              {messages.map((message) => {
                const isSender = message.sender._id === user._id;
                return (
                  <div
                    key={message._id}
                    className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative shadow-sm transition-all hover:shadow-md ${
                        isSender
                          ? 'bg-gradient-to-r from-[#4169E1] to-[#3559d1] text-white rounded-br-none'
                          : 'bg-white text-gray-900 rounded-bl-none border border-gray-100'
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
            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full px-6 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent transition-all"
                  />
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-gradient-to-r from-[#4169E1] to-[#3559d1] text-white rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Start a Conversation</h3>
              <p className="text-gray-500">Select a team member to begin chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}