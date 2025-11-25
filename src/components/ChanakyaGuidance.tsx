import { useState } from 'react';
import { Quote, Send, Bot } from 'lucide-react';

interface Message {
  id: number;
  type: 'bot' | 'user';
  content: string;
  timestamp: string;
}

interface BotResponse {
  keywords: string[];
  response: string;
  category: 'work' | 'leadership' | 'stress' | 'career' | 'team' | 'motivation' | 'ethics';
}

export default function ChanakyaGuidance() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: "🙏 Namaste! I am Chanakya, your workplace wisdom guide. Ask me about work challenges, leadership, career growth, or team issues. I have ancient wisdom for modern problems!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const botResponses: BotResponse[] = [
    // Work & Productivity
    { keywords: ['work', 'job', 'task', 'productivity', 'busy', 'workload'], response: "📚 'Before you start some work, always ask yourself three questions - Why am I doing it, What the results might be and Will I be successful.' Focus on purpose, not just activity.", category: 'work' },
    { keywords: ['deadline', 'pressure', 'urgent', 'time'], response: "⏰ 'Time is the most valuable thing we have. Don't waste it on unimportant tasks.' Prioritize wisely and work with focus, not panic.", category: 'work' },
    { keywords: ['lazy', 'procrastination', 'delay', 'postpone'], response: "🚀 'Once you start working on something, don't be afraid of failure and don't abandon it.' Start small, but start today. Action beats perfection.", category: 'motivation' },
    { keywords: ['quality', 'excellence', 'perfection', 'standards'], response: "💎 'Whatever work you do, do it with full dedication and sincerity.' Excellence is not a skill, it's an attitude.", category: 'work' },
    
    // Leadership & Management
    { keywords: ['leader', 'leadership', 'manage', 'boss', 'authority'], response: "👑 'A leader is one who knows the way, goes the way, and shows the way.' Lead by example, not by command.", category: 'leadership' },
    { keywords: ['team', 'teamwork', 'collaboration', 'group'], response: "🤝 'The fragrance of flowers spreads only in the direction of the wind. But the goodness of a person spreads in all directions.' Be the positive influence your team needs.", category: 'team' },
    { keywords: ['decision', 'choice', 'decide', 'judgment'], response: "🎯 'Test a servant while in the discharge of his duty, a relative in difficulty, a friend in adversity.' Make decisions based on evidence, not emotions.", category: 'leadership' },
    { keywords: ['delegate', 'responsibility', 'trust', 'assign'], response: "⚖️ 'Give responsibility to those who can handle it, but always verify the results.' Trust but verify - the golden rule of delegation.", category: 'leadership' },
    
    // Stress & Mental Health
    { keywords: ['stress', 'tension', 'anxiety', 'worried', 'overwhelmed'], response: "🧘 'A person should not be too honest. Straight trees are cut first.' Sometimes, step back and observe before reacting. Not every battle needs to be fought.", category: 'stress' },
    { keywords: ['angry', 'anger', 'frustrated', 'annoyed'], response: "🔥 'Anger is the enemy of wisdom.' Take three deep breaths before responding. Your future self will thank you.", category: 'stress' },
    { keywords: ['tired', 'exhausted', 'burnout', 'fatigue'], response: "🌱 'Even the strongest tree needs rest between seasons.' Take breaks, recharge yourself. Productivity comes from energy, not just effort.", category: 'stress' },
    { keywords: ['balance', 'life', 'personal', 'family'], response: "⚖️ 'Treat your family like a treasure and your work like a duty.' Both are important, but family gives you strength to excel at work.", category: 'stress' },
    
    // Career Growth
    { keywords: ['career', 'growth', 'promotion', 'advance', 'success'], response: "📈 'Education is the best friend. An educated person is respected everywhere.' Keep learning, keep growing. Your skills are your greatest asset.", category: 'career' },
    { keywords: ['learning', 'skill', 'knowledge', 'study', 'course'], response: "📖 'Books are as useful to a stupid person as a mirror is useful to a blind person.' Learn with purpose and apply with wisdom.", category: 'career' },
    { keywords: ['opportunity', 'chance', 'luck', 'fortune'], response: "🎯 'Opportunity comes to those who are prepared.' Keep sharpening your skills, luck favors the prepared mind.", category: 'career' },
    { keywords: ['change', 'new', 'different', 'switch'], response: "🔄 'Change is the law of nature. Those who resist change will be left behind.' Embrace change as a chance to grow stronger.", category: 'career' },
    
    // Relationships & Communication
    { keywords: ['colleague', 'coworker', 'relationship', 'people'], response: "🤝 'Never make friends with people who are above or below you in status for wrong reasons.' Build genuine relationships based on mutual respect.", category: 'team' },
    { keywords: ['communication', 'talk', 'speak', 'conversation'], response: "💬 'Speak only when your words are more valuable than silence.' Choose your words wisely, they have power to build or destroy.", category: 'team' },
    { keywords: ['conflict', 'fight', 'argument', 'dispute'], response: "⚔️ 'The wise person avoids unnecessary conflicts but stands firm on principles.' Pick your battles wisely.", category: 'team' },
    { keywords: ['help', 'support', 'assist', 'cooperation'], response: "🤲 'Help others climb the mountain, and you'll reach the summit together.' Collaboration multiplies success.", category: 'team' },
    
    // Ethics & Values
    { keywords: ['honest', 'truth', 'integrity', 'ethics'], response: "💎 'Honesty is the first chapter in the book of wisdom.' Be truthful, but also be wise about when and how to speak truth.", category: 'ethics' },
    { keywords: ['money', 'salary', 'wealth', 'rich'], response: "💰 'Wealth is not about having a lot of money; it's about having a lot of options.' Focus on building skills, money will follow.", category: 'ethics' },
    { keywords: ['respect', 'dignity', 'honor', 'reputation'], response: "👑 'Respect is earned through actions, not demanded through position.' Your character is your true crown.", category: 'ethics' },
    { keywords: ['mistake', 'error', 'wrong', 'failure'], response: "🌱 'Failure is the stepping stone to success.' Learn from mistakes, don't repeat them. Every failure teaches valuable lessons.", category: 'motivation' },
    
    // Motivation & Inspiration
    { keywords: ['motivation', 'inspire', 'encourage', 'boost'], response: "🔥 'The one excellent thing that can be learned from a lion is that whatever a man intends doing should be done by him with a whole-hearted effort.' Give your 100% to everything you do.", category: 'motivation' },
    { keywords: ['confidence', 'self-doubt', 'believe', 'faith'], response: "💪 'Believe in yourself and your abilities. The world will believe in you too.' Confidence comes from preparation and practice.", category: 'motivation' },
    { keywords: ['goal', 'target', 'aim', 'objective'], response: "🎯 'Set your goals high and work systematically towards them.' A goal without a plan is just a wish.", category: 'motivation' },
    { keywords: ['patience', 'wait', 'slow', 'time'], response: "⏳ 'Patience is the companion of wisdom.' Good things take time. Focus on consistent progress, not instant results.", category: 'motivation' },
    
    // Problem Solving
    { keywords: ['problem', 'issue', 'challenge', 'difficulty'], response: "🧩 'Every problem has a solution. Sometimes you need to change your perspective to see it.' Step back, analyze, then act.", category: 'work' },
    { keywords: ['solution', 'solve', 'fix', 'resolve'], response: "💡 'The best solutions come from understanding the root cause, not just treating symptoms.' Dig deeper to find lasting solutions.", category: 'work' },
    { keywords: ['innovation', 'creative', 'idea', 'new'], response: "🌟 'Innovation comes from questioning the status quo.' Don't be afraid to think differently and propose new ideas.", category: 'work' },
    
    // Success & Achievement
    { keywords: ['success', 'achievement', 'accomplish', 'win'], response: "🏆 'Success is not just about reaching the destination, but about who you become during the journey.' Celebrate growth, not just results.", category: 'motivation' },
    { keywords: ['competition', 'competitor', 'rival', 'compare'], response: "🏃 'Compete with yourself, not others. Your only competition is who you were yesterday.' Focus on personal growth.", category: 'motivation' },
    { keywords: ['recognition', 'appreciation', 'praise', 'reward'], response: "🌟 'Do good work and recognition will follow. Don't work for recognition alone.' Excellence is its own reward.", category: 'motivation' },
    
    // General Wisdom
    { keywords: ['advice', 'guidance', 'help', 'suggestion'], response: "🧠 'The best advice is often the simplest: Be honest, work hard, treat others well, and never stop learning.' These principles never fail.", category: 'ethics' },
    { keywords: ['future', 'tomorrow', 'plan', 'planning'], response: "🔮 'The future belongs to those who prepare for it today.' Plan wisely, but don't forget to live in the present.", category: 'career' },
    { keywords: ['experience', 'learn', 'lesson', 'wisdom'], response: "📚 'Experience is the best teacher, but learning from others' experiences is wisdom.' Stay curious and keep learning.", category: 'career' },
    
    // Default responses
    { keywords: ['hello', 'hi', 'hey', 'namaste'], response: "🙏 Namaste! I'm here to share ancient wisdom for your modern workplace challenges. What's on your mind today?", category: 'motivation' },
    { keywords: ['thank', 'thanks', 'grateful'], response: "🙏 You're welcome! Remember, 'Gratitude is not only the greatest virtue but the parent of all others.' Keep spreading positivity!", category: 'ethics' },
    { keywords: ['bye', 'goodbye', 'see you'], response: "🙏 May wisdom guide your path and success follow your efforts. Until we meet again, stay strong and keep growing!", category: 'motivation' }
  ];

  const findBestResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // Find responses that match keywords
    const matchingResponses = botResponses.filter(response => 
      response.keywords.some(keyword => lowerInput.includes(keyword))
    );
    
    if (matchingResponses.length > 0) {
      // Return the first matching response
      return matchingResponses[0].response;
    }
    
    // Default response if no keywords match
    const defaultResponses = [
      "🤔 Interesting question! Remember: 'The wise person learns from every situation.' What specific challenge are you facing?",
      "💭 'Every question contains the seed of its answer.' Can you tell me more about your situation?",
      "🧘 'Patience and persistence solve most problems.' What area of work or life would you like guidance on?",
      "🌟 'The right question is half the answer.' Could you be more specific about what's troubling you?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const sendMessage = () => {
    if (!userInput.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate Chanakya thinking and responding
    setTimeout(() => {
      const response = findBestResponse(userInput);
      const botMessage: Message = {
        id: messages.length + 2,
        type: 'bot',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);

    setUserInput('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Chanakya AI Assistant</h2>
        <p className="text-gray-600">Ancient wisdom for modern workplace challenges</p>
      </div>

      {/* Chatbot Info */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Chanakya AI Assistant</h3>
            <p className="text-sm text-gray-600">Ancient wisdom for modern workplace challenges</p>
          </div>
        </div>
        <div className="text-gray-700">
          <p className="mb-2">💼 <strong>Ask me about:</strong></p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>• Work & Productivity</div>
            <div>• Leadership & Management</div>
            <div>• Career Growth</div>
            <div>• Team Collaboration</div>
            <div>• Stress Management</div>
            <div>• Ethics & Values</div>
          </div>
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "How to handle work stress?",
            "Tips for better leadership?",
            "How to grow in career?",
            "Dealing with difficult colleagues?",
            "Work-life balance advice?",
            "How to stay motivated?"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setUserInput(suggestion)}
              className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-all text-sm"
            >
              {suggestion}
            </button>
          ))}
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
                  : 'bg-orange-100 text-orange-900 border border-orange-200'
              }`}>
                {message.type === 'bot' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={14} />
                    <span className="text-xs font-medium">Chanakya</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-orange-600'
                }`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-orange-100 border border-orange-200 px-4 py-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Bot size={14} className="text-orange-600" />
                  <span className="text-xs font-medium text-orange-600">Chanakya is thinking...</span>
                </div>
                <div className="flex gap-1 mt-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
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

      {/* Bot Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-orange-600">40+</div>
          <div className="text-sm text-gray-600">Predefined Responses</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">7</div>
          <div className="text-sm text-gray-600">Topic Categories</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-green-600">24/7</div>
          <div className="text-sm text-gray-600">Available</div>
        </div>
      </div>
    </div>
  );
}