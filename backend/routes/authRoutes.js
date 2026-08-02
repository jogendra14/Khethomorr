import express from "express";
import {  
    registerUser, 
    loginUser, 
    checkEmail,
    getCurrentUser,
    logoutUser,
} from "../controller/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes (no authentication needed)
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/check-email", checkEmail);  // ✅ POST, not GET, and no auth needed

// Protected routes (authentication required)
router.get("/me", protect, getCurrentUser);  // ✅ GET, protect only, not admin
router.post("/logout", protect, logoutUser); // ✅ POST, protect only

export default router;