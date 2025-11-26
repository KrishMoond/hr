const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency'], 
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  rejectionReason: String,
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// paid: whether salary is deducted or not for this leave (true = paid/no deduction)
leaveSchema.add({
  paid: { type: Boolean, default: false },
  unpaidDays: { type: Number, default: 0 },
  deductionAmount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Leave', leaveSchema);