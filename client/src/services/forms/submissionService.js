"use client";
import { apiClient } from "../../hooks/apiClient";
import { apiBaseUrl } from "../../utils/constants";

export const getFormSubmissions = async (formId, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      sortField: params.sortField || "createdAt",
      sortOrder: params.sortOrder || "desc",
    }).toString();

    const response = await apiClient(
      `${apiBaseUrl}/submissions/form/${formId}?${queryParams}`,
      { method: "GET" }
    );

    if (response?.success) {
      return {
        data: response.data,
        pagination: response.pagination,
        sort: response.sort,
      };
    }

    return { data: [], pagination: null };
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return { data: [], pagination: null };
  }
};

// Ajoutez aussi ces fonctions supplémentaires pour la gestion des statuts
export const updateSubmissionStatus = async (submissionId, newStatus) => {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/submissions/${submissionId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      }
    );

    return response; // ✅ No need to check response.success
  } catch (error) {
    console.error("Erreur de mise à jour du statut :", error.message);
    throw error; // ✅ Propagate the backend error
  }
};

export const getSubmissionStatistics = async (formId) => {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/candidatures/${formId}/submissions/stats`,
      {
        method: "GET",
      }
    );

    return response?.success ? response.data : {};
  } catch (error) {
    console.error("Erreur de récupération des stats :", error.message);
    return {};
  }
};
// submissionService.js
export const leaveFeedbackOnSubmission = async (submissionId, content) => {
  const response = await apiClient(
    `${apiBaseUrl}/submissions/${submissionId}/feedback`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    }
  );
  return response.feedbacks;
};

export const changeSubmissionStatus = async (submissionId, newStatus) => {
  const response = await apiClient(
    `${apiBaseUrl}/submissions/${submissionId}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    }
  );
  return response;
};

export const addOrUpdatePreselectionEvaluation = async (
  submissionId,
  evaluationText
) => {
  return apiClient(`${apiBaseUrl}/submissions/${submissionId}/evaluate`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ evaluation: evaluationText.toLowerCase() }),
  });
};

export async function validatePreselectionSubmissions(submissionIds) {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/submissions/validate-preselection`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionIds }),
      }
    );

    return response;
  } catch (error) {
    // Re-throw the error with proper structure so the caller can access it
    throw error;
  }
}

// services/submissions/submissionServices.js
export const getAcceptedSubmissions = async (regionId, params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient(
      `${apiBaseUrl}/submissions/accepted/${regionId}?${queryParams}`
    );

    return {
      data: response.data || [],
      pagination: response.pagination || { total: 0 },
    };
  } catch (error) {
    console.error("Error fetching accepted submissions:", error);
    return {
      data: [],
      pagination: { total: 0 },
    };
  }
};

export const updateAttendanceStatus = async (submissionId, status) => {
  try {
    const response = await apiClient.patch(
      `${apiBaseUrl}/submissions/${submissionId}/attendance`,
      { status }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating attendance status:", error);
    throw error;
  }
};
export const validatePostCreathonSubmissions = async (submissionIds) => {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/submissions/validate-after-creathon`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionIds: submissionIds,
        }),
      }
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to validate submissions");
    }

    return {
      success: true,
      data: response.data,
      message: response.message,
      totalProcessed: response.totalProcessed,
      successfulCount: response.successfulCount,
      failedCount: response.failedCount,
      results: response.results,
    };
  } catch (error) {
    console.error("Validation error:", error);
    throw new Error(error.message || "Failed to validate submissions");
  }
};

// services/forms/formServices.js
export const getFormsRegions = async () => {
  try {
    const response = await apiClient(`${apiBaseUrl}/regions/open`, {
      method: "GET",
    });
    console.log("response front", response);
    if (response?.success) {
      return { data: response.data, success: true };
    }
    return { data: [], success: false };
  } catch (error) {
    console.error("Error fetching form regions:", error);
    toast.error("Failed to load regions");
    return { data: [], success: false };
  }
};

