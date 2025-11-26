const mongoose = require('mongoose');
const Leave = require('../models/Leave');
const User = require('../models/User');
require('dotenv').config();

async function testLeaveApproval() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find an admin/hr user
    const adminUser = await User.findOne({ role: { $in: ['admin', 'hr'] } });
    if (!adminUser) {
      console.log('No admin/hr user found');
      return;
    }

    // Find a pending leave
    const pendingLeave = await Leave.findOne({ status: 'pending' });
    if (!pendingLeave) {
      console.log('No pending leaves found');
      return;
    }

    console.log('Found pending leave:', pendingLeave._id);
    console.log('Admin user:', adminUser.email, adminUser.role);

    // Test approval
    pendingLeave.status = 'approved';
    pendingLeave.approvedBy = adminUser._id;
    pendingLeave.approvedAt = new Date();
    
    await pendingLeave.save();
    console.log('Leave approved successfully');

    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

testLeaveApproval();