const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Simple test route first
router.get('/test', auth, (req, res) => {
  res.json({ message: 'Analytics route working' });
});

// Dashboard endpoint
router.get('/dashboard', auth, async (req, res) => {
  try {
    const UserMetrics = require('../models/UserMetrics');
    const userId = req.user.id;
    
    // Get or create user metrics
    let metrics = await UserMetrics.findOne({ user: userId });
    if (!metrics) {
      metrics = await UserMetrics.initializeForUser(userId);
    }
    
    // Prepare dashboard response with default values
    const dashboardData = {
      productivity: {
        score: metrics.productivityScore || 75,
        trend: metrics.productivityTrend || 5,
        weeklyHours: metrics.hoursThisWeek || 40
      },
      tasks: {
        total: metrics.tasksTotal || 10,
        completed: metrics.tasksCompleted || 7,
        overdue: metrics.tasksOverdue || 1,
        thisWeek: metrics.tasksThisWeek || 5,
        completionRate: metrics.taskCompletionRate || 70
      },
      goals: {
        monthly: metrics.goalsMonthly || 3,
        completed: metrics.goalsCompleted || 2,
        progress: metrics.goalsProgress || 67
      },
      wellness: {
        score: metrics.wellnessScore || 78,
        activities: metrics.wellnessActivities || 3,
        streak: metrics.wellnessStreak || 7
      },
      learning: {
        courses: metrics.learningCourses || 2,
        progress: metrics.learningProgress || 45,
        certificates: metrics.learningCertificates || 1
      },
      recognition: {
        points: metrics.recognitionPoints || 1250,
        rank: metrics.teamRank || 12,
        badges: metrics.badges || 8
      },
      notifications: {
        chat: metrics.unreadChat || 0,
        helpdesk: metrics.unreadHelpdesk || 0,
        wellness: metrics.unreadWellness || 0,
        ai: metrics.unreadAI || 0,
        total: metrics.unreadNotifications || 0
      },
      projects: 3,
      lastUpdated: metrics.updatedAt || new Date()
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
});

module.exports = router;