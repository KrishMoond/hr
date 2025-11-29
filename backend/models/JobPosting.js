const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  employmentType: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract', 'internship'], 
    required: true 
  },
  experienceLevel: { 
    type: String, 
    enum: ['entry', 'mid', 'senior', 'executive'], 
    required: true 
  },
  salaryRange: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' }
  },
  description: { type: String, required: true },
  requirements: [String],
  responsibilities: [String],
  skills: [String],
  benefits: [String],
  status: { 
    type: String, 
    enum: ['draft', 'active', 'paused', 'closed'], 
    default: 'draft' 
  },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicationDeadline: Date,
  totalApplications: { type: Number, default: 0 },
  isRemote: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('JobPosting', jobPostingSchema);