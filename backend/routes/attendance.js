const express = require('express');
const { body, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Check in
router.post('/checkin', auth, [
  body('location.lat').optional().isFloat(),
  body('location.lng').optional().isFloat()
], async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employee: req.user._id,
      date: today
    });

    if (existingAttendance && existingAttendance.checkIn) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const checkInTime = new Date();
    const { location } = req.body;

    let attendance;
    if (existingAttendance) {
      existingAttendance.checkIn = checkInTime;
      existingAttendance.status = 'present';
      if (location) {
        existingAttendance.location.checkInLocation = location;
      }
      attendance = await existingAttendance.save();
    } else {
      attendance = new Attendance({
        employee: req.user._id,
        date: today,
        checkIn: checkInTime,
        status: 'present',
        location: location ? { checkInLocation: location } : {}
      });
      await attendance.save();
    }

    res.json({ message: 'Checked in successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check out
router.post('/checkout', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: 'No check-in found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const checkOutTime = new Date();
    const { location, breakTime = 0 } = req.body;

    attendance.checkOut = checkOutTime;
    attendance.breakTime = breakTime;
    if (location) {
      attendance.location.checkOutLocation = location;
    }

    await attendance.save(); // Pre-save hook will calculate total hours

    res.json({ message: 'Checked out successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance records
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, employee } = req.query;
    let query = {};

    // Employees can only see their own attendance
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    } else if (employee) {
      query.employee = employee;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance summary
router.get('/summary', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    let query = { date: { $gte: startDate, $lte: endDate } };
    
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    }

    const attendance = await Attendance.find(query);
    
    const summary = {
      totalDays: attendance.length,
      presentDays: attendance.filter(a => a.status === 'present').length,
      absentDays: attendance.filter(a => a.status === 'absent').length,
      lateDays: attendance.filter(a => a.status === 'late').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
      overtimeHours: attendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0)
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;