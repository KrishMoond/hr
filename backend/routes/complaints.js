const express = require('express');
const { body, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// File complaint (Employee)
router.post('/', auth, [
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('category').isIn(['harassment', 'discrimination', 'workplace', 'management', 'facilities', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, priority = 'medium', isAnonymous = false } = req.body;

    const complaint = new Complaint({
      employee: req.user._id,
      title,
      description,
      category,
      priority,
      isAnonymous
    });

    await complaint.save();
    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('employee', 'firstName lastName email');
    
    res.status(201).json(populatedComplaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get complaints
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Employees can only see their own complaints
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    }

    const { status, category, priority } = req.query;
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const complaints = await Complaint.find(query)
      .populate('employee', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update complaint (HR/Admin)
router.put('/:id', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { status, assignedTo, resolution } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (assignedTo) complaint.assignedTo = assignedTo;
    if (resolution) {
      complaint.resolution = resolution;
      complaint.resolvedAt = new Date();
    }

    // Add update to history
    complaint.updates.push({
      author: req.user._id,
      content: `Status updated to ${status}${resolution ? '. Resolution: ' + resolution : ''}`,
      status,
      timestamp: new Date()
    });

    await complaint.save();
    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('employee', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .populate('updates.author', 'firstName lastName');

    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;