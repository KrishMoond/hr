const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@hrsarthi.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      
      // Create admin user
      const newAdmin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@hrsarthi.com',
        password: 'admin123',
        role: 'admin',
        position: 'System Administrator',
        department: 'IT',
        location: 'New York, NY'
      });
      
      await newAdmin.save();
      console.log('✅ Admin user created successfully');
      console.log('Login: admin@hrsarthi.com / admin123');
    } else {
      console.log('✅ Admin user found:', admin.email, admin.role);
      
      // Test password
      const isValidPassword = await admin.comparePassword('admin123');
      console.log('Password test:', isValidPassword ? '✅ Valid' : '❌ Invalid');
      
      if (!isValidPassword) {
        // Reset password
        admin.password = 'admin123';
        await admin.save();
        console.log('✅ Password reset successfully');
      }
    }

    // Check HR user too
    const hr = await User.findOne({ email: 'hr@hrsarthi.com' });
    if (!hr) {
      const newHR = new User({
        firstName: 'HR',
        lastName: 'Manager',
        email: 'hr@hrsarthi.com',
        password: 'hr123',
        role: 'hr',
        position: 'HR Manager',
        department: 'Human Resources',
        location: 'New York, NY'
      });
      await newHR.save();
      console.log('✅ HR user created');
    }

    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@hrsarthi.com / admin123');
    console.log('HR: hr@hrsarthi.com / hr123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAdmin();