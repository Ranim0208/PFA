import User from "../models/User.js";
import generatePassword from "../utils/passwordGenerator.js";
import ComponentCoordinator from "../models/ComponentCoordinator.js";
import { memberCreateValidator } from "../validators/memberValidator.js";
import sendEmail from "../utils/emailSender.js";
import { generateAccountCreationEmail } from "../utils/addMemberAccount.js";
// controllers/membersController.js
import RegionalCoordinator from "../models/RegionalCoordinator.js";
import Region from "../models/region.js";
import Mentor from "../models/Mentor.js";

// controllers/userController.js
export const AddMember = async (req, res) => {
  try {
    const { firstName, lastName, email, role, region, component } = req.body;

    // Validate request
    const { error } = memberCreateValidator.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      console.error("Validation Error:", error);
      return res.status(400).json({
        errors: error.details.map((detail) => ({
          field: detail.path[0],
          message: detail.message,
        })),
      });
    }

    // Check for required region
    if (role === "RegionalCoordinator" && !region) {
      console.error("Missing Region for Coordinator");
      return res.status(400).json({
        error: "La région est obligatoire pour les coordinateurs régionaux",
      });
    }
    // Component Coordinator requires component
    if (role === "ComponentCoordinator" && !component) {
      console.error("Missing Component for Component Coordinator");
      return res.status(400).json({
        error:
          "Le composant est obligatoire pour les coordinateurs de composante",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error("Duplicate Email:", email);
      return res.status(400).json({
        error: "Un utilisateur avec cet email existe déjà",
      });
    }

    const password = generatePassword();
    // Create the user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: password,
      roles: [role],
      isConfirmed: false,
      isArchived: false,
    });

    await newUser.save();

    // If regional coordinator, create the association
    if (role === "RegionalCoordinator") {
      const regionExists = await Region.findById(region);
      if (!regionExists) {
        console.error("Invalid Region ID:", region);
        return res.status(400).json({
          error: "La région spécifiée n'existe pas",
        });
      }

      await RegionalCoordinator.create({
        user: newUser._id,
        region,
      });
    }
    if (role === "ComponentCoordinator") {
      if (!["crea", "inov"].includes(component)) {
        console.error("Invalid Component:", component);
        return res.status(400).json({
          error: "Le composant doit être soit 'crea' soit 'inov'",
        });
      }
      await ComponentCoordinator.create({
        user: newUser._id,
        component,
      });
    } else if (role === "mentor") {
      // Create mentor record in addition to user
      await Mentor.create({
        user: newUser._id,
        status: "invited",
        accountStatus: "pending",
        personalInfo: {
          fullName: `${firstName} ${lastName}`,
          email: email,
        },
        invitedAt: new Date(),
      });
    }

    const emailTemplate = generateAccountCreationEmail(
      { firstName, lastName, email },
      password,
      role
    );

    await sendEmail(emailTemplate);

    res.status(201).json({
      message: "Membre créé avec succès",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Erreur AddMember:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la création du membre",
      details: error.message,
    });
  }
};

// Backend controller - fix archive filtering
export const getAllMembers = async (req, res) => {
  try {
    // Get pagination and sorting parameters from query
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";
    const includeArchived = req.query.includeArchived === "true";

    // Build filter object
    const filter = {};

    // Handle archive filter - show archived only if includeArchived is true
    if (includeArchived) {
      // When includeArchived is true, show ONLY archived members
      filter.isArchived = true;
    } else {
      // When includeArchived is false, show ONLY active members
      filter.isArchived = false;
    }

    // Search filter
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: "i" } },
        { lastName: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Role filter
    if (req.query.role) filter.roles = { $in: [req.query.role] };

    // Execute paginated query
    const [members, total] = await Promise.all([
      User.find(filter)
        .select("-password -__v")
        .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    res.status(200).json({
      success: true,
      data: members,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
      totalItems: total,
      sort: {
        field: sortField,
        order: sortOrder,
      },
    });
  } catch (error) {
    console.error("Erreur getAllMembers:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la récupération des membres",
      details: error.message,
    });
  }
};

// export const archiveMembers = async (req, res) => {
//   try {
//     const { ids } = req.body;

//     if (!Array.isArray(ids) || ids.length === 0) {
//       return res.status(400).json({ message: "Aucun identifiant fourni." });
//     }

//     // Vérifier combien sont déjà archivés
//     const alreadyArchived = await User.countDocuments({
//       _id: { $in: ids },
//       isArchived: true,
//     });

//     if (alreadyArchived === ids.length) {
//       return res.status(400).json({
//         message:
//           ids.length === 1
//             ? "Ce membre est déjà archivé."
//             : "Tous les membres sélectionnés sont déjà archivés.",
//       });
//     }

