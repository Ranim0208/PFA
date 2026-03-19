"use client";
import { apiClient } from "@/hooks/apiClient";
import { apiBaseUrl } from "../../utils/constants";

const baseUrl = `${apiBaseUrl}/creathons`;
export async function getCreathonsByRegion(regionId) {
  return apiClient(`${baseUrl}/region/${regionId}`, { method: "GET" });
}
export async function getCreathonStatsByRegion(regionId) {
  return apiClient(`${baseUrl}/stats-by-region/${regionId}`, { method: "GET" });
}
export async function getCreathonsForComponentCoordinator() {
  return apiClient(`${baseUrl}/component-coordinator`, { method: "GET" });
}

export async function getCreathonsForGeneralCoordinator() {
  return apiClient(`${baseUrl}/general-coordinator`, { method: "GET" });
}
// 🔹 Valider la logistique d’un créathon
export async function validateCreathonLogistics(creathonId, comments = "") {
  return apiClient(`${baseUrl}/validate-logistics/${creathonId}`, {
    method: "POST",
    body: JSON.stringify({ comments }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
export async function finalvalidateCreathonLogistics(
  creathonId,
  comments = ""
) {
  return apiClient(`${baseUrl}/final-validate-logistics/${creathonId}`, {
    method: "POST",
    body: JSON.stringify({ comments }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
export const getTeamMembers = async (creathonId) => {
  const response = await apiClient(`${API_URL}/${creathonId}/team`, {
    method: "GET",
  });
  return response.data;
};

export const addTeamMembers = async (creathonId, members, type) => {
  return apiClient(`${baseUrl}/${creathonId}/team`, {
    method: "POST",
    body: JSON.stringify({ [type]: members }),
    headers: { "Content-Type": "application/json" },
  });
};

export const sendInvitations = async (creathonId, type) => {
  return apiClient(`${baseUrl}/${creathonId}/invitations`, {
    method: "POST",
    body: JSON.stringify({ type }),
    headers: { "Content-Type": "application/json" },
  });
};

export const removeTeamMember = async (creathonId, memberId, type) => {
  return apiClient(`${baseUrl}/${creathonId}/team/${memberId}`, {
    method: "DELETE",
    body: JSON.stringify({ type }),
    headers: { "Content-Type": "application/json" },
  });
};

export async function getAllCreathons() {
  return apiClient(baseUrl, { method: "GET" });
}

export async function createCreathon(data) {
  return apiClient(baseUrl, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCreathon(id, data) {
  return apiClient(`${baseUrl}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getCreathonById(id) {
  return apiClient(`${baseUrl}/${id}`, { method: "GET" });
}
export const updateCreathonTeam = async (creathonId, teamData) => {
  const response = apiClient(`${baseUrl}/${creathonId}/team`, {
    method: "PUT",
    body: JSON.stringify(teamData),
  });

  return response.data;
};
// creathons.service.js
export const sendCreathonInvitations = async (creathonId, type) => {
  try {
    const response = await apiClient(
      `${baseUrl}/${creathonId}/send-invitations`,
      {
        method: "POST",
        body: JSON.stringify({ type }), // Properly stringify the object
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to send invitations:", error);
    throw error;
  }
};
