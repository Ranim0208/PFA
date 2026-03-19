// services/auth/logout.js
import { apiBaseUrl } from "../../utils/constants";

export const logoutUser = async () => {
  try {
    // Call logout endpoint
    const response = await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Don't throw error if logout endpoint fails - still clear local data
    if (!response.ok) {
      console.warn("Logout endpoint failed, but continuing with local cleanup");
    }
  } catch (error) {
    console.error("Logout endpoint error:", error);
    // Continue with local cleanup even if server request fails
  } finally {
    // Always clear client-side data
    if (typeof window !== "undefined") {
      localStorage.removeItem("userRegionId");
      localStorage.removeItem("regionName");
      localStorage.removeItem("userComponent");

      // Force redirect to login page
      window.location.href = "/auth/login";
    }
  }
};
