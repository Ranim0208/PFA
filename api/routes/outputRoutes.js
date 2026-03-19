// routes/outputRoutes.js
import express from "express";
import {
  createTrainingOutput,
  getTrainingOutputs,
  // getOutputDetails,
  submitParticipantOutput,
  evaluateParticipantOutput,
  addOutputComment,
  deleteTrainingOutput,
  getParticipantOutputs,
  getParticipantOutputDetails,
  updateParticipantSubmission,
  getMentorSubmissionsByTraining,
} from "../controllers/outputs.controller.js";
import { trainingOutputsUpload } from "../utils/outputFileUpload.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import authenticate from "../middlewares/authMiddleware.js";
import { participantSubmissionUpload } from "../utils/participantSubmissionUpload.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("mentor"),
  trainingOutputsUpload,
  createTrainingOutput
);
router.get("/training/:trainingId", authenticate, getTrainingOutputs);
// router.get("/:outputId", authenticate, getOutputDetails);
router.delete(
  "/:outputId",
  authenticate,
  authorizeRoles("mentor"),
  deleteTrainingOutput
);

// Participant output routes
// Participant routes - View and submit outputs
router.get(
  "/participant/my-outputs",
  authenticate,
  authorizeRoles("projectHolder"),
  getParticipantOutputs
);

router.get(
  "/participant/:outputId/details",
  authenticate,
  authorizeRoles("mentor", "projectHolder", "componentCoordinator"),
  getParticipantOutputDetails
);

router.get(
  "/mentor/submissions/:trainingId",
  authenticate,
  authorizeRoles("mentor"),
  getMentorSubmissionsByTraining
);
router.post(
  "/:outputId/submit",
  authenticate,
  authorizeRoles("projectHolder"),
  participantSubmissionUpload,
  submitParticipantOutput
);

router.put(
  "/participant/:outputId/update-submission",
  authenticate,
  authorizeRoles("projectHolder"),
  // participantSubmissionUpload,
  updateParticipantSubmission
);

// Evaluation routes (mentor)
router.put(
  "/evaluate/:participantOutputId",
  authenticate,
  authorizeRoles("mentor"),
  evaluateParticipantOutput
);

// Comment routes (both mentor and participant)
router.post(
  "/comments/:participantOutputId",
  authenticate,
  authorizeRoles("mentor", "projectHolder"),
  addOutputComment
);
export default router;
