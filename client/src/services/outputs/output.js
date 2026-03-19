// services/outputService.js
import { apiBaseUrl } from "@/utils/constants";
import { apiClient } from "@/hooks/apiClient";
// services/outputs/output.js - Fixed Frontend Service
export async function createTrainingOutput(
  trainingId,
  outputData,
  attachments = []
) {
  const formData = new FormData();

  // Append the training ID only once
  formData.append("trainingId", trainingId);

  // Append all other output data
  Object.entries(outputData).forEach(([key, value]) => {
    // Skip trainingId since we already added it
    if (key === "trainingId") return;

    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === "object" && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  });

  // Append attachments
  attachments.forEach((file) => {
    formData.append("attachments", file);
  });

  // Debug: Log form data entries
  console.log("FormData entries:");
  for (let [key, value] of formData.entries()) {
    console.log(key, value instanceof File ? value.name : value);
  }

  try {
    const response = await fetch(`${apiBaseUrl}/outputs`, {
      method: "POST",
      body: formData,
    });

    return response;
  } catch (error) {
    console.error("Error creating output:", error);
    throw error;
  }
}
export async function getTrainingOutputs(trainingId) {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/outputs/training/${trainingId}`,
      {
        method: "GET",
      }
    );

    return {
      data: Array.isArray(response.data) ? response.data : [],
      stats: response.stats || { total: 0, submitted: 0, approved: 0 },
      ...response,
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch training outputs"
    );
  }
}

// Add this function to your outputs service file (@/services/outputs/output.js)

// Add these functions to your outputs service file (@/services/outputs/output.js)

export async function getMentorSubmissions(params = {}) {
  try {
    const queryParams = new URLSearchParams();

    if (params.status && params.status !== "all") {
      queryParams.append("status", params.status);
    }

    if (params.search) {
      queryParams.append("search", params.search);
    }

    if (params.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }

    if (params.sortOrder) {
      queryParams.append("sortOrder", params.sortOrder);
    }

    // Add training filter support
    if (params.trainingId && params.trainingId !== "all") {
      queryParams.append("trainingId", params.trainingId);
    }

    const queryString = queryParams.toString();
    const url = `${apiBaseUrl}/outputs/mentor/submissions${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await apiClient(url, {
      method: "GET",
    });

    return {
      data: Array.isArray(response.data) ? response.data : [],
      stats: response.stats || {
        total: 0,
        submitted: 0,
        approved: 0,
        draft: 0,
        overdue: 0,
      },
      ...response,
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch mentor submissions"
    );
  }
}

// Alternative function specifically for getting submissions by training ID
export async function getMentorSubmissionsByTraining(trainingId, params = {}) {
  try {
    const queryParams = new URLSearchParams();

    if (params.status && params.status !== "all") {
      queryParams.append("status", params.status);
    }

    if (params.search) {
      queryParams.append("search", params.search);
    }

    if (params.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }

    if (params.sortOrder) {
      queryParams.append("sortOrder", params.sortOrder);
    }

    const queryString = queryParams.toString();
    const url = `${apiBaseUrl}/outputs/mentor/submissions/${trainingId}${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await apiClient(url, {
      method: "GET",
    });

    return {
      data: Array.isArray(response.data) ? response.data : [],
      stats: response.stats || {
        total: 0,
        submitted: 0,
        approved: 0,
        draft: 0,
        overdue: 0,
      },
      training: response.training || null,
      ...response,
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch training submissions"
    );
  }
}
export async function getOutputDetails(outputId) {
  try {
    const response = await apiClient(`${apiBaseUrl}/outputs/${outputId}`, {
      method: "GET",
    });

    return {
      data: response.data || null,
      participants: Array.isArray(response.participants)
        ? response.participants
        : [],
      stats: response.stats || { total: 0, submitted: 0, approved: 0 },
      ...response,
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch output details"
    );
  }
}

export async function deleteTrainingOutput(outputId) {
  try {
    const response = await apiClient(`${apiBaseUrl}/outputs/${outputId}`, {
      method: "DELETE",
    });

    return {
      success: response.success || false,
      message: response.message || "Output deleted successfully",
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete training output"
    );
  }
}

// Participant Output Services

export async function evaluateParticipantOutput(
  participantOutputId,
  evaluationData
) {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/outputs/evaluate/${participantOutputId}`, // ID in URL
      {
        method: "PUT",
        body: JSON.stringify(evaluationData), // { approved, feedback } in body
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.success) {
      throw new Error(response.message || "Evaluation failed");
    }

    return response;
  } catch (error) {
    console.error("Evaluation error:", error);
    throw error;
  }
}

