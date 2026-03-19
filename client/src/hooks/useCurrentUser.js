"use client";
import { useEffect, useState } from "react";
import { apiClient } from "./apiClient";
import { logoutUser } from "../services/auth/logout";
import { apiBaseUrl } from "../utils/constants";

const useCurrentUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      // Attempt to fetch current user data from the API
      const userData = await apiClient(`${apiBaseUrl}/users/me`);
      console.log(userData);
      setUser(userData.user); // Set user data in state
    } catch (error) {
      // Handle session expiration or other errors
      if (error.message.includes("Session expired")) {
        logoutUser(); // Log out if session is expired
      } else {
        setError(error.message); // Set error message if it's not session-related
      }
    } finally {
      setLoading(false); // Mark loading as false once the API call is finished
    }
  };

  // Fetch user data on mount
  useEffect(() => {
    fetchUser();
  }, []); // Empty dependency array means this runs only once on component mount

  return { user, loading, error }; // Return the user, loading state, and any errors
};

export default useCurrentUser;
