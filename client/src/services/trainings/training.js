"use client";
import { apiClient } from "@/hooks/apiClient";
import { apiBaseUrl } from "@/utils/constants";

export async function createTraining(trainingData) {
  try {
    const response = await apiClient(`${apiBaseUrl}/trainings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trainingData),
    });
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to create training");
  }
}
export async function createBootcamp(formData) {
  try {
    // Since this is a server action, we can directly call your backend API
    const response = await apiClient(
      `${apiBaseUrl}/trainings/bootcamp/create`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );
    console.log("Bootcamp creation response:", response);

    if (!response.ok) {
      throw new Error(response.message || "Failed to create bootcamp");
    }

    return {
      success: true,
      data: response.data,
      message: "Bootcamp created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to create bootcamp",
    };
  }
}

// services/trainings/training.js
export async function updateBootcamp(id, formData) {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/trainings/bootcamp/update/${id}`,
      {
        method: "PUT",
        body: formData,
        credentials: "include",
      }
    );
    console.log("Bootcamp update response:", response);

    if (!response.ok) {
      throw new Error(response.message || "Failed to update bootcamp");
    }

    return {
      success: true,
      data: response.data,
      message: "Bootcamp updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to update bootcamp",
    };
  }
}
export async function getTrainings({
  type,
  status,
  cohorts,
  page = 1,
  limit = 10,
}) {
  try {
    const queryParams = new URLSearchParams();
    if (type) queryParams.append("type", type);
    if (status) queryParams.append("status", status);
    if (cohorts && cohorts !== "all") queryParams.append("cohorts", cohorts);
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    const response = await apiClient(
      `${apiBaseUrl}/trainings?${queryParams.toString()}`
    );
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch trainings");
  }
}
export async function updateTraining(trainingId, trainingData) {
  try {
    const response = await apiClient(`${apiBaseUrl}/trainings/${trainingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trainingData),
    });
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to update training");
  }
}

export async function getTrainingById(trainingId) {
  try {
    const response = await apiClient(`${apiBaseUrl}/trainings/${trainingId}`);
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch training");
  }
}

export async function approveTrainingRequest(trainingId, approvalData) {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/trainings/${trainingId}/approve`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(approvalData),
        credentials: "include",
      }
    );
    return response;
  } catch (error) {
    console.error("Error approving training:", error);
    throw new Error(
      error.message || "An error occurred while approving the training request"
    );
  }
}

export async function rejectTrainingRequest(trainingId, rejectionData) {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/trainings/${trainingId}/reject`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rejectionData),
        credentials: "include",
      }
    );
    return response;
  } catch (error) {
    console.error("Error rejecting training:", error);
    throw new Error(
      error.message || "An error occurred while rejecting the training request"
    );
  }
}
// Region-related services
export async function getParticipantRegion() {
  try {
    const response = await apiClient(`${apiBaseUrl}/accepted-participants/me`);
    return response.data.region;
  } catch (error) {
    console.error("Failed to fetch participant region:", error);
    throw new Error(error.message || "Failed to fetch region information");
  }
}

export async function getMentorTrainings() {
  try {
    const response = await apiClient(`${apiBaseUrl}/trainings/mentor`, {
      method: "GET",
    });
    return {
      data: Array.isArray(response.data) ? response.data : [],
      ...response, // Preserve other response properties
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch mentor trainings"
    );
  }
}
