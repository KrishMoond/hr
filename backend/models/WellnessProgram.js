const mongoose = require('mongoose');

const wellnessProgramSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['challenge', 'program', 'event'], required: true },
  category: { type: String, enum: ['fitness', 'mental', 'nutrition', 'sleep'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'upcoming', 'completed'], default: 'upcoming' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  goals: [{
    title: String,
    target: Number,
    unit: String,
    participants: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      current: { type: Number, default: 0 },
      progress: { type: Number, default: 0 }
    }]
  }],
  rewards: [{
    title: String,
    description: String,
    criteria: String,
    points: Number
  }],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('WellnessProgram', wellnessProgramSchema);