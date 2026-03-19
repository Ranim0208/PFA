import express from "express";
const router = express.Router();
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import authenticate from "../middlewares/authMiddleware.js";
import { uploadAffiche, getAfficheUrl } from "../utils/afficheUpload.js";
import multer from "multer";
import {
  createForm,
  getTemplates,
  getFormById,
  getAllForms,
  updateForm,
  getTemplateFields,
  deleteForm,
  validateForms,
  publishValidatedForms,
  getPublishedForms,
  saveFormAsTemplate,
  createFormFromTemplate,
} from "../controllers/candidaturesController.js";


// Accepte n’importe quel fichier et regroupe par fieldname
const handleAfficheUpload = (req, res, next) => {
  const upload = uploadAffiche.any(); 
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "Fichier > 5 Mo" });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    // Regrouper req.files si tableau → objet { fieldname: [files] }
    if (req.files && Array.isArray(req.files)) {
      const filesObject = {};
      req.files.forEach((file) => {
        if (!filesObject[file.fieldname]) filesObject[file.fieldname] = [];
        filesObject[file.fieldname].push(file);
      });
      req.files = filesObject;
    }

    // Si le front envoie le champ "affiche" comme input name="affiche"
    // injecter l’URL dans req.body.imageUrl pour le contrôleur
    if (req.files?.affiche?.length) {
      const f = req.files.affiche[0];
      req.body.imageUrl = getAfficheUrl(f.filename);
    }

    next();
  });
};

// Get published forms for students
router.get("/open", getPublishedForms);

// Création de formulaire
router.post(
  "/add",
  authenticate,
  authorizeRoles("IncubationCoordinator"),
  handleAfficheUpload,
  createForm
);
// Récupération des fields templates
router.get("/template-fields", getTemplateFields);

// Récupération des formulaires templates
router.get("/templates", authenticate, getTemplates);

// Save form as template
router.post(
  "/:id/save-as-template",
  authenticate,
  authorizeRoles("IncubationCoordinator"),
  saveFormAsTemplate
);

// Apply template to form
router.post(
  "/:formId/apply-template/:templateId",
  authenticate,
  authorizeRoles("IncubationCoordinator"),
  createFormFromTemplate
);

// Récupération d'un formulaire
router.get("/:id", authorizeRoles("IncubationCoordinator"), getFormById);

// Mise à jour de formulaire
router.put("/:id", updateForm);

// Récupération de toutes les formulaires
router.get(
  "/",
  authorizeRoles("IncubationCoordinator", "ComponentCoordinator"),
  getAllForms
);
// Suppression de formulaire
router.delete("/:id", authorizeRoles("IncubationCoordinator"), deleteForm);
// Publication de formulaires (par ComponentCoordinator uniquement)
router.patch(
  "/validate",
  authorizeRoles("ComponentCoordinator"),
  validateForms
);
// Handle publishing validated forms
router.patch(
  "/publish-validated",
  authorizeRoles("IncubationCoordinator"),
  publishValidatedForms
);

export default router;