//     // Mise à jour des non-archivés
//     const result = await User.updateMany(
//       {
//         _id: { $in: ids },
//         $or: [{ isArchived: false }, { isArchived: { $exists: false } }],
//       },
//       { $set: { isArchived: true } }
//     );

//     const count = result.modifiedCount;

//     res.status(200).json({
//       message:
//         count === 1
//           ? "1 membre a été archivé avec succès."
//           : `${count} membres ont été archivés avec succès.`,
//       modifiedCount: count,
//     });
//   } catch (error) {
//     console.error("Erreur lors de l'archivage des membres:", error);
//     res.status(500).json({ message: "Une erreur interne est survenue." });
//   }
// };
// export const unarchiveMembers = async (req, res) => {
//   try {
//     const { ids } = req.body;

//     if (!Array.isArray(ids) || ids.length === 0) {
//       return res.status(400).json({ message: "Aucun identifiant fourni." });
//     }

//     // Check how many are already unarchived
//     const alreadyUnarchived = await User.countDocuments({
//       _id: { $in: ids },
//       isArchived: false,
//     });

//     if (alreadyUnarchived === ids.length) {
//       return res.status(400).json({
//         message:
//           ids.length === 1
//             ? "Ce membre est déjà désarchivé."
//             : "Tous les membres sélectionnés sont déjà désarchivés.",
//       });
//     }

//     // Update archived members to unarchive them
//     const result = await User.updateMany(
//       {
//         _id: { $in: ids },
//         isArchived: true,
//       },
//       { $set: { isArchived: false } }
//     );

//     const count = result.modifiedCount;

//     res.status(200).json({
//       message:
//         count === 1
//           ? "1 membre a été désarchivé avec succès."
//           : `${count} membres ont été désarchivés avec succès.`,
//       modifiedCount: count,
//     });
//   } catch (error) {
//     console.error("Erreur lors de la désarchivage des membres:", error);
//     res.status(500).json({ message: "Une erreur interne est survenue." });
//   }
// };
// Backend controller
export const manageArchiveStatus = async (req, res) => {
  try {
    const { ids, action } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucun identifiant fourni.",
      });
    }

    if (!["archive", "unarchive"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action invalide.",
      });
    }

    const targetArchivedStatus = action === "archive";

    // First, check the current status of all users
    const users = await User.find(
      { _id: { $in: ids } },
      { _id: 1, isArchived: 1 }
    );

    // Filter users that actually need to be updated
    const usersNeedingUpdate = users.filter(
      (user) => user.isArchived !== targetArchivedStatus
    );

    if (usersNeedingUpdate.length === 0) {
      const message = targetArchivedStatus
        ? ids.length === 1
          ? "Ce membre est déjà archivé."
          : "Tous les membres sélectionnés sont déjà archivés."
        : ids.length === 1
        ? "Ce membre n'est pas archivé."
        : "Aucun des membres sélectionnés n'est archivé.";

      return res.status(400).json({
        success: false,
        message,
      });
    }

    const userIdsToUpdate = usersNeedingUpdate.map((user) => user._id);

    // Update users that need to be changed
    const result = await User.updateMany(
      { _id: { $in: userIdsToUpdate } },
      { $set: { isArchived: targetArchivedStatus } }
    );

    const count = result.modifiedCount;
    const actionText = targetArchivedStatus ? "archivé" : "désarchivé";

    res.status(200).json({
      success: true,
      message:
        count === 1
          ? `1 membre a été ${actionText} avec succès.`
          : `${count} membres ont été ${actionText}s avec succès.`,
      modifiedCount: count,
      action,
    });
  } catch (error) {
    console.error(`Erreur lors du ${req.body.action} des membres:`, error);
    res.status(500).json({
      success: false,
      message: "Une erreur interne est survenue.",
    });
  }
};
export const getAllComponentCoordinators = async (req, res) => {
  try {
    const coordinators = await ComponentCoordinator.find().populate({
      path: "user",
      select: "firstName lastName email",
    });

    const formatted = coordinators.map((coord) => ({
      id: coord.user._id,
      firstName: coord.user.firstName,
      lastName: coord.user.lastName,
      email: coord.user.email,
      component: coord.component,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching component coordinators:", error);
    res
      .status(500)
      .json({ message: "Server error fetching component coordinators" });
  }
};
export const getAllIncubationCoordinators = async (req, res) => {
  try {
    const coordinators = await User.find({
      roles: "IncubationCoordinator",
      isArchived: false,
    }).select("-password");
    const formatted = coordinators.map((coord) => ({
      id: coord._id,
      firstName: coord.firstName,
      lastName: coord.lastName,
      email: coord.email,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
// Get users by role
export const getUsersByRole = async (req, res) => {
  const { role } = req.params;

  try {
    const users = await User.find({ roles: role, isArchived: false }).select(
      "-password"
    );
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users by role:", error);
    res.status(500).json({ message: "Server error fetching users by role" });
  }
};
