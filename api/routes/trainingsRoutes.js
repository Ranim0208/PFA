import express from "express";
import {
  createTraining,
  validateTraining,
  rejectTraining,
  rescheduleTraining,
  getTrainings,
  updateTraining,
  getTrainingById,
  createBootcamp,
  updateBootcamp,
  getTrainingsForMentor,
  getApprovedTrainings,
   getMyTrainings,
} from "../controllers/trainingController.js";
import authenticate from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { uploadProgramFile } from "../utils/uploadBootcampProgram.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("ComponentCoordinator"),
  createTraining
);
router.get(
  "/mentor",
  authenticate,
  authorizeRoles("mentor"),
  getTrainingsForMentor
);
// get all approved training
router.get(
  "/approved",
  authenticate,
  authorizeRoles("ComponentCoordinator"),
  getApprovedTrainings
);

router.post(
  "/bootcamp/create",
  authenticate,
  authorizeRoles("ComponentCoordinator"),
  uploadProgramFile,
  createBootcamp
);
router.put(
  "/bootcamp/update/:id",
  authenticate,
  authorizeRoles("ComponentCoordinator"),
  uploadProgramFile,
  updateBootcamp
);

router.put(
  "/reschedule",
  authenticate,
  authorizeRoles(["GeneralCoordinator"]),
  rescheduleTraining
);
router.patch(
  "/:trainingId/approve",
  authenticate,
  authorizeRoles("IncubationCoordinator"),
  validateTraining
);
router.patch(
  "/:trainingId/reject",
  authenticate,
  authorizeRoles("IncubationCoordinator"),
  rejectTraining
);


router.get("/my-trainings", authenticate, getMyTrainings);

router.get("/", authenticate, getTrainings);
//update training by id
router.put(
  "/:id",
  authenticate,
  authorizeRoles("ComponentCoordinator"),
  updateTraining
);
// get training by id
router.get(
  "/:trainingId",
  authenticate,
  authorizeRoles("ComponentCoordinator", "mentor"),
  getTrainingById
);




export default router;
