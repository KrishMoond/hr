const UserMetrics = require('../models/UserMetrics');

class MetricsUpdater {
  constructor(io) {
    this.io = io;
  }

  async updateUserMetric(userId, metric, value, operation = 'set') {
    try {
      let metrics = await UserMetrics.findOne({ user: userId });
      if (!metrics) {
        metrics = await UserMetrics.initializeForUser(userId);
      }

      const oldValue = metrics[metric];

      if (operation === 'increment') {
        metrics[metric] = (metrics[metric] || 0) + (value || 1);
      } else if (operation === 'decrement') {
        metrics[metric] = Math.max((metrics[metric] || 0) - (value || 1), 0);
      } else {
        metrics[metric] = value;
      }

      // Recalculate productivity if needed
      if (['tasksCompleted', 'goalsProgress', 'wellnessScore', 'hoursThisWeek'].includes(metric)) {
        const oldProductivity = metrics.productivityScore;
        metrics.calculateProductivityScore();
        
        if (oldProductivity !== metrics.productivityScore) {
          this.emitUpdate(userId, 'productivityScore', metrics.productivityScore);
        }
      }

      await metrics.save();

      // Emit real-time update if value changed
      if (oldValue !== metrics[metric]) {
        this.emitUpdate(userId, metric, metrics[metric]);
      }

      return metrics[metric];
    } catch (error) {
      console.error('Error updating user metric:', error);
      throw error;
    }
  }

  async incrementNotification(userId, type) {
    const metricMap = {
      chat: 'unreadChat',
      helpdesk: 'unreadHelpdesk',
      wellness: 'unreadWellness',
      ai: 'unreadAI'
    };

    const metric = metricMap[type];
    if (metric) {
      await this.updateUserMetric(userId, metric, 1, 'increment');
      await this.updateUserMetric(userId, 'unreadNotifications', 1, 'increment');
    }
  }

  async clearNotifications(userId, type) {
    const metricMap = {
      chat: 'unreadChat',
      helpdesk: 'unreadHelpdesk',
      wellness: 'unreadWellness',
      ai: 'unreadAI'
    };

    const metric = metricMap[type];
    if (metric) {
      const metrics = await UserMetrics.findOne({ user: userId });
      if (metrics && metrics[metric] > 0) {
        const clearedCount = metrics[metric];
        await this.updateUserMetric(userId, metric, 0);
        await this.updateUserMetric(userId, 'unreadNotifications', clearedCount, 'decrement');
      }
    }
  }

  emitUpdate(userId, metric, value) {
    if (this.io) {
      this.io.to(userId.toString()).emit('metrics:update', { metric, value });
    }
  }

  // Task completion handler
  async onTaskCompleted(userId) {
    await this.updateUserMetric(userId, 'tasksCompleted', 1, 'increment');
  }

  // Wellness activity handler
  async onWellnessActivity(userId) {
    await this.updateUserMetric(userId, 'wellnessActivities', 1, 'increment');
    
    // Update streak logic here
    const metrics = await UserMetrics.findOne({ user: userId });
    const today = new Date().toDateString();
    const lastActivity = new Date(metrics.lastActivityUpdate).toDateString();
    
    if (today !== lastActivity) {
      await this.updateUserMetric(userId, 'wellnessStreak', 1, 'increment');
      metrics.lastActivityUpdate = new Date();
      await metrics.save();
    }
  }

  // Learning progress handler
  async onLearningProgress(userId, progressDelta) {
    await this.updateUserMetric(userId, 'learningProgress', progressDelta, 'increment');
  }
}

module.exports = MetricsUpdater;