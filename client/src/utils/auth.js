export async function getClientAuth() {
  try {
    const response = await fetchCurrentUser();
    if (response && (response.user || response.id)) {
      const userData = response.user || response;

      // FIX: Handle both 'role' and 'roles'
      const roles = Array.isArray(userData.roles)
        ? userData.roles
        : Array.isArray(userData.role)
        ? userData.role
        : userData.role
        ? [userData.role]
        : [];

      if (roles.includes("RegionalCoordinator") && userData.region?.id) {
        localStorage.setItem("userRegionId", userData.region.id);
        localStorage.setItem(
          "regionName",
          userData.region.name?.fr || userData.region.name
        );
      }

      if (
        roles.includes("ComponentCoordinator") &&
        userData.component?.composant
      ) {
        const componentType = userData.component.composant;
        if (["crea", "inov"].includes(componentType)) {
          localStorage.setItem("userComponent", componentType);
        }
      }

      return {
        user: { ...userData, roles }, // Ensure roles is always an array
        isAuthenticated: true,
        error: null,
      };
    }

    return {
      user: null,
      isAuthenticated: false,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      isAuthenticated: false,
      error: error.message,
    };
  }
}

// Update checkUserPermission
export function checkUserPermission(user, requiredRoles) {
  if (!user) return false;

  // FIX: Handle both 'role' and 'roles'
  const userRoles = Array.isArray(user.roles)
    ? user.roles
    : Array.isArray(user.role)
    ? user.role
    : user.role
    ? [user.role]
    : [];

  if (!Array.isArray(requiredRoles)) requiredRoles = [requiredRoles];
  return requiredRoles.some((role) => userRoles.includes(role));
}
export function getUserRedirectPath(user) {
  if (!user) return "/auth/login";

  const roles = Array.isArray(user.roles)
    ? user.roles
    : Array.isArray(user.role)
    ? user.role
    : user.role
    ? [user.role]
    : [];

  if (roles.includes("admin")) {
    return "/admin";
  } else if (roles.includes("GeneralCoordinator")) {
    return `/general-coordinator`;
  } else if (roles.includes("ComponentCoordinator")) {
    return "/component-coordinator";
  } else if (roles.includes("RegionalCoordinator")) {
    return `/regional-coordinator`;
  } else if (roles.includes("mentor")) {
    return `/mentor`;
  } else if (roles.length > 0) {
    return `/${roles[0].toLowerCase().replace(/\s+/g, "-")}`;
  }

  return "/dashboard";
}

export function logoutUser() {
  // Clear localStorage
  localStorage.removeItem("userRegionId");
  localStorage.removeItem("regionName");
  localStorage.removeItem("userComponent");

  // Redirect to login
  window.location.href = "/auth/login";
}
