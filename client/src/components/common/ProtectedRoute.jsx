// components/ProtectedRoute.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getClientAuth,
  checkUserPermission,
  getUserRedirectPath,
} from "@/utils/auth";
import Loader from "../ui/Loader";
import UnauthorizedPage from "./UnauthorizedPage";

export default function ProtectedRoute({
  children,
  requiredRoles = [],
  fallbackPath = "/login",
  showUnauthorized = true,
}) {
  const [authState, setAuthState] = useState({
    user: null,
    loading: true,
    isAuthenticated: false,
    isAuthorized: false,
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  // In the checkAuth function
  const checkAuth = async () => {
    try {
      const { user, isAuthenticated, error } = await getClientAuth();

      if (!isAuthenticated) {
        const currentPath = window.location.pathname;
        const redirectUrl = new URL(fallbackPath, window.location.origin);
        redirectUrl.searchParams.set("redirect", currentPath);
        redirectUrl.searchParams.set("error", "auth_required");
        window.location.href = redirectUrl.toString();
        return;
      }

      // Check role permissions if required
      let isAuthorized = true;
      if (requiredRoles.length > 0) {
        isAuthorized = checkUserPermission(user, requiredRoles);

        if (!isAuthorized && !showUnauthorized) {
          const redirectPath = getUserRedirectPath(user);
          window.location.href = redirectPath;
          return;
        }
      }

      setAuthState({
        user,
        loading: false,
        isAuthenticated,
        isAuthorized,
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
        isAuthorized: false,
      });
    }
  };
  if (authState.loading) {
    return <Loader />;
  }

  if (!authState.isAuthenticated) {
    return null;
  }

  if (requiredRoles.length > 0 && !authState.isAuthorized) {
    return showUnauthorized ? <UnauthorizedPage user={authState.user} /> : null;
  }

  return <>{children}</>;
}
