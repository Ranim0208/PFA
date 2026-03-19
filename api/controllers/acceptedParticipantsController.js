import AcceptedParticipant from "../models/AcceptedParticipant.js";
import Training from "../models/Training.js";
import Region from "../models/region.js";
import Mentor from "../models/Mentor.js";
import mongoose from "mongoose";
// controllers/acceptedParticipantsController.js
export const getParticipantRegion = async (req, res) => {
  try {
    const participant = await AcceptedParticipant.findOne({
      user: req.user._id,
    })
      .populate("region", "name _id")
      .populate("form", "title _id");

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        region: participant.region,
        form: participant.form,
      },
    });
  } catch (error) {
    console.error("Error fetching participant region:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching participant region",
    });
  }
};
export const getParticipantsForMentor2 = async (req, res) => {
  console.log("[getParticipantsForMentor] Starting process");
  try {
    const userId = req.user.id;
    const {
      cohortName,
      trainingId,
      status,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    console.log(
      `[Params] user:${userId}, cohort:"${cohortName}", trainingId:"${trainingId}", status:"${status}", search:"${search}", page:${page}, limit:${limit}`
    );

    // Validate pagination parameters
    const safePage = Math.max(1, parseInt(page));
    const safeLimit = Math.min(parseInt(limit), 100) || 10;

    // Find mentor
    console.log(`[Step 1] Finding mentor for user ID: ${userId}`);
    const mentor = await Mentor.findOne({ user: userId }).lean();
    if (!mentor) {
      console.error(`[ERROR] Mentor not found for user: ${userId}`);
      return res.status(404).json({
        success: false,
        error: "Mentor profile not found",
      });
    }
    console.log(`[Success] Found mentor: ${mentor._id}`);

    // Build training filter
    const currentDate = new Date();
    let trainingFilter = {
      trainers: mentor._id,
      // startDate: { $gte: currentDate },
      // endDate: { $gte: currentDate },
    };
    if (trainingId) trainingFilter._id = trainingId;

    console.log(
      `[Step 2] Fetching trainings with filter:`,
      JSON.stringify(trainingFilter, null, 2)
    );
    const trainings = await Training.find(trainingFilter)
      .select("title cohorts startDate endDate")
      .lean();

    if (!trainings.length) {
      console.error(
        `[ERROR] No active trainings found for mentor: ${mentor._id}. Current date: ${currentDate}`
      );
      return res.status(404).json({
        success: false,
        message: "You don't have any active trainings at this time",
      });
    }
    console.log(
      `[Success] Found ${trainings.length} trainings:`,
      trainings.map((t) => t.title)
    );

    // Cohort validation
    let cohortNames = [];
    if (cohortName) {
      console.log(`[Step 3] Validating cohort: ${cohortName}`);
      const validCohort = trainings.some((t) =>
        t.cohorts?.includes(cohortName)
      );

      if (!validCohort) {
        console.error(
          `[ERROR] Cohort not found: ${cohortName}. Available cohorts:`,
          trainings.flatMap((t) => t.cohorts || [])
        );
        return res.status(404).json({
          success: false,
          message: `Cohort "${cohortName}" not found in your active trainings`,
        });
      }
      cohortNames = [cohortName];
    } else {
      cohortNames = [...new Set(trainings.flatMap((t) => t.cohorts || []))];
      console.log(`[Step 3] Using all cohorts:`, cohortNames);
    }

    // Prepare region filters
    console.log(
      `[Step 4] Processing ${cohortNames.length} cohort(s) for region lookup`
    );
    const cohortNamesFr = [];
    const cohortNamesAr = [];

    cohortNames.forEach((entry) => {
      const [fr, ar] = entry.split(" / ").map((s) => s?.trim() || "");
      if (fr) cohortNamesFr.push(fr);
      if (ar) cohortNamesAr.push(ar);
    });
    console.log(`[Debug] Cohort FR names:`, cohortNamesFr);
    console.log(`[Debug] Cohort AR names:`, cohortNamesAr);

    const regionFilter = {
      $or: [
        { "name.fr": { $in: cohortNamesFr } },
        { "name.ar": { $in: cohortNamesAr } },
      ],
    };

    console.log(
      `[Step 5] Finding regions with filter:`,
      JSON.stringify(regionFilter, null, 2)
    );
    const regions = await Region.find(regionFilter).lean();

    if (!regions.length) {
      console.error(
        `[ERROR] No regions found for cohorts. Cohorts: ${cohortNames.join(
          ", "
        )}`
      );
      return res.status(404).json({
        success: false,
        message: "No regions match your training cohorts",
      });
    }
    console.log(
      `[Success] Found ${regions.length} regions:`,
      regions.map((r) => r.name)
    );

    // Build participant filter
    const regionIds = regions.map((r) => r._id);
    let participantFilter = { region: { $in: regionIds } };

    if (status) {
      participantFilter.status = status;
      console.log(`[Filter] Added status filter: ${status}`);
    }
    if (search) {
      participantFilter.$or = [
        { "user.firstName": { $regex: search, $options: "i" } },
        { "user.lastName": { $regex: search, $options: "i" } },
        { "user.email": { $regex: search, $options: "i" } },
      ];
      console.log(`[Filter] Added search filter: ${search}`);
    }

    console.log(
      `[Step 6] Fetching participants with final filter:`,
      JSON.stringify(participantFilter, null, 2)
    );

    const [participants, total] = await Promise.all([
      AcceptedParticipant.find(participantFilter)
        .populate("user", "firstName lastName email phone")
        .populate("region", "name")
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),
      AcceptedParticipant.countDocuments(participantFilter),
    ]);

    console.log(`[Success] Found ${participants.length}/${total} participants`);

    res.status(200).json({
      success: true,
      data: participants,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    console.error(`[FATAL ERROR] ${error.message}`);
    console.error("Error details:", {
      name: error.name,
      stack: error.stack,
      additionalInfo: {
        query: req.query,
        user: req.user,
        timestamp: new Date().toISOString(),
      },
    });

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? `[${error.name}] ${error.message}`
          : undefined,
    });
  } finally {
    console.log(
      `[getParticipantsForMentor] Process completed at ${new Date().toISOString()}`
    );
  }
};

