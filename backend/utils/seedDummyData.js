const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Employee = require('../models/Employee');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const Complaint = require('../models/Complaint');
const Ticket = require('../models/Ticket');
const WellnessProgram = require('../models/WellnessProgram');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Leave.deleteMany({});
    await Complaint.deleteMany({});
    await Ticket.deleteMany({});
    await WellnessProgram.deleteMany({});
    console.log('Cleared existing data');

    // Create Users
    const users = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@hrsarthi.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        position: 'System Administrator',
        department: 'IT',
        isActive: true
      },
      {
        firstName: 'HR',
        lastName: 'Manager',
        email: 'hr@hrsarthi.com',
        password: await bcrypt.hash('hr123', 10),
        role: 'hr',
        position: 'HR Manager',
        department: 'Human Resources',
        isActive: true
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@hrsarthi.com',
        password: await bcrypt.hash('password123', 10),
        role: 'employee',
        position: 'Software Developer',
        department: 'Engineering',
        isActive: true
      },
      {
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike.c@hrsarthi.com',
        password: await bcrypt.hash('password123', 10),
        role: 'employee',
        position: 'Product Manager',
        department: 'Product',
        isActive: true
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.d@hrsarthi.com',
        password: await bcrypt.hash('password123', 10),
        role: 'employee',
        position: 'UX Designer',
        department: 'Design',
        isActive: true
      },
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.s@hrsarthi.com',
        password: await bcrypt.hash('password123', 10),
        role: 'employee',
        position: 'Marketing Specialist',
        department: 'Marketing',
        isActive: true
      },
      {
        firstName: 'Lisa',
        lastName: 'Wilson',
        email: 'lisa.w@hrsarthi.com',
        password: await bcrypt.hash('password123', 10),
        role: 'employee',
        position: 'Sales Representative',
        department: 'Sales',
        isActive: true
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Created users');

    // Create Employee records
    const employees = createdUsers.map((user, index) => ({
      user: user._id,
      employeeId: `EMP${String(index + 1).padStart(3, '0')}`,
      joinDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      salary: 50000 + (index * 10000),
      performance: 70 + Math.floor(Math.random() * 30),
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'].slice(0, Math.floor(Math.random() * 4) + 1),
      status: 'active'
    }));

    const createdEmployees = await Employee.insertMany(employees);
    console.log('Created employees');

    // Create Projects
    const projects = [
      {
        title: 'HR Management System',
        description: 'Complete HR management platform with employee tracking, payroll, and analytics',
        status: 'active',
        priority: 'high',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        budget: 150000,
        projectManager: createdUsers[0]._id,
        teamMembers: [createdUsers[2]._id, createdUsers[3]._id, createdUsers[4]._id],
        progress: 65,
        tags: ['HR', 'Management', 'Dashboard'],
        createdBy: createdUsers[0]._id
      },
      {
        title: 'Mobile App Development',
        description: 'Native mobile application for employee self-service',
        status: 'planning',
        priority: 'medium',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-09-30'),
        budget: 100000,
        projectManager: createdUsers[1]._id,
        teamMembers: [createdUsers[2]._id, createdUsers[4]._id],
        progress: 25,
        tags: ['Mobile', 'React Native', 'Self-Service'],
        createdBy: createdUsers[1]._id
      },
      {
        title: 'Analytics Dashboard',
        description: 'Advanced analytics and reporting dashboard for management',
        status: 'completed',
        priority: 'high',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2023-12-31'),
        budget: 75000,
        projectManager: createdUsers[0]._id,
        teamMembers: [createdUsers[3]._id, createdUsers[5]._id],
        progress: 100,
        tags: ['Analytics', 'Dashboard', 'Reporting'],
        createdBy: createdUsers[0]._id
      }
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log('Created projects');

    // Create Tasks
    const tasks = [
      {
        title: 'Design user authentication flow',
        description: 'Create wireframes and mockups for login/signup process',
        status: 'completed',
        priority: 'high',
        assignedTo: createdUsers[4]._id,
        project: createdProjects[0]._id,
        dueDate: new Date('2024-02-15'),
        createdBy: createdUsers[0]._id,
        assignedBy: createdUsers[0]._id
      },
      {
        title: 'Implement REST API endpoints',
        description: 'Develop backend API for user management and authentication',
        status: 'in-progress',
        priority: 'high',
        assignedTo: createdUsers[2]._id,
        project: createdProjects[0]._id,
        dueDate: new Date('2024-03-01'),
        createdBy: createdUsers[0]._id,
        assignedBy: createdUsers[0]._id
      },
      {
        title: 'Setup database schema',
        description: 'Design and implement MongoDB collections and relationships',
        status: 'completed',
        priority: 'urgent',
        assignedTo: createdUsers[2]._id,
        project: createdProjects[0]._id,
        dueDate: new Date('2024-01-30'),
        createdBy: createdUsers[0]._id,
        assignedBy: createdUsers[0]._id
      },
      {
        title: 'Create mobile wireframes',
        description: 'Design mobile app user interface and user experience',
        status: 'todo',
        priority: 'medium',
        assignedTo: createdUsers[4]._id,
        project: createdProjects[1]._id,
        dueDate: new Date('2024-04-15'),
        createdBy: createdUsers[1]._id,
        assignedBy: createdUsers[1]._id
      }
    ];

    await Task.insertMany(tasks);
    console.log('Created tasks');

    // Create Leave Applications
    const leaves = [
      {
        employee: createdUsers[2]._id,
        type: 'vacation',
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-03-20'),
        reason: 'Family vacation',
        status: 'approved',
        appliedDate: new Date('2024-02-15'),
        approvedBy: createdUsers[1]._id
      },
      {
        employee: createdUsers[3]._id,
        type: 'sick',
        startDate: new Date('2024-02-10'),
        endDate: new Date('2024-02-12'),
        reason: 'Medical appointment',
        status: 'approved',
        appliedDate: new Date('2024-02-08'),
        approvedBy: createdUsers[1]._id
      },
      {
        employee: createdUsers[4]._id,
        type: 'personal',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-04-02'),
        reason: 'Personal matters',
        status: 'pending',
        appliedDate: new Date('2024-03-01')
      }
    ];

    await Leave.insertMany(leaves);
    console.log('Created leave applications');

    // Create Complaints
    const complaints = [
      {
        employee: createdUsers[2]._id,
        title: 'Workplace Environment Issue',
        description: 'The office temperature is consistently too cold, affecting productivity',
        category: 'workplace',
        priority: 'medium',
        status: 'in-progress',
        dateSubmitted: new Date('2024-02-01'),
        assignedTo: createdUsers[1]._id
      },
      {
        employee: createdUsers[3]._id,
        title: 'Equipment Request',
        description: 'Need a new monitor for better productivity',
        category: 'equipment',
        priority: 'low',
        status: 'resolved',
        dateSubmitted: new Date('2024-01-15'),
        assignedTo: createdUsers[0]._id,
        resolvedDate: new Date('2024-01-25')
      }
    ];

    await Complaint.insertMany(complaints);
    console.log('Created complaints');

    // Create Help Desk Tickets
    const tickets = [
      {
        title: 'Password Reset Request',
        description: 'Unable to access email account, need password reset',
        category: 'technical',
        priority: 'high',
        status: 'resolved',
        submittedBy: createdUsers[2]._id,
        assignedTo: createdUsers[0]._id,
        createdAt: new Date('2024-02-05'),
        resolvedAt: new Date('2024-02-05')
      },
      {
        title: 'Software Installation',
        description: 'Need Adobe Creative Suite installed on workstation',
        category: 'software',
        priority: 'medium',
        status: 'open',
        submittedBy: createdUsers[4]._id,
        assignedTo: createdUsers[0]._id,
        createdAt: new Date('2024-02-10')
      }
    ];

    await Ticket.insertMany(tickets);
    console.log('Created help desk tickets');

    // Create Wellness Programs
    const wellnessPrograms = [
      {
        title: 'Daily Meditation',
        description: '10-minute guided meditation sessions',
        category: 'mental-health',
        duration: 30,
        goals: ['Reduce stress', 'Improve focus', 'Better work-life balance'],
        participants: [createdUsers[2]._id, createdUsers[3]._id],
        isActive: true,
        createdBy: createdUsers[1]._id
      },
      {
        title: 'Fitness Challenge',
        description: '30-day fitness challenge with daily exercises',
        category: 'physical-health',
        duration: 30,
        goals: ['Improve fitness', 'Build healthy habits', 'Team bonding'],
        participants: [createdUsers[2]._id, createdUsers[4]._id, createdUsers[5]._id],
        isActive: true,
        createdBy: createdUsers[1]._id
      },
      {
        title: 'Nutrition Workshop',
        description: 'Learn about healthy eating habits and meal planning',
        category: 'nutrition',
        duration: 7,
        goals: ['Healthy eating', 'Meal planning', 'Nutrition awareness'],
        participants: [createdUsers[3]._id, createdUsers[6]._id],
        isActive: false,
        createdBy: createdUsers[1]._id
      }
    ];

    await WellnessProgram.insertMany(wellnessPrograms);
    console.log('Created wellness programs');

    console.log('✅ Dummy data seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@hrsarthi.com / admin123');
    console.log('HR Manager: hr@hrsarthi.com / hr123');
    console.log('Employee: sarah.j@hrsarthi.com / password123');
    console.log('Employee: mike.c@hrsarthi.com / password123');
    console.log('Employee: emily.d@hrsarthi.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();