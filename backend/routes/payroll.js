const express = require('express');
const { body, validationResult } = require('express-validator');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Generate payroll for all employees
router.post('/generate', auth, authorize('admin', 'hr'), [
  body('month').isInt({ min: 1, max: 12 }),
  body('year').isInt({ min: 2020, max: 2030 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { month, year } = req.body;
    
    // Get all active employees
    const employees = await Employee.find({ status: 'active' }).populate('user');
    const payrolls = [];

    for (const employee of employees) {
      // Check if payroll already exists
      const existingPayroll = await Payroll.findOne({
        employee: employee.user._id,
        month,
        year
      });

      if (existingPayroll) continue;

      // Calculate payroll
      const basicSalary = employee.salary;
      const allowances = {
        hra: basicSalary * 0.4, // 40% HRA
        transport: 2000,
        medical: 1500
      };
      const grossSalary = basicSalary + allowances.hra + allowances.transport + allowances.medical;
      
      const deductions = {
        tax: grossSalary * 0.1, // 10% tax
        pf: basicSalary * 0.12, // 12% PF
        insurance: 500
      };
      const netSalary = grossSalary - (deductions.tax + deductions.pf + deductions.insurance);

      const payroll = new Payroll({
        employee: employee.user._id,
        month,
        year,
        basicSalary,
        allowances,
        deductions,
        grossSalary,
        netSalary,
        presentDays: 22, // Default, should be calculated from attendance
        processedBy: req.user._id
      });

      await payroll.save();
      payrolls.push(payroll);
    }

    res.json({ message: `Generated payroll for ${payrolls.length} employees`, payrolls });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get payrolls
router.get('/', auth, async (req, res) => {
  try {
    const { month, year, employee } = req.query;
    let query = {};

    if (month) query.month = month;
    if (year) query.year = year;
    if (employee) query.employee = employee;

    // Employees can only see their own payroll
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    }

    const payrolls = await Payroll.find(query)
      .populate('employee', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName')
      .sort({ year: -1, month: -1 });

    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update payroll status
router.put('/:id/status', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { status } = req.body;
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status, processedBy: req.user._id, processedAt: new Date() },
      { new: true }
    ).populate('employee', 'firstName lastName email');

    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;