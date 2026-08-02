// backend/controller/authController.js

import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/sendEmail.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body; 
    console.log("📥 Registration request received:", { name, email });
   
    
    // ✅ 1. Check if user exists (fast query)
    const existingUser = await User.findOne({ email }).select('email').lean();
    if (existingUser) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

     // ✅ 2. Hash password (async with proper salt rounds)
    console.log("🔐 Hashing password...");
    const saltRounds = 10; // ✅ Less rounds = faster
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("✅ Password hashed");

    // ✅ 3. Create user (only necessary fields)
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    
    console.log("💾 Saving user to database...");
    await user.save();
    console.log("✅ User saved successfully");

   // ✅ 4. Generate JWT (fast)
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "7d" }
    );

    // ✅ 5. Send response immediately
    console.log("📤 Sending response...");
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified
      }
    });

  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW: Check if email exists
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: "Email is required" 
      });
    }

    const user = await User.findOne({ email });
    
    res.json({ 
      exists: !!user,
      message: user ? "Email already registered" : "Email is available"
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};

// ✅ NEW: Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};

// ✅ NEW: Logout user
const logoutUser = async (req, res) => {
  try {
    // Since we're using JWT, logout is handled on client side
    // by removing the token from localStorage
    // But we can optionally implement a token blacklist here
    
    res.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};

export { 
  registerUser, 
  loginUser, 
  getUsers, 
  checkEmail,      // ✅ Export new function
  getCurrentUser,  // ✅ Export new function
  logoutUser       // ✅ Export new function
};