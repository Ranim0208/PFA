"use client";

import { apiClient } from "@/hooks/apiClient";
import { apiBaseUrl } from "../../utils/constants";

export async function fetchCurrentUser() {
  try {
    const data = await apiClient(`${apiBaseUrl}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch user");
  }
}

export async function fetchUser() {
  // This works in client components where cookies are automatically sent
  try {
    const response = await fetch(`${apiBaseUrl}/users/me`, {
      method: "GET",
      credentials: "include", // Cookies are sent automatically
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, user: data.user || data };
    }

    return { success: false, error: `HTTP ${response.status}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
