import express from "express";
import {
  createSession,
  recordAttendance,
  updateSession,
  deleteSession,
  getSessionAttendance,
  createTrainingOutput,
  submitParticipantOutput,
  getParticipantOutputs,
  getCohortTracking,
  reviewParticipantOutput,
  getParticipantTrainings,
  getParticipantSessions,
  getParticipantDashboard,
  getParticipantAttendance,
  getParticipantCohortTracking,
  getMentorDashboardStats,
  getSessionsByTrainingAndUser,
  confirmPresence,
  getSessionsByTraining,
  getTrainingAttendance,
  saveAttendanceForDay,
  getTrainingTrackingData,
  getParticipantsAttendanceByRegion,
  updateSignature
} from "../controllers/trainingsTrackingController.js";
import authenticate from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
const router = express.Router();
// Session Management
// Get training attendance
router.get(
  "/:trainingId/attendance",
  authenticate,
  authorizeRoles("mentor"),
  getTrainingAttendance
);
// Save attendance for a day*
router.post(
  "/:trainingId/attendance",
  authenticate,
  authorizeRoles("mentor"),
  saveAttendanceForDay
);
router.post(
  "/:trainingId/attendance",
  authenticate,
  authorizeRoles("mentor"),
  saveAttendanceForDay
);
// getParticipantsAttendanceByRegion
router.get(
  "/:regionId/attendancebyregion",
  authenticate,
  authorizeRoles("componentCoordinator"),
  getParticipantsAttendanceByRegion
);

// Create a new session
router.post(
  "/createSession",
  authenticate,
  authorizeRoles("mentor"),
  createSession
);
// Get sessions by training ID
router.get(
  "/getSession/:trainingId",
  authenticate,
  authorizeRoles("mentor", "componentCoordinator"),
  getSessionsByTraining
);
// Update session
router.put(
  "/sessions/:id",
  authenticate,
  authorizeRoles("mentor"),
  updateSession
);
//delete session
router.delete(
  "/sessions/:id",
  authenticate,
  authorizeRoles("mentor"),
  deleteSession
);
//get the session details for project -holder
router.get(
  "/sessions/by-training-user/:trainingId",
  authenticate,
  getSessionsByTrainingAndUser
);
//confirm presence project holder
router.put("/sessions/:sessionId/confirm-presence", confirmPresence);
// Update existing signature
router.put("/sessions/:sessionId/update-signature", authenticate, updateSignature);
// Session Management
router.post(
  "/:trainingId/sessions",
  authenticate,
  authorizeRoles("ComponentCoordinator", "mentor"),
  createSession
);

// Attendance Tracking
router.post(
  "/sessions/:sessionId/attendance",
  authenticate,
  authorizeRoles("mentor", "ComponentCoordinator"),
  recordAttendance
);
router.get(
  "/sessions/:sessionId/attendance",
  authenticate,
  authorizeRoles("mentor", "ComponentCoordinator"),
  getSessionAttendance
);
router.get(
  "/participants/:participantId/trainings",
  authenticate,
  getParticipantTrainings
);
router.get(
  "/participants/:participantId/sessions",
  authenticate,
  getParticipantSessions
);
// Cohort Tracking
router.get(
  "/:trainingId/cohorts/:cohort/tracking",
  authenticate,
  getCohortTracking
);
// Participant Dashboard Route
router.get(
  "/participants/:participantId/dashboard",
  authenticate,
  getParticipantDashboard
);
// Participant Training Data Routes
router.get(
  "/participants/:participantId/trainings",
  authenticate,
  getParticipantTrainings
);
router.get(
  "/participants/:participantId/sessions",
  authenticate,
  getParticipantSessions
);
router.get(
  "/participants/:participantId/attendance",
  authenticate,
  getParticipantAttendance
);

router.get("/:trainingId", authenticate, getTrainingTrackingData);
export default router;
