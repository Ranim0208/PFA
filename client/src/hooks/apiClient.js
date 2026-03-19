"use client";
import { logoutUser } from "../services/auth/logout";
import { redirect } from "next/navigation";
import { RefreshToken } from "@/services/auth/refresh";
// import { cookies } from "next/headers";

export const apiClient = async (url, options = {}, retry = true) => {
  try {
    const config = {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    console.log("🔐 API Client calling:", url);
    console.log("📤 Request config:", {
      method: config.method || "GET",
      credentials: config.credentials,
      headers: config.headers,
    });

    const response = await fetch(url, config);

    console.log("📥 API Response status:", response.status);
    console.log(
      "📥 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (response.status === 401) {
      console.log("⚠️ 401 Unauthorized - Retry allowed:", retry);

      if (retry) {
        try {
          console.log("🔄 Attempting token refresh...");
          const refreshResult = await RefreshToken();

          if (refreshResult.success) {
            console.log("✅ Token refreshed successfully, retrying request...");
            // Wait a bit for cookie to be set
            await new Promise((resolve) => setTimeout(resolve, 100));
            return apiClient(url, options, false);
          } else {
            console.log("❌ Token refresh failed, logging out");
            await logoutUser();
            redirect("/auth/login");
          }
        } catch (refreshError) {
          console.error("❌ Token refresh error:", refreshError);
          await logoutUser();
          redirect("/auth/login");
        }
      } else {
        console.log("❌ No retry allowed, logging out");
        await logoutUser();
        redirect("/auth/login");
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error response:", errorText);

      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }

      const error = new Error(
        errorData.message || errorData.error || `HTTP ${response.status}`
      );

      if (errorData.errors) {
        error.validationErrors = Array.isArray(errorData.errors)
          ? errorData.errors
          : [errorData.message];
      }
      throw error;
    }

    const data = await response.json();
    console.log("✅ API Success response");
    return data;
  } catch (error) {
    if (
      error.message === "NEXT_REDIRECT" ||
      error.digest?.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("🔴 API Client Error:", {
      error: error.message,
      url,
      cause: error.cause,
      stack: error.stack,
    });
    throw error;
  }
};

export const safeApiCall = async (url, options = {}) => {
  try {
    const response = await apiClient(url, options);
    return response || null;
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    return null;
  }
};