export async function addSubmissionComment(participantOutputId, comment) {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/outputs/comments/${participantOutputId}/`,
      {
        method: "POST",
        body: JSON.stringify({ comment }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: response,
      message: "Comment added successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to add comment",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    };
  }
}

export async function getParticipantOutputs(participantId, trainingId) {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/participants/${participantId}/outputs?trainingId=${trainingId}`,
      {
        method: "GET",
      }
    );

    return {
      data: Array.isArray(response.data) ? response.data : [],
      ...response,
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch participant outputs"
    );
  }
}

// Statistics Services
export async function getOutputStatistics(trainingId) {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/outputs/statistics/${trainingId}`,
      {
        method: "GET",
      }
    );

    return {
      data: response.data || {},
      ...response,
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch output statistics"
    );
  }
}

// participant services
// Get all outputs for the current participant
export async function getMyOutputs(params = {}) {
  try {
    const searchParams = new URLSearchParams();

    if (params.trainingId) searchParams.append("trainingId", params.trainingId);
    if (params.status) searchParams.append("status", params.status);
    if (params.search) searchParams.append("search", params.search);

    const queryString = searchParams.toString();
    const url = `${apiBaseUrl}/outputs/participant/my-outputs${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await apiClient(url, {
      method: "GET",
    });
    console.log("response for the get My Output", response);
    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
      stats: response.stats || {
        total: 0,
        notStarted: 0,
        submitted: 0,
        approved: 0,
        overdue: 0,
      },
      participant: response.participant || null,
      ...response,
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch participant outputs"
    );
  }
}

// Get specific output details for participant
export async function getParticipantOutputDetails(outputId) {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/outputs/participant/${outputId}/details`,
      {
        method: "GET",
      }
    );

    return {
      success: true,
      data: response.data || null,
      ...response,
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch output details"
    );
  }
}

// Submit participant output
export async function submitParticipantOutput(
  outputId,
  { notes, attachments = [] }
) {
  console.log("Notes:", notes);
  const formData = new FormData();
  console.log("formData", formData);
  // Safely append notes if it exists
  if (notes) {
    formData.append("notes", notes);
    console.log("formData with notes", formData);
  }

  // Append files if they exist
  if (attachments && attachments.length > 0) {
    attachments.forEach((file) => {
      formData.append("attachments", file);
    });
  }

  try {
    const response = await fetch(`${apiBaseUrl}/outputs/${outputId}/submit`, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header - let the browser set it with boundary
      headers: {
        Accept: "application/json",
      },
    });

    return {
      success: true,
      data: response,
      message: response.message || "Output submitted successfully",
    };
  } catch (error) {
    throw new Error(error.message || "Failed to submit output");
  }
} // Update participant submission (for resubmissions)
export async function updateParticipantSubmission(
  outputId,
  submissionData,
  attachments = []
) {
  const formData = new FormData();
  // Append submission data
  Object.entries(submissionData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  // Append attachments
  attachments.forEach((file) => {
    formData.append("attachments", file);
  });

  try {
    const response = await apiClient(
      `${apiBaseUrl}/outputs/participant/${outputId}/update-submission`,
      {
        method: "PUT",
        body: formData,
      }
    );

    return {
      success: true,
      data: response.data,
      message: response.message || "Submission updated successfully",
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update submission"
    );
  }
}

// Add comment to output (for discussions)
export async function addParticipantComment(participantOutputId, commentData) {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/outputs/comments/${participantOutputId}`,
      {
        method: "POST",
        body: JSON.stringify(commentData),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: response.data,
      message: response.message || "Comment added successfully",
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to add comment");
  }
}

// Get participant's trainings for filtering
export async function getParticipantTrainings() {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/participants/my-trainings`,
      {
        method: "GET",
      }
    );

    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
      ...response,
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch participant trainings"
    );
  }
}
