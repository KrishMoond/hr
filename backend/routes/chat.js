const express = require('express');
const Chat = require('../models/Chat');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's chats
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
      isActive: true
    })
    .populate('participants', 'firstName lastName avatar isActive')
    .populate('lastMessage.sender', 'firstName lastName')
    .sort({ 'lastMessage.timestamp': -1 });

    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new chat
router.post('/', auth, async (req, res) => {
  try {
    const { participants, type, name } = req.body;
    
    // Add current user to participants if not included
    if (!participants.includes(req.user._id)) {
      participants.push(req.user._id);
    }

    const chat = new Chat({
      participants,
      type,
      name: type === 'group' ? name : undefined
    });

    await chat.save();
    
    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'firstName lastName avatar isActive');

    res.status(201).json(populatedChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat messages
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const chat = await Chat.findById(req.params.chatId)
      .populate('messages.sender', 'firstName lastName avatar');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = chat.messages
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice((page - 1) * limit, page * limit);

    res.json({
      messages: messages.reverse(),
      totalPages: Math.ceil(chat.messages.length / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { content, type = 'text', fileUrl, fileName } = req.body;
    
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = {
      sender: req.user._id,
      content,
      type,
      fileUrl,
      fileName
    };

    chat.messages.push(message);
    chat.lastMessage = {
      content,
      sender: req.user._id,
      timestamp: new Date()
    };

    await chat.save();

    const populatedMessage = await Chat.findById(chat._id)
      .populate('messages.sender', 'firstName lastName avatar')
      .then(chat => chat.messages[chat.messages.length - 1]);

    // Emit to all participants via Socket.IO
    if (global.io) {
      chat.participants.forEach(participantId => {
        if (participantId.toString() !== req.user._id) {
          global.io.to(participantId.toString()).emit('new-message', {
            chatId: chat._id,
            message: populatedMessage
          });
        }
      });
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/:chatId/read', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Mark unread messages as read
    chat.messages.forEach(message => {
      if (!message.isRead && message.sender.toString() !== req.user._id) {
        message.isRead = true;
        message.readBy.push({
          user: req.user._id,
          readAt: new Date()
        });
      }
    });

    await chat.save();
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;