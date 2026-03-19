// controllers/creathonController.js
import Creathon from "../models/Creathon.js";
import CandidatureSubmission from "../models/CandidatureSubmission.js";
import User from "../models/User.js";
import Mentor from "../models/Mentor.js";
import Jury from "../models/jury.js";
import generatePassword from "../utils/passwordGenerator.js";
import sendEmail from "../utils/emailSender.js";
import Form from "../models/form.js";
import mongoose from "mongoose";
import { sendBulkEmails } from "../utils/sendBulkEmails.js";
import {
  generateMentorInvitationEmail,
  generateJuryInvitationEmail,
} from "../utils/emailTemplates.js";
import { generateInvitationToken } from "../utils/generateTokens.js";
// Créer un nouveau créathon
export const createCreathon = async (req, res) => {
  try {
    const userId = req.user._id;
    const value = req.body;
    // Validate input data with Joi
    // const { error, value } = creathonCreationValidator.validate(req.body, {
    //   abortEarly: false,
    // });

    // if (error) {
    //   const validationErrors = error.details.map((err) => err.message);
    //   return res.status(400).json({
    //     message: "Échec de la validation des données.",
    //     errors: validationErrors,
    //   });
    // }

    const creathon = new Creathon({
      ...value,
      createdBy: userId,
      coordinators: {
        componentCoordinator: value.coordinators.componentCoordinator,
        generalCoordinator: value.coordinators.generalCoordinator || null,
      },
      jury: {
        numberOfJuries: value.jury.numberOfJuries,
        members: [],
      },
      mentors: {
        numberOfMentors: value.mentors.numberOfMentors,
        members: [],
      },
      budget: value.budget || {
        totalBudget: 0,
        allocatedBudget: 0,
        expenses: [],
      },
      resources: value.resources || {
        materials: [],
        equipment: [],
        facilities: [],
      },
      status: value.status || "draft",
    });

    await creathon.save();

    res.status(201).json({
      message: "Créathon créé avec succès",
      creathon,
    });
  } catch (error) {
    console.error("Erreur lors de la création du créathon:", error);
    res.status(500).json({
      message: "Erreur lors de la création du créathon",
      error: error.message,
    });
  }
};
export const getCreathonsForComponentCoordinator = async (req, res) => {
  try {
    const userId = req.user._id;
    const creathons = await Creathon.find({
      "coordinators.componentCoordinator": userId,
    })
      .populate("region", "name code")
      .populate("coordinators.componentCoordinator", "firstName lastName email")
      .populate("coordinators.generalCoordinator", "firstName lastName email")
      .populate("jury.members.user", "firstName lastName email")
      .populate("mentors.members.user", "firstName lastName email");

    res.status(200).json({ creathons });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};
export const getCreathonsForGeneralCoordinator = async (req, res) => {
  try {
    const userId = req.user._id;
    const creathons = await Creathon.find({
      "coordinators.generalCoordinator": userId,
    })
      .populate("region", "name code")
      .populate("coordinators.componentCoordinator", "firstName lastName email")
      .populate("coordinators.generalCoordinator", "firstName lastName email")
      .populate("jury.members.user", "firstName lastName email")
      .populate(
        "mentors.members.user",
        "firstName lastName email status accountStatus"
      );

    res.status(200).json({ creathons });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error });
  }
};
export const validateCreathonLogistics = async (req, res) => {
  try {
    const userId = req.user._id;
    const creathonId = req.params.id;
    const { comments } = req.body;

    const creathon = await Creathon.findById(creathonId).populate(
      "coordinators.generalCoordinator"
    );

    if (!creathon)
      return res.status(404).json({ message: "Créathon non trouvé" });

    if (
      creathon.coordinators.componentCoordinator.toString() !==
      userId.toString()
    ) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    // Save validation
    creathon.validations.componentValidation = {
      validatedBy: userId,
      validatedAt: new Date(),
      comments,
    };

    creathon.status = "pending_validation";
    await creathon.save();

    // Email notification to general coordinator
    const generalEmail = creathon.coordinators.generalCoordinator?.email;
    const componentName = req.user.name || req.user.email; // optional
    const creathonTitle = creathon.title;

    if (generalEmail) {
      await sendEmail({
        to: generalEmail,
        subject: "Nouveau créathon à valider",
        text: `Bonjour,\n\nLe coordinateur de composante (${componentName}) a validé le créathon "${creathonTitle}".\n\nVous pouvez maintenant le consulter et procéder à sa validation générale.\n\nCordialement,\nPlateforme Tacir`,
      });
    }

    res.status(200).json({
      message: "Validation logistique envoyée et notification envoyée",
      creathon,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
export const validateCreathonLogisticsByGeneralCoordinator = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;
    const creathonId = req.params.id;
    const { comments } = req.body;

    const creathon = await Creathon.findById(creathonId).populate(
      "coordinators.generalCoordinator"
    );

    if (!creathon)
      return res.status(404).json({ message: "Créathon non trouvé" });

    if (!creathon.validations?.componentValidation?.validatedAt) {
      return res.status(400).json({
        message:
          "Le coordinateur de composante n’a pas encore validé ce créathon",
      });
    }

    creathon.validations.generalValidation = {
      validatedBy: userId,
      validatedAt: new Date(),
      comments,
    };

    creathon.status = "validated";
    await creathon.save();

    res
      .status(200)
      .json({ message: "Validation générale enregistrée", creathon });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
export const getAllCreathons = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, component, region } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (component) filter.component = component;
    if (region) filter.region = region;

    const creathons = await Creathon.find(filter)
      .populate("region", "name code")
      .populate("coordinators.componentCoordinator", "firstName lastName email")
      .populate("coordinators.generalCoordinator", "firstName lastName email")
      .populate("selectedProjects")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Creathon.countDocuments(filter);

    res.json({
      creathons,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des créathons:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des créathons",
      error: error.message,
    });
  }
};
// Obtenir un créathon par ID
export const getCreathonById = async (req, res) => {
  try {
    const creathon = await Creathon.findById(req.params.id)
      .populate("region", "name.fr")
      .populate("coordinators.componentCoordinator", "firstName lastName email")
      .populate("coordinators.generalCoordinator", "firstName lastName email")
      .populate("mentors.members.user", "firstName lastName email")
      .populate("jury.members.user", "firstName lastName email")
      .populate("selectedProjects");

    if (!creathon) {
      return res.status(404).json({ message: "Créathon non trouvé" });
    }

    res.json(creathon);
  } catch (error) {
    console.error("Erreur lors de la récupération du créathon:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération du créathon",
      error: error.message,
    });
  }
};
export const getCreathonByRegion = async (req, res) => {
  try {
    const { regionId } = req.params;

    // ✅ Validation de l'ObjectId
    if (!mongoose.Types.ObjectId.isValid(regionId)) {
      return res.status(400).json({ message: "ID de région invalide" });
    }

    const creathon = await Creathon.findOne({ region: regionId })
      .populate("region", "name code")
      .populate("coordinators.componentCoordinator", "firstName lastName email")
      .populate("coordinators.generalCoordinator", "firstName lastName email")
      .populate("jury.members.user", "firstName lastName email")
      .populate("mentors.members.user", "firstName lastName email");

    if (!creathon) {
      return res
        .status(404)
        .json({ message: "Aucun créathon trouvé pour cette région" });
    }

    console.log("creathon", creathon);
    res.json(creathon);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des créathons par région:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des créathons",
      error: error.message,
    });
  }
};
// Mettre à jour un créathon
export const updateCreathon = async (req, res) => {
  try {
    const creathon = await Creathon.findById(req.params.id);

    if (!creathon) {
      return res.status(404).json({ message: "Créathon non trouvé" });
    }

    const updatedCreathon = await Creathon.findByIdAndUpdate(
      req.params.id,
      { ...req.body, status: "pending_validation" },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Créathon mis à jour avec succès",
      creathon: updatedCreathon,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du créathon:", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du créathon",
      error: error.message,
    });
  }
};
export const getCreathonStatistics = async (req, res) => {
  try {
    const { component, region, year } = req.query;

    const matchStage = {};
    if (component) matchStage.component = component;
    if (region) matchStage.region = new mongoose.Types.ObjectId(region);
    if (year) {
      matchStage.createdAt = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`),
      };
    }

    const stats = await Creathon.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalCreathons: { $sum: 1 },
          completedCreathons: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          ongoingCreathons: {
            $sum: { $cond: [{ $eq: ["$status", "ongoing"] }, 1, 0] },
          },
          publishedCreathons: {
            $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] },
          },
          totalParticipants: {
            $sum: {
              $add: ["$mentors.numberOfMentors", "$jury.numberOfJuries"],
            },
          },
          totalProjects: { $sum: { $size: "$selectedProjects" } },
          totalBudget: { $sum: "$budget.totalBudget" },
        },
      },
    ]);

    const statusDistribution = await Creathon.aggregate([
      { $match: matchStage },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const componentDistribution = await Creathon.aggregate([
      { $match: matchStage },
      { $group: { _id: "$component", count: { $sum: 1 } } },
    ]);

    res.json({
      overview: stats[0] || {
        totalCreathons: 0,
        completedCreathons: 0,
        ongoingCreathons: 0,
        publishedCreathons: 0,
        totalParticipants: 0,
        totalProjects: 0,
        totalBudget: 0,
      },
      statusDistribution,
      componentDistribution,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques",
      error: error.message,
    });
  }
};
export const getCreathonStatsByRegion = async (req, res) => {
  const { regionId } = req.params;

  try {
    // 1. Find Creathon by Region
    const creathon = await Creathon.findOne({ region: regionId });

    // 2. Find the form for that region
    const form = await Form.findOne({ region: regionId });
    if (!form) {
      return res
        .status(404)
        .json({ message: "Aucun formulaire trouvé pour cette région" });
    }

    // 3. Count present + submitted candidatures
    const participantCount = await CandidatureSubmission.countDocuments({
      form: form._id,
      // status: "submitted",
      attendanceStatus: "present",
    });
    console.log("participantCount", participantCount);
    // 4. Prepare stats object
    const stats = {
      participantCount, // Participants Prévus
      creathonExists: !!creathon,
      creathonStatus: creathon ? creathon.status : null,
    };

    res.status(200).json({
      formId: form._id,
      regionId,
      creathon,
      stats,
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des statistiques:", err);
    res.status(500).json({
      message: "Erreur serveur lors du chargement des statistiques régionales.",
    });
  }
};
// Component Coordinator submits team list
export const submitTeamList = async (req, res) => {
  try {
    const { creathonId } = req.params;
    const { mentors, juryMembers } = req.body;
    const userId = req.user._id;

    const creathon = await Creathon.findOne({
      _id: creathonId,
      "coordinators.componentCoordinator": userId,
    });

    if (!creathon) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    if (creathon.validations?.componentValidation?.validatedAt) {
      return res.status(400).json({ message: "Creathon already validated" });
    }

    // Process mentors - create accounts if needed
    const processedMentors = await Promise.all(
      mentors.map(async (mentor) => {
        let user = await User.findOne({ email: mentor.email });
        if (!user) {
          const tempPassword = generatePassword();
          user = new User({
            firstName: mentor.firstName,
            lastName: mentor.lastName,
            email: mentor.email,
            password: tempPassword,
            roles: ["mentor"],
          });
          await user.save();
        }
        return { ...mentor, userId: user._id };
      })
    );

    // Create mentor records
    await Mentor.insertMany(
      processedMentors.map((mentor) => ({
        user: mentor.userId,
        creathon: creathonId,
        status: "pending",
      }))
    );

    // Process jury members
    await Jury.insertMany(
      juryMembers.map((jury) => ({
        user: jury.userId,
        creathon: creathonId,
        status: "pending",
      }))
    );

    // Update creathon with team counts
    creathon.mentors.numberOfMentors = mentors.length;
    creathon.jury.numberOfJuries = juryMembers.length;
    await creathon.save();

    // Notify General Coordinator
    const generalCoordinator = await User.findById(
      creathon.coordinators.generalCoordinator
    );
    await sendEmail({
      to: generalCoordinator.email,
      subject: `Liste d'équipe soumise pour ${creathon.title}`,
      text: `Le coordinateur de composante a soumis la liste des mentors et jurés pour le créathon ${creathon.title}.`,
    });

    res.status(200).json({ message: "Team list submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// General Coordinator sends invitations
export const sendMentorInvitations = async (req, res) => {
  console.log("Sending mentor invitations...");
  try {
    const { creathonId } = req.params;
    const userId = req.user._id;

    const creathon = await Creathon.findOne({
      _id: creathonId,
      "coordinators.generalCoordinator": userId,
    }).populate("mentors.members.user");

    if (!creathon) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    if (!creathon.validations?.componentValidation?.validatedAt) {
      return res
        .status(400)
        .json({ message: "Creathon not validated by component coordinator" });
    }

    // Create mentor records if they don't exist
    const invitationPromises = creathon.mentors.members.map(async (mentor) => {
      const token = generateInvitationToken(mentor.user._id, creathonId);
      const tokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry

      // Upsert mentor record
      await Mentor.findOneAndUpdate(
        { user: mentor.user._id },
        {
          creathon: creathonId,
          invitationToken: token,
          tokenExpires,
          invitedAt: new Date(),
          status: "invited",
          accountStatus: "pending",
        },
        { upsert: true, new: true }
      );

      return {
        email: mentor.user.email,
        subject: `Invitation à participer comme mentor - ${creathon.title}`,
        html: `
          <p>Bonjour ${mentor.user.firstName},</p>
          <p>Vous avez été sélectionné comme mentor pour le créathon "${creathon.title}".</p>
          <p>Veuillez compléter votre profil en cliquant sur le lien ci-dessous :</p>
          <a href="${process.env.FRONTEND_URL}/mentor/onboarding?token=${token}">
            Compléter mon profil
          </a>
          <p>Cordialement,<br>L'équipe Tacir</p>
        `,
      };
    });

    const emailResults = await sendBulkEmails(
      await Promise.all(invitationPromises)
    );

    res.status(200).json({
      message: "Invitations sent successfully",
      results: emailResults,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// General Coordinator validates mentor account
export const validateMentorAccount = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const userId = req.user._id;

    const mentor = await Mentor.findById(mentorId)
      .populate("creathon")
      .populate("user");

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    if (
      mentor.creathon.coordinators.generalCoordinator.toString() !==
      userId.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    if (!mentor.personalInfo?.rib || !mentor.personalInfo?.idDocument) {
      return res.status(400).json({ message: "Mentor profile not complete" });
    }

    mentor.accountStatus = "validated";
    mentor.validatedAt = new Date();
    await mentor.save();

    // Notify mentor
    await sendEmail({
      to: mentor.user.email,
      subject: "Votre compte mentor a été validé",
      text: `Félicitations ! Votre compte mentor pour le créathon ${mentor.creathon.title} a été validé.`,
    });

    res.status(200).json({ message: "Mentor validated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get team list
export const getCreathonTeam = async (req, res) => {
  try {
    const { creathonId } = req.params;

    const creathon = await Creathon.findById(creathonId)
      .populate("mentors.members.user")
      .populate("jury.members.user");

    if (!creathon) {
      return res.status(404).json({ message: "Creathon not found" });
    }

    res.status(200).json({
      mentors: creathon.mentors.members,
      jury: creathon.jury.members,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export team list
export const exportTeamList = async (req, res) => {
  try {
    const { creathonId } = req.params;

    const creathon = await Creathon.findById(creathonId)
      .populate("mentors.members.user")
      .populate("jury.members.user");

    if (!creathon) {
      return res.status(404).json({ message: "Creathon not found" });
    }

    // Convert to CSV format
    let csvContent = "Type,Nom,Email,Statut\n";

    // Add mentors
    creathon.mentors.members.forEach((mentor) => {
      csvContent += `Mentor,${mentor.user.firstName} ${mentor.user.lastName},${mentor.user.email},${mentor.accountStatus}\n`;
    });

    // Add jury members
    creathon.jury.members.forEach((jury) => {
      csvContent += `Jury,${jury.user.firstName} ${jury.user.lastName},${jury.user.email},${jury.status}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=equipe-creathon-${creathonId}.csv`
    );
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCreathonTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { mentors, jury } = req.body;

    // Add default fields (e.g., invitedAt) to new members if not already present
    const mentorMembers = mentors.members.map((m) => ({
      ...m,
      invitedAt: m.invitedAt || new Date(),
    }));

    const juryMembers = jury.members.map((j) => ({
      ...j,
      invitedAt: j.invitedAt || new Date(),
    }));

    const updatedCreathon = await Creathon.findByIdAndUpdate(
      id,
      {
        $set: {
          "mentors.members": mentorMembers,
          "mentors.numberOfMentors": mentorMembers.length,
          "jury.members": juryMembers,
          "jury.numberOfJuries": juryMembers.length,
        },
      },
      { new: true }
    ).populate([
      "coordinators.componentCoordinator",
      "coordinators.generalCoordinator",
      "mentors.members.user",
      "jury.members.user",
    ]);

    if (!updatedCreathon) {
      return res.status(404).json({ message: "Créathon non trouvé" });
    }

    const { componentCoordinator, generalCoordinator } =
      updatedCreathon.coordinators;

    await sendEmail({
      to: generalCoordinator.email,
      subject: "Mise à jour de l'équipe du Créathon",
      html: `
          <p>Bonjour ${generalCoordinator.firstName},</p>
          <p>L'équipe du Créathon "<strong>${
            updatedCreathon.title
          }</strong>" a été mise à jour.</p>
      
          <p><strong>Composition actuelle :</strong></p>
      
          <h4>Mentors (${updatedCreathon.mentors.numberOfMentors})</h4>
          <ul>
            ${updatedCreathon.mentors.members
              .map(
                (m) =>
                  `<li>${m.firstName || "Inconnu"} ${m.lastName || ""} (${
                    m.email || "Email non fourni"
                  })</li>`
              )
              .join("")}
          </ul>
      
          <h4>Jury (${updatedCreathon.jury.numberOfJuries})</h4>
          <ul>
            ${updatedCreathon.jury.members
              .map(
                (j) =>
                  `<li>${j.firstName || "Inconnu"} ${j.lastName || ""} (${
                    j.email || "Email non fourni"
                  })</li>`
              )
              .join("")}
          </ul>
      
          <p>Cordialement,<br>L'équipe Créathon</p>
        `,
    });

    res.status(200).json(updatedCreathon);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'équipe :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
// controllers/creathonController.js
export const getMentorsByRegionId = async (req, res) => {
  try {
    const { regionId } = req.query;

    if (!regionId) {
      return res
        .status(400)
        .json({ message: "L'identifiant de région est requis" });
    }

    const creathon = await Creathon.findOne({ region: regionId }).populate(
      "mentors.members.user",
      "firstName lastName email accountStatus"
    );

    if (!creathon) {
      return res
        .status(404)
        .json({ message: "Aucun créathon trouvé pour cette région" });
    }

    res.status(200).json({
      regionId,
      mentors: creathon.mentors.members,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des mentors par région :",
      error
    );
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const sendTeamInvitations = async (req, res) => {
  try {
    const { id: creathonId } = req.params;
    const { type } = req.body;
    const userId = req.user._id;

    if (!["mentors", "jury"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'mentors' or 'jury'",
      });
    }

    const creathon = await Creathon.findOne({
      _id: creathonId,
      "coordinators.generalCoordinator": userId,
    }).populate({
      path: `${type}.members.user`,
      select: "firstName lastName email",
      match: { email: { $exists: true } },
    });

    if (!creathon) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action",
      });
    }

    const membersToInvite = creathon[type].members
      .map((member) => {
        const email = member.user?.email || member.email;
        const firstName = member.user?.firstName || member.firstName;
        const lastName = member.user?.lastName || member.lastName;
        const userId = member.user?._id || member.user;

        return {
          ...member.toObject(),
          email,
          firstName,
          lastName,
          userId,
        };
      })
      .filter((member) => {
        if (!member.email) {
          console.warn(`Skipping member ${member._id} - no email address`);
          return false;
        }
        return true;
      });

    if (membersToInvite.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No ${type} members with valid email addresses found`,
        details: {
          totalMembers: creathon[type].members.length,
          membersWithEmails: membersToInvite.length,
        },
      });
    }
    console.log("membersToInvite", membersToInvite);
    const emailPayloads = [];
    const failedMembers = [];
    const newUsersCreated = [];

    const model = type === "mentors" ? Mentor : Jury;

    for (const member of membersToInvite) {
      try {
        let user = member.userId ? await User.findById(member.userId) : null;
        let tempPassword = null;

        // Create user if not exists
        if (!user) {
          if (!member.email) throw new Error("No email provided");

          tempPassword = generatePassword();
          user = await User.create({
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            password: tempPassword,
            roles: [type === "mentors" ? "mentor" : "jury"],
            isConfirmed: false,
          });

          newUsersCreated.push(user._id);

          // Update creathon reference
          await Creathon.updateOne(
            { _id: creathonId, [`${type}.members._id`]: member._id },
            { $set: { [`${type}.members.$.user`]: user._id } }
          );
        }

        const token = generateInvitationToken(user._id, creathon._id);

        await model.findOneAndUpdate(
          { user: user._id },
          {
            user: user._id,
            creathon: creathon._id,
            invitationToken: token,
            invitedAt: new Date(),
            status: "invited",
            accountStatus: "pending",
            personalInfo: {
              fullName: `${user.firstName} ${user.lastName}`,
              email: user.email,
              ...(type === "mentors" && {
                phone: member.phone,
                specialization: member.specialization,
              }),
            },
          },
          { upsert: true, new: true }
        );
        const mentorInfo = {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: member.phone,
          specialization: member.specialization,
          invitationToken: token,
          user, // if you need it inside
        };

        const juryInfo = {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          invitationToken: token,
          user,
        };

        const emailPayload =
          type === "mentors"
            ? generateMentorInvitationEmail(mentorInfo, creathon, tempPassword)
            : generateJuryInvitationEmail(juryInfo, creathon, tempPassword);
        // const emailPayload =
        //   type === "mentors"
        //     ? generateMentorInvitationEmail(
        //         { ...member, user, invitationToken: token },
        //         creathon,
        //         tempPassword
        //       )
        //     : generateJuryInvitationEmail(
        //         { ...member, user, invitationToken: token },
        //         creathon,
        //         tempPassword
        //       );
        emailPayloads.push(emailPayload);
      } catch (err) {
        console.error(`Failed to invite ${type} member`, err);
        failedMembers.push({
          memberId: member._id,
          email: member.email,
          error: err.message,
        });
      }
    }

    if (emailPayloads.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid invitations could be generated",
        failedMembers,
      });
    }

    const emailResults = await sendBulkEmails(emailPayloads);
    console.log("email result", emailResults);
    return res.status(200).json({
      success: true,
      message: `Successfully sent ${emailPayloads.length} ${type} invitations`,
      stats: {
        totalMembers: creathon[type].members.length,
        invitationsSent: emailPayloads.length,
        newAccountsCreated: newUsersCreated.length,
        failed: failedMembers.length,
      },
      failedMembers,
    });
  } catch (error) {
    console.error("Error in sendTeamInvitations:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process invitations",
    });
  }
};
