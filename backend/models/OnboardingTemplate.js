const mongoose = require('mongoose');

const onboardingTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: String,
  position: String,
  description: String,
  
  tasks: [{
    title: { type: String, required: true },
    description: String,
    category: { 
      type: String, 
      enum: ['documentation', 'training', 'setup', 'meeting', 'compliance'], 
      required: true 
    },
    assignedTo: { type: String, enum: ['hr', 'manager', 'it', 'employee'] },
    dueAfterDays: { type: Number, default: 0 }, // days after start date
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    estimatedHours: Number,
    requiredDocuments: [String],
    instructions: String,
    isOptional: { type: Boolean, default: false }
  }],
  
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('OnboardingTemplate', onboardingTemplateSchema);