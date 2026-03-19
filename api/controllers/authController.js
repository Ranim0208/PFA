import bcrypt from "bcryptjs";
import { findUserByEmail } from "../helpers/userHelper.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import RefreshToken from "../models/RefreshToken.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import RegionalCoordinator from "../models/RegionalCoordinator.js";
import mongoose from "mongoose";
import ComponentCoordinator from "../models/ComponentCoordinator.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import sendEmail from "../utils/emailSender.js";
import crypto from "crypto";
// Helper function for cookie options
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: true, // true in production (HTTPS)
    sameSite: "none",
    path: "/",
    domain: ".tacir.tn",
  };
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        message:
          "Email or password incorrect. Please check your details and try again.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message:
          "Email or password incorrect. Please check your details and try again.",
      });
    }

    if (!user.isConfirmed) {
      return res.status(403).json({
        requiresActivation: true,
        userId: user._id,
        message: "You must activate your account before logging in.",
      });
    }

    if (user.isArchived) {
      return res.status(403).json({
        isArchived: true,
        message:
          "Votre compte a été désactivé. Vous n'avez plus accès à la plateforme. Veuillez contacter l'administrateur pour plus d'informations.",
      });
    }

    await RefreshToken.updateMany(
      { userId: user._id, isRevoked: false },
      { isRevoked: true }
    );

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false,
    });

    // ✅ PRODUCTION FIX: Same domain cookie configuration
    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // true in production for HTTPS
      sameSite: "lax", // Use 'lax' for same-domain in production
      path: "/",
      domain: isProduction ? ".tacir.tn" : undefined, // CRITICAL: Use parent domain
    };

    // Set refresh cookie (7 days)
    res.cookie("refresh", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set access cookie (15 minutes)
    res.cookie("access", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    const userInfo = {
      id: user._id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      roles: user.roles,
    };

    // ... rest of your user info logic

    console.log("✅ Login successful for:", user.email);
    console.log("✅ Cookies set with domain:", cookieOptions.domain);

    return res.status(200).json({
      success: true,
      user: userInfo,
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(500).json({
      message: "An error occurred during login. Please try again later.",
    });
  }
};

// Refresh Access Token using the Refresh Token
const refreshAccessToken = async (req, res) => {
  const refreshToken = req.headers["x-refresh-token"];

  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "Refresh token missing or invalid" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      userId: decoded.userId,
      isRevoked: false,
    });

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (storedToken.isExpired()) {
      await storedToken.revoke();
      return res.status(401).json({
        success: false,
        message: "Refresh token expired",
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      await storedToken.revoke();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newAccessToken = generateAccessToken(user);
    const cookieOptions = getCookieOptions();

    res.cookie("access", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    console.log("✅ Token refreshed for:", user.email);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (err) {
    console.error("❌ Error verifying refresh token:", err);

    try {
      const decoded = jwt.decode(refreshToken);
      if (decoded && decoded.userId) {
        await RefreshToken.updateMany(
          { userId: decoded.userId, token: refreshToken },
          { isRevoked: true }
        );
      }
    } catch (revokeError) {
      console.error("Error revoking invalid token:", revokeError);
    }

    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );
        await RefreshToken.updateMany(
          { userId: decoded.userId },
          { isRevoked: true }
        );
      } catch (error) {
        console.error("Error revoking refresh tokens:", error);
      }
    }

    const cookieOptions = getCookieOptions();

    res.clearCookie("access", cookieOptions);
    res.clearCookie("refresh", cookieOptions);

    console.log("✅ Logout successful");

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("❌ Logout Error:", error);

    const cookieOptions = getCookieOptions();
    res.clearCookie("access", cookieOptions);
    res.clearCookie("refresh", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a reset link has been sent",
      });
    }

    // Delete any existing reset tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id });

    // Create new reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    await PasswordResetToken.create({
      userId: user._id,
      token: hashedToken,
      expiresAt,
    });

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&id=${user._id}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a reset link has been sent",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({
      message: "An error occurred while processing your request",
    });
  }
};

const resetPassword = async (req, res) => {
  const { token, userId, newPassword } = req.body;

  try {
    // Hash the token to compare with stored token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the reset token
    const resetToken = await PasswordResetToken.findOne({
      userId,
      token: hashedToken,
      expiresAt: { $gt: new Date() },
    });

    if (!resetToken) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    // Update user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });

    // Delete the used token
    await PasswordResetToken.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      message: "An error occurred while resetting your password",
    });
  }
};
const validateResetToken = async (req, res) => {
  const { token, userId } = req.body;

  try {
    if (!token || !userId) {
      return res.status(400).json({ valid: false });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetToken = await PasswordResetToken.findOne({
      userId,
      token: hashedToken,
      expiresAt: { $gt: new Date() },
    });

    res.status(200).json({ valid: !!resetToken });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(200).json({ valid: false });
  }
};
const activateAccount = async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    if (user.isConfirmed) {
      return res.status(400).json({ message: "Le compte est déjà activé." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      isConfirmed: true,
    });

    return res.status(200).json({
      success: true,
      message: "Le compte a été activé avec succès.",
    });
  } catch (error) {
    console.error("Account activation error:", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors de l'activation du compte.",
    });
  }
};

export {
  loginUser,
  refreshAccessToken,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  validateResetToken,
  activateAccount,
};
