const express = require('express');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Chat = require('../models/Chat');
const Ticket = require('../models/Ticket');
const WellnessProgram = require('../models/WellnessProgram');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Dashboard overview analytics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const totalChats = await Chat.countDocuments({ type: 'individual' });
    const activeChats = await Chat.countDocuments({ 
      type: 'individual',
      'lastMessage.timestamp': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const openTickets = await Ticket.countDocuments({ status: 'open' });
    const activeWellnessPrograms = await WellnessProgram.countDocuments({ status: 'active' });

    // Performance trends (last 6 months)
    const performanceData = await Employee.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          avgPerformance: { $avg: '$performance' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Department distribution
    const departmentStats = await User.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: {
        totalEmployees,
        activeEmployees,
        totalChats,
        activeChats,
        openTickets,
        activeWellnessPrograms
      },
      performanceData,
      departmentStats,
      trends: {
        employeeGrowth: 8.5,
        chatActivity: -2.1,
        ticketResolution: 15.3,
        wellnessParticipation: 12.8
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Performance analytics
router.get('/performance', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { period = '6months' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '1month':
        dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
        break;
      case '3months':
        dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 3)) };
        break;
      case '6months':
        dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 6)) };
        break;
      case '1year':
        dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
    }

    const performanceByDepartment = await Employee.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $group: {
          _id: '$userInfo.department',
          avgPerformance: { $avg: '$performance' },
          count: { $sum: 1 },
          highPerformers: {
            $sum: { $cond: [{ $gte: ['$performance', 90] }, 1, 0] }
          }
        }
      }
    ]);

    const topPerformers = await Employee.find()
      .populate('user', 'firstName lastName department')
      .sort({ performance: -1 })
      .limit(10);

    const performanceTrends = await Employee.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $group: {
          _id: {
            month: { $month: '$updatedAt' },
            year: { $year: '$updatedAt' }
          },
          avgPerformance: { $avg: '$performance' },
          satisfaction: { $avg: 85 } // Mock satisfaction data
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      performanceByDepartment,
      topPerformers,
      performanceTrends
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Workforce analytics
router.get('/workforce', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const headcountTrends = await Employee.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          newHires: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const departmentDistribution = await User.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const statusDistribution = await Employee.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const skillsAnalysis = await Employee.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      headcountTrends,
      departmentDistribution,
      statusDistribution,
      skillsAnalysis
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Engagement analytics
router.get('/engagement', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const chatActivity = await Chat.aggregate([
      { $unwind: '$messages' },
      {
        $group: {
          _id: {
            month: { $month: '$messages.createdAt' },
            year: { $year: '$messages.createdAt' }
          },
          messageCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const wellnessParticipation = await WellnessProgram.aggregate([
      { $unwind: '$participants' },
      {
        $group: {
          _id: '$category',
          participantCount: { $sum: 1 }
        }
      }
    ]);

    const helpdeskActivity = await Ticket.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          ticketCount: { $sum: 1 },
          resolvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      chatActivity,
      wellnessParticipation,
      helpdeskActivity
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Productivity insights
router.get('/productivity', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    // Mock productivity data - in real implementation, this would come from project management tools
    const productivityData = {
      taskCompletion: [
        { month: 'Jan', completed: 85, total: 100 },
        { month: 'Feb', completed: 92, total: 105 },
        { month: 'Mar', completed: 88, total: 98 },
        { month: 'Apr', completed: 95, total: 110 },
        { month: 'May', completed: 90, total: 102 },
        { month: 'Jun', completed: 97, total: 115 }
      ],
      workEfficiency: [
        { department: 'Engineering', efficiency: 92 },
        { department: 'Design', efficiency: 88 },
        { department: 'Marketing', efficiency: 85 },
        { department: 'Sales', efficiency: 90 },
        { department: 'HR', efficiency: 87 }
      ],
      projectMetrics: {
        onTime: 78,
        delayed: 15,
        ahead: 7
      }
    };

    res.json(productivityData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;