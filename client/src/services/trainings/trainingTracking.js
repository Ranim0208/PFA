"use client";
import { apiBaseUrl } from "@/utils/constants";
import { safeApiCall } from "@/hooks/apiClient";
import { apiClient } from "@/hooks/apiClient";
// Session Management Services
export const createSession = async (sessionData) => {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/trainingsTracking/createSession`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      }
    );
    return response;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
};
//update session
export const updateSession = async (sessionId, sessionData) => {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/trainingsTracking/sessions/${sessionId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      }
    );
    return response;
  } catch (error) {
    console.error("Error updating session:", error);
    throw error;
  }
};
// delete session
export const deleteSession = async (sessionId) => {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/trainingsTracking/sessions/${sessionId}`,
      {
        method: "DELETE",
      }
    );
    return response;
  } catch (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
};
// fetch participants for mentor y cohorte name
export const getTrainingParticipantsForMentor = async (
  trainingId,
  cohortName
) => {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/accepted-participants/by-cohort?trainingId=${trainingId}&cohortName=${encodeURIComponent(
        cohortName
      )}&page=1&limit=100`
    );
    return response;
  } catch (error) {
    console.error("Failed to fetch participants:", error);
    throw error;
  }
};
// Fetch sessions for a specific training
export const getTrainingSessions = async (trainingId) => {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/trainingsTracking/getSession/${trainingId}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }
};
// Fetch mentor trainings
export const getMentorTrainings = async ({ page, limit }) => {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/trainings/mentor-trainings?page=${page}&limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error("Failed to fetch trainings:", error);
    throw error;
  }
};
// Attendance Management Services
export async function recordAttendance(sessionId, attendanceData) {
  const response = await safeApiCall(
    `${apiBaseUrl}/tracking/sessions/${sessionId}/attendance`,
    {
      method: "POST",
      body: JSON.stringify(attendanceData),
    }
  );
  return response || { success: false, message: "Failed to record attendance" };
}

export async function getSessionAttendance(sessionId) {
  const response = await safeApiCall(
    `${apiBaseUrl}/tracking/sessions/${sessionId}/attendance`
  );
  return Array.isArray(response) ? response : [];
}

export async function saveAttendance(sessionId, attendance) {
  try {
    await apiClient(`${apiBaseUrl}/trainingsTracking/sessions/${sessionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendance }),
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving attendance:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de l'enregistrement de la présence",
    };
  }
}

export async function getParticipantTrainings(participantId) {
  const response = await safeApiCall(
    `${apiBaseUrl}/tracking/participants/${participantId}/trainings`
  );
  return Array.isArray(response) ? response : [];
}

export async function getParticipantSessions(participantId) {
  const response = await safeApiCall(
    `${apiBaseUrl}/tracking/participants/${participantId}/sessions`
  );
  return Array.isArray(response) ? response : [];
}

export async function getParticipantAttendance(participantId) {
  const response = await safeApiCall(
    `${apiBaseUrl}/tracking/participants/${participantId}/attendance`
  );
  return Array.isArray(response) ? response : [];
}

export async function getParticipantDashboard(participantId) {
  const response = await safeApiCall(
    `${apiBaseUrl}/tracking/participants/${participantId}/dashboard`
  );
  return response || {};
}

export async function getParticipantCohortTracking(participantId) {
  const response = await safeApiCall(
    `${apiBaseUrl}/tracking/participants/${participantId}/cohort-tracking`
  );
  return response || {};
}

// Cohort Tracking Services
export async function getCohortTracking(trainingId, cohort) {
  const response = await safeApiCall(
    `${apiBaseUrl}/tracking/${trainingId}/cohorts/${cohort}/tracking`
  );
  return response || {};
}

export async function getMentorRecentActivity(limit = 10) {
  const response = await safeApiCall(
    `${apiBaseUrl}/mentor/activity?limit=${limit}`
  );
  return Array.isArray(response) ? response : [];
}

export async function getMentorPendingOutputs(limit = 10) {
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    status: "pending",
  });
  const response = await safeApiCall(
    `${apiBaseUrl}/mentor/outputs/pending?${queryParams.toString()}`
  );
  return Array.isArray(response) ? response : [];
}

