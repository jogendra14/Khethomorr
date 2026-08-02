// backend/routes/adminRoutes.js
import express from "express";
import { 
  adminLogin, 
  getUsers, 
  createUser,
  updateUserStatus, 
  deleteUser,
  updateUser 
} from "../controller/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/users", protect, admin, getUsers);
router.post("/users", protect, admin, createUser);
router.patch("/users/:id/status", protect, admin, updateUserStatus);
router.delete("/users/:id", protect, admin, deleteUser);
router.put("/users/:id", protect, admin, updateUser);

export default router;