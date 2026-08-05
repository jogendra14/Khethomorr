// backend/models/User.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"]
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email"
    ]
  },

  phone: {  
    type: String,
    trim: true,
    default: ""
  },

  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false // ✅ Important: Don't return password by default
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  status: { 
    type: String, 
    enum: ['Active', 'Blocked'], 
    default: 'Active' 
  },
  verified: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: ""
  }
}, 
{
  timestamps: true
});

export default mongoose.model("User", userSchema);