// Utility functions
export function formatParticipantData(
  participants = [],
  sessions = [],
  outputs = []
) {
  return participants.map((participant) => {
    const participantSessions = sessions.filter((session) =>
      session.attendance?.some((att) => att.participant === participant.id)
    );
    const attendedSessions = participantSessions.filter((session) =>
      session.attendance.some(
        (att) => att.participant === participant.id && att.status === "present"
      )
    );
    const attendanceRate =
      participantSessions.length > 0
        ? Math.round(
            (attendedSessions.length / participantSessions.length) * 100
          )
        : 0;

    const participantOutputs = outputs.filter(
      (output) => output.participant === participant.id
    );
    const submittedOutputs = participantOutputs.filter(
      (output) => output.submitted
    );

    let status = "active";
    if (
      attendanceRate < 70 ||
      submittedOutputs.length < participantOutputs.length * 0.7
    ) {
      status = "at-risk";
    }
    if (attendanceRate < 50) {
      status = "inactive";
    }

    return {
      ...participant,
      attendance: attendanceRate,
      outputsSubmitted: submittedOutputs.length,
      outputsTotal: participantOutputs.length,
      status,
    };
  });
}

export async function formatSessionData(sessions = [], attendanceRecords = []) {
  return sessions.map((session) => {
    const sessionAttendance = attendanceRecords.filter(
      (att) => att.session === session.id
    );
    const presentCount = sessionAttendance.filter(
      (att) => att.status === "present"
    ).length;

    return {
      ...session,
      attendanceRecorded: sessionAttendance.length > 0,
      presentCount,
      totalCount: sessionAttendance.length,
    };
  });
}

export async function getParticipantsByRegion(params = {}) {
  console.log("=== SERVICE: Getting participants by region ===");
  console.log("Params:", params);

  const queryParams = new URLSearchParams();

  if (params.regionId) {
    queryParams.append("regionId", params.regionId);
  }

  if (params.trainingId) {
    queryParams.append("trainingId", params.trainingId);
  }

  if (params.includeEmpty !== undefined) {
    queryParams.append("includeEmpty", params.includeEmpty.toString());
  }

  const queryString = queryParams.toString();
  const url = `${apiBaseUrl}/participants/by-region${
    queryString ? `?${queryString}` : ""
  }`;

  console.log("API URL:", url);

  const response = await safeApiCall(url);

  console.log("Service response:", response);

  if (response && response.success) {
    return {
      success: true,
      data: response.data,
      totalRegions: response.data?.totalRegions || 0,
      totalParticipants: response.data?.totalParticipants || 0,
      participantsByRegion: response.data?.participantsByRegion || [],
    };
  }

  return {
    success: false,
    data: null,
    totalRegions: 0,
    totalParticipants: 0,
    participantsByRegion: [],
  };
}

export async function getParticipantsBySpecificRegion(regionId, params = {}) {
  console.log("=== SERVICE: Getting participants by specific region ===");
  console.log("Region ID:", regionId);
  console.log("Params:", params);

  if (!regionId) {
    console.error("Region ID is required");
    return {
      success: false,
      error: "Region ID is required",
      data: null,
    };
  }

  const queryParams = new URLSearchParams();

  if (params.trainingId) {
    queryParams.append("trainingId", params.trainingId);
  }

  const queryString = queryParams.toString();
  const url = `${apiBaseUrl}/participants/by-region/${regionId}${
    queryString ? `?${queryString}` : ""
  }`;

  console.log("API URL:", url);

  const response = await safeApiCall(url);

  console.log("Service response:", response);

  if (response && response.success) {
    return {
      success: true,
      data: response.data,
      region: response.data?.region || null,
      trainings: response.data?.trainings || [],
      participantCount: response.data?.participantCount || 0,
      participants: response.data?.participants || [],
    };
  }

  return {
    success: false,
    data: null,
    region: null,
    trainings: [],
    participantCount: 0,
    participants: [],
  };
}

