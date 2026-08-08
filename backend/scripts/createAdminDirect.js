// scripts/createAdminDirect.js
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createAdminDirect = async () => {
  try {
    await connectDB();

    console.log('\n🔐 Create Admin/SuperAdmin User (Direct Insert)\n');
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

    // ✅ Hash password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Direct insert into MongoDB collection
    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Check existing user
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      console.log('\n❌ User already exists with this email');
      rl.close();
      process.exit(1);
    }

    // Insert user directly
    const result = await collection.insertOne({
      name,
      email,
      password: hashedPassword,
      role: role.toLowerCase(),
      isActive: true,
      isEmailVerified: true,
      loginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('\n✅ Admin created successfully!');
    console.log('============================================');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${name}`);
    console.log(`🔑 Role: ${role}`);
    console.log(`🆔 ID: ${result.insertedId}`);
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

createAdminDirect();