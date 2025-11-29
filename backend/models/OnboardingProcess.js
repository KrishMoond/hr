const mongoose = require('mongoose');

const onboardingProcessSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'OnboardingTemplate', required: true },
  startDate: { type: Date, required: true },
  expectedCompletionDate: Date,
  actualCompletionDate: Date,
  status: { 
    type: String, 
    enum: ['not-started', 'in-progress', 'completed', 'overdue'], 
    default: 'not-started' 
  },
  
  tasks: [{
    templateTaskId: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    category: String,
    assignedTo: String,
    dueDate: Date,
    priority: String,
    status: { 
      type: String, 
      enum: ['pending', 'in-progress', 'completed', 'skipped'], 
      default: 'pending' 
    },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedAt: Date,
    notes: String,
    attachments: [String], // file paths
    timeSpent: Number // hours
  }],
  
  assignedHR: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  feedback: {
    employeeFeedback: String,
    employeeRating: { type: Number, min: 1, max: 5 },
    hrNotes: String,
    improvementSuggestions: [String]
  },
  
  completionPercentage: { type: Number, default: 0 }
}, { timestamps: true });

// Calculate completion percentage before saving
onboardingProcessSchema.pre('save', function(next) {
  if (this.tasks && this.tasks.length > 0) {
    const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
    this.completionPercentage = Math.round((completedTasks / this.tasks.length) * 100);
    
    if (this.completionPercentage === 100 && this.status !== 'completed') {
      this.status = 'completed';
      this.actualCompletionDate = new Date();
    }
  }
  next();
});

module.exports = mongoose.model('OnboardingProcess', onboardingProcessSchema);