// services/mentors/mentorService.js
"use client";
import { apiClient } from "@/hooks/apiClient";
import { apiBaseUrl } from "@/utils/constants";

// Update mentor profile
export async function updateMentorProfile(formData) {
  try {
    const response = await apiClient(`${apiBaseUrl}/mentors/profile`, {
      method: "PUT",
      body: JSON.stringify(formData), // Send FormData directly
      // Don't set Content-Type header - let the browser set it
    });

    if (!response.success) {
      throw new Error(response.message || "Failed to update mentor profile");
    }
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Failed to update mentor profile");
  }
}
// Upload mentor files (CV, ID document)
export async function uploadMentorFiles(files) {
  try {
    const formData = new FormData();

    if (files.cv) {
      formData.append("cv", files.cv, files.cv.name);
    }

    if (files.idDocument) {
      formData.append("idDocument", files.idDocument, files.idDocument.name);
    }

    const response = await apiClient(`${apiBaseUrl}/mentors/upload`, {
      method: "POST",
      body: formData,
    });

    // apiClient usually wraps the response, so let's check response.success & response.data instead of status or message fields
    if (!response.success) {
      throw new Error(response.message || "Upload failed");
    }

    return response.data; // return the updated mentor profile object
  } catch (error) {
    console.error("File upload failed:", error);
    throw new Error(error.message || "Failed to upload files");
  }
}

// Update mentor status (accept/decline invitation)
export async function updateMentorStatus(status) {
  try {
    const response = await apiClient(`${apiBaseUrl}/mentors/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to update mentor status");
  }
}

// Get mentors for a specific creathon (admin/coordinator use)
export async function getMentorsByCreathon(creathonId) {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/mentors/creathon/${creathonId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch mentors");
  }
}

// Validate mentor account (admin/coordinator use)
export async function validateMentorAccount(mentorId, accountStatus) {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/mentors/${mentorId}/validate`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountStatus }),
      }
    );
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to validate mentor account");
  }
}

export async function fetchMentorProfile() {
  try {
    const response = await apiClient(`${apiBaseUrl}/mentors/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Mentor profile response:", response);
    if (response?.success) {
      return response;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch mentor profile:", error);
    return null;
  }
}
// Add this new function to check mentor status
export async function checkMentorStatus() {
  try {
    const response = await apiClient(`${apiBaseUrl}/mentors/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to check mentor status");
  }
}

export async function getMentorProfile() {
  try {
    const response = await apiClient(`${apiBaseUrl}/mentors/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.requiresProfileCreation) {
      return { requiresProfileCreation: true };
    }

    return response;
  } catch (error) {
    // Handle 404 as a profile creation case
    if (error.message.includes("not found")) {
      return { requiresProfileCreation: true };
    }
    throw error;
  }
}

export async function createMentorProfile(profileData) {
  try {
    const response = await apiClient(`${apiBaseUrl}/mentors/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to create mentor profile");
  }
}

export async function getMentorFiles() {
  try {
    const response = await apiClient(`${apiBaseUrl}/mentors/files`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch mentor files");
  }
}

// Delete mentor file - New function to remove uploaded files
export async function deleteMentorFile(fileType) {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/mentors/files/${fileType}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to delete file");
  }
}

// Get all mentors (admin/coordinator use)
export async function getAllMentors() {
  try {
    const response = await apiClient(`${apiBaseUrl}/mentors`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch mentors");
  }
}
