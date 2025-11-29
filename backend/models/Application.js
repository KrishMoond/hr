const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobPosting: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting', required: true },
  applicant: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    address: String,
    linkedIn: String,
    portfolio: String
  },
  resume: { type: String, required: true }, // file path
  coverLetter: String,
  experience: { type: Number, default: 0 }, // years
  currentSalary: Number,
  expectedSalary: Number,
  noticePeriod: String,
  
  status: { 
    type: String, 
    enum: ['applied', 'screening', 'interview', 'technical-test', 'offer', 'hired', 'rejected'], 
    default: 'applied' 
  },
  
  // Interview stages
  interviews: [{
    type: { type: String, enum: ['phone', 'video', 'in-person', 'technical'] },
    interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scheduledAt: Date,
    duration: Number, // minutes
    feedback: String,
    rating: { type: Number, min: 1, max: 5 },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'] },
    notes: String
  }],
  
  // Assessment scores
  assessments: [{
    type: String, // 'technical', 'aptitude', 'personality'
    score: Number,
    maxScore: Number,
    completedAt: Date,
    notes: String
  }],
  
  // HR notes and feedback
  hrNotes: String,
  rejectionReason: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // HR person handling
  
  // Offer details
  offer: {
    salary: Number,
    startDate: Date,
    benefits: [String],
    offerDate: Date,
    acceptanceDeadline: Date,
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'expired'] }
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);