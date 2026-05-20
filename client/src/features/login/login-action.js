// features/login/login-action.js
import { apiBaseUrl } from "../../utils/constants";

export async function loginAction(credentials) {
  const url = `${apiBaseUrl}/auth/login`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return handleErrorResponse(data, response.status);
    }

    if (!data.user) {
      return {
        success: false,
        error: "Authentication succeeded but no user data received",
      };
    }

    // Remove the storeUserData call and just return the data
    // Let the client component handle localStorage
    const redirectPath = getRedirectPath(data.user.roles || [], data.user);

    return {
      success: true,
      user: data.user,
      redirect: redirectPath,
    };
  } catch (error) {
    console.error("Login failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
}

function handleErrorResponse(data, status) {
  if (data.requiresActivation) {
    return {
      requiresActivation: true,
      userId: data.userId,
      message: data.message,
      success: false,
    };
  }

  if (data.isArchived) {
    return {
      isArchived: true,
      message: data.message,
      success: false,
    };
  }

  return {
    success: false,
    error: data.message || `Authentication failed (${status})`,
  };
}

function getRedirectPath(roles, user) {
  const roleRedirects = {
    admin: "/admin/members",
    IncubationCoordinator: "/incubation-coordinator/candidatures",
    ComponentCoordinator: "/component-coordinator/candidatures",
    RegionalCoordinator: "/regional-coordinator/candidatures",
    mentor: "/mentor/profile",
    projectHolder: "/project-holder/trainings",
  };

  for (const role of roles) {
    if (roleRedirects[role]) {
      return roleRedirects[role];
    }
  }

  return "/dashboard";
}
