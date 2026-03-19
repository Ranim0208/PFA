import Form from "../models/form.js";
import TemplateField from "../models/templateField.js"; // Assuming you have TemplateField model
import { validateCandidatureForm } from "../validators/formCreationValidator.js";
import { validateTemplateField } from "../validators/optionValidator.js";
import Region from "../models/region.js";
import mongoose from "mongoose";

export const createForm = async (req, res) => {
  try {
    const { fields, region: regionNames, ...formData } = req.body;
    console.log("Received body:", req.body);
    console.log("Region data:", regionNames);

    // Validate region - check both existence and non-empty values
    if (!regionNames || typeof regionNames !== "object") {
      return res.status(400).json({
        error:
          "Region is required and must be an object with French and Arabic names",
      });
    }

    if (
      !regionNames.fr ||
      !regionNames.ar ||
      regionNames.fr.trim() === "" ||
      regionNames.ar.trim() === ""
    ) {
      return res.status(400).json({
        error: "Region must have both French and Arabic names",
      });
    }

    // Find or create region
    let region = await Region.findOne({
      $or: [
        { "name.fr": regionNames.fr.trim() },
        { "name.ar": regionNames.ar.trim() },
      ],
    });

    if (!region) {
      region = await new Region({
        name: {
          fr: regionNames.fr.trim(),
          ar: regionNames.ar.trim(),
        },
      }).save();
      console.log("Created new region:", region);
    } else {
      console.log("Found existing region:", region);
    }

    // Validate form data
    let validatedFormData;
    try {
      validatedFormData = validateCandidatureForm({
        ...formData,
        region: regionNames, // Keep original for validation
        createdBy: req.user.id,
      });
    } catch (validationError) {
      console.error("Form validation error:", validationError);
      return res.status(400).json({ error: validationError.message });
    }

    // Process fields
    if (!Array.isArray(fields)) {
      return res.status(400).json({ error: "Fields must be an array." });
    }

    const fieldIds = [];
    const now = new Date();

    for (const field of fields) {
      try {
        console.log("Processing field:", {
          _id: field._id,
          id: field.id,
          type: field.type,
          isTemplate: field.isTemplate,
          templateId: field.templateId,
          isFromTemplate: field.isFromTemplate,
          templateFieldId: field.templateFieldId,
        });

        // CORRECTION: VALIDER LE CHAMP AVEC validateTemplateField
        let validatedField;
        try {
          // Nettoyer le champ avant validation (supprimer les propriétés temporaires)
          const cleanField = { ...field };
          delete cleanField.id; // Supprimer l'ID temporaire du frontend
          delete cleanField.tempId;

          // Valider le champ
          validatedField = validateTemplateField(cleanField);
          console.log("✅ Field validated successfully:", validatedField.type);
        } catch (validationError) {
          console.error("Field validation failed:", validationError.message);
          // Créer un champ basique si la validation échoue
          validatedField = {
            type: field.type || "text",
            label: field.label || { fr: "Nouveau champ", ar: "حقل جديد" },
            name: field.name || `field_${Date.now()}`,
            required: field.required || false,
            placeholder: field.placeholder || { fr: "", ar: "" },
            options: field.options || [],
            isTemplate: false,
          };
          console.log("🔄 Using fallback field after validation error");
        }

        // CORRECTION: Vérifier si c'est un template field avec un ID valide
        if (
          (validatedField.isTemplate || validatedField.isFromTemplate) &&
          validatedField.templateId
        ) {
          // Vérifier si l'ID est un ObjectId valide
          if (mongoose.Types.ObjectId.isValid(validatedField.templateId)) {
            // Handle template field reference
            const templateField = await TemplateField.findByIdAndUpdate(
              validatedField.templateId,
              {
                $inc: { usageCount: 1 },
                $set: { lastUsedAt: now },
              },
              { new: true }
            );

            if (!templateField) {
              console.warn(
                "Template field not found:",
                validatedField.templateId
              );
              // Créer un nouveau champ à la place
              const newField = await createNewField(
                validatedField,
                req.user.id
              );
              fieldIds.push(newField._id);
            } else {
              fieldIds.push(templateField._id);
              console.log("✅ Used template field:", templateField._id);
            }
          } else {
            console.warn(
              "Invalid ObjectId for template field:",
              validatedField.templateId
            );
            // Créer un nouveau champ à la place
            const newField = await createNewField(validatedField, req.user.id);
            fieldIds.push(newField._id);
          }
        } else if (
          validatedField._id &&
          mongoose.Types.ObjectId.isValid(validatedField._id)
        ) {
          // CORRECTION: Vérifier si c'est un champ existant avec un ObjectId valide
          const existingField = await TemplateField.findById(
            validatedField._id
          );
          if (existingField) {
            // Update the existing field avec les données validées
            existingField.type = validatedField.type;
            existingField.label = validatedField.label;
            existingField.name = validatedField.name;
            existingField.required = validatedField.required;
            existingField.placeholder = validatedField.placeholder;
            existingField.options = validatedField.options;
            existingField.isTemplate = validatedField.isTemplate;

            await existingField.save();
            fieldIds.push(existingField._id);
            console.log("✅ Updated existing field:", existingField._id);
          } else {
            // Field not found, create new one
            const newField = await createNewField(validatedField, req.user.id);
            fieldIds.push(newField._id);
            console.log("✅ Created new field (replacement):", newField._id);
          }
        } else {
          // CORRECTION: C'est un nouveau champ (a un ID temporaire ou pas d'_id)
          const newField = await createNewField(validatedField, req.user.id);
          fieldIds.push(newField._id);
          console.log("✅ Created new field:", newField._id);
        }
      } catch (fieldError) {
        console.error("Field processing error:", fieldError);
        // CORRECTION: Continuer avec les autres champs au lieu d'arrêter
        try {
          // Créer un champ minimal en cas d'erreur
          const fallbackField = await createNewField(
            {
              type: "text",
              label: { fr: "Champ de secours", ar: "حقل احتياطي" },
              name: `field_fallback_${Date.now()}`,
              required: false,
              placeholder: { fr: "", ar: "" },
              options: [],
              isTemplate: false,
            },
            req.user.id
          );
          fieldIds.push(fallbackField._id);
          console.log(
            "✅ Created fallback field after error:",
            fallbackField._id
          );
        } catch (fallbackError) {
          console.error("Even fallback field creation failed:", fallbackError);
          // Ne pas arrêter tout le processus pour un seul champ
          continue;
        }
      }
    }

    // Create the form with region ObjectId, not the region names
    const newForm = new Form({
      ...validatedFormData,
      fields: fieldIds,
      region: region._id, // Use the ObjectId here
      imageUrl: req.body.imageUrl || validatedFormData.imageUrl || "",
    });

    console.log("Creating form with data:", {
      ...validatedFormData,
      fields: fieldIds,
      region: region._id,
    });

    await newForm.save();
    console.log("Form saved successfully:", newForm._id);

    // Return populated response
    const populatedForm = await Form.findById(newForm._id)
      .populate("region", "name.fr name.ar")
      .populate({
        path: "fields",
        select: "-__v -createdAt -updatedAt",
      });

    res.status(201).json(populatedForm);
  } catch (error) {
    console.error("Create Form Error:", error);

    // Handle different error types
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({ error: errorMessages.join(", ") });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        error: `Duplicate field error: ${
          Object.keys(error.keyValue)[0]
        } already exists`,
      });
    }

    res.status(500).json({
      error: "An unexpected error occurred: " + error.message,
    });
  }
};
// Sauvegarder un formulaire comme modèle
export const saveFormAsTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category = "custom", tags = [] } = req.body;

    // Trouver le formulaire original
    const originalForm = await Form.findById(id)
      .populate("fields")
      .populate("region");

    if (!originalForm) {
      return res.status(404).json({ message: "Formulaire non trouvé" });
    }

    // Créer une copie profonde des champs
    const fieldCopies = await Promise.all(
      originalForm.fields.map(async (field) => {
        const fieldData = field.toObject();
        delete fieldData._id;
        delete fieldData.createdAt;
        delete fieldData.updatedAt;

        const fieldCopy = new TemplateField({
          ...fieldData,
          isTemplateField: true,
          createdFrom: field._id,
        });
        await fieldCopy.save();
        return fieldCopy._id;
      })
    );

    // Créer le modèle
    const template = new Form({
      title: title || {
        fr: `Modèle : ${originalForm.title.fr}`,
        ar: `قالب: ${originalForm.title.ar}`,
      },
      description: description || originalForm.description,
      fields: fieldCopies,
      isTemplate: true,
      templateCategory: category,
      templateTags: [...tags, "sauvegardé-du-formulaire"],
      createdBy: req.user.id,
    });

    await template.save();

    await template.populate("fields");
    await template.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Formulaire sauvegardé comme modèle avec succès",
      template,
    });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du modèle:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
};

