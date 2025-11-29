const mongoose = require('mongoose');

const trainingProgramSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { 
    type: String, 
    enum: ['technical', 'soft-skills', 'leadership', 'compliance', 'safety', 'orientation'], 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['online', 'classroom', 'workshop', 'seminar', 'certification'], 
    required: true 
  },
  
  // Program details
  duration: { type: Number, required: true }, // hours
  maxParticipants: Number,
  prerequisites: [String],
  learningObjectives: [String],
  
  // Content and materials
  modules: [{
    title: String,
    description: String,
    duration: Number, // hours
    materials: [String], // file paths or URLs
    order: Number
  }],
  
  // Instructor information
  instructor: {
    name: String,
    email: String,
    bio: String,
    isExternal: { type: Boolean, default: false }
  },
  
  // Scheduling
  schedule: [{
    startDate: Date,
    endDate: Date,
    location: String,
    isVirtual: { type: Boolean, default: false },
    meetingLink: String,
    maxParticipants: Number,
    registeredCount: { type: Number, default: 0 }
  }],
  
  // Cost and budget
  cost: {
    perParticipant: Number,
    totalBudget: Number,
    currency: { type: String, default: 'USD' }
  },
  
  // Certification
  providesCertificate: { type: Boolean, default: false },
  certificateTemplate: String, // file path
  validityPeriod: Number, // months
  
  // Requirements
  isMandatory: { type: Boolean, default: false },
  targetDepartments: [String],
  targetPositions: [String],
  
  // Assessment
  hasAssessment: { type: Boolean, default: false },
  passingScore: { type: Number, min: 0, max: 100 },
  
  status: { 
    type: String, 
    enum: ['draft', 'active', 'completed', 'cancelled'], 
    default: 'draft' 
  },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('TrainingProgram', trainingProgramSchema);