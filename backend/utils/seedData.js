const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Chat = require('../models/Chat');
const WellnessProgram = require('../models/WellnessProgram');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Chat.deleteMany({});
    await WellnessProgram.deleteMany({});
    
    // Clear new collections
    const Leave = require('../models/Leave');
    const Complaint = require('../models/Complaint');
    await Leave.deleteMany({});
    await Complaint.deleteMany({});

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@hrsarthi.com',
      password: 'admin123',
      role: 'admin',
      position: 'System Administrator',
      department: 'IT',
      location: 'New York, NY'
    });
    await adminUser.save();

    // Create HR user
    const hrUser = new User({
      firstName: 'HR',
      lastName: 'Manager',
      email: 'hr@hrsarthi.com',
      password: 'hr123',
      role: 'hr',
      position: 'HR Manager',
      department: 'Human Resources',
      location: 'New York, NY'
    });
    await hrUser.save();

    // Create sample employees
    const employees = [
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@hrsarthi.com',
        password: 'password123',
        position: 'Senior Developer',
        department: 'Engineering',
        location: 'New York, NY',
        phone: '+1 (555) 123-4567',
        salary: 95000,
        performance: 92,
        skills: ['React', 'TypeScript', 'Node.js']
      },
      {
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike.c@hrsarthi.com',
        password: 'password123',
        position: 'Product Manager',
        department: 'Product',
        location: 'San Francisco, CA',
        phone: '+1 (555) 234-5678',
        salary: 110000,
        performance: 87,
        skills: ['Strategy', 'Analytics', 'Leadership']
      },
      {
        firstName: 'Lisa',
        lastName: 'Rodriguez',
        email: 'lisa.r@hrsarthi.com',
        password: 'password123',
        position: 'UX Designer',
        department: 'Design',
        location: 'Austin, TX',
        phone: '+1 (555) 345-6789',
        salary: 78000,
        performance: 95,
        skills: ['Figma', 'User Research', 'Prototyping']
      },
      {
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.k@hrsarthi.com',
        password: 'password123',
        position: 'Data Analyst',
        department: 'Analytics',
        location: 'Seattle, WA',
        phone: '+1 (555) 456-7890',
        salary: 72000,
        performance: 89,
        skills: ['Python', 'SQL', 'Tableau']
      },
      {
        firstName: 'Emma',
        lastName: 'Wilson',
        email: 'emma.w@hrsarthi.com',
        password: 'password123',
        position: 'Marketing Manager',
        department: 'Marketing',
        location: 'Chicago, IL',
        phone: '+1 (555) 567-8901',
        salary: 85000,
        performance: 91,
        skills: ['Digital Marketing', 'SEO', 'Content Strategy']
      }
    ];

    const createdUsers = [];
    const createdEmployees = [];

    for (const empData of employees) {
      const user = new User({
        firstName: empData.firstName,
        lastName: empData.lastName,
        email: empData.email,
        password: empData.password,
        position: empData.position,
        department: empData.department,
        location: empData.location,
        phone: empData.phone,
        avatar: `${empData.firstName[0]}${empData.lastName[0]}`
      });
      await user.save();
      createdUsers.push(user);

      const employee = new Employee({
        user: user._id,
        employeeId: `EMP${1000 + createdUsers.length}`,
        joinDate: new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        salary: empData.salary,
        performance: empData.performance,
        skills: empData.skills,
        status: 'active'
      });
      await employee.save();
      createdEmployees.push(employee);
    }

    // Create sample wellness programs
    const wellnessPrograms = [
      {
        name: 'Daily Steps Challenge',
        description: 'Walk 10,000 steps daily for better health',
        type: 'challenge',
        category: 'fitness',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'active',
        creator: hrUser._id,
        goals: [{
          title: 'Daily Steps',
          target: 10000,
          unit: 'steps'
        }]
      },
      {
        name: 'Meditation Program',
        description: 'Practice mindfulness for mental wellness',
        type: 'program',
        category: 'mental',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        status: 'active',
        creator: hrUser._id,
        goals: [{
          title: 'Meditation Minutes',
          target: 30,
          unit: 'minutes'
        }]
      }
    ];

    for (const programData of wellnessPrograms) {
      const program = new WellnessProgram(programData);
      await program.save();
    }

    // Create sample chat
    const groupChat = new Chat({
      name: 'General Discussion',
      type: 'group',
      participants: [adminUser._id, hrUser._id, ...createdUsers.map(u => u._id)],
      messages: [
        {
          sender: hrUser._id,
          content: 'Welcome to HR SARTHI! Feel free to ask any questions.',
          type: 'text'
        }
      ],
      lastMessage: {
        content: 'Welcome to HR SARTHI! Feel free to ask any questions.',
        sender: hrUser._id,
        timestamp: new Date()
      }
    });
    await groupChat.save();

    console.log('Sample data created successfully!');
    console.log('Admin login: admin@hrsarthi.com / admin123');
    console.log('HR login: hr@hrsarthi.com / hr123');
    console.log('Employee login: sarah.j@hrsarthi.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();