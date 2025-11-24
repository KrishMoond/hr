const express = require('express');
const { body, validationResult } = require('express-validator');
const Leave = require('../models/Leave');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply for leave (Employee)
router.post('/', auth, [
  body('type').isIn(['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency']),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('reason').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, startDate, endDate, reason } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = new Leave({
      employee: req.user._id,
      type,
      startDate: start,
      endDate: end,
      days,
      reason
    });

    await leave.save();
    const populatedLeave = await Leave.findById(leave._id).populate('employee', 'firstName lastName email');
    
    res.status(201).json(populatedLeave);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaves
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Employees can only see their own leaves
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    }

    const { status, type } = req.query;
    if (status) query.status = status;
    if (type) query.type = type;

    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update leave status (HR/Admin)
router.put('/:id', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    leave.status = status;
    if (status === 'approved' || status === 'rejected') {
      leave.approvedBy = req.user._id;
      leave.approvedAt = new Date();
      if (status === 'rejected' && rejectionReason) {
        leave.rejectionReason = rejectionReason;
      }
    }

    await leave.save();
    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName');

    res.json(updatedLeave);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;