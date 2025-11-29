const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { 
    type: String, 
    enum: ['policy', 'contract', 'certificate', 'personal', 'training', 'compliance', 'other'], 
    required: true 
  },
  subcategory: String,
  
  // File information
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: Number, // bytes
  mimeType: String,
  
  // Ownership and access
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // if employee-specific
  department: String,
  
  // Access control
  visibility: { 
    type: String, 
    enum: ['public', 'department', 'private', 'confidential'], 
    default: 'private' 
  },
  accessList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Document lifecycle
  status: { 
    type: String, 
    enum: ['draft', 'active', 'archived', 'expired'], 
    default: 'active' 
  },
  version: { type: String, default: '1.0' },
  expiryDate: Date,
  
  // Metadata
  tags: [String],
  isRequired: { type: Boolean, default: false }, // for compliance documents
  requiresSignature: { type: Boolean, default: false },
  
  // Tracking
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  downloadCount: { type: Number, default: 0 },
  
  // Approval workflow
  approvalRequired: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  
  // Signatures (for contracts/agreements)
  signatures: [{
    signedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    signedAt: Date,
    ipAddress: String,
    signatureImage: String // base64 or file path
  }]
}, { timestamps: true });

// Index for efficient searching
documentSchema.index({ title: 'text', description: 'text', tags: 'text' });
documentSchema.index({ category: 1, employee: 1 });
documentSchema.index({ expiryDate: 1 });

module.exports = mongoose.model('Document', documentSchema);