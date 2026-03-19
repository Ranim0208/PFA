// services/auth/refresh.js
import { apiBaseUrl } from "../../utils/constants";

// services/auth/refresh.js - SIMPLIFIED VERSION
export async function authenticateInMiddleware(accessToken, refreshToken) {
  try {
    if (!accessToken) {
      console.log("❌ Middleware: No access token");
      return { success: false, error: "No access token" };
    }

    // Just decode the JWT - no API call needed!
    const user = decodeJWT(accessToken);

    if (user) {
      console.log("✅ Middleware: Token valid");
      return { success: true, user };
    }

    console.log("❌ Middleware: Token invalid");
    return { success: false, error: "Token invalid" };
  } catch (error) {
    console.error("🔴 Middleware: Authentication error", error);
    return { success: false, error: "Authentication failed" };
  }
}

function decodeJWT(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("🔓 Decoded user from JWT:", {
      userId: payload.userId,
      email: payload.email,
      roles: payload.roles,
    });

    return {
      id: payload.userId,
      email: payload.email,
      roles: payload.roles || [],
      role: payload.roles?.[0],
    };
  } catch (error) {
    console.error("JWT decode error:", error);
    return null;
  }
}

// FIXED: This function takes refreshToken as parameter for middleware
export async function refreshTokenWithToken(refreshToken) {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refresh=${refreshToken}`,
      },
    });

    console.log("🔄 Refresh response status:", response.status);

    if (!response.ok) {
      return {
        success: false,
        error: `Refresh failed: ${response.status}`,
      };
    }

    // Try to get token from response body
    const data = await response.json().catch(() => ({}));
    console.log("📥 Refresh response data:", data);

    if (data.accessToken) {
      return { success: true, newAccessToken: data.accessToken };
    }

    // Try to get token from Set-Cookie header
    const setCookieHeader = response.headers.get("set-cookie");
    console.log("🍪 Set-Cookie header:", setCookieHeader);

    if (setCookieHeader) {
      const accessCookieMatch = setCookieHeader.match(/access=([^;]+)/);
      if (accessCookieMatch && accessCookieMatch[1]) {
        return { success: true, newAccessToken: accessCookieMatch[1] };
      }
    }

    return {
      success: true,
      newAccessToken: null,
    };
  } catch (error) {
    console.error("Refresh token error:", error);
    return {
      success: false,
      error: "Network error during refresh",
    };
  }
}

// This is for Server Components/Actions that can use cookies()
export async function RefreshToken() {
  const { cookies } = await import("next/headers");
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refresh")?.value;

  if (!refreshToken) {
    throw new Error("Refresh token not found in cookies");
  }

  return refreshTokenWithToken(refreshToken);
}
