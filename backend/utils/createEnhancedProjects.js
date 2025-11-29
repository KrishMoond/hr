const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
require('dotenv').config();

const createEnhancedProjects = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get users
    const admin = await User.findOne({ role: 'admin' });
    const hrUser = await User.findOne({ role: 'hr' });
    const users = await User.find();
    const employees = users.filter(u => u.role === 'employee');

    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    // Clear existing projects and tasks
    await Project.deleteMany({});
    await Task.deleteMany({});

    // Enhanced sample projects
    const enhancedProjects = [
      {
        title: 'HR Digital Transformation',
        description: 'Complete overhaul of HR processes with modern digital solutions, automation, and AI integration to improve efficiency and employee experience.',
        startDate: new Date(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        priority: 'urgent',
        status: 'active',
        createdBy: admin._id,
        projectManager: admin._id,
        teamMembers: employees.slice(0, 4).map(e => e._id),
        budget: 150000,
        spentAmount: 45000,
        tags: ['Digital', 'Automation', 'AI', 'HR Tech'],
        category: 'Technology',
        requiresDailyUpdates: true,
        isPrivate: false
      },
      {
        title: 'Employee Wellness & Engagement Program',
        description: 'Comprehensive wellness initiative including mental health support, fitness programs, team building activities, and work-life balance improvements.',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        priority: 'high',
        status: 'planning',
        createdBy: admin._id,
        projectManager: hrUser ? hrUser._id : admin._id,
        teamMembers: employees.slice(1, 5).map(e => e._id),
        budget: 75000,
        spentAmount: 0,
        tags: ['Wellness', 'Engagement', 'Mental Health', 'Team Building'],
        category: 'HR Initiative',
        requiresDailyUpdates: true,
        isPrivate: false
      },
      {
        title: 'Performance Management System Upgrade',
        description: 'Modernize performance review process with 360-degree feedback, goal tracking, continuous feedback, and analytics dashboard.',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        priority: 'high',
        status: 'planning',
        createdBy: admin._id,
        projectManager: admin._id,
        teamMembers: employees.slice(0, 3).map(e => e._id),
        budget: 80000,
        spentAmount: 0,
        tags: ['Performance', 'Reviews', '360 Feedback', 'Analytics'],
        category: 'HR System',
        requiresDailyUpdates: true,
        isPrivate: false
      },
      {
        title: 'Remote Work Infrastructure',
        description: 'Establish robust remote work capabilities including collaboration tools, security protocols, and virtual team management systems.',
        startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        status: 'planning',
        createdBy: admin._id,
        projectManager: admin._id,
        teamMembers: employees.slice(2, 6).map(e => e._id),
        budget: 120000,
        spentAmount: 0,
        tags: ['Remote Work', 'Collaboration', 'Security', 'Infrastructure'],
        category: 'Technology',
        requiresDailyUpdates: false,
        isPrivate: false
      },
      {
        title: 'Learning & Development Platform',
        description: 'Create comprehensive L&D platform with online courses, skill assessments, career path planning, and certification tracking.',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        status: 'planning',
        createdBy: admin._id,
        projectManager: hrUser ? hrUser._id : admin._id,
        teamMembers: employees.slice(1, 4).map(e => e._id),
        budget: 100000,
        spentAmount: 0,
        tags: ['Learning', 'Development', 'Training', 'Skills', 'Certification'],
        category: 'Education',
        requiresDailyUpdates: true,
        isPrivate: false
      },
      {
        title: 'Diversity & Inclusion Initiative',
        description: 'Strategic program to enhance workplace diversity, create inclusive culture, and implement bias-free recruitment and promotion processes.',
        startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        priority: 'high',
        status: 'planning',
        createdBy: admin._id,
        projectManager: hrUser ? hrUser._id : admin._id,
        teamMembers: employees.slice(0, 5).map(e => e._id),
        budget: 60000,
        spentAmount: 0,
        tags: ['Diversity', 'Inclusion', 'Culture', 'Recruitment', 'Bias-Free'],
        category: 'Culture',
        requiresDailyUpdates: false,
        isPrivate: false
      }
    ];

    const createdProjects = [];
    for (const projectData of enhancedProjects) {
      const project = new Project(projectData);
      await project.save();
      
      // Set some projects to have progress
      if (project.status === 'active') {
        project.progress = Math.floor(Math.random() * 60) + 20; // 20-80% progress
        project.completedTasks = Math.floor(Math.random() * 8) + 2;
        project.totalTasks = project.completedTasks + Math.floor(Math.random() * 10) + 5;
        await project.save();
      }
      
      createdProjects.push(project);
    }

    // Create sample tasks for active projects
    const activeProject = createdProjects.find(p => p.status === 'active');
    if (activeProject) {
      const sampleTasks = [
        {
          title: 'UI/UX Design for New Dashboard',
          description: 'Create modern, intuitive dashboard design with improved user experience and accessibility features.',
          project: activeProject._id,
          assignedTo: employees[0]._id,
          assignedBy: admin._id,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          priority: 'high',
          estimatedHours: 32,
          status: 'in-progress',
          progress: 65
        },
        {
          title: 'Backend API Development',
          description: 'Develop RESTful APIs for new HR modules with proper authentication and data validation.',
          project: activeProject._id,
          assignedTo: employees[1]._id,
          assignedBy: admin._id,
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          priority: 'high',
          estimatedHours: 48,
          status: 'in-progress',
          progress: 40
        },
        {
          title: 'Database Schema Optimization',
          description: 'Optimize database structure for better performance and scalability with proper indexing.',
          project: activeProject._id,
          assignedTo: employees[2]._id,
          assignedBy: admin._id,
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          priority: 'medium',
          estimatedHours: 24,
          status: 'completed',
          progress: 100
        },
        {
          title: 'Security Audit & Implementation',
          description: 'Conduct comprehensive security audit and implement necessary security measures and protocols.',
          project: activeProject._id,
          assignedTo: employees[3]._id,
          assignedBy: admin._id,
          dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
          priority: 'urgent',
          estimatedHours: 40,
          status: 'todo',
          progress: 0
        },
        {
          title: 'User Testing & Feedback Collection',
          description: 'Organize user testing sessions and collect feedback for iterative improvements.',
          project: activeProject._id,
          assignedTo: employees[0]._id,
          assignedBy: admin._id,
          dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
          priority: 'medium',
          estimatedHours: 16,
          status: 'todo',
          progress: 0
        }
      ];

      for (const taskData of sampleTasks) {
        const task = new Task(taskData);
        await task.save();
      }

      // Update project progress
      await activeProject.updateProgress();
    }

    console.log('✅ Enhanced projects created successfully!');
    console.log(`📁 Created ${createdProjects.length} projects with modern features`);
    console.log(`📋 Created sample tasks for active project`);
    console.log(`💰 Total budget across all projects: $${createdProjects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}`);
    console.log(`👤 Project managers: Admin and HR users`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating enhanced projects:', error);
    process.exit(1);
  }
};

createEnhancedProjects();