const mongoose = require('mongoose');
const Employee = require('../models/Employee');
require('dotenv').config();

async function initializeLeaveBalances() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all employees to have proper leave balances
    const result = await Employee.updateMany(
      { leaveBalances: { $exists: false } },
      {
        $set: {
          leaveBalances: {
            annual: 14,
            sick: 10,
            personal: 5,
            bonus: 0
          }
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} employees with leave balances`);

    // Also update employees with incomplete leave balances
    const employees = await Employee.find({});
    for (const employee of employees) {
      if (!employee.leaveBalances) {
        employee.leaveBalances = {
          annual: 14,
          sick: 10,
          personal: 5,
          bonus: 0
        };
      } else {
        // Ensure all fields exist
        employee.leaveBalances.annual = employee.leaveBalances.annual ?? 14;
        employee.leaveBalances.sick = employee.leaveBalances.sick ?? 10;
        employee.leaveBalances.personal = employee.leaveBalances.personal ?? 5;
        employee.leaveBalances.bonus = employee.leaveBalances.bonus ?? 0;
      }
      await employee.save();
    }

    console.log('Leave balances initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing leave balances:', error);
    process.exit(1);
  }
}

initializeLeaveBalances();