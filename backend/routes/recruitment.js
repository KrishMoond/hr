const express = require('express');
const { body, validationResult } = require('express-validator');
const JobPosting = require('../models/JobPosting');
const Application = require('../models/Application');
const { auth, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create job posting
router.post('/jobs', auth, authorize('admin', 'hr'), [
  body('title').notEmpty(),
  body('department').notEmpty(),
  body('description').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const jobPosting = new JobPosting({
      ...req.body,
      postedBy: req.user._id
    });

    await jobPosting.save();
    res.status(201).json(jobPosting);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get job postings
router.get('/jobs', async (req, res) => {
  try {
    const { status = 'active', department, location } = req.query;
    let query = { status };

    if (department) query.department = department;
    if (location) query.location = location;

    const jobs = await JobPosting.find(query)
      .populate('postedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply for job
router.post('/jobs/:jobId/apply', upload.single('resume'), [
  body('applicant.firstName').notEmpty(),
  body('applicant.lastName').notEmpty(),
  body('applicant.email').isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Resume is required' });
    }

    const jobPosting = await JobPosting.findById(req.params.jobId);
    if (!jobPosting) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    const application = new Application({
      jobPosting: req.params.jobId,
      applicant: req.body.applicant,
      resume: req.file.path,
      coverLetter: req.body.coverLetter,
      experience: req.body.experience,
      expectedSalary: req.body.expectedSalary,
      noticePeriod: req.body.noticePeriod
    });

    await application.save();

    // Update job posting application count
    jobPosting.totalApplications += 1;
    await jobPosting.save();

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get applications
router.get('/applications', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { jobId, status } = req.query;
    let query = {};

    if (jobId) query.jobPosting = jobId;
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('jobPosting', 'title department')
      .populate('interviews.interviewer', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status
router.put('/applications/:id/status', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        rejectionReason,
        assignedTo: req.user._id
      },
      { new: true }
    ).populate('jobPosting', 'title department');

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Schedule interview
router.post('/applications/:id/interview', auth, authorize('admin', 'hr'), [
  body('type').isIn(['phone', 'video', 'in-person', 'technical']),
  body('scheduledAt').isISO8601(),
  body('interviewer').notEmpty()
], async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.interviews.push({
      ...req.body,
      status: 'scheduled'
    });

    await application.save();
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;