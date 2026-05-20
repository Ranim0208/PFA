import { Router } from "express";
import {
  loginUser,
  refreshAccessToken,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  validateResetToken,
  activateAccount,
} from "../controllers/authController.js";
const router = Router();

router.post("/login", loginUser);
// In your authRoutes.js
router.get("/check-session", (req, res) => {
  console.log("=== Cookie Debug ===");
  console.log("All cookies:", req.cookies);
  console.log("Raw cookie header:", req.headers.cookie);
  console.log("Has access?", !!req.cookies.access);
  console.log("Has refresh?", !!req.cookies.refresh);

  res.json({
    hasCookieParser: !!req.cookies,
    cookies: req.cookies,
    rawCookieHeader: req.headers.cookie,
    accessToken: req.cookies.access ? "present" : "missing",
    refreshToken: req.cookies.refresh ? "present" : "missing",
  });
});
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);
router.post("/request-password-reset", requestPasswordReset);
router.put("/reset-password", resetPassword);
router.post("/validate-reset-token", validateResetToken);
router.put("/activate-account", activateAccount);
export default router;
