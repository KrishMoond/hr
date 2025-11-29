const mongoose = require('mongoose');

const benefitPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['health', 'dental', 'vision', 'life', 'disability', 'retirement', 'pto', 'other'], 
    required: true 
  },
  provider: String,
  description: String,
  
  // Eligibility criteria
  eligibility: {
    employmentType: [{ type: String, enum: ['full-time', 'part-time', 'contract'] }],
    minimumTenure: Number, // months
    departments: [String],
    positions: [String]
  },
  
  // Cost structure
  cost: {
    employeeContribution: Number,
    employerContribution: Number,
    totalCost: Number,
    frequency: { type: String, enum: ['monthly', 'quarterly', 'annually'] }
  },
  
  // Coverage details
  coverage: {
    individual: { type: Boolean, default: true },
    spouse: { type: Boolean, default: false },
    children: { type: Boolean, default: false },
    family: { type: Boolean, default: false }
  },
  
  // Plan details
  details: {
    deductible: Number,
    coPayment: Number,
    outOfPocketMax: Number,
    coverageLimit: Number,
    networkProviders: [String]
  },
  
  isActive: { type: Boolean, default: true },
  enrollmentPeriod: {
    startDate: Date,
    endDate: Date,
    isOpenEnrollment: { type: Boolean, default: false }
  },
  
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('BenefitPlan', benefitPlanSchema);