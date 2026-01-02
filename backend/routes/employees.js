const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get employee count
router.get('/count', auth, async (req, res) => {
  try {
    const count = await User.countDocuments({ role: { $in: ['employee', 'hr', 'admin'] } });
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all employees
router.get('/', auth, async (req, res) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;
    
    let userQuery = {};
    
    // Build user query
    if (department && department !== 'all') {
      userQuery.department = department;
    }
    
    if (search) {
      userQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }

    // Get all users first
    const users = await User.find(userQuery)
      .select('firstName lastName email phone position department location avatar role isActive createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Get corresponding employee records
    const userIds = users.map(user => user._id);
    const employees = await Employee.find({ user: { $in: userIds } });
    
    // Create a map of employee data by user ID
    const employeeMap = {};
    employees.forEach(emp => {
      employeeMap[emp.user.toString()] = emp;
    });

    // Combine user and employee data
    const combinedData = users.map(user => {
      const employeeData = employeeMap[user._id.toString()];
      return {
        _id: employeeData?._id || user._id,
        user: user,
        employeeId: employeeData?.employeeId || `EMP${user._id.toString().slice(-6)}`,
        joinDate: employeeData?.joinDate || user.createdAt,
        salary: employeeData?.salary || 0,
        performance: employeeData?.performance || 0,
        status: employeeData?.status || (user.isActive ? 'active' : 'inactive'),
        skills: employeeData?.skills || [],
        manager: employeeData?.manager || null,
        team: employeeData?.team || []
      };
    });

    // Apply status filter after combining data
    let filteredEmployees = combinedData;
    if (status) {
      filteredEmployees = combinedData.filter(emp => emp.status === status);
    }

    const total = await User.countDocuments(userQuery);

    res.json({
      employees: filteredEmployees,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch employees',
      message: 'Internal server error' 
    });
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