import Training from "../models/Training.js";
import { generateTrainingCreationNotification } from "../utils/emailTemplates.js";
import sendEmail from "../utils/emailSender.js";
import User from "../models/User.js";
import Mentor from "../models/Mentor.js";
import AcceptedParticipant from "../models/AcceptedParticipant.js";
import Region from "../models/region.js";
import {
  notifyNewEvent,
  notifyPendingIncubationValidation,
  notifyReschedule,
} from "../services/notificationService.js";

export const createTraining = async (req, res) => {
  try {
    const {
      title, description, type, incubationCoordinators, trainers, time,
      duration, cohorts, maxParticipants, startDate, endDate, componentActivity,
      logisticsNeeds, travelNeeds, communicationNeeds, communicationNeedsOther,
      organizationalNeeds, requiredPartners, humanResources, materialResources,
      financialResources, highlightMoments, additionalComments, sessionType,
      meetingLink, proposedLocation,
    } = req.body;

    const componentCoordinator = req.user.id;
    const startDateObj = new Date(startDate);
    let endDateObj = endDate ? new Date(endDate) : null;
    if (duration && !endDate) {
      endDateObj = new Date(startDateObj);
      endDateObj.setDate(startDateObj.getDate() + parseInt(duration));
    }

    const newTraining = new Training({
      title, description, type, componentCoordinator,
      incubationCoordinators: incubationCoordinators || [],
      trainers: trainers || [],
      scheduledDate: startDateObj, startDate: startDateObj, endDate: endDateObj,
      time, duration: duration ? parseInt(duration) : null,
      cohorts: cohorts || [],
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      status: "pending", componentActivity,
      logisticsNeeds: logisticsNeeds || [],
      travelNeeds: travelNeeds || [],
      communicationNeeds: communicationNeeds || [],
      communicationNeedsOther, organizationalNeeds, requiredPartners,
      humanResources, materialResources: materialResources || [],
      financialResources, highlightMoments, additionalComments,
      sessionType, meetingLink, proposedLocation,
    });

    await newTraining.save();

    const creator = await User.findById(componentCoordinator).select("firstName lastName email");

    if (incubationCoordinators && incubationCoordinators.length > 0) {
      const coordinators = await User.find({ _id: { $in: incubationCoordinators } });
      await Promise.all(
        coordinators.map(async (coordinator) => {
          const emailData = generateTrainingCreationNotification(newTraining, coordinator, creator);
          try {
            await sendEmail(emailData);
          } catch (emailError) {
            console.error(`Failed to send email to ${coordinator.email}:`, emailError);
          }
        }),
      );
    }

    // ✅ Notification push vers le coordinateur d'incubation
    try {
      await notifyPendingIncubationValidation(newTraining);
    } catch (notifErr) {
      console.error("Error sending pending incubation notification:", notifErr);
    }

    res.status(201).json({ success: true, data: newTraining, message: "Training created successfully" });
  } catch (error) {
    console.error("Error creating training:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create training" });
  }
};

export const createBootcamp = async (req, res) => {
  try {
    const programFile = req.file;
    console.log("programFile", req.body);
    if (!programFile) {
      return res.status(400).json({ success: false, message: "Program file (PDF) is required" });
    }

    const {
      title, description, type, incubationCoordinators, trainers, time, duration,
      cohorts, maxParticipants, startDate, endDate, componentActivity, logisticsNeeds,
      travelNeeds, communicationNeeds, communicationNeedsOther, organizationalNeeds,
      requiredPartners, humanResources, materialResources, financialResources,
      highlightMoments, additionalComments,
    } = req.body;

    const startDateObj = new Date(startDate);
    const endDateObj = endDate ? new Date(endDate) : null;

    if (isNaN(startDateObj.getTime()) || (endDateObj && isNaN(endDateObj.getTime()))) {
      return res.status(400).json({ success: false, message: "Invalid date format" });
    }

    const componentCoordinator = req.user.id;

    const newTraining = new Training({
      title, description, type, componentCoordinator,
      incubationCoordinators: Array.isArray(incubationCoordinators) ? incubationCoordinators : [],
      trainers: Array.isArray(trainers) ? trainers : [],
      scheduledDate: startDateObj, startDate: startDateObj, endDate: endDateObj,
      time, duration: duration ? parseInt(duration) : null,
      cohorts: Array.isArray(cohorts) ? cohorts : [],
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      programFile: `/uploads/${req.file.filename}`,
      status: "pending", componentActivity,
      logisticsNeeds: Array.isArray(logisticsNeeds) ? logisticsNeeds : [],
      logisticsDetails: req.body.logisticsDetails || "",
      travelNeeds: Array.isArray(travelNeeds) ? travelNeeds : [],
      specificNeeds: req.body.specificNeeds || "",
      communicationNeeds: Array.isArray(communicationNeeds) ? communicationNeeds : [],
      communicationNeedsOther: communicationNeedsOther || "",
      organizationalNeeds: organizationalNeeds || "",
      requiredPartners: requiredPartners || "",
      humanResources: humanResources || "",
      materialResources: Array.isArray(materialResources) ? materialResources : [],
      financialResources: financialResources || "",
      highlightMoments: highlightMoments || "",
      additionalComments: additionalComments || "",
    });

    await newTraining.save();

    // ✅ Notification push vers le coordinateur d'incubation
    try {
      await notifyPendingIncubationValidation(newTraining);
    } catch (notifErr) {
      console.error("Error sending pending incubation notification:", notifErr);
    }

    res.status(201).json({ success: true, data: newTraining, message: "Bootcamp created successfully" });
  } catch (error) {
    console.error("Error creating bootcamp:", error);
    if (req.file) {
      try { await fs.promises.unlink(req.file.path); } catch (e) { }
    }
    res.status(500).json({ success: false, message: error.message || "Failed to create bootcamp" });
  }
};

