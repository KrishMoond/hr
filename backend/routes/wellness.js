const express = require('express');
const { body, validationResult } = require('express-validator');
const WellnessProgram = require('../models/WellnessProgram');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all wellness programs
router.get('/programs', auth, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const programs = await WellnessProgram.find(query)
      .populate('creator', 'firstName lastName')
      .populate('participants', 'firstName lastName avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await WellnessProgram.countDocuments(query);

    res.json({
      programs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new wellness program
router.post('/programs', auth, authorize('admin', 'hr'), [
  body('name').notEmpty().withMessage('Program name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').isIn(['challenge', 'program', 'event']).withMessage('Invalid type'),
  body('category').isIn(['fitness', 'mental', 'nutrition', 'sleep']).withMessage('Invalid category'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, type, category, startDate, endDate, goals, rewards } = req.body;

    const program = new WellnessProgram({
      name,
      description,
      type,
      category,
      startDate,
      endDate,
      goals,
      rewards,
      creator: req.user._id
    });

    await program.save();

    const populatedProgram = await WellnessProgram.findById(program._id)
      .populate('creator', 'firstName lastName');

    res.status(201).json(populatedProgram);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join wellness program
router.post('/programs/:id/join', auth, async (req, res) => {
  try {
    const program = await WellnessProgram.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    if (program.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already joined this program' });
    }

    program.participants.push(req.user._id);
    
    // Initialize user progress for each goal
    program.goals.forEach(goal => {
      goal.participants.push({
        user: req.user._id,
        current: 0,
        progress: 0
      });
    });

    await program.save();

    const updatedProgram = await WellnessProgram.findById(program._id)
      .populate('participants', 'firstName lastName avatar');

    res.json(updatedProgram);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update progress
router.put('/programs/:id/progress', auth, [
  body('goalIndex').isNumeric().withMessage('Goal index is required'),
  body('current').isNumeric().withMessage('Current value is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { goalIndex, current } = req.body;
    
    const program = await WellnessProgram.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    if (!program.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not enrolled in this program' });
    }

    const goal = program.goals[goalIndex];
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const userProgress = goal.participants.find(p => p.user.toString() === req.user._id);
    if (userProgress) {
      userProgress.current = current;
      userProgress.progress = (current / goal.target) * 100;
    }

    await program.save();
    res.json({ message: 'Progress updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's wellness goals
router.get('/goals', auth, async (req, res) => {
  try {
    const programs = await WellnessProgram.find({
      participants: req.user._id,
      status: 'active'
    });

    const goals = [];
    programs.forEach(program => {
      program.goals.forEach((goal, index) => {
        const userProgress = goal.participants.find(p => p.user.toString() === req.user._id);
        if (userProgress) {
          goals.push({
            id: `${program._id}_${index}`,
            programId: program._id,
            programName: program.name,
            title: goal.title,
            target: goal.target,
            current: userProgress.current,
            progress: userProgress.progress,
            unit: goal.unit,
            category: program.category,
            deadline: program.endDate
          });
        }
      });
    });

    res.json(goals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get wellness analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const totalPrograms = await WellnessProgram.countDocuments();
    const activePrograms = await WellnessProgram.countDocuments({ status: 'active' });
    
    const participationStats = await WellnessProgram.aggregate([
      { $unwind: '$participants' },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const categoryStats = await WellnessProgram.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Calculate user's personal stats
    const userPrograms = await WellnessProgram.find({
      participants: req.user._id
    });

    let completedGoals = 0;
    let totalGoals = 0;

    userPrograms.forEach(program => {
      program.goals.forEach(goal => {
        const userProgress = goal.participants.find(p => p.user.toString() === req.user._id);
        if (userProgress) {
          totalGoals++;
          if (userProgress.progress >= 100) {
            completedGoals++;
          }
        }
      });
    });

    res.json({
      totalPrograms,
      activePrograms,
      participationStats,
      categoryStats,
      userStats: {
        enrolledPrograms: userPrograms.length,
        completedGoals,
        totalGoals,
        completionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;