// Créer un formulaire à partir d’un modèle
export const createFormFromTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const formData = req.body;

    const template = await Form.findOne({
      _id: templateId,
      isTemplate: true,
    }).populate("fields");

    if (!template) {
      return res.status(404).json({ message: "Modèle non trouvé" });
    }

    const fieldCopies = await Promise.all(
      template.fields.map(async (field) => {
        const fieldData = field.toObject();
        delete fieldData._id;
        delete fieldData.createdAt;
        delete fieldData.updatedAt;

        const fieldCopy = new TemplateField({
          ...fieldData,
          isTemplateField: false,
          createdFrom: field._id,
        });
        await fieldCopy.save();
        return fieldCopy._id;
      })
    );

    const newForm = new Form({
      ...formData,
      fields: fieldCopies,
      createdBy: req.user.id,
      isTemplate: false,
      basedOnTemplate: templateId,
    });

    await newForm.save();

    await Form.findByIdAndUpdate(templateId, {
      $inc: { templateUsageCount: 1 },
    });

    await newForm.populate("fields");
    await newForm.populate("region");
    await newForm.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Formulaire créé à partir du modèle avec succès",
      form: newForm,
    });
  } catch (error) {
    console.error("Erreur lors de la création du formulaire:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
};

// Récupérer les modèles
export const getTemplates = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      category = "",
      sortField = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const searchQuery = {
      isTemplate: true,
      ...(search && {
        $or: [
          { "title.fr": { $regex: search, $options: "i" } },
          { "title.ar": { $regex: search, $options: "i" } },
          { "description.fr": { $regex: search, $options: "i" } },
          { "description.ar": { $regex: search, $options: "i" } },
          { templateTags: { $in: [new RegExp(search, "i")] } },
        ],
      }),
      ...(category && { templateCategory: category }),
    };

    const templates = await Form.find(searchQuery)
      .populate("fields")
      .populate("createdBy", "name email")
      .sort({ [sortField]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    const totalTemplates = await Form.countDocuments(searchQuery);

    res.json({
      success: true,
      data: templates,
      pagination: {
        page: parseInt(page),
        pageSize: limit,
        total: totalTemplates,
        totalPages: Math.ceil(totalTemplates / limit),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des modèles:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des modèles",
      details: error.message,
    });
  }
};

// Dans un fichier utils/objectId.js

// Get a specific form by ID, including populated fields
export const getFormById = async (req, res) => {
  try {
    const { id } = req.params;

    // Population corrigée avec vérification explicite
    const form = await Form.findById(id)
      .populate({
        path: "createdBy",
        select: "_id", // Seul l'ID est nécessaire pour la vérification
        model: "User",
      })
      .populate("region", "name.fr name.ar")
      .lean();

    if (!form) {
      return res.status(404).json({ error: "Formulaire introuvable" });
    }

    // Vérification sécurisée de l'utilisateur
    if (!req.user?._id) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    // Conversion explicite en chaînes pour comparaison
    const formOwnerId = form.createdBy?._id?.toString();
    const currentUserId = req.user._id.toString();

    // Vérification de permission
    if (!form.published && formOwnerId !== currentUserId) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Population supplémentaire uniquement si nécessaire
    const populatedForm = await Form.populate(form, [
      { path: "fields", model: "TemplateField" },
      { path: "validatedBy", select: "_id name", model: "User" },
    ]);

    res.json({
      ...populatedForm,
      _id: populatedForm._id.toString(),
      createdBy: formOwnerId,
    });
  } catch (error) {
    console.error("Erreur de récupération:", {
      params: req.params,
      user: req.user?._id,
      error: error.message,
    });
    res.status(500).json({
      error: "Erreur serveur",
      details: error.message,
    });
  }
};
// Update a form, including its fields

// Update a form, including its fields
export const updateForm = async (req, res) => {
  try {
    console.log("=== FULL REQUEST BODY ===");
    console.log("Complete req.body:", req.body);
    console.log("req.body fields:", req.body.fields);
    console.log("req.body fields type:", typeof req.body.fields);
    console.log("req.body fields length:", req.body.fields?.length);
    console.log("=== END REQUEST BODY ===");

    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: "Formulaire non trouvé" });
    }

    // VÉRIFICATION CRITIQUE: Bloquer TOUTE modification si le formulaire est publié
    // if (form.published) {
    //   return res.status(403).json({
    //     error:
    //       "Impossible de modifier un formulaire publié. Veuillez d'abord le dépublier pour effectuer des modifications.",
    //     code: "FORM_PUBLISHED_NO_UPDATE",
    //     details: {
    //       formId: form._id,
    //       publishedAt: form.publishedAt,
    //       publishedBy: form.publishedBy,
    //     },
    //   });
    // }
    const {
      fields,
      prizes,
      eventDates,
      region: regionUpdate,
      ...formData
    } = req.body;

    console.log("After destructuring - fields:", fields);
    console.log("After destructuring - fields count:", fields?.length);

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    // If fields is undefined, try to get it from the raw body
    const fieldsToProcess = fields || req.body.fields || [];
    console.log("Fields to process:", fieldsToProcess.length);

    // Handle region update if provided
    if (regionUpdate) {
      if (!regionUpdate.fr || !regionUpdate.ar) {
        return res.status(400).json({
          error: "Region must have both French and Arabic names",
        });
      }

      let region = await Region.findOne({
        $or: [{ "name.fr": regionUpdate.fr }, { "name.ar": regionUpdate.ar }],
      });

      if (!region) {
        region = await new Region({
          name: {
            fr: regionUpdate.fr,
            ar: regionUpdate.ar,
          },
        }).save();
      }

      form.region = region._id;
    }

    // Update top-level form data (excluding fields)
    Object.assign(form, formData);

    // Handle fields update
    if (Array.isArray(fieldsToProcess) && fieldsToProcess.length > 0) {
      console.log("Processing fields array:", fieldsToProcess.length);

      const fieldIds = [];

      for (const fieldData of fieldsToProcess) {
        console.log("Processing field:", {
          _id: fieldData._id,
          type: fieldData.type,
          isTemplate: fieldData.isTemplate,
          templateId: fieldData.templateId,
        });

        if (fieldData.isTemplate && fieldData.templateId) {
          // Use existing template field
          const templateField = await TemplateField.findById(
            fieldData.templateId
          );
          if (templateField) {
            fieldIds.push(templateField._id);
            console.log("Added template field:", templateField._id);
          } else {
            console.log("Template field not found:", fieldData.templateId);
          }
        } else if (fieldData._id && !fieldData._id.startsWith("temp-")) {
          // This is an existing field in the database
          const existingField = await TemplateField.findById(fieldData._id);
          if (existingField) {
            // Update the existing field
            existingField.type = fieldData.type;
            existingField.label = fieldData.label;
            existingField.name = fieldData.name;
            existingField.required = fieldData.required;
            existingField.placeholder = fieldData.placeholder;
            existingField.options = fieldData.options;

            await existingField.save();
            fieldIds.push(existingField._id);
            console.log("Updated existing field:", existingField._id);
          } else {
            // Field not found, create new one
            const newField = await createNewField(fieldData, req.user?._id);
            fieldIds.push(newField._id);
            console.log("Created new field (replacement):", newField._id);
          }
        } else {
          // This is a new field (has temp ID or no _id)
          const newField = await createNewField(fieldData, req.user?._id);
          fieldIds.push(newField._id);
          console.log("Created new field:", newField._id);
        }
      }

      // Replace the form's fields array with the new ordered array
      form.fields = fieldIds;
      console.log("Final field IDs:", fieldIds);
    } else {
      console.log("No fields to process or fields is not an array");
    }

    // Update prizes if provided
    if (Array.isArray(prizes)) {
      form.prizes = prizes.map((prize) => ({
        ...prize,
        _id: prize._id || new mongoose.Types.ObjectId(),
      }));
    }

    // Update event dates if provided
    if (Array.isArray(eventDates)) {
      form.eventDates = eventDates.map((event) => ({
        ...event,
        _id: event._id || new mongoose.Types.ObjectId(),
      }));
    }

    form.updatedAt = new Date();

    // Save the form
    await form.save();
    console.log("Form saved successfully");

    // Populate and return the updated form
    const populatedForm = await Form.findById(form._id)
      .populate("region", "name.fr name.ar")
      .populate("fields");

    res.json({
      success: true,
      form: populatedForm,
    });
  } catch (error) {
    console.error("Error in updateForm:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: messages.join(", ") });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        error: `Duplicate key error: ${
          Object.keys(error.keyValue)[0]
        } already exists`,
      });
    }

    res.status(500).json({
      error: `Server error: ${error.message}`,
    });
  }
};

// Helper function to create new fields
async function createNewField(fieldData, userId) {
  console.log("Creating new field with data:", {
    type: fieldData.type,
    label: fieldData.label,
    name: fieldData.name,
    required: fieldData.required,
    placeholder: fieldData.placeholder,
    options: fieldData.options,
    isTemplate: fieldData.isTemplate || false,
    createdBy: userId,
  });

  // CORRECTION: S'assurer que le nom est unique en ajoutant un timestamp
  const uniqueName = fieldData.name
    ? `${fieldData.name}_${Date.now()}`
    : `field_${Date.now()}`;

  const newField = new TemplateField({
    type: fieldData.type,
    label: fieldData.label || { fr: "Nouveau champ", ar: "حقل جديد" },
    name: uniqueName,
    required: fieldData.required || false,
    placeholder: fieldData.placeholder || { fr: "", ar: "" },
    options: fieldData.options || [],
    isTemplate: fieldData.isTemplate || false,
    createdBy: userId,
  });

  const savedField = await newField.save();
  console.log("✅ New field created:", savedField._id);
  return savedField;
}

// Get all forms with pagination and filters
export const getAllForms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const filter = {};

    // Recherche texte
    if (req.query.search) {
      filter.$or = [
        { "title.fr": { $regex: req.query.search, $options: "i" } },
        { "title.ar": { $regex: req.query.search, $options: "i" } },
        { "description.fr": { $regex: req.query.search, $options: "i" } },
        { "description.ar": { $regex: req.query.search, $options: "i" } },
      ];
    }

    // createdBy
    if (req.query.createdBy) {
      filter.createdBy = req.query.createdBy;
    }

    // isTemplate
    if (req.query.isTemplate !== undefined) {
      filter.isTemplate = req.query.isTemplate === "true";
    }

    // Filtre région par ID
    const { regionId } = req.query;
    if (regionId && mongoose.Types.ObjectId.isValid(regionId)) {
      filter.region = new mongoose.Types.ObjectId(regionId);
    }

    // Fallback par nom de région (optionnel)
    const { regionNameFr, regionNameAr } = req.query;
    if (!filter.region && (regionNameFr || regionNameAr)) {
      const nameQuery = {};
      if (regionNameFr)
        nameQuery["name.fr"] = { $regex: regionNameFr, $options: "i" };
      if (regionNameAr)
        nameQuery["name.ar"] = { $regex: regionNameAr, $options: "i" };
      const regionDoc = await Region.findOne(nameQuery).select("_id").lean();
      if (regionDoc?._id) {
        filter.region = regionDoc._id;
      } else {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: { page, pageSize, total: 0, totalPages: 0 },
          sort: { field: sortField, order: sortOrder === 1 ? "asc" : "desc" },
        });
      }
    }

    // -------- Filtrage par date de candidature --------
    // Hypothèse: le modèle Form possède startDate et endDate (Date).
    // Si vos champs diffèrent, renommez ci-dessous.
    const now = new Date();

    const { status, dateFrom, dateTo, dateField } = req.query;
    // dateField permet de choisir le champ cible pour dateFrom/dateTo: "createdAt" (défaut), "startDate" ou "endDate"
    const targetField = ["createdAt", "startDate", "endDate"].includes(
      dateField
    )
      ? dateField
      : "createdAt";

    // Fenêtre libre: ?dateFrom=2025-01-01&dateTo=2025-12-31&dateField=createdAt
    if (dateFrom || dateTo) {
      const range = {};
      if (dateFrom) range.$gte = new Date(dateFrom); // début inclus
      if (dateTo) {
        // pour couvrir toute la journée de dateTo, passez une fin exclusive du lendemain minuit si besoin
        // Sinon, utilisez <= en gardant $lte si votre besoin est inclusif.
        range.$lte = new Date(dateTo);
      }
      filter[targetField] = { ...(filter[targetField] || {}), ...range };
    }

    // Statuts dynamiques (à venir / en cours / terminé) basés sur startDate/endDate
    if (status === "upcoming") {
      filter.startDate = { ...(filter.startDate || {}), $gt: now };
    } else if (status === "ongoing") {
      filter.startDate = { ...(filter.startDate || {}), $lte: now };
      filter.endDate = { ...(filter.endDate || {}), $gt: now };
    } else if (status === "ended") {
      filter.endDate = { ...(filter.endDate || {}), $lte: now };
    }

    const [forms, total] = await Promise.all([
      Form.find(filter)
        .populate("createdBy", "firstName lastName email")
        .populate("validatedBy", "firstName lastName email")
        .populate("updatedBy", "firstName lastName email")
        .populate("fields")
        .populate("region", "name.fr name.ar")
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Form.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    res.status(200).json({
      success: true,
      data: forms,
      pagination: { page, pageSize, total, totalPages },
      sort: { field: sortField, order: sortOrder === 1 ? "asc" : "desc" },
      filters: {
        status: status || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        dateField: targetField,
      },
    });
  } catch (error) {
    console.error("Error in getAllForms:", error);
    res.status(500).json({
      success: false,
      error: "Server error when retrieving forms",
      details: error.message,
    });
  }
};

export const getTemplateFields = async (req, res) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1; // Current page
    const pageSize = parseInt(req.query.pageSize) || 20; // Number of items per page
    const sortField = req.query.sortField || "createdAt"; // Sorting field
    const sortOrder = req.query.sortOrder || "desc"; // Sorting order

    // Execute paginated query for template fields
    const [fields, total] = await Promise.all([
      TemplateField.find({ isTemplate: true })
        .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 }) // Sorting based on query parameters
        .skip((page - 1) * pageSize) // Skip based on the current page and page size
        .limit(pageSize) // Limit results to page size
        .lean(), // Return plain objects (optional)

      TemplateField.countDocuments({ isTemplate: true }), // Count total documents for template fields
    ]);

    const totalPages = Math.ceil(total / pageSize); // Calculate total pages

    // Return paginated response
    res.status(200).json({
      success: true,
      data: fields,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
      sort: {
        field: sortField,
        order: sortOrder,
      },
    });
  } catch (error) {
    console.error("Error in getTemplateFields:", error);
    res.status(500).json({
      success: false,
      error: "Server error when retrieving template fields",
      details: error.message,
    });
  }
};
// DELETE /forms/:id
export const deleteForm = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedForm = await Form.findByIdAndDelete(id);

    if (!deletedForm) {
      return res
        .status(404)
        .json({ success: false, message: "Formulaire introuvable" });
    }

    res
      .status(200)
      .json({ success: true, message: "Formulaire supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du formulaire:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      details: error.message,
    });
  }
};
export const validateForms = async (req, res) => {
  try {
    const { ids } = req.body;
    console.log("body", req.body);

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Aucun identifiant fourni." });
    }

    // Vérifier combien sont déjà validés
    const alreadyPublished = await Form.countDocuments({
      _id: { $in: ids },
      validated: true,
    });

    if (alreadyPublished === ids.length) {
      return res.status(400).json({
        message:
          ids.length === 1
            ? "Ce formulaire est déjà validé."
            : "Tous les formulaires sélectionnés sont déjà validés.",
      });
    }

    // Mise à jour
    const result = await Form.updateMany(
      {
        _id: { $in: ids },
        validated: false,
      },
      {
        $set: {
          validated: true,
          validatedAt: new Date(),
          validatedBy: req.user._id,
        },
      }
    );

    res.status(200).json({
      message:
        result.modifiedCount === 1
          ? "1 formulaire a été validé avec succès."
          : `${result.modifiedCount} formulaires ont été validés avec succès.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Erreur lors de la validation des formulaires :", error);
    res.status(500).json({ message: "Une erreur interne est survenue." });
  }
};
export const publishValidatedForms = async (req, res) => {
  try {
    const { formIds } = req.body;

    // Ensure the formIds are provided and are an array
    if (!Array.isArray(formIds) || formIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Aucun formulaire sélectionné." });
    }

    // Vérifier combien sont déjà publiés
    const alreadyPublished = await Form.countDocuments({
      _id: { $in: formIds },
      validated: true, // Ensure only validated forms are considered
      published: true, // Ensure that the form is already published
    });

    if (alreadyPublished === formIds.length) {
      return res.status(400).json({
        message:
          formIds.length === 1
            ? "Ce formulaire est déjà publié."
            : "Tous les formulaires sélectionnés sont déjà publiés.",
      });
    }

    // Mise à jour des formulaires validés mais non publiés
    const result = await Form.updateMany(
      {
        _id: { $in: formIds },
        validated: true, // Only validated forms can be published
        published: false, // Ensure the form is not already published
      },
      {
        $set: {
          published: true,
          publishedBy: req.user._id, // Set the current user as the publisher
          publishedAt: new Date(), // Set the current date as the published date
        },
      }
    );

    res.status(200).json({
      message:
        result.modifiedCount === 1
          ? "1 formulaire a été publié avec succès."
          : `${result.modifiedCount} formulaires ont été publiés avec succès.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Erreur lors de la publication des formulaires :", error);
    res.status(500).json({
      success: false,
      message:
        "Une erreur interne est survenue lors de la publication des formulaires.",
    });
  }
};

// Get published forms that are currently open for students
export const getPublishedForms = async (req, res) => {
  try {
    const now = new Date();
    const forms = await Form.find({
      published: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate("createdBy", "firstName lastName")
      .populate("fields")
      .populate("region", "name.fr name.ar")
      .sort({ startDate: -1 })
      .lean();
    res.status(200).json({
      success: true,
      message: `${forms.length} formulaire(s) ouvert(s) récupéré(s) avec succès.`,
      data: forms.map((form) => ({
        ...form,
        status: "open",
        daysRemaining: Math.ceil((form.endDate - now) / (1000 * 60 * 60 * 24)),
      })),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des formulaires :", error);
    res.status(500).json({
      success: false,
      message:
        "Erreur serveur lors de la récupération des formulaires ouverts.",
      error: error.message,
    });
  }
};
