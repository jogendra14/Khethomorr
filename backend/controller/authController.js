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
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user"
    });
    
    if (user) {
      // Generate a mock OTP
      const otp = Math.floor(100000 + Math.random() * 900000);
      
      // Send Welcome / OTP Email
      const message = `
        <h2>Welcome to ShopNest, ${name}!</h2>
        <p>Thank you for registering on our platform.</p>
        <p>Your one-time verification/discount OTP is: <strong>${otp}</strong></p>
      `;

      await sendEmail({
        email: user.email,
        subject: 'Welcome to Khethomorr - Your OTP',
        message
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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