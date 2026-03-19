// services/auth.js

import { apiBaseUrl } from "@/utils/constants";
// 1. Request Password Reset
export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/request-password-reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data.message;
  } catch (error) {
    console.error("requestPasswordReset error:", error.message);
    throw new Error(error.message || "Something went wrong");
  }
};

// 2. Reset Password
export const resetPassword = async ({ token, userId, newPassword }) => {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/reset-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, userId, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Password reset failed");
    }

    return data.message;
  } catch (error) {
    console.error("resetPassword error:", error.message);
    throw new Error(error.message || "Something went wrong");
  }
};

// 3. Validate Reset Token
export const validateResetToken = async ({ token, userId }) => {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/validate-reset-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, userId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Token validation failed");
    }

    return data.valid;
  } catch (error) {
    console.error("validateResetToken error:", error.message);
    return false;
  }
};
