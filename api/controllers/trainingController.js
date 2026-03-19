import Training from "../models/Training.js";
import { generateTrainingCreationNotification } from "../utils/emailTemplates.js";
import sendEmail from "../utils/emailSender.js";
import User from "../models/User.js";
import Mentor from "../models/Mentor.js";

// Create a new training request
export const createTraining = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      incubationCoordinators,
      trainers,
      time,
      duration,
      cohorts,
      maxParticipants,
      startDate,
      endDate,
      componentActivity,
      logisticsNeeds,
      travelNeeds,
      communicationNeeds,
      communicationNeedsOther,
      organizationalNeeds,
      requiredPartners,
      humanResources,
      materialResources,
      financialResources,
      highlightMoments,
      additionalComments,
      sessionType,
      meetingLink,
      proposedLocation,
    } = req.body;

    // Get the component coordinator from the authenticated user
    const componentCoordinator = req.user.id;

    // Convert startDate to Date object
    const startDateObj = new Date(startDate);

    // Calculate endDate if duration is provided but endDate isn't
    let endDateObj = endDate ? new Date(endDate) : null;

    if (duration && !endDate) {
      endDateObj = new Date(startDateObj);
      endDateObj.setDate(startDateObj.getDate() + parseInt(duration));
    }

    // Create new training
    const newTraining = new Training({
      title,
      description,
      type,
      componentCoordinator,
      incubationCoordinators: incubationCoordinators || [],
      trainers: trainers || [],
      scheduledDate: startDateObj,
      startDate: startDateObj,
      endDate: endDateObj,
      time,
      duration: duration ? parseInt(duration) : null,
      cohorts: cohorts || [],
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      status: "pending",
      componentActivity,
      logisticsNeeds: logisticsNeeds || [],
      travelNeeds: travelNeeds || [],
      communicationNeeds: communicationNeeds || [],
      communicationNeedsOther,
      organizationalNeeds,
      requiredPartners,
      humanResources,
      materialResources: materialResources || [],
      financialResources,
      highlightMoments,
      additionalComments,
      sessionType,
      meetingLink,
      proposedLocation,
    });

    await newTraining.save();

    // Populate the creator details
    const creator = await User.findById(componentCoordinator).select(
      "firstName lastName email"
    );

    // If incubation coordinators are assigned, send them emails
    if (incubationCoordinators && incubationCoordinators.length > 0) {
      const coordinators = await User.find({
        _id: { $in: incubationCoordinators },
      });

      await Promise.all(
        coordinators.map(async (coordinator) => {
          const emailData = generateTrainingCreationNotification(
            newTraining,
            coordinator,
            creator
          );

          try {
            await sendEmail(emailData);
          } catch (emailError) {
            console.error(
              `Failed to send email to coordinator ${coordinator.email}:`,
              emailError
            );
          }
        })
      );
    }

    res.status(201).json({
      success: true,
      data: newTraining,
      message: "Training created successfully",
    });
  } catch (error) {
    console.error("Error creating training:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create training",
    });
  }
};

