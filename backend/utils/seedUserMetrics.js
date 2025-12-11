const mongoose = require('mongoose');
const UserMetrics = require('../models/UserMetrics');
const User = require('../models/User');
require('dotenv').config();

async function seedUserMetrics() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find();
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      // Check if metrics already exist
      const existingMetrics = await UserMetrics.findOne({ user: user._id });
      
      if (!existingMetrics) {
        // Create sample metrics for each user
        const metrics = new UserMetrics({
          user: user._id,
          productivityScore: Math.floor(Math.random() * 30) + 70, // 70-100
          productivityTrend: Math.floor(Math.random() * 21) - 10, // -10 to +10
          tasksTotal: Math.floor(Math.random() * 20) + 5, // 5-25
          tasksCompleted: Math.floor(Math.random() * 15) + 3, // 3-18
          tasksOverdue: Math.floor(Math.random() * 3), // 0-2
          tasksThisWeek: Math.floor(Math.random() * 8) + 2, // 2-10
          goalsMonthly: Math.floor(Math.random() * 5) + 3, // 3-8
          goalsCompleted: Math.floor(Math.random() * 4) + 1, // 1-5
          goalsProgress: Math.floor(Math.random() * 40) + 40, // 40-80
          wellnessScore: Math.floor(Math.random() * 30) + 60, // 60-90
          wellnessActivities: Math.floor(Math.random() * 5), // 0-4
          wellnessStreak: Math.floor(Math.random() * 15) + 1, // 1-15
          learningCourses: Math.floor(Math.random() * 4) + 1, // 1-4
          learningProgress: Math.floor(Math.random() * 60) + 20, // 20-80
          learningCertificates: Math.floor(Math.random() * 5), // 0-4
          recognitionPoints: Math.floor(Math.random() * 2000) + 500, // 500-2500
          teamRank: Math.floor(Math.random() * 50) + 1, // 1-50
          badges: Math.floor(Math.random() * 15) + 3, // 3-18
          hoursThisWeek: Math.floor(Math.random() * 20) + 30, // 30-50
          hoursToday: Math.floor(Math.random() * 8) + 2, // 2-10
          unreadChat: Math.floor(Math.random() * 5), // 0-4
          unreadHelpdesk: Math.floor(Math.random() * 3), // 0-2
          unreadWellness: Math.floor(Math.random() * 2), // 0-1
          unreadAI: Math.floor(Math.random() * 3), // 0-2
          unreadNotifications: Math.floor(Math.random() * 8) // 0-7
        });

        // Don't auto-calculate to avoid validation errors during seeding
        
        await metrics.save();
        console.log(`Created metrics for user: ${user.firstName} ${user.lastName}`);
      } else {
        console.log(`Metrics already exist for user: ${user.firstName} ${user.lastName}`);
      }
    }

    console.log('User metrics seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding user metrics:', error);
    process.exit(1);
  }
}

seedUserMetrics();