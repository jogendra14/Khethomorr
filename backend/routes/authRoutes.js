import express from "express";
import {
  registerUser,
  loginUser,
  checkEmail,
  getCurrentUser,
  logoutUser,
  updateCurrentUser,
  changeUserPassword,
} from "../controller/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/check-email", checkEmail);

router.get("/me", protect, getCurrentUser);
router.post("/logout", protect, logoutUser);
router.put("/profile", protect, updateCurrentUser);
router.put("/change-password", protect, changeUserPassword);

export default router;
