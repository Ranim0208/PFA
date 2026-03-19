// services/memberService.js
import { apiBaseUrl } from "../../utils/constants";
import { apiClient } from "../../hooks/apiClient";

export async function addMember(data) {
  return apiClient(`${apiBaseUrl}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// services/users/members.js
export async function fetchMembers({
  pageIndex,
  pageSize,
  search,
  filters,
  sortField,
  sortDirection,
  includeArchived = false,
}) {
  try {
    // Build query params
    const params = new URLSearchParams({
      page: pageIndex + 1,
      pageSize,
      includeArchived: includeArchived.toString(),
      ...(search && { search }),
      ...(filters?.role && { role: filters.role }),
      ...(sortField && { sortField }),
      ...(sortDirection && { sortOrder: sortDirection }),
    });

    const response = await apiClient(
      `${apiBaseUrl}/members?${params.toString()}`
    );

    // Handle the response structure
    if (response.success) {
      return {
        data: response.data,
        totalItems: response.totalItems || response.pagination?.total || 0,
        pagination: response.pagination,
      };
    } else {
      throw new Error(response.error || "Failed to fetch members");
    }
  } catch (error) {
    console.error("Error fetching members:", error);
    throw error;
  }
}

export async function archiveMembers(ids) {
  const response = await apiClient(`${apiBaseUrl}/members/archive`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, action: "archive" }),
  });

  if (response.success) {
    return response;
  } else {
    throw new Error(response.error || "Failed to archive members");
  }
}

export async function unarchiveMembers(ids) {
  const response = await apiClient(`${apiBaseUrl}/members/archive`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, action: "unarchive" }),
  });

  if (response.success) {
    return response;
  } else {
    throw new Error(response.error || "Failed to unarchive members");
  }
}
export async function getComponentCoordinators() {
  try {
    return await apiClient(`${apiBaseUrl}/members/componentCoordinators`);
  } catch (error) {
    console.error("Error fetching component coordinators:", error);
    throw error;
  }
}
export async function getIncubationCoordinators() {
  try {
    return await apiClient(`${apiBaseUrl}/members/incubationCoordinators`);
  } catch (error) {
    console.error("Error fetching component coordinators:", error);
    throw error;
  }
}

// get users by role
export async function getUsersByRole(role) {
  try {
    return await apiClient(`${apiBaseUrl}/members/role/${role}`);
  } catch (error) {
    console.error(`Error fetching users by role (${role}):`, error);
    throw error;
  }
}
