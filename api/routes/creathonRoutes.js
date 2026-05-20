import express from "express";
import {
  createCreathon,
  getAllCreathons,
  getCreathonById,
  updateCreathon,
  getCreathonByRegion,
  submitTeamList,
  sendMentorInvitations,
  validateMentorAccount,
  getCreathonTeam,
  exportTeamList,
  getCreathonStatsByRegion,
  validateCreathonLogistics,
  getCreathonsForComponentCoordinator,
  getCreathonsForGeneralCoordinator,
  validateCreathonLogisticsByGeneralCoordinator,
  updateCreathonTeam,
  sendTeamInvitations,
  getMentorsByRegionId,
} from "../controllers/creathonController.js";
import authenticate from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

// Routes publiques
router.get("/", getAllCreathons);
router.get("/region/:regionId", getCreathonByRegion);
router.get("/stats-by-region/:regionId", getCreathonStatsByRegion);
router.post("/", authenticate, createCreathon);
router.put("/:id", authenticate, updateCreathon);

router.get(
  "/component-coordinator",
  authenticate,
  getCreathonsForComponentCoordinator
);
router.get(
  "/general-coordinator",
  authenticate,
  getCreathonsForGeneralCoordinator
);

router.post("/validate-logistics/:id", authenticate, validateCreathonLogistics);
router.post(
  "/final-validate-logistics/:id",
  authenticate,
  validateCreathonLogisticsByGeneralCoordinator
);

// Submit mentor/jury list (Component Coordinator)
router.post("/:creathonId/team", authenticate, submitTeamList);

// Validate mentor account (General Coordinator)
router.post("/mentors/:mentorId/validate", authenticate, validateMentorAccount);

// Get team list
router.get("/:creathonId/team", authenticate, getCreathonTeam);
router.put("/:id/team", authenticate, updateCreathonTeam);

// Export team list
router.get("/:creathonId/team/export", authenticate, exportTeamList);

router.post(
  "/:id/send-invitations",
  authenticate,
  authorizeRoles("IncubationCoordinator"),
  sendTeamInvitations
);

// routes/creathonRoutes.js
router.get("/mentors-by-region", getMentorsByRegionId);

router.get("/:id", getCreathonById);

export default router;
