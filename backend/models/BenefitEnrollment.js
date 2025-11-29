const mongoose = require('mongoose');

const benefitEnrollmentSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  benefitPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'BenefitPlan', required: true },
  
  enrollmentDate: { type: Date, required: true },
  effectiveDate: { type: Date, required: true },
  endDate: Date,
  
  status: { 
    type: String, 
    enum: ['active', 'pending', 'cancelled', 'expired'], 
    default: 'pending' 
  },
  
  // Coverage selection
  coverageType: { 
    type: String, 
    enum: ['individual', 'spouse', 'children', 'family'], 
    required: true 
  },
  
  // Dependents information
  dependents: [{
    name: String,
    relationship: { type: String, enum: ['spouse', 'child', 'other'] },
    dateOfBirth: Date,
    ssn: String // encrypted
  }],
  
  // Cost breakdown
  monthlyPremium: { type: Number, required: true },
  employeeContribution: { type: Number, required: true },
  employerContribution: { type: Number, required: true },
  
  // Beneficiary information (for life insurance, etc.)
  beneficiaries: [{
    name: String,
    relationship: String,
    percentage: { type: Number, min: 0, max: 100 },
    contactInfo: {
      phone: String,
      email: String,
      address: String
    }
  }],
  
  // Enrollment details
  enrollmentMethod: { type: String, enum: ['online', 'paper', 'phone'] },
  confirmationNumber: String,
  
  // Change tracking
  changes: [{
    changeType: { type: String, enum: ['enrollment', 'modification', 'cancellation'] },
    changeDate: Date,
    reason: String,
    previousValues: mongoose.Schema.Types.Mixed,
    newValues: mongoose.Schema.Types.Mixed,
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // Documents
  enrollmentDocuments: [String], // file paths
  
  notes: String,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Compound index to prevent duplicate enrollments
benefitEnrollmentSchema.index({ employee: 1, benefitPlan: 1, status: 1 });

module.exports = mongoose.model('BenefitEnrollment', benefitEnrollmentSchema);