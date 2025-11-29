const mongoose = require('mongoose');

const complianceReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['eeo', 'safety', 'training', 'payroll', 'benefits', 'attendance', 'custom'], 
    required: true 
  },
  description: String,
  
  // Reporting period
  reportingPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    frequency: { type: String, enum: ['monthly', 'quarterly', 'annually', 'ad-hoc'] }
  },
  
  // Filters and criteria
  filters: {
    departments: [String],
    positions: [String],
    locations: [String],
    employmentTypes: [String],
    customCriteria: mongoose.Schema.Types.Mixed
  },
  
  // Report data
  data: {
    summary: mongoose.Schema.Types.Mixed,
    details: [mongoose.Schema.Types.Mixed],
    metrics: [{
      name: String,
      value: mongoose.Schema.Types.Mixed,
      unit: String,
      benchmark: mongoose.Schema.Types.Mixed
    }],
    charts: [{
      type: String, // 'bar', 'pie', 'line', etc.
      title: String,
      data: mongoose.Schema.Types.Mixed
    }]
  },
  
  // Compliance status
  complianceStatus: {
    overall: { type: String, enum: ['compliant', 'non-compliant', 'at-risk', 'unknown'] },
    issues: [{
      category: String,
      description: String,
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
      recommendation: String,
      dueDate: Date,
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    recommendations: [String]
  },
  
  // File attachments
  attachments: [{
    fileName: String,
    filePath: String,
    fileType: String,
    description: String
  }],
  
  // Generation details
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  generatedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['draft', 'generated', 'reviewed', 'approved', 'submitted'], 
    default: 'draft' 
  },
  
  // Review and approval
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  
  // Submission details
  submittedTo: String, // regulatory body or internal department
  submissionDate: Date,
  submissionMethod: String,
  confirmationNumber: String,
  
  // Scheduling for recurring reports
  isRecurring: { type: Boolean, default: false },
  nextGenerationDate: Date,
  
  notes: String,
  tags: [String]
}, { timestamps: true });

// Index for efficient querying
complianceReportSchema.index({ type: 1, 'reportingPeriod.startDate': 1 });
complianceReportSchema.index({ generatedBy: 1, status: 1 });

module.exports = mongoose.model('ComplianceReport', complianceReportSchema);