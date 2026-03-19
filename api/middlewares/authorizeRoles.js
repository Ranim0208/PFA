import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authorizeRoles =
  (...allowedRoles) =>
  async (req, res, next) => {
    try {
      // Only use cookies
      const accessToken = req.cookies.access;
      const refreshToken = req.cookies.refresh;

      if (!accessToken) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      // Verify access token
      let decoded;
      try {
        decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      } catch (error) {
        // If access token expired, try to refresh
        if (error.name === "TokenExpiredError" && refreshToken) {
          try {
            const refreshDecoded = jwt.verify(
              refreshToken,
              process.env.JWT_REFRESH_SECRET
            );

            // Generate new access token
            const newAccessToken = jwt.sign(
              { userId: refreshDecoded.userId },
              process.env.JWT_ACCESS_SECRET,
              { expiresIn: "15min" }
            );

            // Set new cookie
            res.cookie("access", newAccessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "none",
              maxAge: 15 * 60 * 1000,
              domain: ".tacir.tn",
              path: "/",
            });

            decoded = refreshDecoded;
          } catch (refreshError) {
            return res.status(401).json({
              success: false,
              error: "Session expired",
            });
          }
        } else {
          return res.status(401).json({
            success: false,
            error: "Invalid token",
          });
        }
      }

      // Get user
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Check roles
      const userRoles = user.roles.map((role) => role.toLowerCase());
      const requiredRoles = allowedRoles.map((role) => role.toLowerCase());

      const hasAccess = requiredRoles.some((role) => userRoles.includes(role));

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: `Access denied. Required roles: ${requiredRoles.join(", ")}`,
          userRoles,
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(500).json({
        success: false,
        error: "Authentication error",
      });
    }
  };
