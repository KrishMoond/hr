import { useState, useRef, useEffect } from 'react';
import { Send, Search, Phone, Video, MoreVertical, Paperclip, Smile, Users, Plus } from 'lucide-react';

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'image';
  isRead: boolean;
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  type: 'individual' | 'group';
  participants?: number;
}

interface User {
  id: number;
  name: string;
  avatar: string;
  isOnline: boolean;
}

export default function ChatSection() {
  const [chats] = useState<Chat[]>([
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'SJ',
      lastMessage: 'Thanks for the update on the project!',
      lastMessageTime: '2 min ago',
      unreadCount: 2,
      isOnline: true,
      type: 'individual'
    },
    {
      id: 2,
      name: 'Development Team',
      avatar: 'DT',
      lastMessage: 'Mike: The new feature is ready for testing',
      lastMessageTime: '15 min ago',
      unreadCount: 5,
      isOnline: false,
      type: 'group',
      participants: 8
    },
    {
      id: 3,
      name: 'Lisa Rodriguez',
      avatar: 'LR',
      lastMessage: 'Can we schedule a design review?',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      isOnline: true,
      type: 'individual'
    },
    {
      id: 4,
      name: 'HR Announcements',
      avatar: 'HR',
      lastMessage: 'New wellness program starting next week',
      lastMessageTime: '2 hours ago',
      unreadCount: 1,
      isOnline: false,
      type: 'group',
      participants: 120
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      senderId: 1,
      senderName: 'Sarah Johnson',
      content: 'Hi! How is the dashboard project coming along?',
      timestamp: '10:30 AM',
      type: 'text',
      isRead: true
    },
    {
      id: 2,
      senderId: 0, // Current user
      senderName: 'You',
      content: 'Great! I just finished the interactive components. The charts are looking really good.',
      timestamp: '10:32 AM',
      type: 'text',
      isRead: true
    },
    {
      id: 3,
      senderId: 1,
      senderName: 'Sarah Johnson',
      content: 'Awesome! Can you show me a demo later today?',
      timestamp: '10:35 AM',
      type: 'text',
      isRead: true
    },
    {
      id: 4,
      senderId: 0,
      senderName: 'You',
      content: 'Sure! How about 3 PM?',
      timestamp: '10:36 AM',
      type: 'text',
      isRead: true
    },
    {
      id: 5,
      senderId: 1,
      senderName: 'Sarah Johnson',
      content: 'Perfect! Thanks for the update on the project!',
      timestamp: '10:38 AM',
      type: 'text',
      isRead: false
    }
  ]);

  const [selectedChat, setSelectedChat] = useState<Chat>(chats[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        senderId: 0,
        senderName: 'You',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        isRead: true
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
            <button className="p-2 bg-[#4169E1] text-white rounded-full hover:bg-[#3559d1] transition-all">
              <Plus size={16} />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedChat.id === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-[#4169E1] rounded-full flex items-center justify-center text-white font-semibold">
                    {chat.avatar}
                  </div>
                  {chat.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {chat.name}
                      {chat.type === 'group' && (
                        <span className="ml-1 text-xs text-gray-500">({chat.participants})</span>
                      )}
                    </h3>
                    <span className="text-xs text-gray-500">{chat.lastMessageTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                    {chat.unreadCount > 0 && (
                      <span className="ml-2 px-2 py-1 bg-[#4169E1] text-white text-xs rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-[#4169E1] rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedChat.avatar}
                </div>
                {selectedChat.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedChat.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedChat.type === 'group' 
                    ? `${selectedChat.participants} members` 
                    : selectedChat.isOnline ? 'Online' : 'Last seen recently'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                <Phone size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                <Video size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.senderId === 0
                  ? 'bg-[#4169E1] text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {message.senderId !== 0 && selectedChat.type === 'group' && (
                  <p className="text-xs font-semibold mb-1 text-blue-600">{message.senderName}</p>
                )}
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.senderId === 0 ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all">
              <Paperclip size={20} />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:bg-gray-200 rounded-full transition-all">
                <Smile size={16} />
              </button>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-[#4169E1] text-white rounded-full hover:bg-[#3559d1] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}