//create bootcamp
export const createBootcamp = async (req, res) => {
  try {
    // Handle file upload first if needed

    const programFile = req.file;
    console.log("programFile", req.body); // Assuming you're using multer or similar middleware
    if (!programFile) {
      return res.status(400).json({
        success: false,
        message: "Program file (PDF) is required",
      });
    }
    // Parse other form data
    const {
      title,
      description,
      type,
      incubationCoordinators,
      trainers,
      time,
      duration,
      cohorts,
      maxParticipants,
      startDate,
      endDate,
      componentActivity,
      logisticsNeeds,
      travelNeeds,
      communicationNeeds,
      communicationNeedsOther,
      organizationalNeeds,
      requiredPartners,
      humanResources,
      materialResources,
      financialResources,
      highlightMoments,
      additionalComments,
    } = req.body;

    // Convert string dates to Date objects
    const startDateObj = new Date(startDate);
    const endDateObj = endDate ? new Date(endDate) : null;

    // Validate dates
    if (
      isNaN(startDateObj.getTime()) ||
      (endDateObj && isNaN(endDateObj.getTime()))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Get the component coordinator from the authenticated user
    const componentCoordinator = req.user.id;

    // Create new training
    const newTraining = new Training({
      title,
      description,
      type,
      componentCoordinator,
      incubationCoordinators: Array.isArray(incubationCoordinators)
        ? incubationCoordinators
        : [],
      trainers: Array.isArray(trainers) ? trainers : [],
      scheduledDate: startDateObj,
      startDate: startDateObj,
      endDate: endDateObj,
      time,
      duration: duration ? parseInt(duration) : null,
      cohorts: Array.isArray(cohorts) ? cohorts : [],
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      programFile: `/uploads/${req.file.filename}`, // Store public URL
      status: "pending",
      componentActivity,
      logisticsNeeds: Array.isArray(logisticsNeeds) ? logisticsNeeds : [],
      logisticsDetails: req.body.logisticsDetails || "",
      travelNeeds: Array.isArray(travelNeeds) ? travelNeeds : [],
      specificNeeds: req.body.specificNeeds || "",
      communicationNeeds: Array.isArray(communicationNeeds)
        ? communicationNeeds
        : [],
      communicationNeedsOther: communicationNeedsOther || "",
      organizationalNeeds: organizationalNeeds || "",
      requiredPartners: requiredPartners || "",
      humanResources: humanResources || "",
      materialResources: Array.isArray(materialResources)
        ? materialResources
        : [],
      financialResources: financialResources || "",
      highlightMoments: highlightMoments || "",
      additionalComments: additionalComments || "",
    });

    await newTraining.save();

    // Rest of your code for sending emails, etc...
    // ...

    res.status(201).json({
      success: true,
      data: newTraining,
      message: "Bootcamp created successfully",
    });
  } catch (error) {
    console.error("Error creating bootcamp:", error);

    // Clean up uploaded file if there was an error
    if (req.file) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (cleanupError) {
        console.error("Error cleaning up uploaded file:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create bootcamp",
    });
  }
};
export const updateBootcamp = async (req, res) => {
  try {
    const { id } = req.params;
    const programFile = req.file;

    // Find existing bootcamp
    const existingBootcamp = await Training.findById(id);
    if (!existingBootcamp) {
      return res.status(404).json({
        success: false,
        message: "Bootcamp not found",
      });
    }

    // Parse form data
    const {
      title,
      description,
      incubationCoordinators,
      trainers,
      cohorts,
      maxParticipants,
      startDate,
      endDate,
      componentActivity,
      logisticsNeeds,
      logisticsDetails,
      travelNeeds,
      specificNeeds,
      communicationNeeds,
      communicationNeedsOther,
      organizationalNeeds,
      requiredPartners,
      humanResources,
      materialResources,
      financialResources,
      highlightMoments,
      additionalComments,
    } = req.body;

    // Convert string dates to Date objects
    const startDateObj = new Date(startDate);
    const endDateObj = endDate ? new Date(endDate) : null;

    // Validate dates
    if (
      isNaN(startDateObj.getTime()) ||
      (endDateObj && isNaN(endDateObj.getTime()))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Update bootcamp fields
    existingBootcamp.title = title || existingBootcamp.title;
    existingBootcamp.description = description || existingBootcamp.description;
    existingBootcamp.incubationCoordinators = Array.isArray(
      incubationCoordinators
    )
      ? incubationCoordinators
      : existingBootcamp.incubationCoordinators;
    existingBootcamp.trainers = Array.isArray(trainers)
      ? trainers
      : existingBootcamp.trainers;
    existingBootcamp.cohorts = Array.isArray(cohorts)
      ? cohorts
      : existingBootcamp.cohorts;
    existingBootcamp.maxParticipants = maxParticipants
      ? parseInt(maxParticipants)
      : existingBootcamp.maxParticipants;
    existingBootcamp.startDate = startDateObj;
    existingBootcamp.endDate = endDateObj;
    existingBootcamp.scheduledDate = startDateObj;
    existingBootcamp.componentActivity =
      componentActivity || existingBootcamp.componentActivity;
    existingBootcamp.logisticsNeeds = Array.isArray(logisticsNeeds)
      ? logisticsNeeds
      : existingBootcamp.logisticsNeeds;
    existingBootcamp.logisticsDetails =
      logisticsDetails || existingBootcamp.logisticsDetails;
    existingBootcamp.travelNeeds = Array.isArray(travelNeeds)
      ? travelNeeds
      : existingBootcamp.travelNeeds;
    existingBootcamp.specificNeeds =
      specificNeeds || existingBootcamp.specificNeeds;
    existingBootcamp.communicationNeeds = Array.isArray(communicationNeeds)
      ? communicationNeeds
      : existingBootcamp.communicationNeeds;
    existingBootcamp.communicationNeedsOther =
      communicationNeedsOther || existingBootcamp.communicationNeedsOther;
    existingBootcamp.organizationalNeeds =
      organizationalNeeds || existingBootcamp.organizationalNeeds;
    existingBootcamp.requiredPartners =
      requiredPartners || existingBootcamp.requiredPartners;
    existingBootcamp.humanResources =
      humanResources || existingBootcamp.humanResources;
    existingBootcamp.materialResources = Array.isArray(materialResources)
      ? materialResources
      : existingBootcamp.materialResources;
    existingBootcamp.financialResources =
      financialResources || existingBootcamp.financialResources;
    existingBootcamp.highlightMoments =
      highlightMoments || existingBootcamp.highlightMoments;
    existingBootcamp.additionalComments =
      additionalComments || existingBootcamp.additionalComments;

    // Handle file update if new file was uploaded
    if (programFile) {
      // Delete old file if it exists
      if (existingBootcamp.programFile) {
        try {
          const oldFilePath = path.join(
            __dirname,
            "../../public",
            existingBootcamp.programFile
          );
          await fs.promises.unlink(oldFilePath);
        } catch (err) {
          console.error("Error deleting old program file:", err);
        }
      }
      existingBootcamp.programFile = `/uploads/${programFile.filename}`;
    }

    await existingBootcamp.save();

    res.status(200).json({
      success: true,
      data: existingBootcamp,
      message: "Bootcamp updated successfully",
    });
  } catch (error) {
    console.error("Error updating bootcamp:", error);

    // Clean up uploaded file if there was an error
    if (req.file) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (cleanupError) {
        console.error("Error cleaning up uploaded file:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update bootcamp",
    });
  }
};

// Validate/approve a training
export const validateTraining = async (req, res) => {
  try {
    const { trainingId } = req.params;
    const { location, sessionType, meetingLink } = req.body;
    const incubationCoordinator = req.userId;
    if (!location && sessionType === "in-person") {
      return res
        .status(400)
        .json({ message: "Location is required for in-person sessions" });
    }

    if (sessionType === "online" && !meetingLink) {
      return res
        .status(400)
        .json({ message: "Meeting link is required for online sessions" });
    }

    const updateData = {
      status: "approved",
      location: sessionType === "in-person" ? location : undefined,
      meetLink: sessionType === "online" ? meetingLink : undefined,
      sessionType,
      incubationCoordinator,
      approvedAt: new Date(),
    };

    const training = await Training.findByIdAndUpdate(trainingId, updateData, {
      new: true,
    })
      .populate("componentCoordinator", "firstName lastName email")
      .populate("trainers", "personalInfo.fullName");

    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    res.json(training);
  } catch (err) {
    console.error("Error approving training:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message, // Include error message in response
    });
  }
};

export const rejectTraining = async (req, res) => {
  try {
    const { trainingId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length < 10) {
      return res.status(400).json({
        message:
          "Rejection reason is required and should be at least 10 characters",
      });
    }

    const training = await Training.findByIdAndUpdate(
      trainingId,
      {
        status: "rejected",
        rejectionReason,
        rejectedAt: new Date(),
        rejectedBy: req.userId,
      },
      { new: true }
    ).populate("componentCoordinator", "firstName lastName email");

    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    res.json(training);
  } catch (err) {
    console.error("Error rejecting training:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message, // Include error message in response
    });
  }
};
// Reschedule a training
export const rescheduleTraining = async (req, res) => {
  try {
    const { trainingId, rescheduledDate } = req.body;

    const training = await Training.findByIdAndUpdate(
      trainingId,
      {
        status: "rescheduled",
        rescheduledDate,
        scheduledDate: rescheduledDate,
      },
      { new: true }
    );

    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    res.json(training);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTrainings = async (req, res) => {
  try {
    const {
      type,
      status,
      cohorts,
      coordinator,
      page = 1,
      limit = 10,
    } = req.query;
    const filters = {};

    if (type) filters.type = type;
    if (status) filters.status = status;
    if (coordinator) filters.componentCoordinator = coordinator;
    if (cohorts) filters.cohorts = { $in: cohorts.split(",") }; // Handle multiple cohort filters

    const skip = (page - 1) * limit;

    const [trainings, total] = await Promise.all([
      Training.find(filters)
        .populate("componentCoordinator", "firstName lastName email")
        .populate("incubationCoordinators", "firstName lastName email")
        .populate("trainers", "personalInfo")
        .sort({ scheduledDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Training.countDocuments(filters),
    ]);

    res.json({
      data: trainings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert dates if they exist
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
      updateData.scheduledDate = new Date(updateData.startDate);
    }

    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    } else if (updateData.duration && updateData.startDate) {
      const endDate = new Date(updateData.startDate);
      endDate.setDate(endDate.getDate() + parseInt(updateData.duration));
      updateData.endDate = endDate;
    }

    const updatedTraining = await Training.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("componentCoordinator", "firstName lastName email")
      .populate("incubationCoordinators", "firstName lastName email")
      .populate("trainers", "personalInfo");

    if (!updatedTraining) {
      return res.status(404).json({ message: "Training not found" });
    }

    res.json({
      success: true,
      data: updatedTraining,
      message: "Training updated successfully",
    });
  } catch (error) {
    console.error("Error updating training:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update training",
    });
  }
};

export const getTrainingById = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate("componentCoordinator", "firstName lastName email")
      .populate("incubationCoordinators", "firstName lastName email")
      .populate("trainers", "personalInfo")
      .populate("cohorts", "name");

    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    res.json({
      success: true,
      data: training,
    });
  } catch (error) {
    console.error("Error fetching training:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch training",
    });
  }
};

