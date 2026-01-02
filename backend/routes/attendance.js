const express = require('express');
const { body, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get attendance records (Admin/HR only)
router.get('/', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { date, employee, status, page = 1, limit = 50 } = req.query;
    
    let query = {};
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    if (employee) {
      query.employee = employee;
    }
    
    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName email position department')
      .populate('markedBy', 'firstName lastName')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments(query);

    res.json({
      attendance,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark attendance (Admin/HR only)
router.post('/', auth, authorize('admin', 'hr'), [
  body('employee').notEmpty().withMessage('Employee is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('status').isIn(['present', 'absent', 'on-leave', 'half-day']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employee, date, status, checkIn, checkOut, notes } = req.body;

    // Check if employee exists
    const employeeExists = await User.findById(employee);
    if (!employeeExists) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      employee,
      date: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.status = status;
      existingAttendance.checkIn = checkIn ? new Date(checkIn) : existingAttendance.checkIn;
      existingAttendance.checkOut = checkOut ? new Date(checkOut) : existingAttendance.checkOut;
      existingAttendance.notes = notes || existingAttendance.notes;
      existingAttendance.markedBy = req.user.id;

      // Calculate hours worked
      if (existingAttendance.checkIn && existingAttendance.checkOut) {
        const hours = (existingAttendance.checkOut - existingAttendance.checkIn) / (1000 * 60 * 60);
        existingAttendance.hoursWorked = Math.max(0, hours);
      }

      await existingAttendance.save();
      
      const updatedAttendance = await Attendance.findById(existingAttendance._id)
        .populate('employee', 'firstName lastName email position department')
        .populate('markedBy', 'firstName lastName');

      return res.json(updatedAttendance);
    }

    // Create new attendance record
    const attendance = new Attendance({
      employee,
      date: new Date(date),
      status,
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      notes,
      markedBy: req.user.id
    });

    // Calculate hours worked
    if (attendance.checkIn && attendance.checkOut) {
      const hours = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);
      attendance.hoursWorked = Math.max(0, hours);
    }

    await attendance.save();

    const newAttendance = await Attendance.findById(attendance._id)
      .populate('employee', 'firstName lastName email position department')
      .populate('markedBy', 'firstName lastName');

    res.status(201).json(newAttendance);
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my attendance (Employee)
router.get('/my', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = { employee: req.user.id };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate('markedBy', 'firstName lastName')
      .sort({ date: -1 });

    // Calculate statistics
    const stats = {
      totalDays: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      onLeave: attendance.filter(a => a.status === 'on-leave').length,
      halfDay: attendance.filter(a => a.status === 'half-day').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0)
    };

    res.json({ attendance, stats });
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;