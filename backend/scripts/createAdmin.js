// scripts/createAdmin.js
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createAdmin = async () => {
  try {
    await connectDB();

    console.log('\n🔐 Create Admin/SuperAdmin User\n');
    console.log('============================================\n');

    const name = await question('Enter full name: ');
    const email = await question('Enter email: ');
    const password = await question('Enter password (min 6 chars): ');
    const role = await question('Enter role (admin/superadmin): ');
    const confirm = await question('\nCreate this admin? (yes/no): ');

    if (confirm.toLowerCase() !== 'yes') {
      console.log('\n❌ Admin creation cancelled');
      rl.close();
      process.exit(0);
    }

    // Validate role
    if (!['admin', 'superadmin'].includes(role.toLowerCase())) {
      console.log('\n❌ Invalid role. Use "admin" or "superadmin"');
      rl.close();
      process.exit(1);
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('\n❌ User already exists with this email');
      rl.close();
      process.exit(1);
    }

    // ✅ FIX: Directly create user without pre-save middleware issues
    // Create user with raw password - pre-save middleware will handle hashing
    const user = new User({
      name,
      email,
      password, // Raw password - pre-save middleware will hash it
      role: role.toLowerCase(),
      isActive: true,
      isEmailVerified: true
    });

    // ✅ Save user - this will trigger pre-save middleware
    await user.save();

    console.log('\n✅ Admin created successfully!');
    console.log('============================================');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`🔑 Role: ${user.role}`);
    console.log(`🆔 ID: ${user._id}`);
    console.log('============================================\n');

    rl.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    rl.close();
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  rl.close();
  process.exit(1);
});

createAdmin();