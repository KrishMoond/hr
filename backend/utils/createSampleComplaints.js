const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
require('dotenv').config();

const sampleComplaints = [
  {
    title: 'Workplace Harassment Issue',
    description: 'I am experiencing inappropriate behavior from a colleague that makes me uncomfortable in the workplace.',
    category: 'harassment',
    priority: 'high',
    status: 'open'
  },
  {
    title: 'Payroll Discrepancy',
    description: 'My salary for last month was calculated incorrectly. The overtime hours were not included.',
    category: 'payroll',
    priority: 'medium',
    status: 'in-progress'
  },
  {
    title: 'Unsafe Working Conditions',
    description: 'The air conditioning system in our office has been broken for weeks, creating an uncomfortable work environment.',
    category: 'workplace-safety',
    priority: 'high',
    status: 'open'
  },
  {
    title: 'Discrimination Based on Age',
    description: 'I feel I am being passed over for promotions due to my age, despite having excellent performance reviews.',
    category: 'discrimination',
    priority: 'urgent',
    status: 'open'
  },
  {
    title: 'Benefits Not Applied Correctly',
    description: 'My health insurance benefits were not applied correctly and I had to pay out of pocket for medical expenses.',
    category: 'benefits',
    priority: 'medium',
    status: 'resolved'
  },
  {
    title: 'Manager Communication Issues',
    description: 'My direct manager is not providing clear instructions and feedback, affecting my work performance.',
    category: 'management',
    priority: 'medium',
    status: 'in-progress'
  },
  {
    title: 'Office Facilities Problem',
    description: 'The elevator has been out of order for several days, making it difficult for employees to access upper floors.',
    category: 'facilities',
    priority: 'low',
    status: 'resolved'
  },
  {
    title: 'General Workplace Concern',
    description: 'The noise level in the open office space is too high, making it difficult to concentrate on work.',
    category: 'general',
    priority: 'low',
    status: 'closed'
  }
];

async function createSampleComplaints() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing complaints
    await Complaint.deleteMany({});
    console.log('Cleared existing complaints');

    // Get all users to assign complaints to
    const users = await User.find({});
    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      return;
    }

    // Create complaints with random users
    const complaints = [];
    for (let i = 0; i < sampleComplaints.length; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const complaint = new Complaint({
        ...sampleComplaints[i],
        submittedBy: randomUser._id,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      });

      // Add some comments to resolved complaints
      if (complaint.status === 'resolved' || complaint.status === 'closed') {
        const hrUser = users.find(u => u.role === 'hr' || u.role === 'admin');
        if (hrUser) {
          complaint.comments.push({
            author: hrUser._id,
            content: 'We have investigated this issue and taken appropriate action.',
            timestamp: new Date(complaint.createdAt.getTime() + 24 * 60 * 60 * 1000)
          });
          complaint.assignedTo = hrUser._id;
          if (complaint.status === 'resolved') {
            complaint.resolvedAt = new Date(complaint.createdAt.getTime() + 48 * 60 * 60 * 1000);
            complaint.resolution = 'Issue has been resolved through proper channels and corrective measures have been implemented.';
          }
        }
      }

      complaints.push(complaint);
    }

    await Complaint.insertMany(complaints);
    console.log(`✅ Created ${complaints.length} sample complaints`);

    // Show statistics
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📊 Complaint Statistics:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating sample complaints:', error);
    process.exit(1);
  }
}

createSampleComplaints();