// utils/trainingUtils.js
import AcceptedParticipant from "../models/AcceptedParticipant.js";
import Region from "../models/region.js";
import Training from "../models/Training.js";

export const getParticipantsByTrainingId = async (trainingId) => {
  try {
    // Get the training to access its cohorts
    const training = await Training.findById(trainingId);
    if (!training) {
      throw new Error("Training not found");
    }

    // Extract cohort names from the training
    const cohortNames = training.cohorts || [];
    if (cohortNames.length === 0) {
      return []; // No cohorts means no participants
    }

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

    // Find matching regions
    const regions = await Region.find({
      $or: [
        { "name.fr": { $in: cohortNamesFr } },
        { "name.ar": { $in: cohortNamesAr } },
      ],
    });

    if (regions.length === 0) {
      return []; // No matching regions
    }

    const regionIds = regions.map((region) => region._id);

    // Find participants in these regions
    const participants = await AcceptedParticipant.find({
      region: { $in: regionIds },
    }).populate("user", "firstName lastName email");

    return participants;
  } catch (error) {
    console.error("Error in getParticipantsByTrainingId:", error);
    throw error;
  }
};
