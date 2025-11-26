const express = require('express');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Crisis detection patterns
function containsCrisis(text) {
  if (!text || typeof text !== 'string') return false;
  const patterns = [
    /suicide/i, /kill myself/i, /hurt myself/i, /i can't go on/i,
    /end my life/i, /want to die/i, /self[- ]harm/i, /harm myself/i
  ];
  return patterns.some(rx => rx.test(text));
}

// Intent detection - expanded for HR/workplace context
function detectIntent(text) {
  if (!text) return 'small_talk';
  const t = text.toLowerCase();
  
  if (/stress|stressed|anxious|overwhelmed|pressure/.test(t)) return 'stress';
  if (/sleep|insomnia|tired|exhausted|rest/.test(t)) return 'sleep';
  if (/productivity|focus|concentrate|distract|motivat/.test(t)) return 'productivity';
  if (/leadership|leader|manage|boss|team|delegate/.test(t)) return 'leadership';
  if (/leave|time off|vacation|holiday|days off/.test(t)) return 'leave_info';
  if (/career|growth|promotion|advancement|develop/.test(t)) return 'career';
  if (/help|support|talk|someone|resource|hr|human/.test(t)) return 'human_support';
  if (/conflict|fight|argument|difficult|colleague|relation/.test(t)) return 'conflict';
  if (/decision|choice|difficult/.test(t)) return 'decision';
  if (/training|learn|skill|course|development/.test(t)) return 'learning';
  
  return 'small_talk';
}

// Load knowledge base
let knowledgeBase = {};
try {
  knowledgeBase = require('../data/chanakya_knowledge.json');
} catch (err) {
  console.warn('Knowledge base not found, using default responses');
  knowledgeBase = {};
}

// Default curated responses
const defaultReplies = {
  stress: {
    quote: "\"A person should not be too honest. Straight trees are cut first.\"",
    advice: "When stressed, step back and observe before reacting. Take three deep breaths (inhale 4s, hold 4s, exhale 6s). Not every battle needs to be fought today. Consider reaching out to your manager or HR if the pressure persists."
  },
  sleep: {
    quote: "\"Energy is the foundation of all achievement.\"",
    advice: "Poor sleep worsens stress. Maintain a consistent bedtime, reduce screens 30 mins before sleep, and avoid caffeine after 2 PM. A well-rested mind makes better decisions. If sleep issues persist, consult your doctor or HR wellness program."
  },
  productivity: {
    quote: "\"Before you start some work, always ask yourself three questions - Why am I doing it, What the results might be and Will I be successful?\"",
    advice: "Try the Pomodoro technique: 25 mins focused work, 5 mins break. Break tasks into small, achievable steps. Prioritize your 3 Most Important Tasks (MITs) each day. Focus on purpose, not just activity."
  },
  leadership: {
    quote: "\"A leader is one who knows the way, goes the way, and shows the way.\"",
    advice: "Lead by example, not by command. Build trust through transparency and fairness. Delegate responsibilities based on team strengths. Give feedback that helps people grow, not just criticize. A good leader develops other leaders."
  },
  leave_info: {
    quote: "\"Rest is the reward of labor.\"",
    advice: "You can apply for leave through the Leave Management portal in your dashboard. Check your leave balances (annual, sick, personal, bonus). For urgent requests, contact your manager and HR directly. Taking regular breaks improves productivity and mental health."
  },
  career: {
    quote: "\"Education is the best friend. An educated person is respected everywhere.\"",
    advice: "Invest in continuous learning and skill development. Keep track of your accomplishments and share them during reviews. Seek mentorship and build a professional network. Remember, career growth is a marathon, not a sprint."
  },
  human_support: {
    quote: "\"Seeking support is a sign of strength, not weakness.\"",
    advice: "Your wellbeing matters. Our HR team is here to help with career guidance, health concerns, or personal challenges. You can also access the wellness programs for stress management, fitness, or counseling. Don't hesitate to reach out."
  },
  conflict: {
    quote: "\"The wise person avoids unnecessary conflicts but stands firm on principles.\"",
    advice: "Approach difficult conversations with curiosity, not judgment. Try to understand the other person's perspective. Focus on the issue, not the person. If a conflict persists, involve your manager or HR mediation. Building bridges is more valuable than being right."
  },
  decision: {
    quote: "\"Test a servant while in the discharge of his duty; a relative in difficulty; a friend in adversity; a wife in misfortune; and a king in battle.\"",
    advice: "Good decisions come from solid information, not emotions. List pros and cons, consider consequences, and seek advice from trusted mentors. Trust your judgment, but don't ignore wise counsel. Remember, even imperfect decisions made promptly beat perfect decisions made too late."
  },
  learning: {
    quote: "\"Books are as useful to a stupid person as a mirror is useful to a blind person.\"",
    advice: "Learn with clear purpose and apply what you learn. Take advantage of company training programs, certifications, and mentorship. Read industry updates and learn from peer experiences. Growth happens when knowledge meets action."
  },
  small_talk: {
    quote: "\"The wise person learns from every situation.\"",
    advice: "Hi! I'm Chanakya, your workplace wisdom guide. I can help with stress, productivity, leadership, career growth, leave info, or any workplace challenge. Ask me anything — ancient wisdom meets modern problems!"
  }
};

// Crisis response (always safe and non-therapeutic)
const crisisResponse = {
  quote: "\"Your life has value and meaning.\"",
  advice: "I'm really sorry you're feeling this way. I can't provide emergency help here, but please reach out to someone immediately:\n\n🚨 **Emergency:** Call your local emergency services (911 in US, 999 in UK, 112 in EU)\n\n💬 **Helplines:**\n• National Suicide Prevention Lifeline (US): 1-800-273-8255\n• Crisis Text Line: Text HOME to 741741\n• International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/\n\n👥 **Immediate Support:**\n• Contact your HR department or Employee Assistance Program (EAP)\n• Talk to a trusted family member, friend, or manager\n• Reach out to a mental health professional\n\nYour company values your wellbeing. Please don't face this alone.",
  meta: { crisis: true }
};

/**
 * POST /api/ai/chanakya
 * Handles Chanakya AI assistant queries
 * Request: { message: string }
 * Response: { quote: string, advice: string, meta: { intent, crisis } }
 */
router.post('/chanakya', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Priority 1: Crisis detection - always respond with crisis protocol
    if (containsCrisis(message)) {
      console.log(`[Chanakya] CRISIS DETECTED from user ${req.user?._id || 'unknown'}`);
      return res.json(crisisResponse);
    }

    // Priority 2: Intent-based routing
    const intent = detectIntent(message);
    
    // Get response from knowledge base or use default
    let response = knowledgeBase[intent] || defaultReplies[intent] || defaultReplies.small_talk;

    // Ensure response structure
    if (!response.quote || !response.advice) {
      response = defaultReplies.small_talk;
    }

    // Minimal logging - no PII, just intent and timestamp for analytics
    console.log(`[Chanakya] user=${req.user?._id || 'guest'} intent=${intent} timestamp=${new Date().toISOString()}`);

    return res.json({
      quote: response.quote,
      advice: response.advice,
      meta: {
        intent,
        crisis: false
      }
    });
  } catch (error) {
    console.error('[Chanakya] Error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
