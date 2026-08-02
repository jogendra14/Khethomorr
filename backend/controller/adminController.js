import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    // ✅ IMPORTANT: Explicitly select password because it has select: false
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // Check if user is admin
    if (user.role !== "admin") {
      return res.status(403).json({ 
        message: "Access Denied. Admin only." 
      });
    }

    // Verify password - using bcrypt directly
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Return response (remove password from response)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified
    };

    res.status(200).json({
      success: true,
      token,
      ...userResponse,
      message: "Login successful"
    });

  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ 
      message: error.message || "Server error" 
    });
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

export { adminLogin, getUsers };