import express from "express";
const router = express.Router();
import multer from "multer";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { checkFormOpen } from "../middlewares/checkOpenForms.js";
import {
  submitApplication,
  getFormSubmissions,
  leaveFeedback,
  changeSubmissionStatus,
  addPreselectionEvaluation,
  validatePreselection,
  getAcceptedSubmissions,
  getFormSubmissionsByRegion,
  confirmAttendanceStatus,
  withdrawCandidate,
  getReplacementCandidates,
  selectReplacementCandidate,
  createAccountsForAcceptedParticipants,
} from "../controllers/submissionsController.js";
import authenticate from "../middlewares/authMiddleware.js";
import { uploadCandidatureFiles } from "../utils/candidate-fileUpload.js";
// submit candidature form for the porteur de projet
// Dynamic multer middleware that handles any number of file fields
const handleFileUploads = (req, res, next) => {
  // Use multer.any() to accept any files
  const upload = uploadCandidatureFiles.any();

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size exceeds 10MB limit",
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Transform req.files array to object keyed by fieldname
    if (req.files && Array.isArray(req.files)) {
      const filesObject = {};
      req.files.forEach((file) => {
        if (!filesObject[file.fieldname]) {
          filesObject[file.fieldname] = [];
        }
        filesObject[file.fieldname].push(file);
      });
      req.files = filesObject;
    }

    next();
  });
};

router.post(
  "/submit/:formId",
  checkFormOpen,
  handleFileUploads,
  submitApplication
);
// Add this with other routes
router.get("/form/:formId", authenticate, getFormSubmissions);
// Review a specific form submission (add feedback)
router.patch(
  "/:submissionId/feedback",
  // authorizeRoles("ComponentCoordinator"),
  authenticate,
  leaveFeedback
);
//post-creathon validation
router.post(
  "/validate-after-creathon",
  authenticate,
  authorizeRoles("ComponentCoordinator"),
  createAccountsForAcceptedParticipants
);
// Change status of a submission
router.patch(
  "/:submissionId/status",
  // authorizeRoles("ComponentCoordinator"),
  authenticate,
  changeSubmissionStatus
);
// routes/submissions.js
router.patch(
  "/:submissionId/evaluate",
  // authorizeRoles("ComponentCoordinator"),
  authenticate,
  addPreselectionEvaluation
);

router.patch(
  "/validate-preselection",
  authorizeRoles("ComponentCoordinator"),
  validatePreselection
);
// routes/submissions.js
router.get(
  "/accepted/:regionId",
  authorizeRoles("RegionalCoordinator"),
  getAcceptedSubmissions
);
// router.patch(
//   "/:submissionId/attendance",
//   authorizeRoles("RegionalCoordinator"),
//   updateAttendanceStatus
// );
router.get("/region/:regionId", getFormSubmissionsByRegion);
router.patch(
  "/:id/attendance",
  authorizeRoles("RegionalCoordinator"),
  confirmAttendanceStatus
);

router.patch(
  "/:submissionId/withdraw",
  authorizeRoles("ComponentCoordinator"),
  withdrawCandidate
);

router.get(
  "/:formId/replacement-candidates",
  authorizeRoles("ComponentCoordinator", "RegionalCoordinator"),
  getReplacementCandidates
);

router.patch(
  "/:submissionId/select-replacement",
  authorizeRoles("ComponentCoordinator"),
  selectReplacementCandidate
);

export default router;
