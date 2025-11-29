const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'], 
    default: 'planning' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  
  // Timeline
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  // Team
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Progress
  progress: { type: Number, default: 0, min: 0, max: 100 },
  totalTasks: { type: Number, default: 0 },
  completedTasks: { type: Number, default: 0 },
  
  // Budget (optional)
  budget: { type: Number, default: 0 },
  spentAmount: { type: Number, default: 0 },
  
  // Additional fields
  tags: [String],
  category: String,
  client: String,
  
  // Settings
  requiresDailyUpdates: { type: Boolean, default: true },
  isPrivate: { type: Boolean, default: false },
  
  // Metadata
  lastActivity: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false },
  
  // Attachments
  attachments: [String], // file paths
  
  tags: [String]
}, { timestamps: true });

// Update progress when tasks change
projectSchema.methods.updateProgress = async function() {
  const Task = require('./Task');
  const tasks = await Task.find({ project: this._id });
  
  this.totalTasks = tasks.length;
  this.completedTasks = tasks.filter(task => task.status === 'completed').length;
  this.progress = this.totalTasks > 0 ? Math.round((this.completedTasks / this.totalTasks) * 100) : 0;
  
  if (this.progress === 100 && this.status === 'active') {
    this.status = 'completed';
  }
  
  await this.save();
};

module.exports = mongoose.model('Project', projectSchema);