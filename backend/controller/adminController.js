import User from "../models/User.js";
import SiteSettings from "../models/SiteSettings.js";
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

    if (user.status === "Blocked") {
      return res.status(403).json({ message: "This account has been blocked" });
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

const createUser = async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || "",
      role: role || "user",
      password: hashedPassword,
      status: "Active",
      verified: false
    });

    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      verified: user.verified,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userResponse
    });

  } catch (error) {
    console.error("Error creating user:", error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors.join(", ")
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create user"
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

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = status;
    await user.save();

    res.json({
      message: "User status updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, status } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (status) user.status = status;


    await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const publicSettings = (settings) => ({
  websiteName: settings?.websiteName || "Khethomorr",
  websiteUrl: settings?.websiteUrl || "",
  phone: settings?.phone || "",
  address: settings?.address || "",
  facebook: settings?.facebook || "",
  instagram: settings?.instagram || "",
  twitter: settings?.twitter || "",
  announcement: settings?.announcement || "",
  businessHours: settings?.businessHours || "Mon - Sat: 9:00 AM - 8:00 PM",
});

const getPublicSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.findOne().lean();
    res.json(publicSettings(settings));
  } catch (error) {
    res.status(500).json({ message: "Unable to load website settings" });
  }
};

const getSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.findOne().lean();
    res.json({
      ...publicSettings(settings),
      adminName: req.user.name,
      email: req.user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to load settings" });
  }
};

const updateSettings = async (req, res) => {
  try {
    const {
      adminName,
      email,
      websiteName,
      websiteUrl,
      phone,
      address,
      facebook,
      instagram,
      twitter,
      announcement,
      businessHours,
    } = req.body;

    if (!adminName?.trim() || !email?.trim() || !websiteName?.trim()) {
      return res.status(400).json({ message: "Admin name, email, and website name are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailOwner = await User.findOne({ email: normalizedEmail }).select("_id");
    if (emailOwner && emailOwner._id.toString() !== req.user._id.toString()) {
      return res.status(409).json({ message: "That email address is already in use" });
    }

    req.user.name = adminName.trim();
    req.user.email = normalizedEmail;
    await req.user.save();

    const settings = await SiteSettings.findOneAndUpdate(
      {},
      {
        websiteName: websiteName.trim(),
        websiteUrl: websiteUrl?.trim() || "",
        phone: phone?.trim() || "",
        address: address?.trim() || "",
        facebook: facebook?.trim() || "",
        instagram: instagram?.trim() || "",
        twitter: twitter?.trim() || "",
        announcement: announcement?.trim() || "",
        businessHours: businessHours?.trim() || "",
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    res.json({ ...publicSettings(settings), adminName: req.user.name, email: req.user.email });
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to update settings" });
  }
};

const getAdminProfile = async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone || "",
    avatar: req.user.avatar || "",
    role: req.user.role,
  });
};

const updateAdminProfile = async (req, res) => {
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
    if (req.file) {
      req.user.avatar = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }
    await req.user.save();

    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      avatar: req.user.avatar || "",
      role: req.user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to update profile" });
  }
};

const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const adminUser = await User.findById(req.user._id).select("+password");
    const isMatch = await bcrypt.compare(currentPassword, adminUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    adminUser.password = await bcrypt.hash(newPassword, 10);
    await adminUser.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Unable to change password" });
  }
};

export {
  adminLogin,
  getUsers,
  createUser,
  updateUserStatus,
  deleteUser,
  updateUser,
  getPublicSiteSettings,
  getSettings,
  updateSettings,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
};
