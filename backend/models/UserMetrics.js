const mongoose = require('mongoose');

const userMetricsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  // Performance Metrics
  productivityScore: { type: Number, default: 0, min: 0, max: 100 },
  productivityTrend: { type: Number, default: 0 }, // Weekly change percentage
  
  // Task Metrics
  tasksTotal: { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 },
  tasksOverdue: { type: Number, default: 0 },
  tasksThisWeek: { type: Number, default: 0 },
  
  // Goal Metrics
  goalsMonthly: { type: Number, default: 0 },
  goalsCompleted: { type: Number, default: 0 },
  goalsProgress: { type: Number, default: 0, min: 0, max: 100 },
  
  // Wellness Metrics
  wellnessScore: { type: Number, default: 0, min: 0, max: 100 },
  wellnessActivities: { type: Number, default: 0 },
  wellnessStreak: { type: Number, default: 0 },
  
  // Learning Metrics
  learningCourses: { type: Number, default: 0 },
  learningProgress: { type: Number, default: 0, min: 0, max: 100 },
  learningCertificates: { type: Number, default: 0 },
  
  // Recognition Metrics
  recognitionPoints: { type: Number, default: 0 },
  teamRank: { type: Number, default: 0 },
  badges: { type: Number, default: 0 },
  
  // Time Tracking
  hoursThisWeek: { type: Number, default: 0 },
  hoursToday: { type: Number, default: 0 },
  
  // Notification Counters
  unreadChat: { type: Number, default: 0 },
  unreadHelpdesk: { type: Number, default: 0 },
  unreadWellness: { type: Number, default: 0 },
  unreadAI: { type: Number, default: 0 },
  unreadNotifications: { type: Number, default: 0 },
  
  // Last Updated Tracking
  lastProductivityUpdate: { type: Date, default: Date.now },
  lastActivityUpdate: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for task completion rate
userMetricsSchema.virtual('taskCompletionRate').get(function() {
  return this.tasksTotal > 0 ? Math.round((this.tasksCompleted / this.tasksTotal) * 100) : 0;
});

// Static method to initialize metrics for new user
userMetricsSchema.statics.initializeForUser = async function(userId) {
  const existingMetrics = await this.findOne({ user: userId });
  if (!existingMetrics) {
    return await this.create({ user: userId });
  }
  return existingMetrics;
};

// Method to update productivity score based on recent activity
userMetricsSchema.methods.calculateProductivityScore = function() {
  const taskScore = this.taskCompletionRate * 0.4;
  const goalScore = this.goalsProgress * 0.3;
  const wellnessScore = this.wellnessScore * 0.2;
  const timeScore = Math.min(this.hoursThisWeek / 40, 1) * 100 * 0.1;
  
  this.productivityScore = Math.round(taskScore + goalScore + wellnessScore + timeScore);
  return this.productivityScore;
};

module.exports = mongoose.model('UserMetrics', userMetricsSchema);