// Get all trainings assigned to a mentor
export const getTrainingsForMentor = async (req, res) => {
  try {
    // First get the mentor ID from the user
    const userMentor = await Mentor.findOne({ user: req.user.id });

    if (!userMentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor profile not found for this user",
      });
    }

    // Calculate date 30 days ago from today
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    const trainings = await Training.find({
      trainers: userMentor._id,
      status: "approved",
      $or: [
        { startDate: { $gte: oneMonthAgo } }, // Started within last month
        { endDate: { $gte: new Date() } }, // Or end date is in future
        { endDate: { $exists: false } }, // Or has no end date
      ],
    })
      .populate("componentCoordinator", "personalInfo.fullName")
      .populate("incubationCoordinators", "personalInfo.fullName")
      .populate({
        path: "trainers",
        select: "personalInfo.fullName",
        model: "Mentor",
      })
      .sort({ startDate: 1 })
      .lean();
    // Filter out fields not needed by mentor
    const filteredTrainings = trainings.map((training) => {
      const {
        logisticsNeeds,
        logisticsDetails,
        specificNeeds,
        travelNeeds,
        communicationNeeds,
        communicationNeedsOther,
        organizationalNeeds,
        requiredPartners,
        humanResources,
        materialResources,
        financialResources,
        highlightMoments,
        additionalComments,
        rejectionReason,
        ...rest
      } = training;

      return {
        ...rest,
        // Keep only essential logistics info
        sessionDetails: {
          location: training.location,
          meetLink: training.meetLink,
          sessionType: training.sessionType,
          proposedLocation: training.proposedLocation,
        },
      };
    });

    res.json({
      success: true,
      data: filteredTrainings,
    });
  } catch (error) {
    console.error("Error fetching mentor trainings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trainings",
      error: error.message,
    });
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
        .sort({ startDate: 1 }) // Sort by soonest start
        .skip(skip)
        .limit(parseInt(limit)),
      Training.countDocuments(filters),
    ]);

    const now = new Date();

    // ✅ Categorize
    const categorized = {
      upcoming: [],
      active: [],
      past: [],
    };

    trainings.forEach((training) => {
      if (training.startDate > now) {
        categorized.upcoming.push(training);
      } else if (
        training.startDate <= now &&
        training.endDate &&
        training.endDate >= now
      ) {
        categorized.active.push(training);
      } else {
        categorized.past.push(training);
      }
    });

    res.json({
      data: categorized,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
