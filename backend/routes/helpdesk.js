const express = require('express');
const { body, validationResult } = require('express-validator');
const Ticket = require('../models/Ticket');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all tickets
router.get('/tickets', auth, async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Non-admin users can only see their own tickets
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      query.creator = req.user._id;
    }
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const tickets = await Ticket.find(query)
      .populate('creator', 'firstName lastName email')
      .populate('assignee', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Ticket.countDocuments(query);

    res.json({
      tickets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new ticket
router.post('/tickets', auth, [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, description, category, priority = 'medium' } = req.body;

    const ticket = new Ticket({
      subject,
      description,
      category,
      priority,
      creator: req.user._id
    });

    await ticket.save();

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('creator', 'firstName lastName email');

    res.status(201).json(populatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get ticket by ID
router.get('/tickets/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('creator', 'firstName lastName email')
      .populate('assignee', 'firstName lastName email')
      .populate('comments.author', 'firstName lastName');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && req.user.role !== 'hr' && 
        ticket.creator._id.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update ticket
router.put('/tickets/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check permissions
    const canUpdate = req.user.role === 'admin' || req.user.role === 'hr' || 
                     ticket.creator.toString() === req.user._id;
    
    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, priority, assignee, resolution } = req.body;

    if (status) {
      ticket.status = status;
      if (status === 'resolved' || status === 'closed') {
        ticket.resolvedAt = new Date();
        if (resolution) ticket.resolution = resolution;
      }
    }
    
    if (priority && (req.user.role === 'admin' || req.user.role === 'hr')) {
      ticket.priority = priority;
    }
    
    if (assignee && (req.user.role === 'admin' || req.user.role === 'hr')) {
      ticket.assignee = assignee;
    }

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('creator', 'firstName lastName email')
      .populate('assignee', 'firstName lastName email');

    res.json(updatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to ticket
router.post('/tickets/:id/comments', auth, [
  body('content').notEmpty().withMessage('Comment content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const { content } = req.body;

    ticket.comments.push({
      author: req.user._id,
      content
    });

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('comments.author', 'firstName lastName');

    res.json(updatedTicket.comments[updatedTicket.comments.length - 1]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get FAQ
router.get('/faq', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    // Mock FAQ data - in production, this would come from database
    let faqs = [
      {
        id: 1,
        question: 'How do I apply for annual leave?',
        answer: 'You can apply for annual leave through the HR portal. Go to Leave Management > Apply Leave, select the dates, and submit for approval.',
        category: 'leave',
        views: 245
      },
      {
        id: 2,
        question: 'What is the company policy on remote work?',
        answer: 'Our remote work policy allows up to 3 days per week of remote work with manager approval. Full details are available in the Employee Handbook.',
        category: 'policy',
        views: 189
      },
      {
        id: 3,
        question: 'How can I view my salary slip?',
        answer: 'Salary slips are available in the HR portal under Payroll > Salary Slips. You can download PDFs for the last 12 months.',
        category: 'salary',
        views: 156
      }
    ];

    if (category && category !== 'all') {
      faqs = faqs.filter(faq => faq.category === category);
    }

    if (search) {
      faqs = faqs.filter(faq => 
        faq.question.toLowerCase().includes(search.toLowerCase()) ||
        faq.answer.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(faqs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get helpdesk analytics
router.get('/analytics', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'open' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'in-progress' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'resolved' });

    const categoryStats = await Ticket.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const priorityStats = await Ticket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      categoryStats,
      priorityStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;