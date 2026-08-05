// backend/routes/adminRoutes.js
import express from "express";
import { 
  adminLogin, 
  getUsers, 
  createUser,
  updateUserStatus, 
  deleteUser,
  updateUser,
  getSettings,
  updateSettings,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} from "../controller/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/users", protect, admin, getUsers);
router.post("/users", protect, admin, createUser);
router.patch("/users/:id/status", protect, admin, updateUserStatus);
router.delete("/users/:id", protect, admin, deleteUser);
router.put("/users/:id", protect, admin, updateUser);
router.route("/settings").get(protect, admin, getSettings).put(protect, admin, updateSettings);
router.route("/profile").get(protect, admin, getAdminProfile).put(protect, admin, upload.single("avatar"), updateAdminProfile);
router.put("/change-password", protect, admin, changeAdminPassword);

export default router;
