import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const resetAdminPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find all admin/superadmin users
    const admins = await User.find({ 
      role: { $in: ['admin', 'superadmin'] } 
    }).select('+password');
    
    console.log(`Found ${admins.length} admin users`);
    
    for (const admin of admins) {
      // Set temporary password
      admin.password = 'TempPass123!'; // Change this!
      await admin.save();
      console.log(`Reset password for: ${admin.email}`);
    }
    
    console.log('All admin passwords reset. Please change them immediately!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetAdminPasswords();