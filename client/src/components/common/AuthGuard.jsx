// components/RoleGuard.js
"use client";

import { useState, useEffect } from "react";
import { getClientAuth, checkUserPermission } from "@/utils/auth";

export default function RoleGuard({
  children,
  allowedRoles = [],
  fallback = null,
  requireAll = false,
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { user } = await getClientAuth();
      setUser(user);
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return fallback;
  }

  // Check if user has required roles
  let hasAccess = false;

  if (requireAll) {
    // User must have ALL specified roles
    hasAccess = allowedRoles.every((role) => user.roles?.includes(role));
  } else {
    // User must have at least ONE of the specified roles
    hasAccess = checkUserPermission(user, allowedRoles);
  }

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
}
