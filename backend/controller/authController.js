import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  role: user.role,
  verified: user.verified,
});

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Name, a valid email, and a password of at least 6 characters are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail }).select("_id").lean();
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists with this email" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: generateToken(user._id),
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "User already exists with this email" });
    }
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    if (user.status === "Blocked") {
      return res.status(403).json({ success: false, message: "This account has been blocked. Please contact support." });
    }

    res.json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id),
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};

const checkEmail = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.exists({ email });
    res.json({ exists: Boolean(user), message: user ? "Email already registered" : "Email is available" });
  } catch (error) {
    res.status(500).json({ message: "Unable to check email" });
  }
};

const getCurrentUser = async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
};

const logoutUser = async (_req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};

const updateCurrentUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailOwner = await User.findOne({ email: normalizedEmail }).select("_id");
    if (emailOwner && emailOwner._id.toString() !== req.user._id.toString()) {
      return res.status(409).json({ message: "That email address is already in use" });
    }

    req.user.name = name.trim();
    req.user.email = normalizedEmail;
    req.user.phone = phone?.trim() || "";
    await req.user.save();

    res.json({ success: true, user: publicUser(req.user) });
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to update profile" });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Current password and a new password of at least 6 characters are required" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to change password" });
  }
};

export {
  registerUser,
  loginUser,
  checkEmail,
  getCurrentUser,
  logoutUser,
  updateCurrentUser,
  changeUserPassword,
};
