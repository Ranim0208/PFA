import express from "express";
import {
  getParticipantRegion,
  getParticipantsForMentor,
  getParticipantsForMentor2,
} from "../controllers/acceptedParticipantsController.js";
import authenticate from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { getTrainingAllParticipants } from "../controllers/acceptedParticipantsController.js";

const router = express.Router();
router.get(
  "/mentor/my-cohorts",
  authenticate,
  authorizeRoles("mentor"),
  getParticipantsForMentor
);

router.get(
  "/by-cohort",
  authenticate,
  authorizeRoles("mentor"),
  getParticipantsForMentor2
);
router.get("/me", authenticate, getParticipantRegion);
// get participants by training id
router.get(
  "/:id",
  authenticate,
  authorizeRoles("ComponentCoordinator"),
  getTrainingAllParticipants
);



//router.get("/by-region", authenticate, authorizeRoles("mentor"),getParticipantsForMentor);

export default router;
