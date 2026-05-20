import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authMiddleware.js";
import {
  getUserById,
  getCurrentUser,
  getIncubationCoordinators,
} from "../controllers/usersController.js";
// ✅ GET: Get user by ID (admin only, can adjust role check as needed)
router.get("/me", authenticate, getCurrentUser);
router.get("/:id", authenticate, getUserById);
router.get("/incubation-coordinators", authenticate, getIncubationCoordinators);
export default router;
