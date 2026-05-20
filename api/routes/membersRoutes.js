import express from "express";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import {
  AddMember,
  getAllMembers,
  // archiveMembers,
  getAllComponentCoordinators,
  getAllIncubationCoordinators,
  // unarchiveMembers,
  getUsersByRole,
  manageArchiveStatus,
} from "../controllers/membersController.js";
import authenticate from "../middlewares/authMiddleware.js";
const router = express.Router();

// Create member
router.post("/", authorizeRoles("admin"), AddMember);
// Get all members with pagination
router.get("/", authorizeRoles("admin"), getAllMembers);
// Archive selected users
router.patch(
  "/archive",
  authorizeRoles("admin", "ComponentCoordinator"),
  manageArchiveStatus
);
// Unarchive selected users — new route
// router.patch(
//   "/unarchive",
//   authorizeRoles("admin", "ComponentCoordinator"),
//   unarchiveMembers
// );
// get all component Coordinators
router.get(
  "/componentCoordinators",
  authorizeRoles("RegionalCoordinator"),
  getAllComponentCoordinators
);
// get  all general coordinators
router.get(
  "/incubationCoordinators",
  authenticate,
  getAllIncubationCoordinators
);

// get users by role
router.get(
  "/role/:role",
  authorizeRoles("admin", "ComponentCoordinator"),
  getUsersByRole
);

export default router;
