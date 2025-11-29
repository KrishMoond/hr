const express = require('express');
const ProjectChat = require('../models/ProjectChat');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get project chat
router.get('/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is part of project
    const isParticipant = project.teamMembers.includes(req.user._id) || 
                         project.projectManager.toString() === req.user._id.toString() ||
                         project.createdBy.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let chat = await ProjectChat.findOne({ project: req.params.projectId })
      .populate('messages.sender', 'firstName lastName')
      .populate('participants', 'firstName lastName');

    if (!chat) {
      // Create chat if doesn't exist
      chat = new ProjectChat({
        project: req.params.projectId,
        participants: [...project.teamMembers, project.projectManager, project.createdBy],
        messages: []
      });
      await chat.save();
      await chat.populate('participants', 'firstName lastName');
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/:projectId/message', auth, async (req, res) => {
  try {
    const { content, messageType = 'message', statusUpdate } = req.body;
    
    const chat = await ProjectChat.findOne({ project: req.params.projectId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = {
      sender: req.user._id,
      content,
      messageType,
      statusUpdate,
      timestamp: new Date()
    };

    chat.messages.push(message);
    await chat.save();

    // If status update, update project
    if (messageType === 'status_update' && statusUpdate) {
      await Project.findByIdAndUpdate(req.params.projectId, {
        status: statusUpdate.newStatus,
        progress: statusUpdate.progress || 0
      });
    }

    await chat.populate('messages.sender', 'firstName lastName');
    const newMessage = chat.messages[chat.messages.length - 1];

    // Emit to project room
    global.io?.to(`project-${req.params.projectId}`).emit('new-project-message', {
      projectId: req.params.projectId,
      message: newMessage
    });

    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;