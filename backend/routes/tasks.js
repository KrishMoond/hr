const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create task
router.post('/', auth, [
  body('title').notEmpty(),
  body('project').notEmpty(),
  body('assignedTo').notEmpty(),
  body('dueDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = new Task({
      ...req.body,
      assignedBy: req.user._id
    });

    await task.save();
    await task.populate(['assignedTo', 'assignedBy', 'project'], 'firstName lastName title');

    // Update project progress
    const project = await Project.findById(req.body.project);
    if (project) {
      await project.updateProgress();
    }

    // Send notification
    global.io?.to(req.body.assignedTo).emit('task-assigned', {
      task,
      message: `New task assigned: ${task.title}`
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get tasks
router.get('/', auth, async (req, res) => {
  try {
    const { project, status, assignedTo } = req.query;
    let query = {};

    // Filter based on user role
    if (req.user.role === 'employee') {
      query.assignedTo = req.user._id;
    } else {
      if (assignedTo) query.assignedTo = assignedTo;
    }

    if (project) query.project = project;
    if (status) query.status = status;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'firstName lastName')
      .populate('assignedBy', 'firstName lastName')
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName')
      .populate('project', 'title')
      .populate('comments.author', 'firstName lastName');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check access
    const hasAccess = req.user.role !== 'employee' || 
      task.assignedTo._id.toString() === req.user._id.toString() ||
      task.assignedBy._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    const canEdit = req.user.role !== 'employee' || 
      task.assignedTo.toString() === req.user._id.toString() ||
      task.assignedBy.toString() === req.user._id.toString();

    if (!canEdit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(task, req.body);
    await task.save();
    await task.populate(['assignedTo', 'assignedBy', 'project'], 'firstName lastName title');

    // Update project progress
    const project = await Project.findById(task.project._id);
    if (project) {
      await project.updateProgress();
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add daily update
router.post('/:id/daily-update', auth, [
  body('update').notEmpty(),
  body('hoursWorked').isNumeric()
], async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only assigned user can add daily updates
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only assigned user can add daily updates' });
    }

    // Check if update already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingUpdate = task.dailyUpdates.find(update => {
      const updateDate = new Date(update.date);
      updateDate.setHours(0, 0, 0, 0);
      return updateDate.getTime() === today.getTime();
    });

    if (existingUpdate) {
      // Update existing
      existingUpdate.update = req.body.update;
      existingUpdate.hoursWorked = req.body.hoursWorked;
      existingUpdate.blockers = req.body.blockers;
      existingUpdate.nextDayPlan = req.body.nextDayPlan;
      existingUpdate.submittedAt = new Date();
    } else {
      // Add new update
      task.dailyUpdates.push({
        date: new Date(),
        update: req.body.update,
        hoursWorked: req.body.hoursWorked,
        blockers: req.body.blockers,
        nextDayPlan: req.body.nextDayPlan
      });
    }

    await task.save();
    await task.populate(['assignedTo', 'project'], 'firstName lastName title');

    // Notify project manager
    const project = await Project.findById(task.project._id).populate('projectManager');
    if (project && project.projectManager) {
      global.io?.to(project.projectManager._id.toString()).emit('daily-update', {
        task,
        update: req.body.update,
        message: `Daily update from ${task.assignedTo.firstName} on ${task.title}`
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task progress
router.put('/:id/progress', auth, async (req, res) => {
  try {
    const { progress, status, comment } = req.body;
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.progress = progress;
    if (status) task.status = status;
    
    await task.save();
    await task.populate(['assignedTo', 'project'], 'firstName lastName title');

    // Notify project chat
    global.io?.to(`project-${task.project._id}`).emit('task-progress-update', {
      taskId: task._id,
      taskTitle: task.title,
      progress,
      updatedBy: `${req.user.firstName} ${req.user.lastName}`,
      comment
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comment', auth, [
  body('content').notEmpty()
], async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.comments.push({
      author: req.user._id,
      content: req.body.content,
      isInternal: req.body.isInternal || false
    });

    await task.save();
    await task.populate('comments.author', 'firstName lastName');

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my daily tasks (for today's updates)
router.get('/my/daily', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ 
      assignedTo: req.user._id,
      status: { $in: ['todo', 'in-progress'] }
    })
    .populate('project', 'title requiresDailyUpdates')
    .sort({ dueDate: 1 });

    // Check which tasks need daily updates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasksWithUpdateStatus = tasks.map(task => {
      const hasUpdateToday = task.dailyUpdates.some(update => {
        const updateDate = new Date(update.date);
        updateDate.setHours(0, 0, 0, 0);
        return updateDate.getTime() === today.getTime();
      });

      return {
        ...task.toObject(),
        hasUpdateToday,
        needsUpdate: task.project?.requiresDailyUpdates && !hasUpdateToday
      };
    });

    res.json(tasksWithUpdateStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task analytics
router.get('/analytics/overview', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'employee') {
      query.assignedTo = req.user._id;
    }

    const totalTasks = await Task.countDocuments(query);
    const completedTasks = await Task.countDocuments({ ...query, status: 'completed' });
    const overdueTasks = await Task.countDocuments({ 
      ...query, 
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    });
    const inProgressTasks = await Task.countDocuments({ ...query, status: 'in-progress' });

    // Tasks needing daily updates
    const tasksNeedingUpdates = await Task.find({
      ...query,
      status: { $in: ['todo', 'in-progress'] }
    }).populate('project', 'requiresDailyUpdates');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingUpdates = tasksNeedingUpdates.filter(task => {
      if (!task.project?.requiresDailyUpdates) return false;
      
      return !task.dailyUpdates.some(update => {
        const updateDate = new Date(update.date);
        updateDate.setHours(0, 0, 0, 0);
        return updateDate.getTime() === today.getTime();
      });
    }).length;

    res.json({
      totalTasks,
      completedTasks,
      overdueTasks,
      inProgressTasks,
      pendingUpdates,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;