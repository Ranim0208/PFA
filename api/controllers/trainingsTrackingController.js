import Session from "../models/Session.js";
import User from "../models/User.js";
import Training from "../models/Training.js";
import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import Region from "../models/region.js";
import TrainingOutput from "../models/TrainingOutput.js";
import AcceptedParticipant from "../models/AcceptedParticipant.js";
import ParticipantOutput from "../models/ParticipantOutput.js";

// Create a new session
export const createSession = async (req, res) => {
  console.log("Received session creation request:", req.body);

  try {
    const {
      trainingId,
      trainingTitle,
      participantId,
      participantName,
      date,
      startTime,
      endTime,
      cohort,
      // day
    } = req.body;
// Check if session already exists
    const existingSession = await Session.findOne({ 
      trainingId, 
      participantId, 
      // day 
    });

    if (existingSession) {
      return res.status(409).json({
        success: false,
        message: "Session already exists",
      });
    }
    // Validate required fields with detailed checks
    const missingFields = [];
    if (!trainingId || trainingId.trim() === "")
      missingFields.push("trainingId");
    if (!participantId || participantId.trim() === "")
      missingFields.push("participantId");
    if (!date || date.trim() === "") missingFields.push("date");
    if (!startTime || startTime.trim() === "") missingFields.push("startTime");
    if (!endTime || endTime.trim() === "") missingFields.push("endTime");
    if (!cohort || cohort.trim() === "") missingFields.push("cohort");

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    // Log each field value
    console.log("Field values:", {
      trainingId,
      participantId,
      date,
      startTime,
      endTime,
      cohort,
    });

    // Create new session
    const newSession = new Session({
      trainingId,
      trainingTitle,
      participantId,
      participantName,
      date: new Date(date),
      startTime,
      endTime,
      cohort,
      // day
    });

    console.log("Saving session to database...");
    await newSession.save();
    console.log("Session saved successfully");

    res.status(201).json({
      success: true,
      message: "Session created successfully",
      session: newSession,
    });
  } catch (error) {
    console.error("Error creating session:");
    console.error("Error Type:", error.name);
    console.error("Error Message:", error.message);

    if (error.name === "ValidationError") {
      console.error("Validation Errors:", error.errors);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    if (error.name === "CastError") {
      console.error("Cast Error:", error);
      return res.status(400).json({
        success: false,
        message: `Invalid data format: ${error.message}`,
      });
    }

    console.error("Stack Trace:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};
// Get sessions by training ID
export const getSessionsByTraining = async (req, res) => {
  console.log(
    `[${new Date().toISOString()}] Received request for sessions of training: ${
      req.params.trainingId
    }`
  );

  try {
    const { trainingId } = req.params;
    console.log(`Processing sessions request for training ID: ${trainingId}`);

    // Validate training ID
    if (!mongoose.Types.ObjectId.isValid(trainingId)) {
      console.error(`Invalid training ID format: ${trainingId}`);
      return res.status(400).json({
        success: false,
        message: "Invalid training ID format",
      });
    }

    console.log(`Querying sessions for training: ${trainingId}`);
    const sessions = await Session.find({ trainingId }).sort({ date: 1 });

    console.log(
      `Found ${sessions.length} sessions for training: ${trainingId}`
    );
    if (sessions.length > 0) {
      console.log(`Sample session:`, {
        id: sessions[0]._id,
        date: sessions[0].date,
        participant: sessions[0].participantName,
      });
    }

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error fetching sessions for training ${
        req.params.trainingId
      }:`
    );
    console.error("Error Type:", error.name);
    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);

    // Handle specific error types
    if (error.name === "CastError") {
      console.error("Cast Error Details:", error.path, error.kind, error.value);
      return res.status(400).json({
        success: false,
        message: `Invalid data format: ${error.message}`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

// Get participants for a cohort
export const getParticipantsByCohort = async (req, res) => {
  try {
    const { trainingId, cohortName } = req.query;

    // Validate parameters
    if (!trainingId || !cohortName) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required parameters" });
    }

    // Find training
    const training = await Training.findById(trainingId);
    if (!training) {
      return res
        .status(404)
        .json({ success: false, message: "Training not found" });
    }

    // Check if cohort exists in training
    if (!training.cohorts.includes(cohortName)) {
      return res
        .status(404)
        .json({ success: false, message: "Cohort not found in this training" });
    }

    // Find participants (mock implementation - replace with your actual logic)
    const participants = await User.find({
      role: "participant",
      cohort: cohortName,
    }).select("firstName lastName email phone");

    res.status(200).json({
      success: true,
      participants,
    });
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getParticipantsAttendanceByRegion = async (req, res) => {
  try {
    const { regionId } = req.params;
    console.log(
      `[getParticipantsAttendanceByRegion] Received request with regionId: ${regionId}`
    );

    // Validate regionId
    if (!mongoose.Types.ObjectId.isValid(regionId)) {
      console.error(
        `[getParticipantsAttendanceByRegion] Invalid regionId: ${regionId}`
      );
      return res
        .status(400)
        .json({ success: false, message: "Invalid region ID" });
    }
    console.log(
      `[getParticipantsAttendanceByRegion] Valid regionId: ${regionId}`
    );

    // Find the region to get the cohort name
    console.log(
      `[getParticipantsAttendanceByRegion] Fetching region with ID: ${regionId}`
    );
    const region = await Region.findById(regionId).select("name");
    if (!region) {
      console.error(
        `[getParticipantsAttendanceByRegion] Region not found for ID: ${regionId}`
      );
      return res
        .status(404)
        .json({ success: false, message: "Region not found" });
    }
    const cohortName = `${region.name.fr} / ${region.name.ar}`;
    console.log(
      `[getParticipantsAttendanceByRegion] Constructed cohortName: ${cohortName}`
    );

    // Find participants in the region
    console.log(
      `[getParticipantsAttendanceByRegion] Fetching participants for region: ${regionId}`
    );
    const participants = await AcceptedParticipant.find({ region: regionId })
      .populate("user", "firstName lastName")
      .select("user");
    if (!participants.length) {
      console.warn(
        `[getParticipantsAttendanceByRegion] No participants found for region: ${regionId}`
      );
      return res
        .status(404)
        .json({
          success: false,
          message: "No participants found in this region",
        });
    }
    console.log(
      `[getParticipantsAttendanceByRegion] Found ${participants.length} participants:`,
      JSON.stringify(
        participants.map((p) => ({
          id: p.user._id,
          name: `${p.user.firstName} ${p.user.lastName}`,
        })),
        null,
        2
      )
    );

    // Find trainings for the cohort
    console.log(
      `[getParticipantsAttendanceByRegion] Fetching trainings for cohort: ${cohortName}`
    );
    const trainings = await Training.find({ cohorts: cohortName })
      .select("_id title startDate endDate type duration")
      .sort({ startDate: 1 });
    if (!trainings.length) {
      console.warn(
        `[getParticipantsAttendanceByRegion] No trainings found for cohort: ${cohortName}`
      );
      return res
        .status(404)
        .json({
          success: false,
          message: "No trainings found for this cohort",
        });
    }
    console.log(
      `[getParticipantsAttendanceByRegion] Found ${trainings.length} trainings:`,
      JSON.stringify(trainings, null, 2)
    );

    // Filter and log bootcamp trainings specifically
    const bootcampTrainings = trainings.filter((t) => t.type === "bootcamp");
    console.log(
      `[getParticipantsAttendanceByRegion] Found ${bootcampTrainings.length} bootcamp trainings:`,
      JSON.stringify(bootcampTrainings, null, 2)
    );

    // Find sessions for the trainings and participants
    const participantIds = participants.map((p) => p._id);
    console.log(
      `[getParticipantsAttendanceByRegion] Fetching sessions for ${participantIds.length} participants and ${trainings.length} trainings`
    );
    const sessions = await Session.find({
      trainingId: { $in: trainings.map((t) => t._id) },
      participantId: { $in: participantIds },
      cohort: cohortName,
    }).select("trainingId participantId attendance day");
    console.log(
      `[getParticipantsAttendanceByRegion] Found ${sessions.length} sessions:`,
      JSON.stringify(sessions, null, 2)
    );

    // Log sessions related to bootcamp trainings
    const bootcampSessions = sessions.filter((s) =>
      bootcampTrainings.some(
        (t) => t._id.toString() === s.trainingId.toString()
      )
    );
    console.log(
      `[getParticipantsAttendanceByRegion] Found ${bootcampSessions.length} sessions for bootcamp trainings:`,
      JSON.stringify(bootcampSessions, null, 2)
    );

    // Build attendance data
    console.log(
      `[getParticipantsAttendanceByRegion] Building attendance data for ${participants.length} participants`
    );
    const attendance = participants.map((participant, index) => {
      console.log(
        `[getParticipantsAttendanceByRegion] Processing participant ${
          index + 1
        }/${participants.length}: ${participant.user.firstName} ${
          participant.user.lastName
        }`
      );

      const participantAttendance = trainings.map((training, tIndex) => {
        const trainingSessions = sessions.filter(
          (s) =>
            s.trainingId.toString() === training._id.toString() &&
            s.participantId.toString() === participant._id.toString()
        );
        console.log(
          `[getParticipantsAttendanceByRegion] Found ${trainingSessions.length} sessions for participant ${participant.user.firstName} ${participant.user.lastName} in training ${training.title}:`,
          JSON.stringify(trainingSessions, null, 2)
        );

        if (training.type === "bootcamp") {
          // For bootcamps, use duration to determine number of days
          const numDays = training.duration || 1; // Fallback to 1 if duration is missing
          const days = [];
          console.log(
            `[getParticipantsAttendanceByRegion] Processing bootcamp ${training.title} with duration ${numDays} days`
          );
          for (let day = 1; day <= numDays; day++) {
            console.log("trainingSession" + trainingSessions);
            const session = trainingSessions.find((s) => s.day === day);
            const status = session ? session.attendance : "absent";
            console.log(
              `[getParticipantsAttendanceByRegion] Participant: ${
                participant.user.firstName
              } ${participant.user.lastName}, Training: ${
                training.title
              }, Day: ${day}, Status: ${status}, Session found: ${!!session}`
            );
            days.push({
              day,
              status,
            });
          }
          console.log(
            `[getParticipantsAttendanceByRegion] Days array for ${training.title} for ${participant.user.firstName} ${participant.user.lastName}:`,
            JSON.stringify(days, null, 2)
          );
          return {
            trainingId: training._id,
            type: training.type,
            days,
          };
        } else {
          // For mentoring/formation, single session
          const session = trainingSessions[0]; // Take first session (if exists)
          const status = session ? session.attendance : "absent";
          console.log(
            `[getParticipantsAttendanceByRegion] Participant: ${
              participant.user.firstName
            } ${participant.user.lastName}, Training: ${
              training.title
            }, Status: ${status}, Session found: ${!!session}`
          );
          return {
            trainingId: training._id,
            type: training.type,
            status,
          };
        }
      });

      return {
        participantId: participant._id,
        attendance: participantAttendance,
      };
    });

    // Format response
    console.log(`[getParticipantsAttendanceByRegion] Formatting response`);
    const response = {
      success: true,
      data: {
        participants: participants.map((p) => ({
          id: p._id,
          name: `${p.user.firstName} ${p.user.lastName}`,
        })),
        trainings: trainings.map((t) => ({
          _id: t._id,
          title: t.title,
          startDate: t.startDate,
          endDate: t.endDate,
          type: t.type,
          duration: t.duration, // Include duration for bootcamps
        })),
        attendance,
      },
    };
    console.log(
      `[getParticipantsAttendanceByRegion] Response prepared: ${JSON.stringify(
        response,
        null,
        2
      )}`
    );

    res.status(200).json(response);
  } catch (error) {
    console.error(
      `[getParticipantsAttendanceByRegion] Error: ${error.message}`,
      {
        stack: error.stack,
        regionId: req.params.regionId,
      }
    );
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Save attendance for a specific day
export const saveAttendanceForDay = async (req, res) => {
  console.log("[saveAttendanceForDay] Received request to save attendance");
  console.log(`[saveAttendanceForDay] Training ID: ${req.body.trainingId}`);
  console.log(`[saveAttendanceForDay] Day: ${req.body.day}`);

  try {
    const { trainingId, day, attendance } = req.body;

    console.log(
      `[saveAttendanceForDay] Received attendance data for ${
        Object.keys(attendance).length
      } participants`
    );
    console.log(
      `[saveAttendanceForDay] Sample attendance data:`,
      Object.entries(attendance)
        .slice(0, 3)
        .map(([k, v]) => ({ participantId: k, status: v }))
    );

    // Prepare bulk operations
    const bulkOps = Object.entries(attendance).map(
      ([participantId, status]) => {
        const updateDoc = {
          $set: {
            attendance: status,
            ...(status === "present" && {
              status: "confirmed",
              presenceConfirmedAt: new Date(),
            }),
          },
        };

        const filter = {
          trainingId,
          participantId,
          day: Number(day), // Ensure day is a number
        };

        console.log(
          `[saveAttendanceForDay] Preparing update for participant ${participantId}:`,
          {
            filter,
            update: updateDoc,
          }
        );

        return {
          updateOne: {
            filter,
            update: updateDoc,
          },
        };
      }
    );

    console.log(
      `[saveAttendanceForDay] Executing bulkWrite with ${bulkOps.length} operations`
    );

    // Execute bulk write
    const result = await Session.bulkWrite(bulkOps);

    console.log(`[saveAttendanceForDay] BulkWrite result:`, {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
    });

    console.log(
      `[saveAttendanceForDay] Successfully saved attendance for day ${day}`
    );

    res.status(200).json({
      success: true,
      message: "Attendance saved successfully",
      result: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error(
      "[saveAttendanceForDay] Error saving attendance:",
      error.message
    );
    console.error(error.stack);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get attendance data for a training
export const getTrainingAttendance = async (req, res) => {
  try {
    const { trainingId } = req.params;
    console.log(`[Attendance] Fetching attendance for training: ${trainingId}`);

    // Find all sessions for this training
    const sessions = await Session.find({ trainingId });
    console.log(
      `[Attendance] Found ${sessions.length} sessions for training ${trainingId}`
    );

    // Transform to { "participantId-day": "status" } format
    const attendanceMap = sessions.reduce((acc, session) => {
      const key = `${session.participantId}-${session.day}`;
      acc[key] = session.attendance;
      return acc;
    }, {});
    console.log(attendanceMap);
    res.status(200).json({
      success: true,
      attendance: attendanceMap,
    });
  } catch (error) {
    console.error(
      `[Attendance] Error for training ${trainingId}:`,
      error.message
    );
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const confirmPresence = async (req, res) => {
  const { sessionId } = req.params;
  const { signature } = req.body;

  try {
    // Validate session ID
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID format",
      });
    }

    // Validate signature
    if (!signature || !signature.startsWith("data:image/png;base64,")) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature format",
      });
    }

    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check if session can be confirmed
    if (session.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: `Session is already ${session.status}`,
      });
    }

    // Update session
    session.signature = signature;
    session.status = "confirmed";
    session.presenceConfirmedAt = new Date();

    await session.save();

    res.status(200).json({
      success: true,
      message: "Presence confirmed successfully",
      session,
    });
  } catch (error) {
    console.error("Error confirming presence:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};
export const updateSignature = async (req, res) => {
  const { sessionId } = req.params;
  const { signature } = req.body;

  try {
    // Validate session ID
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID format",
      });
    }

    // Validate signature
    if (!signature || !signature.startsWith("data:image/png;base64,")) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature format",
      });
    }

    // Find session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check if session has a signature (can only update existing signatures)
    if (!session.signature) {
      return res.status(400).json({
        success: false,
        message: "Cannot update signature - no existing signature found. Use confirm-presence endpoint instead.",
      });
    }

    // Update signature and timestamp
    session.signature = signature;
    session.signatureUpdatedAt = new Date();
    
    await session.save();

    res.status(200).json({
      success: true,
      message: "Signature updated successfully",
      session,
    });
  } catch (error) {
    console.error("Error updating signature:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};
export const getSessionsByTrainingAndUser = async (req, res) => {
  try {
    const { trainingId } = req.params;
    const userId = req.user.id; // User ID from authentication

    // Validate training ID
    if (!mongoose.Types.ObjectId.isValid(trainingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid training ID format",
      });
    }

    // Find the accepted participant document for this user
    const acceptedParticipant = await AcceptedParticipant.findOne({
      user: userId,
    });

    if (!acceptedParticipant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found",
      });
    }

    const participantId = acceptedParticipant._id;

    // Find sessions for this training and participant
    const sessions = await Session.find({
      trainingId,
      participantId,
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("Error fetching user sessions for training:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

// Update a session by ID
export const updateSession = async (req, res) => {
  console.log(
    `[${new Date().toISOString()}] Received update request for session: ${
      req.params.id
    }`
  );
  console.log("Update data:", req.body);

  try {
    const { id } = req.params;
    const {
      date,
      startTime,
      endTime,
      cohort,
      participantId,
      meetLink,
      attendance,
      signature,
    } = req.body;

    // Validate session ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid session ID format: ${id}`);
      return res.status(400).json({
        success: false,
        message: "Invalid session ID format",
      });
    }

    // Check if session exists
    const existingSession = await Session.findById(id);
    if (!existingSession) {
      console.error(`Session not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Validate input fields
    const updateData = {};
    const invalidFields = [];

    if (date && date.trim() !== "") {
      updateData.date = new Date(date);
    } else if (date !== undefined) {
      invalidFields.push("date");
    }

    if (startTime && startTime.trim() !== "") {
      updateData.startTime = startTime;
    } else if (startTime !== undefined) {
      invalidFields.push("startTime");
    }

    if (endTime && endTime.trim() !== "") {
      updateData.endTime = endTime;
    } else if (endTime !== undefined) {
      invalidFields.push("endTime");
    }

    if (cohort && cohort.trim() !== "") {
      updateData.cohort = cohort;
    } else if (cohort !== undefined) {
      invalidFields.push("cohort");
    }
    // ADD meetLink handling
    if (meetLink !== undefined) {
      // Allow empty string to clear the link
      updateData.meetLink = meetLink;
    }
    // Add attendance and signature handling
    if (attendance !== undefined) {
      updateData.attendance = attendance;
    }

    if (signature !== undefined) {
      updateData.signature = signature;
    }

    if (participantId && participantId.trim() !== "") {
      // Verify participant exists
      const participant = await User.findById(participantId);
      if (!participant || participant.role !== "participant") {
        console.error(`Invalid participant: ${participantId}`);
        return res.status(400).json({
          success: false,
          message: "Invalid participant ID",
        });
      }
      updateData.participantId = participantId;
      updateData.participantName = `${participant.firstName} ${participant.lastName}`;
    } else if (participantId !== undefined) {
      invalidFields.push("participantId");
    }

    if (invalidFields.length > 0) {
      console.error("Invalid field values:", invalidFields);
      return res.status(400).json({
        success: false,
        message: `Invalid values for fields: ${invalidFields.join(", ")}`,
        invalidFields,
      });
    }

    // Check if any data to update
    if (Object.keys(updateData).length === 0) {
      console.warn("No valid fields provided for update");
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    console.log("Updating session with data:", updateData);
    const updatedSession = await Session.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    console.log("Session updated successfully:", updatedSession);
    res.status(200).json({
      success: true,
      message: "Session updated successfully",
      session: updatedSession,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating session:`);
    console.error("Error Type:", error.name);
    console.error("Error Message:", error.message);

    if (error.name === "ValidationError") {
      console.error("Validation Errors:", error.errors);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    if (error.name === "CastError") {
      console.error("Cast Error Details:", error.path, error.kind, error.value);
      return res.status(400).json({
        success: false,
        message: `Invalid data format: ${error.message}`,
      });
    }

    console.error("Stack Trace:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

// Delete a session by ID
export const deleteSession = async (req, res) => {
  console.log(
    `[${new Date().toISOString()}] Received delete request for session: ${
      req.params.id
    }`
  );

  try {
    const { id } = req.params;

    // Validate session ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid session ID format: ${id}`);
      return res.status(400).json({
        success: false,
        message: "Invalid session ID format",
      });
    }

    // Check if session exists
    const session = await Session.findById(id);
    if (!session) {
      console.error(`Session not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    console.log("Deleting session:", {
      id: session._id,
      date: session.date,
      participant: session.participantName,
    });

    await Session.findByIdAndDelete(id);
    console.log("Session deleted successfully");

    res.status(200).json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error deleting session:`);

    console.error("Error Type:", error.name);
    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);

    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      training: req.params.trainingId,
    }).sort({ date: 1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const recordAttendance = async (req, res) => {
  try {
    const { participantId, status, notes } = req.body;

    const attendance = await Attendance.create({
      session: req.params.sessionId,
      participant: participantId,
      status,
      notes,
      recordedBy: req.user.id,
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSessionAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ session: req.params.sessionId })
      .populate("participant", "user")
      .populate("participant.user", "firstName lastName email");

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTrainingOutput = async (req, res) => {
  try {
    const { title, description, deadline, cohort, required } = req.body;

    const output = await TrainingOutput.create({
      training: req.params.trainingId,
      cohort,
      title,
      description,
      deadline,
      required: required !== false,
    });

    res.status(201).json(output);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCohortTracking = async (req, res) => {
  try {
    const { trainingId, cohort } = req.params;

    const [training, sessions, outputs] = await Promise.all([
      Training.findById(trainingId),
      Session.find({ training: trainingId, cohort }),
      TrainingOutput.find({ training: trainingId, cohort }),
    ]);

    const sessionsWithAttendance = await Promise.all(
      sessions.map(async (session) => {
        const attendance = await Attendance.find({ session: session._id })
          .populate("participant", "user")
          .populate("participant.user", "firstName lastName email");
        return {
          ...session.toObject(),
          attendance,
        };
      })
    );

    res.json({
      training,
      cohort,
      sessions: sessionsWithAttendance,
      outputs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getParticipantDashboard = async (req, res) => {
  try {
    const participantId = req.params.participantId;

    // Verify participant exists and user has access
    const participant = await AcceptedParticipant.findById(
      participantId
    ).populate("user", "firstName lastName email");

    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Get all data in parallel
    const [outputs, trainings, sessions, attendance] = await Promise.all([
      ParticipantOutput.find({ participant: participantId })
        .populate("output", "title deadline")
        .populate("training", "title"),

      Training.find({ "cohorts.participants": participantId }).select(
        "title type startDate endDate"
      ),

      Session.find({ cohort: participant.cohort }).populate(
        "training",
        "title"
      ),

      Attendance.find({ participant: participantId }).populate(
        "session",
        "date topic"
      ),
    ]);

    res.json({
      participant,
      outputs,
      trainings,
      sessions,
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all outputs for a participant
// @route   GET /api/tracking/participants/:participantId/outputs
export const getParticipantOutputs = async (req, res) => {
  try {
    const outputs = await ParticipantOutput.find({
      participant: req.params.participantId,
    })
      .populate("output", "title description deadline")
      .populate("training", "title")
      .sort({ deadline: 1 });

    res.json(outputs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit an output
// @route   PUT /api/tracking/participants/:participantId/outputs/:outputId/submit
export const submitParticipantOutput = async (req, res) => {
  try {
    const { fileUrl, notes } = req.body;

    const output = await ParticipantOutput.findOneAndUpdate(
      {
        _id: req.params.outputId,
        participant: req.params.participantId,
      },
      {
        submitted: true,
        submissionDate: new Date(),
        fileUrl,
        notes,
        status: "submitted",
      },
      { new: true }
    )
      .populate("output", "title")
      .populate("training", "title");

    if (!output) {
      return res.status(404).json({ message: "Output not found" });
    }

    res.json(output);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all trainings for a participant
// @route   GET /api/tracking/participants/:participantId/trainings
export const getParticipantTrainings = async (req, res) => {
  try {
    const trainings = await Training.find({
      "cohorts.participants": req.params.participantId,
    })
      .select("title type startDate endDate cohorts status")
      .sort({ startDate: -1 });

    res.json(trainings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sessions for a participant
// @route   GET /api/tracking/participants/:participantId/sessions
export const getParticipantSessions = async (req, res) => {
  try {
    const participant = await AcceptedParticipant.findById(
      req.params.participantId
    ).select("cohort");

    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    const sessions = await Session.find({ cohort: participant.cohort })
      .populate("training", "title")
      .sort({ date: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance records for a participant
// @route   GET /api/tracking/participants/:participantId/attendance
export const getParticipantAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({
      participant: req.params.participantId,
    })
      .populate("session", "date topic training")
      .populate("session.training", "title")
      .sort({ "session.date": -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get cohort tracking data for a participant
// @route   GET /api/tracking/participants/:participantId/cohort-tracking
export const getParticipantCohortTracking = async (req, res) => {
  try {
    const participant = await AcceptedParticipant.findById(
      req.params.participantId
    ).select("cohort user");

    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    const [training, sessions, outputs] = await Promise.all([
      Training.findOne({
        "cohorts.participants": req.params.participantId,
      }).select("title type startDate endDate"),

      Session.find({ cohort: participant.cohort }).sort({ date: 1 }),

      ParticipantOutput.find({
        participant: req.params.participantId,
      }).populate("output", "title deadline"),
    ]);

    res.json({
      participant,
      training,
      cohort: participant.cohort,
      sessions,
      outputs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewParticipantOutput = async (req, res) => {
  try {
    const { approved, feedback } = req.body;

    const output = await ParticipantOutput.findByIdAndUpdate(
      req.params.outputId,
      {
        approved,
        feedback,
        evaluatedBy: req.user.id,
        evaluatedAt: new Date(),
      },
      { new: true }
    )
      .populate("output", "title")
      .populate("participant", "user")
      .populate("participant.user", "firstName lastName");

    if (!output) {
      return res.status(404).json({ message: "Output not found" });
    }

    res.json(output);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Additional helper function to get mentor dashboard stats
export const getMentorDashboardStats = async (req, res) => {
  try {
    const mentorId = req.user.id;

    console.log("=== GET MENTOR DASHBOARD STATS ===");
    console.log("Mentor ID:", mentorId);

    // Get trainings where user is a trainer
    const trainings = await Training.find({ trainers: mentorId }).select(
      "title cohorts type startDate endDate status"
    );

    console.log("Mentor trainings:", trainings.length);

    if (trainings.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalParticipants: 0,
          activeParticipants: 0,
          completionRate: 0,
          upcomingSessions: 0,
          outputsPendingReview: 0,
          totalTrainings: 0,
          totalRegions: 0,
        },
      });
    }

    // Get cohort names (region names)
    const cohortNames = [
      ...new Set(trainings.flatMap((training) => training.cohorts || [])),
    ];

    // Get regions
    const regions = await Region.find({
      $or: [
        { "name.fr": { $in: cohortNames } },
        { "name.ar": { $in: cohortNames } },
      ],
    });

    const regionIds = regions.map((r) => r._id);

    // Get participants from these regions
    const participants = await AcceptedParticipant.find({
      region: { $in: regionIds },
    });

    const activeParticipants = participants.filter(
      (p) => p.status === "confirmed"
    ).length;
    const upcomingTrainings = trainings.filter(
      (t) => t.startDate > new Date() && t.status === "approved"
    ).length;

    const stats = {
      totalParticipants: participants.length,
      activeParticipants,
      completionRate:
        participants.length > 0
          ? Math.round((activeParticipants / participants.length) * 100)
          : 0,
      upcomingSessions: upcomingTrainings,
      outputsPendingReview: 0, // This would need to be calculated based on your output/assignment model
      totalTrainings: trainings.length,
      totalRegions: regions.length,
    };

    console.log("Dashboard stats:", stats);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("=== ERROR IN GET MENTOR DASHBOARD STATS ===");
    console.error("Error details:", error);

    res.status(500).json({
      success: false,
      message: "Error retrieving dashboard stats",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

export const getTrainingTrackingData = async (req, res) => {
  try {
    const { trainingId } = req.params;

    // Validate training ID
    if (!mongoose.Types.ObjectId.isValid(trainingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid training ID format",
      });
    }

    console.log(`Fetching tracking data for training: ${trainingId}`);

    // First get the training to check cohorts
    const training = await Training.findById(trainingId)
      .populate("componentCoordinator", "firstName lastName email")
      .populate("incubationCoordinators", "firstName lastName email")
      .populate("trainers", "firstName lastName email expertise");

    if (!training) {
      return res.status(404).json({
        success: false,
        message: "Training not found",
      });
    }

    // Process cohort names to find matching regions
    const cohortNames =
      training.cohorts?.flatMap((cohort) => {
        if (cohort.includes(" / ")) {
          return cohort.split(" / ").map((s) => s.trim());
        }
        return [cohort.trim()];
      }) || [];

    // Find matching regions if cohorts exist
    let regions = [];
    if (cohortNames.length > 0) {
      regions = await Region.find({
        $or: [
          { "name.fr": { $in: cohortNames } },
          { "name.ar": { $in: cohortNames } },
        ],
      }).select("_id");
    }

    // Fetch all data in parallel for better performance
    const [
      participants,
      sessions,
      trainingOutputs,
      participantOutputs,
      attendanceRecords,
    ] = await Promise.all([
      // Get all participants for this training based on regions
      regions.length > 0
        ? AcceptedParticipant.find({
            region: { $in: regions.map((r) => r._id) },
          })
            .populate({
              path: "user",
              select: "firstName lastName email phone",
            })
            .populate({
              path: "region",
              select: "name.fr name.ar",
            })
            .sort({ createdAt: -1 })
        : [],

      // Get all sessions for this training
      Session.find({ trainingId }).sort({ date: 1 }),

      // Get training outputs/assignments
      TrainingOutput.find({ training: trainingId }).sort({ dueDate: 1 }),

      // Get participant output submissions
      ParticipantOutput.find()
        .populate({
          path: "output",
          match: { training: trainingId },
          select: "title type dueDate description",
        })
        .populate("participant", "user")
        .populate("evaluatedBy", "firstName lastName"),

      // Get attendance data (aggregated from sessions)
      Session.aggregate([
        { $match: { trainingId: new mongoose.Types.ObjectId(trainingId) } },
        {
          $group: {
            _id: "$participantId",
            totalSessions: { $sum: 1 },
            presentSessions: {
              $sum: { $cond: [{ $eq: ["$attendance", "present"] }, 1, 0] },
            },
            sessions: {
              $push: {
                sessionId: "$_id",
                date: "$date",
                status: "$attendance",
                confirmed: "$presenceConfirmedAt",
              },
            },
          },
        },
      ]),
    ]);

    // Filter out participant outputs where output is null (not matching training)
    const validParticipantOutputs = participantOutputs.filter(
      (po) => po.output !== null
    );

    // Calculate statistics
    const stats = calculateTrainingStats({
      participants,
      sessions,
      trainingOutputs,
      participantOutputs: validParticipantOutputs,
      attendanceRecords,
    });

    // Format the response data
    const responseData = {
      training: {
        ...training.toObject(),
        progress: calculateTrainingProgress(training, sessions),
      },
      participants: formatParticipants(participants),
      sessions: formatSessions(sessions),
      outputs: {
        trainingOutputs: formatTrainingOutputs(trainingOutputs),
        participantOutputs: formatParticipantOutputs(validParticipantOutputs),
      },
      attendance: formatAttendance(attendanceRecords, participants, sessions),
      stats,
    };

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error(`Error fetching training tracking data:`, error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
}; // Helper function to calculate training statistics
function calculateTrainingStats({
  participants,
  sessions,
  trainingOutputs,
  participantOutputs,
  attendanceRecords,
}) {
  const totalParticipants = participants.length;

  // Calculate attendance rate
  const totalAttendanceRecords = attendanceRecords.reduce(
    (sum, record) => sum + record.totalSessions,
    0
  );
  const totalPresentRecords = attendanceRecords.reduce(
    (sum, record) => sum + record.presentSessions,
    0
  );
  const attendanceRate =
    totalAttendanceRecords > 0
      ? Math.round((totalPresentRecords / totalAttendanceRecords) * 100)
      : 0;

  // Calculate session completion
  const now = new Date();
  const completedSessions = sessions.filter(
    (session) => new Date(session.date) < now
  ).length;
  const totalSessions = sessions.length;

  // Calculate output completion
  const totalOutputsExpected = trainingOutputs.length * totalParticipants;
  const completedOutputs = participantOutputs.filter(
    (po) => po.submitted && po.approved
  ).length;
  const pendingOutputs = participantOutputs.filter(
    (po) => po.submitted && !po.approved
  ).length;
  const overdueOutputs = participantOutputs.filter((po) => {
    if (!po.output || !po.output.dueDate) return false;
    return !po.submitted && new Date(po.output.dueDate) < now;
  }).length;

  return {
    totalParticipants,
    attendanceRate,
    sessionsCompleted: completedSessions,
    totalSessions,
    sessionCompletionRate:
      totalSessions > 0
        ? Math.round((completedSessions / totalSessions) * 100)
        : 0,
    outputsCompleted: completedOutputs,
    outputsPending: pendingOutputs,
    outputsOverdue: overdueOutputs,
    totalOutputsExpected,
    outputCompletionRate:
      totalOutputsExpected > 0
        ? Math.round((completedOutputs / totalOutputsExpected) * 100)
        : 0,
  };
}

// Helper function to calculate training progress
function calculateTrainingProgress(training, sessions) {
  const now = new Date();
  const startDate = new Date(training.startDate);
  const endDate = new Date(training.endDate);

  if (now < startDate) {
    return { status: "upcoming", percentage: 0 };
  } else if (now > endDate) {
    return { status: "completed", percentage: 100 };
  } else {
    const totalDuration = endDate - startDate;
    const elapsed = now - startDate;
    const percentage = Math.round((elapsed / totalDuration) * 100);
    return { status: "active", percentage };
  }
}

// Helper functions to format data
function formatParticipants(participants) {
  return participants.map((participant) => ({
    _id: participant._id,
    user: {
      firstName: participant.user?.firstName || "Unknown",
      lastName: participant.user?.lastName || "User",
      email: participant.user?.email || "unknown@example.com",
      phone: participant.user?.phone,
    },
    region: participant.region?.name,
    status: participant.status || "pending",
    eventDates: participant.eventDates,
    createdAt: participant.createdAt,
  }));
}

function formatSessions(sessions) {
  return sessions.map((session) => ({
    _id: session._id,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    participantName: session.participantName,
    cohort: session.cohort,
    status: session.status,
    attendance: session.attendance,
    meetLink: session.meetLink,
    presenceConfirmedAt: session.presenceConfirmedAt,
  }));
}

function formatTrainingOutputs(trainingOutputs) {
  return trainingOutputs.map((output) => ({
    _id: output._id,
    title: output.title,
    type: output.type,
    description: output.description,
    dueDate: output.dueDate,
    status: output.status,
    createdAt: output.createdAt,
  }));
}

function formatParticipantOutputs(participantOutputs) {
  return participantOutputs.map((po) => ({
    _id: po._id,
    output: po.output,
    participant: po.participant,
    submitted: po.submitted,
    submissionDate: po.submissionDate,
    approved: po.approved,
    feedback: po.feedback,
    attachments: po.attachments,
    comments: po.comments,
    evaluatedBy: po.evaluatedBy,
    evaluatedAt: po.evaluatedAt,
  }));
}

function formatAttendance(attendanceRecords, participants, sessions) {
  const attendanceData = [];

  attendanceRecords.forEach((record) => {
    const participant = participants.find(
      (p) => p._id.toString() === record._id.toString()
    );

    record.sessions.forEach((sessionData) => {
      const session = sessions.find(
        (s) => s._id.toString() === sessionData.sessionId.toString()
      );

      attendanceData.push({
        _id: `${record._id}_${sessionData.sessionId}`,
        participantId: record._id,
        participantName: participant
          ? `${participant.user.firstName} ${participant.user.lastName}`
          : "Unknown",
        sessionId: sessionData.sessionId,
        sessionDate: sessionData.date,
        sessionTopic: session?.trainingTitle || "Unknown Session",
        status: sessionData.status,
        confirmedAt: sessionData.confirmed,
      });
    });
  });

  return attendanceData;
}