export const getOpenRegionForms = async (regionId, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      sortField: params.sortField || "createdAt",
      sortOrder: params.sortOrder || "desc",
    }).toString();
    const response = await apiClient(
      `${apiBaseUrl}/submissions/region/${regionId}?${queryParams}`,
      {
        method: "GET",
      }
    );
    if (response?.success) {
      return {
        data: response.data,
        pagination: response.pagination,
        sort: response.sort,
      };
    }

    return { data: [], pagination: null };
  } catch (error) {
    console.error("Error fetching open forms:", error);
    return [];
  }
};
export const getAcceptedRegionForms = async (regionId, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      sortField: params.sortField || "createdAt",
      sortOrder: params.sortOrder || "desc",
    }).toString();
    const response = await apiClient(
      `${apiBaseUrl}/submissions/accepted/${regionId}?${queryParams}`,
      {
        method: "GET",
      }
    );
    if (response?.success) {
      return {
        data: response.data,
        pagination: response.pagination,
        sort: response.sort,
      };
    }

    return { data: [], pagination: null };
  } catch (error) {
    console.error("Error fetching open forms:", error);
    return [];
  }
};

// services/forms/submissionService.js
export const confirmAttendance = async (submissionId, attendanceStatus) => {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/submissions/${submissionId}/attendance`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceStatus }),
      }
    );

    // Ensure the response contains the updated submission
    return {
      success: true,
      message: "Le status de présence a été mis à jour avec succès.",
      submission: response, // This should be the full updated submission document
    };
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const getCreathonSubmissionsForMentor = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient(
      `${apiBaseUrl}/mentors/submissions?${queryParams}`,
      {
        method: "GET",
      }
    );
    if (response?.success) {
      return {
        data: response.data,
        pagination: response.pagination,
        sort: response.sort,
      };
    }

    return { data: [], pagination: null };
  } catch (error) {
    console.error("Error fetching submissions for mentor:", error);
    return { data: [], pagination: null };
  }
};

export const addMentorEvaluation = async (submissionId, evaluationData) => {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/mentors/submissions/${submissionId}/evaluations`,
      {
        method: "POST",
        body: JSON.stringify(evaluationData),
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding mentor evaluation:", error);
    throw error;
  }
};

export const addMentorFeedback = async (submissionId, feedbackData) => {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/mentors/submissions/${submissionId}/feedback`,
      {
        method: "POST",
        body: JSON.stringify(feedbackData),
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding mentor feedback:", error);
    throw error;
  }
};

export const withdrawCandidate = async (submissionId, note = "") => {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/submissions/${submissionId}/withdraw`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }), // Add note to the request body
      }
    );

    return {
      success: true,
      message: response.message || "Candidate withdrawn successfully",
      submission: response.data,
    };
  } catch (error) {
    console.error("Error withdrawing candidate:", error);
    throw {
      success: false,
      message: error.response?.data?.message || "Failed to withdraw candidate",
    };
  }
};

export const getReplacementCandidates = async (formId, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      sortField: params.sortField || "createdAt",
      sortOrder: params.sortOrder || "desc",
    }).toString();

    const response = await apiClient(
      `${apiBaseUrl}/submissions/${formId}/replacement-candidates?${queryParams}`,
      {
        method: "GET",
      }
    );

    if (response?.success) {
      return {
        data: response.data,
        pagination: response.pagination,
        sort: response.sort,
      };
    }

    return { data: [], pagination: null };
  } catch (error) {
    console.error("Error fetching replacement candidates:", error);
    return { data: [], pagination: null };
  }
};

export const selectReplacementCandidate = async (submissionId, note = "") => {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/submissions/${submissionId}/select-replacement`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      }
    );

    return {
      success: true,
      message:
        response.message || "Replacement candidate selected successfully",
      submission: response.data,
    };
  } catch (error) {
    console.error("Error selecting replacement candidate:", error);
    throw {
      success: false,
      message:
        error.response?.data?.message ||
        "Failed to select replacement candidate",
    };
  }
};
