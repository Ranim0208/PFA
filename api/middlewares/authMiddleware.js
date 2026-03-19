// authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authenticate = async (req, res, next) => {
  try {
    // Only use cookies - no headers
    const accessToken = req.cookies.access;
    const refreshToken = req.cookies.refresh;

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        console.log("✅ Access token valid for user:", decoded.userId);
        req.user = await User.findById(decoded.userId);
        return next();
      } catch (err) {
        console.log("⚠️ Access token error:", err.name, err.message);
        if (err.name !== "TokenExpiredError") throw err;
        // Token expired, continue to check refresh token
      }
    }

    if (refreshToken) {
      try {
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET,
        );

        console.log(
          "🔄 Generating new access token for user:",
          decodedRefresh.userId,
        );

        // Generate new access token
        const newAccessToken = jwt.sign(
          { userId: decodedRefresh.userId },
          process.env.JWT_ACCESS_SECRET,
          { expiresIn: "15m" },
        );

        // Set new access token in cookie
        res.cookie("access", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "none",
          domain: ".tacir.tn",
          maxAge: 15 * 60 * 1000,
          path: "/",
        });

        console.log("✅ New access token set in cookie");

        // Get user and continue
        req.user = await User.findById(decodedRefresh.userId);
        return next();
      } catch (err) {
        console.log("❌ Refresh token error:", err.name, err.message);
        return res.status(401).json({
          success: false,
          message: "Session expired",
        });
      }
    }

    console.log("❌ No valid tokens found");
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: error.message || "Unauthorized",
    });
  }
};

export default authenticate;
