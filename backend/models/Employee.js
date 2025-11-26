const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, unique: true, required: true },
  joinDate: { type: Date, required: true },
  salary: { type: Number, required: true },
  performance: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, enum: ['active', 'inactive', 'on-leave'], default: 'active' },
  skills: [String],
  projects: [{
    name: String,
    role: String,
    startDate: Date,
    endDate: Date,
    status: { type: String, enum: ['active', 'completed', 'on-hold'] }
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date,
    type: { type: String, enum: ['award', 'certification', 'milestone'] }
  }],
  goals: [{
    title: String,
    description: String,
    target: Number,
    current: Number,
    deadline: Date,
    status: { type: String, enum: ['active', 'completed', 'overdue'] }
  }],
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }]
}, { timestamps: true });

// Track leave balances (days remaining) for quick checks
employeeSchema.add({
  leaveBalances: {
    annual: { type: Number, default: 14 },
    sick: { type: Number, default: 10 },
    personal: { type: Number, default: 5 },
    bonus: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('Employee', employeeSchema);