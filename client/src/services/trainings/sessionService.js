import { apiClient } from "@/hooks/apiClient";
import { apiBaseUrl } from "@/utils/constants";
// Get training attendance
export const getTrainingAttendance = async (trainingId) => {
  return  apiClient(`${apiBaseUrl}/trainingsTracking/${trainingId}/attendance`);
  
};

// Save attendance for a day
export const saveAttendanceForDay = async (trainingId, day, attendance) => {
  const response = await apiClient(`${apiBaseUrl}/trainingsTracking/${trainingId}/attendance`,  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify( {
    day,
    attendance,
    trainingId
  })
  }
    
   );
  return response.data;
};
// Get sessions for a training
export const getTrainingSessions = async (trainingId) => {
  return apiClient(`${apiBaseUrl}/trainingsTracking/getSession/${trainingId}`);
};

// Create a new session
export const createTrainingSession = async (sessionData) => {
  return apiClient(`${apiBaseUrl}/trainingsTracking/createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sessionData)
  });
};

// Update a session
export const updateTrainingSession = async (sessionId, sessionData) => {
  return apiClient(`${apiBaseUrl}/trainingsTracking/sessions/${sessionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sessionData)
  });
};

// Delete a session
export const deleteTrainingSession = async (sessionId) => {
  return apiClient(`${apiBaseUrl}/trainingsTracking/sessions/${sessionId}`, {
    method: "DELETE"
  });
};

// Fetch participants by cohort
export const fetchCohortParticipants = async (trainingId, cohortName) => {
  return apiClient(
    `${apiBaseUrl}/accepted-participants/by-cohort?trainingId=${trainingId}&cohortName=${encodeURIComponent(cohortName)}&page=1&limit=100`
  );
};

// Save attendance
export const saveSessionAttendance = async (sessionId, attendanceStatus) => {
  return apiClient(`${apiBaseUrl}/trainingsTracking/sessions/${sessionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attendance: attendanceStatus })
  });
};