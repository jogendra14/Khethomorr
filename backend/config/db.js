// backend/config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    
    // IMPORTANT: Models ko yahan import karo taaki register ho jayein
    // Isse pehle ki koi query chale, sab models ready rahenge
    try {
      await import('../models/Category.js');
      await import('../models/SubCategory.js');
      await import('../models/Product.js');
      await import('../models/User.js');
      console.log('✅ All models registered successfully');
    } catch (modelError) {
      console.warn('⚠️ Some models could not be registered:', modelError.message);
    }
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;