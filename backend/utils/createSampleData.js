const mongoose = require('mongoose');
const User = require('../models/User');
const Leave = require('../models/Leave');
const Complaint = require('../models/Complaint');
require('dotenv').config();

const createSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get users
    const users = await User.find();
    const employees = users.filter(u => u.role === 'employee');
    const hrUsers = users.filter(u => u.role === 'hr' || u.role === 'admin');

    // Clear existing data
    await Leave.deleteMany({});
    await Complaint.deleteMany({});

    // Create sample leaves
    const leaveTypes = ['annual', 'sick', 'personal', 'maternity', 'emergency'];
    const leaveStatuses = ['pending', 'approved', 'rejected'];
    
    const sampleLeaves = [];
    for (let i = 0; i < 15; i++) {
      const employee = employees[Math.floor(Math.random() * employees.length)];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60) - 30);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 1);
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      const leave = new Leave({
        employee: employee._id,
        type: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
        startDate,
        endDate,
        days,
        reason: [
          'Family vacation',
          'Medical appointment',
          'Personal matters',
          'Wedding ceremony',
          'Emergency situation',
          'Mental health day',
          'Child care',
          'Home repairs'
        ][Math.floor(Math.random() * 8)],
        status: leaveStatuses[Math.floor(Math.random() * leaveStatuses.length)],
        paid: Math.random() > 0.3,
        comments: Math.random() > 0.5 ? [{
          author: hrUsers[0]._id,
          content: 'Approved. Enjoy your time off!',
          timestamp: new Date()
        }] : []
      });

      if (leave.status !== 'pending') {
        leave.approvedBy = hrUsers[0]._id;
        leave.approvedAt = new Date();
      }

      sampleLeaves.push(leave);
    }

    await Leave.insertMany(sampleLeaves);

    // Create sample complaints
    const complaintCategories = ['general', 'harassment', 'discrimination', 'workplace-safety', 'benefits', 'payroll', 'management', 'facilities'];
    const complaintPriorities = ['low', 'medium', 'high', 'urgent'];
    const complaintStatuses = ['open', 'in-progress', 'resolved', 'closed'];

    const sampleComplaints = [];
    for (let i = 0; i < 12; i++) {
      const employee = employees[Math.floor(Math.random() * employees.length)];
      
      const complaint = new Complaint({
        submittedBy: employee._id,
        title: [
          'Office temperature too cold',
          'Parking space issue',
          'Workplace harassment concern',
          'Equipment malfunction',
          'Payroll discrepancy',
          'Manager communication issue',
          'Safety hazard in workspace',
          'Benefits enrollment problem',
          'Discrimination complaint',
          'Facility maintenance request',
          'Work-life balance concern',
          'Training program feedback'
        ][Math.floor(Math.random() * 12)],
        description: [
          'The office air conditioning is set too low, making it uncomfortable to work.',
          'There are not enough parking spaces for all employees.',
          'I would like to report inappropriate behavior from a colleague.',
          'My computer has been malfunctioning for several days.',
          'There is an error in my last paycheck that needs to be corrected.',
          'Communication with my direct manager has been problematic.',
          'There is a safety issue in the workspace that needs attention.',
          'I am having trouble enrolling in the health benefits program.',
          'I believe I have experienced discrimination based on my background.',
          'The office facilities need maintenance and repairs.',
          'My current workload is affecting my work-life balance.',
          'I have feedback about the recent training program.'
        ][Math.floor(Math.random() * 12)],
        category: complaintCategories[Math.floor(Math.random() * complaintCategories.length)],
        priority: complaintPriorities[Math.floor(Math.random() * complaintPriorities.length)],
        status: complaintStatuses[Math.floor(Math.random() * complaintStatuses.length)],
        comments: Math.random() > 0.4 ? [{
          author: hrUsers[0]._id,
          content: 'Thank you for bringing this to our attention. We are investigating.',
          timestamp: new Date()
        }] : []
      });

      if (complaint.status !== 'open') {
        complaint.assignedTo = hrUsers[0]._id;
      }

      sampleComplaints.push(complaint);
    }

    await Complaint.insertMany(sampleComplaints);

    console.log('✅ Sample data created successfully!');
    console.log(`📋 Created ${sampleLeaves.length} leave records`);
    console.log(`📝 Created ${sampleComplaints.length} complaint records`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
};

createSampleData();