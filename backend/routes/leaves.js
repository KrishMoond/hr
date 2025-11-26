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
    
    // Validate dates
    if (start > end) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }
    
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Check if employee exists and get leave balances
    const Employee = require('../models/Employee');
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found' });
    }

    const leave = new Leave({
      employee: req.user._id,
      type,
      startDate: start,
      endDate: end,
      days,
      reason,
      paid: false
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
    // If admin/hr request a specific employee's leaves, allow via query param
    const { employee: employeeQuery } = req.query;

    // Employees can only see their own leaves unless employeeQuery is provided and requester has permissions
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    } else if (employeeQuery && (req.user.role === 'admin' || req.user.role === 'hr')) {
      query.employee = employeeQuery;
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

// Get leave balances for current user
router.get('/balances', auth, async (req, res) => {
  try {
    const Employee = require('../models/Employee');
    const employee = await Employee.findOne({ user: req.user._id });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found' });
    }

    const balances = employee.leaveBalances || {
      annual: 14,
      sick: 10,
      personal: 5,
      bonus: 0
    };

    res.json(balances);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update leave status (HR/Admin)
router.put('/:id', auth, async (req, res) => {
  // Check if user has permission
  if (!['admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Admin or HR role required.' });
  }
  try {
    console.log('Updating leave:', req.params.id, req.body);
    console.log('User role:', req.user.role);
    console.log('User ID:', req.user._id);
    
    const { status, rejectionReason } = req.body;
    
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    // If approving, compute paid/unpaid days based on employee leaveBalances
    leave.status = status;
    if (status === 'approved' || status === 'rejected') {
      leave.approvedBy = req.user._id;
      leave.approvedAt = new Date();
      if (status === 'rejected' && rejectionReason) {
        leave.rejectionReason = rejectionReason;
      }

      if (status === 'approved') {
        // Fetch employee record to update balances
        const Employee = require('../models/Employee');
        const employee = await Employee.findOne({ user: leave.employee });
        if (employee) {
          const balances = employee.leaveBalances || { annual: 14, sick: 10, personal: 5, bonus: 0 };
          const typeKey = leave.type;
          let remaining = balances[typeKey] !== undefined ? balances[typeKey] : 0;
          let unpaidDays = 0;

          if (leave.days <= remaining) {
            // fully covered by existing balance
            balances[typeKey] = remaining - leave.days;
            leave.paid = true;
            leave.unpaidDays = 0;
            leave.deductionAmount = 0;
          } else {
            // partially or fully unpaid, try to use bonus days first
            let need = leave.days - remaining;
            // consume the remaining type balance
            balances[typeKey] = 0;

            // use bonus days if available
            const bonusAvailable = balances.bonus || 0;
            if (bonusAvailable >= need) {
              balances.bonus = bonusAvailable - need;
              need = 0;
            } else {
              need = need - bonusAvailable;
              balances.bonus = 0;
            }

            unpaidDays = need;
            leave.paid = unpaidDays === 0;
            leave.unpaidDays = unpaidDays;
            // compute deduction: approximate daily salary = salary / 30
            const EmployeeModel = require('../models/Employee');
            const empRecord = await EmployeeModel.findById(employee._id);
            const salary = empRecord.salary || 0;
            const daily = salary / 30;
            leave.deductionAmount = Math.round(unpaidDays * daily);

            // balances updated (type and bonus already adjusted)
          }

          // Save updated balances
          employee.leaveBalances = balances;
          await employee.save();

          // Award bonus leaves if employee had no leaves in the previous 2 months
          const twoMonthsAgo = new Date();
          twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
          const recentLeaves = await Leave.find({
            employee: leave.employee,
            status: 'approved',
            createdAt: { $gte: twoMonthsAgo },
            _id: { $ne: leave._id }
          });
          
          // Check if this is the first approved leave in 2 months
          if (!recentLeaves || recentLeaves.length === 0) {
            // Grant 3 bonus days for consistent attendance
            employee.leaveBalances = employee.leaveBalances || { annual: 14, sick: 10, personal: 5, bonus: 0 };
            employee.leaveBalances.bonus = (employee.leaveBalances.bonus || 0) + 3;
            await employee.save();
            
            // Log bonus award for tracking
            console.log(`Awarded 3 bonus leaves to employee ${leave.employee} for 2-month attendance`);
            
            // You could add a notification system here to inform the employee
            // about their bonus leave award
          }
        }
      }
    }

    await leave.save();
    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName');

    res.json(updatedLeave);
  } catch (error) {
    console.error('Leave update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;