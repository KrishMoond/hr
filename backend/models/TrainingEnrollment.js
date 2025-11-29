const mongoose = require('mongoose');

const trainingEnrollmentSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainingProgram: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingProgram', required: true },
  scheduleId: mongoose.Schema.Types.ObjectId, // specific schedule within the program
  
  enrollmentDate: { type: Date, default: Date.now },
  enrollmentType: { 
    type: String, 
    enum: ['self-enrolled', 'manager-assigned', 'hr-assigned', 'mandatory'], 
    default: 'self-enrolled' 
  },
  
  status: { 
    type: String, 
    enum: ['enrolled', 'in-progress', 'completed', 'failed', 'cancelled', 'no-show'], 
    default: 'enrolled' 
  },
  
  // Progress tracking
  progress: {
    completedModules: [mongoose.Schema.Types.ObjectId],
    currentModule: mongoose.Schema.Types.ObjectId,
    progressPercentage: { type: Number, default: 0 },
    hoursCompleted: { type: Number, default: 0 },
    lastAccessedAt: Date
  },
  
  // Assessment results
  assessments: [{
    attemptNumber: Number,
    score: { type: Number, min: 0, max: 100 },
    passed: Boolean,
    completedAt: Date,
    timeSpent: Number, // minutes
    answers: [mongoose.Schema.Types.Mixed] // store encrypted if sensitive
  }],
  
  // Attendance (for classroom/workshop training)
  attendance: [{
    date: Date,
    present: Boolean,
    hoursAttended: Number,
    notes: String
  }],
  
  // Completion details
  completionDate: Date,
  finalScore: Number,
  certificateIssued: Boolean,
  certificateNumber: String,
  certificateUrl: String,
  
  // Feedback
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comments: String,
    wouldRecommend: Boolean,
    suggestions: String
  },
  
  // Cost tracking
  cost: Number,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  notes: String
}, { timestamps: true });

// Update progress percentage before saving
trainingEnrollmentSchema.pre('save', async function(next) {
  if (this.isModified('progress.completedModules')) {
    try {
      const TrainingProgram = require('./TrainingProgram');
      const program = await TrainingProgram.findById(this.trainingProgram);
      if (program && program.modules.length > 0) {
        this.progress.progressPercentage = Math.round(
          (this.progress.completedModules.length / program.modules.length) * 100
        );
        
        if (this.progress.progressPercentage === 100 && this.status === 'in-progress') {
          this.status = 'completed';
          this.completionDate = new Date();
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }
  next();
});

module.exports = mongoose.model('TrainingEnrollment', trainingEnrollmentSchema);