const mongoose = require('mongoose');
const Leave = require('../models/Leave');
const User = require('../models/User');
require('dotenv').config();

async function createSampleLeaves() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find employee users
    const employees = await User.find({ role: 'employee' }).limit(3);
    
    if (employees.length === 0) {
      console.log('No employee users found');
      return;
    }

    const sampleLeaves = [
      {
        employee: employees[0]._id,
        type: 'annual',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-17'),
        days: 3,
        reason: 'Family vacation',
        status: 'pending'
      },
      {
        employee: employees[1]._id,
        type: 'sick',
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-01-22'),
        days: 3,
        reason: 'Medical appointment',
        status: 'pending'
      }
    ];

    // Create leaves if they don't exist
    for (const leaveData of sampleLeaves) {
      const existingLeave = await Leave.findOne({
        employee: leaveData.employee,
        startDate: leaveData.startDate
      });
      
      if (!existingLeave) {
        const leave = new Leave(leaveData);
        await leave.save();
        console.log(`Created leave for employee ${leaveData.employee}`);
      }
    }

    console.log('Sample leaves created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample leaves:', error);
    process.exit(1);
  }
}

createSampleLeaves();