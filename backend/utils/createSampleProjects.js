const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
require('dotenv').config();

const createSampleProjects = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get users
    const admin = await User.findOne({ role: 'admin' });
    const users = await User.find();
    const employees = users.filter(u => u.role === 'employee');

    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    // Clear existing projects and tasks
    await Project.deleteMany({});
    await Task.deleteMany({});

    // Create sample projects
    const sampleProjects = [
      {
        title: 'HR System Upgrade',
        description: 'Modernize the HR management system with new features and improved user experience',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        priority: 'high',
        status: 'active',
        createdBy: admin._id,
        projectManager: admin._id,
        teamMembers: employees.slice(0, 3).map(e => e._id),
        requiresDailyUpdates: true
      },
      {
        title: 'Employee Wellness Program',
        description: 'Implement comprehensive wellness program to improve employee health and satisfaction',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Start in 7 days
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
        priority: 'medium',
        status: 'planning',
        createdBy: admin._id,
        projectManager: admin._id,
        teamMembers: employees.slice(1, 4).map(e => e._id),
        requiresDailyUpdates: true
      },
      {
        title: 'Digital Transformation Initiative',
        description: 'Digitize manual processes and implement automation across departments',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Start in 14 days
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
        priority: 'urgent',
        status: 'planning',
        createdBy: admin._id,
        projectManager: admin._id,
        teamMembers: employees.slice(0, 5).map(e => e._id),
        requiresDailyUpdates: true
      }
    ];

    const createdProjects = [];
    for (const projectData of sampleProjects) {
      const project = new Project(projectData);
      await project.save();
      await project.updateProgress(); // Initialize progress
      createdProjects.push(project);
    }

    // Create sample tasks for the first project
    const firstProject = createdProjects[0];
    const sampleTasks = [
      {
        title: 'Design new dashboard interface',
        description: 'Create mockups and wireframes for the new HR dashboard',
        project: firstProject._id,
        assignedTo: employees[0]._id,
        assignedBy: admin._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        priority: 'high',
        estimatedHours: 16,
        status: 'in-progress'
      },
      {
        title: 'Implement user authentication',
        description: 'Set up secure login system with role-based access control',
        project: firstProject._id,
        assignedTo: employees[1]._id,
        assignedBy: admin._id,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        priority: 'high',
        estimatedHours: 24,
        status: 'todo'
      },
      {
        title: 'Database optimization',
        description: 'Optimize database queries and improve performance',
        project: firstProject._id,
        assignedTo: employees[2]._id,
        assignedBy: admin._id,
        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        estimatedHours: 20,
        status: 'todo'
      }
    ];

    for (const taskData of sampleTasks) {
      const task = new Task(taskData);
      await task.save();
    }

    // Update project progress
    await firstProject.updateProgress();

    console.log('✅ Sample projects created successfully!');
    console.log(`📁 Created ${createdProjects.length} projects`);
    console.log(`📋 Created ${sampleTasks.length} tasks`);
    console.log(`👤 Admin (${admin.firstName} ${admin.lastName}) is the project manager`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample projects:', error);
    process.exit(1);
  }
};

createSampleProjects();