/**
 * Get participants by region for ACTIVE trainings where the authenticated user is a trainer
 * Only returns participants from training sessions that are currently active (within date range)
 */
export const getParticipantsForMentor = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      regionId,
      trainingId,
      trainingType,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    // Find mentor
    const mentor = await Mentor.findOne({ user: userId });
    if (!mentor) {
      return res.status(404).json({ error: "Mentor not found" });
    }
    console.log("training found:", trainingId);
    // Build training filter
    const now = new Date();

    let trainingFilter = {
      trainers: mentor._id,
      // startDate: { $lte: now },
      // endDate: { $gte: now },
    };

    if (trainingId) {
      trainingFilter._id = trainingId;
    }
    if (trainingType) trainingFilter.type = trainingType;

    // Get trainings where this mentor is assigned
    const trainings = await Training.find(trainingFilter).select(
      "title type cohorts startDate endDate description"
    );
    if (!trainings.length) {
      return res.status(404).json({
        success: false,
        message: "No trainings found for this mentor",
      });
    }
    console.log("trainings", trainings);
    // Extract cohort names from trainings and match with regions
    const cohortNames = new Set();
    trainings.forEach((training) => {
      if (training.cohorts && Array.isArray(training.cohorts)) {
        training.cohorts.forEach((cohort) => cohortNames.add(cohort));
      }
    });

    // Parse cohort names to extract French and Arabic region names
    const cohortNamesFr = [];
    const cohortNamesAr = [];

    cohortNames.forEach((cohortName) => {
      if (cohortName.includes(" / ")) {
        const [fr, ar] = cohortName.split(" / ").map((s) => s.trim());
        if (fr) cohortNamesFr.push(fr);
        if (ar) cohortNamesAr.push(ar);
      } else {
        // If no separator, try both languages
        cohortNamesFr.push(cohortName.trim());
        cohortNamesAr.push(cohortName.trim());
      }
    });

    // Build region filter
    let regionFilter = {
      $or: [
        { "name.fr": { $in: cohortNamesFr } },
        { "name.ar": { $in: cohortNamesAr } },
      ],
    };

    // If specific regionId is provided, use it instead
    if (regionId) {
      regionFilter = { _id: regionId };
    }

    // Fetch matching regions
    const regions = await Region.find(regionFilter);
    if (regions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No regions found matching your training cohorts",
      });
    }

    const regionIds = regions.map((region) => region._id);

    // Build participant filter
    let participantFilter = {
      region: { $in: regionIds },
    };

    // Add search functionality
    if (search) {
      participantFilter.$or = [
        { "user.firstName": { $regex: search, $options: "i" } },
        { "user.lastName": { $regex: search, $options: "i" } },
        { "user.email": { $regex: search, $options: "i" } },
      ];
    }

    // Get participants with full population
    const [participants, total] = await Promise.all([
      AcceptedParticipant.find(participantFilter)
        .populate("user", "firstName lastName email phone")
        .populate("region", "name")
        .populate("form", "title region startDate endDate")
        .populate({
          path: "answers.field",
          model: "TemplateField",
          select: "name type label options",
        })
        .populate({
          path: "submission",
          model: "CandidatureSubmission",
          populate: [
            { path: "feedbacks.user", select: "firstName lastName email" },
            {
              path: "mentorFeedbacks.mentorId",
              select: "firstName lastName email",
            },
            {
              path: "preselectionEvaluations.coordinatorId",
              select: "firstName lastName email",
            },
            {
              path: "mentorEvaluations.mentorId",
              select: "firstName lastName email",
            },
          ],
        })

        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .lean(),
      AcceptedParticipant.countDocuments(participantFilter),
    ]);

    // Group participants by training type based on cohort matching
    const participantsByTraining = {};

    // Create a mapping of region names to training types
    const regionToTrainings = {};

    trainings.forEach((training) => {
      if (training.cohorts) {
        training.cohorts.forEach((cohort) => {
          if (!regionToTrainings[cohort]) {
            regionToTrainings[cohort] = [];
          }
          regionToTrainings[cohort].push({
            id: training._id,
            title: training.title,
            type: training.type,
            startDate: training.startDate,
            endDate: training.endDate,
            description: training.description,
          });
        });
      }
    });

    participants.forEach((participant) => {
      const regionName = participant.region.name;

      // Find matching trainings for this region
      let matchingTrainings = [];

      // Check both French and Arabic names
      const frName = regionName.fr;
      const arName = regionName.ar;

      Object.keys(regionToTrainings).forEach((cohortKey) => {
        if (
          cohortKey.includes(frName) ||
          cohortKey.includes(arName) ||
          (cohortKey.includes(" / ") &&
            (cohortKey.split(" / ")[0].trim() === frName ||
              cohortKey.split(" / ")[1].trim() === arName))
        ) {
          matchingTrainings = [
            ...matchingTrainings,
            ...regionToTrainings[cohortKey],
          ];
        }
      });

      // Group by training type
      matchingTrainings.forEach((training) => {
        const trainingType = training.type;

        if (!participantsByTraining[trainingType]) {
          participantsByTraining[trainingType] = {
            trainingType: trainingType,
            trainings: [],
            participants: [],
            totalParticipants: 0,
          };
        }

        // Add training info if not already added
        const existingTraining = participantsByTraining[
          trainingType
        ].trainings.find((t) => t.id.toString() === training.id.toString());

        if (!existingTraining) {
          participantsByTraining[trainingType].trainings.push(training);
        }

        // Add participant with training context
        const participantWithTraining = {
          ...participant,
          relatedTraining: training,
          trainingType: trainingType,
        };

        // Avoid duplicates
        const existingParticipant = participantsByTraining[
          trainingType
        ].participants.find(
          (p) => p._id.toString() === participant._id.toString()
        );

        if (!existingParticipant) {
          participantsByTraining[trainingType].participants.push(
            participantWithTraining
          );
          participantsByTraining[trainingType].totalParticipants++;
        }
      });
    });

    // Convert to array format for easier frontend consumption
    const groupedData = Object.values(participantsByTraining);
    console.log(
      "participants",
      groupedData.map((group) => group.participants).flat()
    );
    // Add summary statistics
    const summary = {
      totalParticipants: total,
      totalTrainingTypes: groupedData.length,
      trainingTypeBreakdown: groupedData.map((group) => ({
        type: group.trainingType,
        count: group.totalParticipants,
        trainings: group.trainings.length,
      })),
    };

    const response = {
      success: true,
      data: groupedData,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
      metadata: {
        regions,
        trainings,
        summary,
        availableTrainingTypes: [...new Set(trainings.map((t) => t.type))],
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Controller
export const getTrainingAllParticipants = async (req, res) => {
  const { id: trainingId } = req.params;

  try {
    // Validate training ID
    if (!mongoose.Types.ObjectId.isValid(trainingId)) {
      return res.status(400).json({ message: "Invalid training ID" });
    }

    const training = await Training.findById(trainingId).lean();
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    // Early return if no cohorts
    if (!training.cohorts || training.cohorts.length === 0) {
      return res.json([]);
    }

    // Process cohort names
    const cohortNames = training.cohorts.flatMap((cohort) => {
      if (cohort.includes(" / ")) {
        return cohort.split(" / ").map((s) => s.trim());
      }
      return [cohort.trim()];
    });

    // Find matching regions
    const regions = await Region.find({
      $or: [
        { "name.fr": { $in: cohortNames } },
        { "name.ar": { $in: cohortNames } },
      ],
    })
      .select("_id")
      .lean();

    if (regions.length === 0) {
      return res.json([]);
    }

    // Get participants with user details
    const participants = await AcceptedParticipant.find({
      region: { $in: regions.map((r) => r._id) },
    })
      .populate({
        path: "user",
        select: "firstName lastName email",
      })
      .populate({
        path: "region",
        select: "name.fr name.ar",
      })
      .lean();

    // Format response
    const formattedParticipants = participants.map((p) => ({
      id: p._id,
      firstName: p.user?.firstName,
      lastName: p.user?.lastName,
      email: p.user?.email,
      region: p.region?.name,
      status: p.status,
    }));
    console.log(
      `Found ${formattedParticipants.length} participants for training ${trainingId}`
    );
    res.json(formattedParticipants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch participants",
    });
  }
};
