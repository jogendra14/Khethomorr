// backend/scripts/createAdmin.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    
    if (adminExists) {
      console.log('⚠️ Admin already exists');
      console.log('Email: admin@gmail.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const admin = new User({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    
    console.log('✅ Admin created successfully!');
    console.log('📧 Email: admin@gmail.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();