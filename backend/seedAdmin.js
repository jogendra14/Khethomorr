// backend/seedAdmin.js
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User.js';
import connectDB from './config/db.js';

const seedAdmin = async () => {
  try {
    await connectDB();
    
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    
    if (adminExists) {
      console.log('Admin already exists');
      process.exit(0);
    }
    
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: 'admin123',  // Ye hash ho jayega pre-save hook se
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    });
    
    console.log('Admin created successfully:', admin.email);
    console.log('Password: admin123');
    process.exit(0);
    
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

seedAdmin();