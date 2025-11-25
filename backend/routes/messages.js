const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all users for chat
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({ 
      _id: { $ne: req.user._id } 
    }).select('firstName lastName email role department isActive');
    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversations (users you've chatted with)
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$content' },
          lastMessageTime: { $first: '$timestamp' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$receiver', req.user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: '$user._id',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          email: '$user.email',
          role: '$user.role',
          department: '$user.department',
          isActive: '$user.isActive',
          lastMessage: 1,
          lastMessageTime: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages between two users
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
    .populate('sender', 'firstName lastName')
    .populate('receiver', 'firstName lastName')
    .sort({ timestamp: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      { sender: userId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json(messages.reverse());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { receiver, content } = req.body;

    if (!receiver || !content) {
      return res.status(400).json({ message: 'Receiver and content are required' });
    }

    const message = new Message({
      sender: req.user._id,
      receiver,
      content: content.trim()
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName')
      .populate('receiver', 'firstName lastName');

    // Emit to receiver via Socket.IO if available
    if (global.io) {
      global.io.to(receiver).emit('new-message', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a specific message as read
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only receiver can mark as read
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    message.isRead = true;
    await message.save();

    // Emit read receipt to sender via Socket.IO
    if (global.io) {
      global.io.to(message.sender.toString()).emit('message-read', {
        messageId: message._id,
        readAt: new Date()
      });
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all messages from a user as read
router.put('/mark-all/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await Message.updateMany(
      {
        sender: userId,
        receiver: req.user._id,
        isRead: false
      },
      { isRead: true }
    );

    // Emit read receipt to sender
    if (global.io) {
      global.io.to(userId.toString()).emit('user-messages-read', {
        userId: req.user._id
      });
    }

    res.json({ updated: result.modifiedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;