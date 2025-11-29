const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const ProjectInvitation = require('../models/ProjectInvitation');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Create project
router.post('/', auth, authorize('admin', 'hr'), [
  body('title').notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = new Project({
      ...req.body,
      createdBy: req.user._id,
      projectManager: req.body.projectManager || req.user._id,
      teamMembers: req.body.teamMembers || []
    });

    await project.save();
    await project.populate(['createdBy', 'projectManager', 'teamMembers'], 'firstName lastName email');
    
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get projects
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query = {};

    // Filter based on user role
    if (req.user.role === 'employee') {
      query.$or = [
        { teamMembers: req.user._id },
        { projectManager: req.user._id },
        { createdBy: req.user._id }
      ];
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const projects = await Project.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('projectManager', 'firstName lastName')
      .populate('teamMembers', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('projectManager', 'firstName lastName')
      .populate('teamMembers', 'firstName lastName email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access
    const hasAccess = req.user.role !== 'employee' || 
      project.teamMembers.some(member => member._id.toString() === req.user._id.toString()) ||
      project.projectManager._id.toString() === req.user._id.toString() ||
      project.createdBy._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions
    const canEdit = req.user.role !== 'employee' || 
      project.projectManager.toString() === req.user._id.toString() ||
      project.createdBy.toString() === req.user._id.toString();

    if (!canEdit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(project, req.body);
    await project.save();
    await project.populate(['createdBy', 'projectManager', 'teamMembers'], 'firstName lastName email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send project invitation
router.post('/:id/invite', auth, authorize('admin', 'hr'), [
  body('invitedUser').notEmpty(),
  body('role').isIn(['member', 'lead', 'reviewer'])
], async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const invitation = new ProjectInvitation({
      project: req.params.id,
      invitedBy: req.user._id,
      invitedUser: req.body.invitedUser,
      role: req.body.role,
      message: req.body.message
    });

    await invitation.save();
    await invitation.populate(['project', 'invitedBy', 'invitedUser'], 'title firstName lastName email');

    // Send notification (implement notification system)
    global.io?.to(req.body.invitedUser).emit('project-invitation', {
      invitation,
      message: `You've been invited to join project: ${project.title}`
    });

    res.status(201).json(invitation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get project invitations
router.get('/invitations/my', auth, async (req, res) => {
  try {
    const invitations = await ProjectInvitation.find({ 
      invitedUser: req.user._id,
      status: 'pending'
    })
    .populate('project', 'title description')
    .populate('invitedBy', 'firstName lastName')
    .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Respond to invitation
router.put('/invitations/:id/respond', auth, [
  body('status').isIn(['accepted', 'declined']),
  body('responseMessage').optional()
], async (req, res) => {
  try {
    const invitation = await ProjectInvitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.invitedUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    invitation.status = req.body.status;
    invitation.responseMessage = req.body.responseMessage;
    invitation.respondedAt = new Date();
    await invitation.save();

    // If accepted, add to project team
    if (req.body.status === 'accepted') {
      const project = await Project.findById(invitation.project);
      if (!project.teamMembers.includes(req.user._id)) {
        project.teamMembers.push(req.user._id);
        await project.save();
      }
    }

    res.json(invitation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get project tasks
router.get('/:id/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.id })
      .populate('assignedTo', 'firstName lastName')
      .populate('assignedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;