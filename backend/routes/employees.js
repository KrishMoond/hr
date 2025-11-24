const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all employees
router.get('/', auth, async (req, res) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    
    const employees = await Employee.find(query)
      .populate('user', 'firstName lastName email phone position department location avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    let filteredEmployees = employees;

    if (search) {
      filteredEmployees = employees.filter(emp => 
        emp.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        emp.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
        emp.user.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.user.position.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (department && department !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => 
        emp.user.department === department
      );
    }

    const total = await Employee.countDocuments(query);

    res.json({
      employees: filteredEmployees,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get employee by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'firstName lastName email phone position department location avatar')
      .populate('manager', 'user')
      .populate('team', 'user');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update employee
router.put('/:id', auth, authorize('admin', 'hr'), [
  body('salary').optional().isNumeric(),
  body('performance').optional().isNumeric().isFloat({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { salary, performance, status, skills } = req.body;

    if (salary) employee.salary = salary;
    if (performance) employee.performance = performance;
    if (status) employee.status = status;
    if (skills) employee.skills = skills;

    await employee.save();

    const updatedEmployee = await Employee.findById(req.params.id)
      .populate('user', 'firstName lastName email phone position department location avatar');

    res.json(updatedEmployee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete employee
router.delete('/:id', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await Employee.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(employee.user);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get employee analytics
router.get('/analytics/overview', auth, async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const onLeaveEmployees = await Employee.countDocuments({ status: 'on-leave' });
    
    const departmentStats = await User.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const performanceStats = await Employee.aggregate([
      {
        $group: {
          _id: null,
          avgPerformance: { $avg: '$performance' },
          highPerformers: {
            $sum: { $cond: [{ $gte: ['$performance', 90] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      departmentStats,
      performanceStats: performanceStats[0] || { avgPerformance: 0, highPerformers: 0 }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;