export const updateBootcamp = async (req, res) => {
  try {
    const { id } = req.params;
    const programFile = req.file;
    const existingBootcamp = await Training.findById(id);
    if (!existingBootcamp) {
      return res.status(404).json({ success: false, message: "Bootcamp not found" });
    }

    const {
      title, description, incubationCoordinators, trainers, cohorts, maxParticipants,
      startDate, endDate, componentActivity, logisticsNeeds, logisticsDetails, travelNeeds,
      specificNeeds, communicationNeeds, communicationNeedsOther, organizationalNeeds,
      requiredPartners, humanResources, materialResources, financialResources,
      highlightMoments, additionalComments,
    } = req.body;

    const startDateObj = new Date(startDate);
    const endDateObj = endDate ? new Date(endDate) : null;

    if (isNaN(startDateObj.getTime()) || (endDateObj && isNaN(endDateObj.getTime()))) {
      return res.status(400).json({ success: false, message: "Invalid date format" });
    }

    existingBootcamp.title = title || existingBootcamp.title;
    existingBootcamp.description = description || existingBootcamp.description;
    existingBootcamp.incubationCoordinators = Array.isArray(incubationCoordinators) ? incubationCoordinators : existingBootcamp.incubationCoordinators;
    existingBootcamp.trainers = Array.isArray(trainers) ? trainers : existingBootcamp.trainers;
    existingBootcamp.cohorts = Array.isArray(cohorts) ? cohorts : existingBootcamp.cohorts;
    existingBootcamp.maxParticipants = maxParticipants ? parseInt(maxParticipants) : existingBootcamp.maxParticipants;
    existingBootcamp.startDate = startDateObj;
    existingBootcamp.endDate = endDateObj;
    existingBootcamp.scheduledDate = startDateObj;
    existingBootcamp.componentActivity = componentActivity || existingBootcamp.componentActivity;
    existingBootcamp.logisticsNeeds = Array.isArray(logisticsNeeds) ? logisticsNeeds : existingBootcamp.logisticsNeeds;
    existingBootcamp.logisticsDetails = logisticsDetails || existingBootcamp.logisticsDetails;
    existingBootcamp.travelNeeds = Array.isArray(travelNeeds) ? travelNeeds : existingBootcamp.travelNeeds;
    existingBootcamp.specificNeeds = specificNeeds || existingBootcamp.specificNeeds;
    existingBootcamp.communicationNeeds = Array.isArray(communicationNeeds) ? communicationNeeds : existingBootcamp.communicationNeeds;
    existingBootcamp.communicationNeedsOther = communicationNeedsOther || existingBootcamp.communicationNeedsOther;
    existingBootcamp.organizationalNeeds = organizationalNeeds || existingBootcamp.organizationalNeeds;
    existingBootcamp.requiredPartners = requiredPartners || existingBootcamp.requiredPartners;
    existingBootcamp.humanResources = humanResources || existingBootcamp.humanResources;
    existingBootcamp.materialResources = Array.isArray(materialResources) ? materialResources : existingBootcamp.materialResources;
    existingBootcamp.financialResources = financialResources || existingBootcamp.financialResources;
    existingBootcamp.highlightMoments = highlightMoments || existingBootcamp.highlightMoments;
    existingBootcamp.additionalComments = additionalComments || existingBootcamp.additionalComments;

    if (programFile) {
      existingBootcamp.programFile = `/uploads/${programFile.filename}`;
    }

    await existingBootcamp.save();
    res.status(200).json({ success: true, data: existingBootcamp, message: "Bootcamp updated successfully" });
  } catch (error) {
    console.error("Error updating bootcamp:", error);
    if (req.file) {
      try { await fs.promises.unlink(req.file.path); } catch (e) { }
    }
    res.status(500).json({ success: false, message: error.message || "Failed to update bootcamp" });
  }
};

