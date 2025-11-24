import { useState, useEffect } from 'react';
import { Quote, Send, Lightbulb, Heart, Target, Zap } from 'lucide-react';

interface Message {
  id: number;
  type: 'quote' | 'advice' | 'user';
  content: string;
  author?: string;
  timestamp: string;
  category: 'motivation' | 'leadership' | 'wisdom' | 'ethics';
}

export default function ChanakyaGuidance() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'quote',
      content: "A person should not be too honest. Straight trees are cut first and honest people are screwed first.",
      author: 'Chanakya',
      timestamp: '9:00 AM',
      category: 'wisdom'
    },
    {
      id: 2,
      type: 'advice',
      content: "In your leadership role, remember that balance is key. Be honest in your intentions but strategic in your approach. Build trust while maintaining professional boundaries.",
      timestamp: '9:01 AM',
      category: 'leadership'
    }
  ]);

  const [userInput, setUserInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('motivation');

  const chanakyaQuotes = {
    motivation: [
      "Before you start some work, always ask yourself three questions - Why am I doing it, What the results might be and Will I be successful. Only when you think deeply and find satisfactory answers to these questions, go ahead.",
      "Once you start working on something, don't be afraid of failure and don't abandon it. People who work sincerely are the happiest.",
      "The biggest guru-mantra is: never share your secrets with anybody. It will destroy you."
    ],
    leadership: [
      "A leader is one who knows the way, goes the way, and shows the way.",
      "The fragrance of flowers spreads only in the direction of the wind. But the goodness of a person spreads in all directions.",
      "Test a servant while in the discharge of his duty, a relative in difficulty, a friend in adversity, and a wife in misfortune."
    ],
    wisdom: [
      "Education is the best friend. An educated person is respected everywhere. Education beats the beauty and the youth.",
      "Books are as useful to a stupid person as a mirror is useful to a blind person.",
      "The world's biggest power is the youth and beauty of a woman."
    ],
    ethics: [
      "Never make friends with people who are above or below you in status. Such friendships will never give you any happiness.",
      "Treat your kid like a darling for the first five years. For the next five years, scold them. By the time they turn sixteen, treat them like a friend. Your grown up children are your best friends.",
      "The one excellent thing that can be learned from a lion is that whatever a man intends doing should be done by him with a whole-hearted and strenuous effort."
    ]
  };

  const getRandomQuote = (category: string) => {
    const quotes = chanakyaQuotes[category as keyof typeof chanakyaQuotes];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'motivation': return Zap;
      case 'leadership': return Target;
      case 'wisdom': return Lightbulb;
      case 'ethics': return Heart;
      default: return Quote;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'motivation': return '#EF4444';
      case 'leadership': return '#3B82F6';
      case 'wisdom': return '#8B5CF6';
      case 'ethics': return '#10B981';
      default: return '#6B7280';
    }
  };

  const sendMessage = () => {
    if (!userInput.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'motivation'
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate Chanakya's response
    setTimeout(() => {
      const quote = getRandomQuote(selectedCategory);
      const quoteMessage: Message = {
        id: messages.length + 2,
        type: 'quote',
        content: quote,
        author: 'Chanakya',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: selectedCategory as any
      };

      const adviceMessage: Message = {
        id: messages.length + 3,
        type: 'advice',
        content: generateContextualAdvice(userInput, selectedCategory),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: selectedCategory as any
      };

      setMessages(prev => [...prev, quoteMessage, adviceMessage]);
    }, 1000);

    setUserInput('');
  };

  const generateContextualAdvice = (input: string, category: string) => {
    const adviceTemplates = {
      motivation: "Remember, every challenge is an opportunity for growth. Stay focused on your goals and maintain your determination.",
      leadership: "As a leader, your actions speak louder than words. Lead by example and inspire others through your dedication.",
      wisdom: "True wisdom comes from experience and reflection. Take time to learn from both successes and failures.",
      ethics: "Always maintain your moral compass. Ethical behavior builds trust and creates lasting relationships."
    };

    return adviceTemplates[category as keyof typeof adviceTemplates];
  };

  const getDailyWisdom = () => {
    const today = new Date().getDay();
    const categories = ['motivation', 'leadership', 'wisdom', 'ethics'];
    const category = categories[today % categories.length];
    return {
      quote: getRandomQuote(category),
      category
    };
  };

  const dailyWisdom = getDailyWisdom();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Chanakya Guidance</h2>
        <p className="text-gray-600">Ancient wisdom for modern workplace challenges</p>
      </div>

      {/* Daily Wisdom */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <Quote className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Daily Wisdom</h3>
            <p className="text-sm text-gray-600">Today's inspiration from Chanakya</p>
          </div>
        </div>
        <blockquote className="text-gray-700 italic text-lg leading-relaxed">
          "{dailyWisdom.quote}"
        </blockquote>
        <div className="mt-3 text-right text-sm text-gray-600">- Chanakya</div>
      </div>

      {/* Category Selection */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Guidance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.keys(chanakyaQuotes).map((category) => {
            const Icon = getCategoryIcon(category);
            const color = getCategoryColor(category);
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedCategory === category
                    ? 'border-current bg-opacity-10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ 
                  color: selectedCategory === category ? color : '#6B7280',
                  backgroundColor: selectedCategory === category ? `${color}10` : 'transparent'
                }}
              >
                <Icon size={24} className="mx-auto mb-2" />
                <div className="text-sm font-medium capitalize">{category}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Chat with Chanakya</h3>
          <p className="text-sm text-gray-600">Ask for guidance and receive ancient wisdom</p>
        </div>
        
        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.type === 'quote'
                  ? 'bg-orange-100 text-orange-900 border border-orange-200'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {message.type === 'quote' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Quote size={14} />
                    <span className="text-xs font-medium">Ancient Wisdom</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
                {message.author && (
                  <p className="text-xs mt-2 opacity-75">- {message.author}</p>
                )}
                <p className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask Chanakya for guidance..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={!userInput.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Wisdom Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-2">Recent Guidance</h4>
          <div className="text-sm text-gray-600">
            <p>• Leadership principles for team management</p>
            <p>• Ethical decision-making frameworks</p>
            <p>• Motivation during challenging projects</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-2">Popular Topics</h4>
          <div className="text-sm text-gray-600">
            <p>• Work-life balance strategies</p>
            <p>• Career advancement wisdom</p>
            <p>• Team conflict resolution</p>
          </div>
        </div>
      </div>
    </div>
  );
}