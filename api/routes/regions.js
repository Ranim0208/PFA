import express from "express";
import {
  getRegions,
  getFormsRegions,
} from "../controllers/regionsController.js";

const router = express.Router();

router.get("/", getRegions);
router.get("/open", getFormsRegions);
export default router;
