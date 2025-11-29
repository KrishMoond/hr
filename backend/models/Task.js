const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  
  // Assignment
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Status and Priority
  status: { 
    type: String, 
    enum: ['todo', 'in-progress', 'review', 'completed', 'blocked'], 
    default: 'todo' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  
  // Timeline
  dueDate: { type: Date, required: true },
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 },
  
  // Progress
  progress: { type: Number, default: 0, min: 0, max: 100 },
  
  // Daily Updates
  dailyUpdates: [{
    date: { type: Date, default: Date.now },
    update: { type: String, required: true },
    hoursWorked: { type: Number, default: 0 },
    blockers: String,
    nextDayPlan: String,
    attachments: [String],
    submittedAt: { type: Date, default: Date.now }
  }],
  
  // Comments and Feedback
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    timestamp: { type: Date, default: Date.now },
    isInternal: { type: Boolean, default: false }
  }],
  
  // Completion
  completedAt: Date,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: String,
  
  // Attachments
  attachments: [String],
  
  tags: [String]
}, { timestamps: true });

// Update actual hours when daily updates are added
taskSchema.pre('save', function(next) {
  if (this.isModified('dailyUpdates')) {
    this.actualHours = this.dailyUpdates.reduce((total, update) => total + (update.hoursWorked || 0), 0);
  }
  
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
    this.progress = 100;
  }
  
  next();
});

module.exports = mongoose.model('Task', taskSchema);