export async function getMentorDashboardStats() {
  console.log("=== SERVICE: Getting mentor dashboard stats ===");

  const response = await safeApiCall(
    `${apiBaseUrl}/participants/dashboard-stats`
  );

  console.log("Dashboard stats service response:", response);

  if (response && response.success) {
    return {
      success: true,
      totalParticipants: response.data?.totalParticipants || 0,
      activeParticipants: response.data?.activeParticipants || 0,
      completionRate: response.data?.completionRate || 0,
      upcomingSessions: response.data?.upcomingSessions || 0,
      outputsPendingReview: response.data?.outputsPendingReview || 0,
      totalTrainings: response.data?.totalTrainings || 0,
      totalRegions: response.data?.totalRegions || 0,
    };
  }

  // Return default values if API fails
  return {
    success: false,
    totalParticipants: 0,
    activeParticipants: 0,
    completionRate: 0,
    upcomingSessions: 0,
    outputsPendingReview: 0,
    totalTrainings: 0,
    totalRegions: 0,
  };
}
export async function getMentorParticipants(filters = {}) {
  console.log("=== SERVICE: Getting mentor participants (compatibility) ===");
  console.log("Filters:", filters);

  // If cohort is provided, try to get participants by region name
  if (filters.cohort) {
    // First try to get by region name matching cohort
    const regionResponse = await getParticipantsByRegion({
      includeEmpty: false,
    });

    if (regionResponse.success) {
      // Filter by cohort name if provided
      const matchingRegions = regionResponse.participantsByRegion.filter(
        (regionData) => {
          const regionName = regionData.region?.name;
          if (typeof regionName === "object") {
            return (
              regionName.fr === filters.cohort ||
              regionName.ar === filters.cohort
            );
          }
          return regionName === filters.cohort;
        }
      );

      // Flatten participants from matching regions
      let participants = matchingRegions.flatMap((regionData) =>
        regionData.participants.map((participant) => ({
          id: participant.id,
          name: participant.user?.name,
          email: participant.user?.email,
          phone: participant.user?.phone,
          avatar: participant.user?.avatar,
          status: participant.status,
          trainingId: filters.trainingId || null,
          cohortId: regionData.region?.id,
          cohort:
            typeof regionData.region?.name === "object"
              ? regionData.region.name.fr
              : regionData.region?.name,
          region: regionData.region?.name,
          validatedAt: participant.validatedAt,
          eventDates: participant.eventDates,
          createdAt: participant.createdAt,
          updatedAt: participant.updatedAt,
        }))
      );

      // Apply additional filters
      if (filters.status && filters.status !== "all") {
        participants = participants.filter((p) => p.status === filters.status);
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        participants = participants.filter(
          (p) =>
            p.name?.toLowerCase().includes(searchTerm) ||
            p.email?.toLowerCase().includes(searchTerm)
        );
      }

      console.log("Filtered participants:", participants.length);
      return participants;
    }
  }

  // Fallback: get all participants and filter
  const allParticipantsResponse = await getParticipantsByRegion({
    includeEmpty: false,
  });

  if (allParticipantsResponse.success) {
    let allParticipants = allParticipantsResponse.participantsByRegion.flatMap(
      (regionData) =>
        regionData.participants.map((participant) => ({
          id: participant.id,
          name: participant.user?.name,
          email: participant.user?.email,
          phone: participant.user?.phone,
          avatar: participant.user?.avatar,
          status: participant.status,
          trainingId: filters.trainingId || null,
          cohortId: regionData.region?.id,
          cohort:
            typeof regionData.region?.name === "object"
              ? regionData.region.name.fr
              : regionData.region?.name,
          region: regionData.region?.name,
          validatedAt: participant.validatedAt,
          eventDates: participant.eventDates,
          createdAt: participant.createdAt,
          updatedAt: participant.updatedAt,
        }))
    );

    // Apply filters
    if (filters.status && filters.status !== "all") {
      allParticipants = allParticipants.filter(
        (p) => p.status === filters.status
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      allParticipants = allParticipants.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm) ||
          p.email?.toLowerCase().includes(searchTerm)
      );
    }

    console.log("All filtered participants:", allParticipants.length);
    return allParticipants;
  }

  console.log("No participants found, returning empty array");
  return [];
}

