const express = require('express');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// AI Upskilling recommendations
router.get('/upskilling', auth, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id }).populate('user');
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // AI-powered course recommendations based on role and performance
    const recommendations = generateCourseRecommendations(employee);
    
    res.json({
      recommendations,
      aiInsight: generateAIInsight(employee),
      trendingSkills: getTrendingSkills(employee.user.department)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Early alert predictions
router.get('/alerts', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const employees = await Employee.find({ status: 'active' }).populate('user');
    const alerts = [];

    employees.forEach(employee => {
      const riskFactors = analyzeRiskFactors(employee);
      if (riskFactors.riskLevel > 0.6) {
        alerts.push({
          employeeId: employee._id,
          employeeName: `${employee.user.firstName} ${employee.user.lastName}`,
          type: riskFactors.primaryRisk,
          severity: riskFactors.riskLevel > 0.8 ? 'high' : 'medium',
          description: riskFactors.description,
          recommendation: riskFactors.recommendation,
          predictedDate: riskFactors.predictedDate,
          confidence: Math.round(riskFactors.riskLevel * 100)
        });
      }
    });

    res.json({
      alerts,
      summary: {
        totalEmployeesAnalyzed: employees.length,
        highRiskCount: alerts.filter(a => a.severity === 'high').length,
        mediumRiskCount: alerts.filter(a => a.severity === 'medium').length,
        preventionRate: 92 // Mock historical prevention rate
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Chanakya wisdom chat
router.post('/chanakya', auth, async (req, res) => {
  try {
    const { message, category = 'motivation' } = req.body;
    
    const response = generateChanakyaResponse(message, category);
    
    res.json({
      quote: response.quote,
      advice: response.advice,
      category: response.category
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Performance predictions
router.get('/performance-prediction/:employeeId', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.employeeId).populate('user');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const prediction = predictPerformance(employee);
    
    res.json(prediction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions for AI logic

function generateCourseRecommendations(employee) {
  const courses = [
    {
      id: 1,
      title: 'Advanced React Development',
      description: 'Master modern React patterns and hooks for scalable applications',
      duration: '8 hours',
      difficulty: 'Advanced',
      category: 'Frontend',
      recommended: true,
      relevanceScore: 95
    },
    {
      id: 2,
      title: 'TypeScript Fundamentals',
      description: 'Learn type-safe JavaScript development with TypeScript',
      duration: '6 hours',
      difficulty: 'Intermediate',
      category: 'Programming',
      recommended: true,
      relevanceScore: 88
    },
    {
      id: 3,
      title: 'Leadership & Team Management',
      description: 'Develop essential leadership skills for senior roles',
      duration: '12 hours',
      difficulty: 'Intermediate',
      category: 'Soft Skills',
      recommended: employee.performance > 85,
      relevanceScore: employee.performance > 85 ? 92 : 65
    }
  ];

  // Filter and sort by relevance
  return courses
    .filter(course => course.relevanceScore > 70)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function generateAIInsight(employee) {
  const insights = [
    `Based on your current role as ${employee.user.position}, focusing on advanced technical skills will prepare you for senior opportunities.`,
    `Your performance score of ${employee.performance}% indicates strong potential for leadership development.`,
    `Market trends in ${employee.user.department} suggest high demand for cloud and AI skills.`
  ];

  return insights[Math.floor(Math.random() * insights.length)];
}

function getTrendingSkills(department) {
  const skillsByDepartment = {
    'Engineering': ['React', 'TypeScript', 'Cloud Architecture', 'DevOps', 'AI/ML'],
    'Design': ['Figma', 'User Research', 'Design Systems', 'Prototyping', 'UX Writing'],
    'Marketing': ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics', 'Social Media'],
    'Sales': ['CRM', 'Lead Generation', 'Negotiation', 'Customer Success', 'Sales Analytics']
  };

  return skillsByDepartment[department] || ['Communication', 'Leadership', 'Problem Solving'];
}

function analyzeRiskFactors(employee) {
  let riskLevel = 0;
  let primaryRisk = 'performance';
  let description = '';
  let recommendation = '';

  // Performance risk
  if (employee.performance < 70) {
    riskLevel += 0.4;
    primaryRisk = 'performance';
    description = 'Performance metrics showing decline over past months';
    recommendation = 'Provide additional mentoring and set clear performance goals';
  }

  // Engagement risk (mock calculation)
  const daysSinceJoin = (new Date() - employee.joinDate) / (1000 * 60 * 60 * 24);
  if (daysSinceJoin > 365 && employee.performance < 80) {
    riskLevel += 0.3;
    primaryRisk = 'engagement';
    description = 'Long tenure with declining engagement indicators';
    recommendation = 'Schedule career development discussion and explore new challenges';
  }

  // Skills gap risk
  if (!employee.skills || employee.skills.length < 3) {
    riskLevel += 0.2;
    primaryRisk = 'skills';
    description = 'Limited skill diversity may impact future opportunities';
    recommendation = 'Enroll in relevant upskilling programs';
  }

  const predictedDate = new Date();
  predictedDate.setMonth(predictedDate.getMonth() + Math.floor(riskLevel * 6));

  return {
    riskLevel,
    primaryRisk,
    description,
    recommendation,
    predictedDate: predictedDate.toISOString().split('T')[0]
  };
}

function generateChanakyaResponse(message, category) {
  const quotes = {
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
      "Learn from the mistakes of others... you can't live long enough to make them all yourself."
    ],
    ethics: [
      "Never make friends with people who are above or below you in status. Such friendships will never give you any happiness.",
      "The one excellent thing that can be learned from a lion is that whatever a man intends doing should be done by him with a whole-hearted and strenuous effort.",
      "Treat your kid like a darling for the first five years. For the next five years, scold them. By the time they turn sixteen, treat them like a friend."
    ]
  };

  const categoryQuotes = quotes[category] || quotes.motivation;
  const selectedQuote = categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];

  const advice = generateContextualAdvice(message, category);

  return {
    quote: selectedQuote,
    advice,
    category
  };
}

function generateContextualAdvice(message, category) {
  const adviceTemplates = {
    motivation: "Remember, every challenge is an opportunity for growth. Stay focused on your goals and maintain your determination.",
    leadership: "As a leader, your actions speak louder than words. Lead by example and inspire others through your dedication.",
    wisdom: "True wisdom comes from experience and reflection. Take time to learn from both successes and failures.",
    ethics: "Always maintain your moral compass. Ethical behavior builds trust and creates lasting relationships."
  };

  return adviceTemplates[category] || adviceTemplates.motivation;
}

function predictPerformance(employee) {
  // Mock performance prediction algorithm
  const currentPerformance = employee.performance;
  const trend = Math.random() * 10 - 5; // Random trend between -5 and +5
  
  const prediction = {
    currentScore: currentPerformance,
    predictedScore: Math.max(0, Math.min(100, currentPerformance + trend)),
    trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
    confidence: Math.round(Math.random() * 20 + 70), // 70-90% confidence
    factors: [
      'Recent project completion rate',
      'Peer feedback scores',
      'Skill development progress',
      'Goal achievement rate'
    ],
    recommendations: [
      'Continue current development path',
      'Focus on communication skills',
      'Seek mentorship opportunities'
    ]
  };

  return prediction;
}

module.exports = router;