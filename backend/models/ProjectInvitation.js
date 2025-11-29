const mongoose = require('mongoose');

const projectInvitationSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invitedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  role: { 
    type: String, 
    enum: ['member', 'lead', 'reviewer'], 
    default: 'member' 
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined', 'expired'], 
    default: 'pending' 
  },
  
  message: String,
  
  // Response
  respondedAt: Date,
  responseMessage: String,
  
  // Expiry
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
}, { timestamps: true });

// Auto-expire invitations
projectInvitationSchema.pre('save', function(next) {
  if (this.expiresAt < new Date() && this.status === 'pending') {
    this.status = 'expired';
  }
  next();
});

module.exports = mongoose.model('ProjectInvitation', projectInvitationSchema);