/**
 * Get upcoming sessions for mentor (placeholder - you may need to implement the backend)
 * @returns {Promise<Array>} Array of upcoming sessions
 */
export async function getMentorUpcomingSessions() {
  console.log("=== SERVICE: Getting mentor upcoming sessions ===");

  // This would need a backend endpoint to get sessions
  // For now, return empty array or implement based on your session model
  const response = await safeApiCall(
    `${apiBaseUrl}/participants/upcoming-sessions`
  );

  if (response && Array.isArray(response)) {
    return response;
  }

  // Fallback: could derive from trainings if needed
  return [];
}
export async function getMentorCohortDistribution() {
  console.log("=== SERVICE: Getting mentor cohort distribution ===");

  const response = await getParticipantsByRegion({ includeEmpty: false });

  if (response.success) {
    const distribution = response.participantsByRegion.map((regionData) => ({
      name:
        typeof regionData.region?.name === "object"
          ? regionData.region.name.fr
          : regionData.region?.name || "Unknown",
      count: regionData.participantCount,
      regionId: regionData.region?.id,
      cities: regionData.region?.cities || [],
    }));

    console.log("Cohort distribution:", distribution);
    return distribution;
  }

  return [];
}
export async function getParticipantsForMentor(params = {}) {
  console.log("=== SERVICE: Getting participants by region for mentor ===");
  console.log("Params:", params);
  console.log("testttttttttt");
  const queryParams = new URLSearchParams();

  // Optional parameters
  if (params.regionId) queryParams.append("regionId", params.regionId);
  if (params.trainingId) queryParams.append("trainingId", params.trainingId);
  if (params.search) queryParams.append("search", params.search);
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);

  const queryString = queryParams.toString();
  const url = `${apiBaseUrl}/accepted-participants/mentor/my-cohorts${
    queryString ? `?${queryString}` : ""
  }`;

  console.log("API URL:", url);

  try {
    const response = await safeApiCall(url);
    console.log("Service response:", response);

    if (response && response.success) {
      return {
        success: true,
        data: response.data || [],
        pagination: response.pagination || {
          total: 0,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: 1,
        },
        metadata: response.metadata || { trainings: [], regions: [] },
      };
    }

    return {
      success: false,
      data: [],
      pagination: {
        total: 0,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: 1,
      },
      metadata: { trainings: [], regions: [] },
    };
  } catch (error) {
    console.error("Service error:", error);
    return {
      success: false,
      error: error.message,
      data: [],
      pagination: {
        total: 0,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: 1,
      },
      metadata: { trainings: [], regions: [] },
    };
  }
}
export async function getApprovedTrainings({
  type,
  cohorts,
  page = 1,
  limit = 10,
}) {
  try {
    const queryParams = new URLSearchParams();
    if (type) queryParams.append("type", type);
    if (cohorts && cohorts !== "all") queryParams.append("cohorts", cohorts);
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    const response = await apiClient(
      `${apiBaseUrl}/trainings/approved?${queryParams.toString()}`
    );

    return response; // Will contain { upcoming, active, past }
  } catch (error) {
    throw new Error(error.message || "Failed to fetch approved trainings");
  }
}
export async function getTrainingParticipants(trainingId) {
  console.log("=== SERVICE: Getting training participants ===");
  try {
    const response = await apiClient(
      `${apiBaseUrl}/accepted-participants/${trainingId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Service response:", response);
    if (response && Array.isArray(response)) {
      return response;
    }
  } catch (error) {
    console.error("Failed to fetch participants:", error);
    throw error;
  }
}

export async function getTrainingTrackingData(trainingId) {
  console.log(
    `=== SERVICE: Getting tracking data for training ${trainingId} ===`
  );
  try {
    const response = await apiClient(
      `${apiBaseUrl}/trainingsTracking/${trainingId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Training tracking data response:", response);
    return response;
  } catch (error) {
    console.error("Failed to fetch training tracking data:", error);
    throw error;
  }
}
