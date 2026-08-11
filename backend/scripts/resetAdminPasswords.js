import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const resetAdminPasswords = async () => {
    console.log('MONGO_URI:', process.env.MONGO_URI); // Check if it's loading
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://Khethomorr:bhomsa14@cluster0.7wpwlcw.mongodb.net/?appName=Cluster0');
    
    
    // Find all admin/superadmin users
    const admins = await User.find({ 
      role: { $in: ['admin', 'superadmin'] } 
    }).select('+password');
    
    console.log(`Found ${admins.length} admin users`);
    
for (const admin of admins) {
  // Direct update without loading the document
  await User.findByIdAndUpdate(admin._id, {
    password: 'TempPass123',
    passwordChangedAt: new Date()
  });
  console.log(`✅ Reset password for: ${admin.email}`);
}
    console.log('All admin passwords reset. Please change them immediately!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetAdminPasswords();