const mongoose = require('mongoose');

const performanceReviewSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  reviewType: { 
    type: String, 
    enum: ['annual', 'quarterly', 'probation', 'project-based'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['draft', 'in-progress', 'completed', 'approved'], 
    default: 'draft' 
  },
  
  // Self Assessment
  selfAssessment: {
    goals: [{
      description: String,
      achievement: { type: Number, min: 0, max: 100 },
      comments: String
    }],
    strengths: [String],
    areasForImprovement: [String],
    overallRating: { type: Number, min: 1, max: 5 }
  },
  
  // Manager Review
  managerReview: {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ratings: {
      technical: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      teamwork: { type: Number, min: 1, max: 5 },
      leadership: { type: Number, min: 1, max: 5 },
      initiative: { type: Number, min: 1, max: 5 },
      reliability: { type: Number, min: 1, max: 5 }
    },
    comments: String,
    achievements: [String],
    developmentAreas: [String],
    overallRating: { type: Number, min: 1, max: 5 }
  },
  
  // Peer Reviews (360-degree feedback)
  peerReviews: [{
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ratings: {
      collaboration: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      reliability: { type: Number, min: 1, max: 5 },
      helpfulness: { type: Number, min: 1, max: 5 }
    },
    comments: String,
    submittedAt: { type: Date, default: Date.now }
  }],
  
  // Goals for next period
  futureGoals: [{
    description: String,
    deadline: Date,
    priority: { type: String, enum: ['high', 'medium', 'low'] },
    measurable: String
  }],
  
  finalRating: { type: Number, min: 1, max: 5 },
  hrComments: String,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('PerformanceReview', performanceReviewSchema);