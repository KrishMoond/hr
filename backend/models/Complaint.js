const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['harassment', 'discrimination', 'workplace', 'management', 'facilities', 'other'], 
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  status: { 
    type: String, 
    enum: ['submitted', 'under-review', 'investigating', 'resolved', 'closed'], 
    default: 'submitted' 
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolution: String,
  resolvedAt: Date,
  isAnonymous: { type: Boolean, default: false },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  updates: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    status: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);