export const validateTraining = async (req, res) => {
  try {
    const { trainingId } = req.params;
    const { location, sessionType, meetingLink } = req.body;
    const incubationCoordinator = req.userId;

    if (!location && sessionType === "in-person") {
      return res.status(400).json({ message: "Location is required for in-person sessions" });
    }
    if (sessionType === "online" && !meetingLink) {
      return res.status(400).json({ message: "Meeting link is required for online sessions" });
    }

    const updateData = {
      status: "approved",
      location: sessionType === "in-person" ? location : undefined,
      meetLink: sessionType === "online" ? meetingLink : undefined,
      sessionType, incubationCoordinator, approvedAt: new Date(),
    };

    const training = await Training.findByIdAndUpdate(trainingId, updateData, { new: true })
      .populate("componentCoordinator", "firstName lastName email")
      .populate("trainers", "personalInfo.fullName user");

    if (!training) return res.status(404).json({ message: "Training not found" });

    // ✅ Notification push vers tous les utilisateurs
    try {
      await notifyNewEvent({ ...training.toObject(), type: training.type });
    } catch (notifError) {
      console.error("Error sending notification:", notifError);
    }

    res.json(training);
  } catch (err) {
    console.error("Error approving training:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

export const rejectTraining = async (req, res) => {
  try {
    const { trainingId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length < 10) {
      return res.status(400).json({ message: "Rejection reason is required and should be at least 10 characters" });
    }

    const training = await Training.findByIdAndUpdate(
      trainingId,
      { status: "rejected", rejectionReason, rejectedAt: new Date(), rejectedBy: req.userId },
      { new: true },
    ).populate("componentCoordinator", "firstName lastName email");

    if (!training) return res.status(404).json({ message: "Training not found" });
    res.json(training);
  } catch (err) {
    console.error("Error rejecting training:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

export const rescheduleTraining = async (req, res) => {
  try {
    const { trainingId, rescheduledDate } = req.body;
    const existing = await Training.findById(trainingId);
    if (!existing) return res.status(404).json({ message: "Training not found" });
    const oldStartDate = existing.startDate;

    const training = await Training.findByIdAndUpdate(
      trainingId,
      { status: "rescheduled", rescheduledDate, scheduledDate: rescheduledDate, startDate: rescheduledDate },
      { new: true },
    );

    try {
      await notifyReschedule({ ...training.toObject(), type: training.type }, oldStartDate);
    } catch (notifErr) {
      console.error("Error sending reschedule notification:", notifErr);
    }

    res.json(training);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTrainings = async (req, res) => {
  try {
    const { type, status, cohorts, coordinator, page = 1, limit = 10 } = req.query;
    const filters = {};
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (coordinator) filters.componentCoordinator = coordinator;
    if (cohorts) filters.cohorts = { $in: cohorts.split(",") };
    const skip = (page - 1) * limit;
    const [trainings, total] = await Promise.all([
      Training.find(filters)
        .populate("componentCoordinator", "firstName lastName email")
        .populate("incubationCoordinators", "firstName lastName email")
        .populate("trainers", "personalInfo")
        .sort({ scheduledDate: -1 }).skip(skip).limit(parseInt(limit)),
      Training.countDocuments(filters),
    ]);
    res.json({ data: trainings, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const existingTraining = await Training.findById(id);
    if (!existingTraining) return res.status(404).json({ message: "Training not found" });
    const oldStartDate = existingTraining.startDate;

    const updatedTraining = await Training.findByIdAndUpdate(id, updateData, { new: true })
      .populate("componentCoordinator", "firstName lastName email")
      .populate("incubationCoordinators", "firstName lastName email")
      .populate("trainers", "personalInfo");

    if (oldStartDate && updatedTraining.startDate &&
      oldStartDate.toISOString() !== updatedTraining.startDate.toISOString()) {
      try {
        await notifyReschedule({ ...updatedTraining.toObject(), type: updateData.type || existingTraining.type }, oldStartDate);
      } catch (notifErr) {
        console.error("Error sending reschedule notification:", notifErr);
      }
    }

    res.json({ success: true, data: updatedTraining, message: "Training updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTrainingById = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate("componentCoordinator", "firstName lastName email")
      .populate("incubationCoordinators", "firstName lastName email")
      .populate("trainers", "personalInfo")
      .populate("cohorts", "name");
    if (!training) return res.status(404).json({ message: "Training not found" });
    res.json({ success: true, data: training });
  } catch (error) {
    console.error("Error fetching training:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch training" });
  }
};

export const getTrainingsForMentor = async (req, res) => {
  try {
    const userMentor = await Mentor.findOne({ user: req.user.id });
    if (!userMentor) {
      return res.status(404).json({ success: false, message: "Mentor profile not found for this user" });
    }
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    const trainings = await Training.find({
      trainers: userMentor._id, status: "approved",
      $or: [{ startDate: { $gte: oneMonthAgo } }, { endDate: { $gte: new Date() } }, { endDate: { $exists: false } }],
    })
      .populate("componentCoordinator", "personalInfo.fullName")
      .populate("incubationCoordinators", "personalInfo.fullName")
      .populate({ path: "trainers", select: "personalInfo.fullName", model: "Mentor" })
      .sort({ startDate: 1 }).lean();

    const filteredTrainings = trainings.map((training) => {
      const { logisticsNeeds, logisticsDetails, specificNeeds, travelNeeds, communicationNeeds,
        communicationNeedsOther, organizationalNeeds, requiredPartners, humanResources,
        materialResources, financialResources, highlightMoments, additionalComments, rejectionReason, ...rest } = training;
      return { ...rest, sessionDetails: { location: training.location, meetLink: training.meetLink, sessionType: training.sessionType, proposedLocation: training.proposedLocation } };
    });

    res.json({ success: true, data: filteredTrainings });
  } catch (error) {
    console.error("Error fetching mentor trainings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch trainings", error: error.message });
  }
};

export const getApprovedTrainings = async (req, res) => {
  try {
    const { type, cohorts, page = 1, limit = 10 } = req.query;
    const filters = { status: "approved" };
    if (type) filters.type = type;
    if (cohorts) filters.cohorts = { $in: cohorts.split(",") };
    const skip = (page - 1) * parseInt(limit);
    const [trainings, total] = await Promise.all([
      Training.find(filters)
        .populate("componentCoordinator", "firstName lastName email")
        .populate("incubationCoordinators", "firstName lastName email")
        .populate("trainers", "personalInfo")
        .sort({ startDate: 1 }).skip(skip).limit(parseInt(limit)),
      Training.countDocuments(filters),
    ]);
    const now = new Date();
    const categorized = { upcoming: [], active: [], past: [] };
    trainings.forEach((training) => {
      if (training.startDate > now) categorized.upcoming.push(training);
      else if (training.startDate <= now && training.endDate && training.endDate >= now) categorized.active.push(training);
      else categorized.past.push(training);
    });
    res.json({ data: categorized, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyTrainings = async (req, res) => {
  try {
    const user = req.user;
    const roles = user.roles;
    let trainings = [];
    if (roles.includes("IncubationCoordinator") || roles.includes("admin")) {
      trainings = await Training.find({ status: "approved" })
        .populate("componentCoordinator", "firstName lastName email")
        .populate("incubationCoordinators", "firstName lastName email")
        .populate("trainers", "personalInfo");
    } else if (roles.includes("ComponentCoordinator")) {
      trainings = await Training.find({ componentCoordinator: user._id, status: "approved" })
        .populate("componentCoordinator", "firstName lastName email")
        .populate("incubationCoordinators", "firstName lastName email")
        .populate("trainers", "personalInfo");
    } else if (roles.includes("mentor")) {
      const mentor = await Mentor.findOne({ user: user._id });
      if (mentor) {
        trainings = await Training.find({ trainers: mentor._id, status: "approved" })
          .populate("componentCoordinator", "firstName lastName email")
          .populate("trainers", "personalInfo");
      }
    } else if (roles.includes("projectHolder")) {
      const participant = await AcceptedParticipant.findOne({ user: user._id });
      if (participant) {
        const region = await Region.findById(participant.region);
        if (region) {
          const cohortName = `${region.name.fr} / ${region.name.ar}`;
          trainings = await Training.find({ cohorts: cohortName, status: "approved" })
            .populate("componentCoordinator", "firstName lastName email");
        }
      }
    }
    res.json({ success: true, data: trainings });
  } catch (error) {
    console.error("Erreur getMyTrainings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};