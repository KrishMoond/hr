const mongoose = require('mongoose');

const projectChatSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    messageType: { 
      type: String, 
      enum: ['message', 'status_update', 'file_share'], 
      default: 'message' 
    },
    statusUpdate: {
      oldStatus: String,
      newStatus: String,
      progress: Number
    },
    timestamp: { type: Date, default: Date.now },
    readBy: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      readAt: { type: Date, default: Date.now }
    }]
  }],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ProjectChat', projectChatSchema);