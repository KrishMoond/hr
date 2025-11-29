const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  checkIn: Date,
  checkOut: Date,
  breakTime: { type: Number, default: 0 }, // in minutes
  totalHours: { type: Number, default: 0 },
  overtimeHours: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'half-day', 'work-from-home'], 
    default: 'absent' 
  },
  location: {
    checkInLocation: { lat: Number, lng: Number, address: String },
    checkOutLocation: { lat: Number, lng: Number, address: String }
  },
  notes: String,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isManualEntry: { type: Boolean, default: false }
}, { timestamps: true });

// Compound index to ensure one attendance record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Calculate total hours when saving
attendanceSchema.pre('save', function(next) {
  if (this.checkIn && this.checkOut) {
    const diffMs = this.checkOut - this.checkIn;
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    this.totalHours = Math.max(0, (totalMinutes - this.breakTime) / 60);
    
    // Calculate overtime (assuming 8 hours standard)
    this.overtimeHours = Math.max(0, this.totalHours - 8);
    
    // Set status based on hours
    if (this.totalHours >= 8) {
      this.status = 'present';
    } else if (this.totalHours >= 4) {
      this.status = 'half-day';
    } else {
      this.status = 'absent';
    }
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);