import express from "express";
import {
  getMentorProfile,
  updateMentorProfile,
  uploadFiles,
  createMentorProfile,
  getCreathonSubmissionsForMentor,
  addMentorEvaluation,
  addMentorFeedback,
  deleteFile,
  getMentors,
  getMentorByUserId,
  getMentorsByCreathon,
} from "../controllers/mentor.controller.js";
import authenticate from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { verifyMentorInvitation } from "../middlewares/verifyMentorInvitation.js";
import upload from "../utils/upload.js";
import { mentorDocumentsUpload } from "../utils/mentorDocsUpload.js";
const router = express.Router();

// Get submissions for mentor
router.get("/submissions", authenticate, getCreathonSubmissionsForMentor);

// Add or update mentor evaluation
router.post(
  "/submissions/:submissionId/evaluations",
  authenticate,
  authorizeRoles("mentor"),
  addMentorEvaluation
);

// Add mentor feedback
router.post(
  "/submissions/:submissionId/feedback",
  authenticate,
  authorizeRoles("mentor"),
  addMentorFeedback
);

router.get(
  "/profile",
  authenticate,
  authorizeRoles("mentor"),
  getMentorProfile
);
router.post(
  "/profile",
  authenticate,
  authorizeRoles("mentor"),
  verifyMentorInvitation,
  mentorDocumentsUpload,
  createMentorProfile
);
router.put(
  "/profile",
  authenticate,
  authorizeRoles("mentor"),
  updateMentorProfile
);
router.post(
  "/upload",
  authenticate,
  authorizeRoles("mentor"),
  upload.fields([
    { name: "cv", maxCount: 1 },
    { name: "idDocument", maxCount: 1 },
  ]),
  uploadFiles
);
router.delete(
  "/files/:fileType",
  authenticate,
  authorizeRoles("mentor"),
  deleteFile
);
router.get("/", authenticate, getMentors);
router.get("/user/:userId", authenticate, getMentorByUserId);
router.get("/creathon/:creathonId", authenticate, getMentorsByCreathon);
export default router;
