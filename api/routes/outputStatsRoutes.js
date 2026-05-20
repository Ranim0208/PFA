// À ajouter dans outputRoutes.js ou monter séparément dans app.js
// GET /outputs/incubation/stats
// Réservé au coordinateur d'incubation

import express from "express";
import TrainingOutput from "../models/TrainingOutput.js";
import ParticipantOutput from "../models/ParticipantOutput.js";
import Training from "../models/Training.js";
import { getParticipantsByTrainingId } from "../helpers/trainingOutput.js";
import authenticate from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

// GET /outputs/incubation/stats
// Retourne pour chaque livrable : taux de soumission, deadline, formation
router.get(
  "/incubation/stats",
  authenticate,
  authorizeRoles("IncubationCoordinator"),
  async (req, res) => {
    try {
      // Toutes les formations approuvées
      const trainings = await Training.find({ status: "approved" }).select(
        "_id title type",
      );
      const trainingIds = trainings.map((t) => t._id);

      // Tous les livrables de ces formations
      const outputs = await TrainingOutput.find({
        training: { $in: trainingIds },
      })
        .populate("training", "title type cohorts")
        .lean();

      // Pour chaque livrable, calculer le taux de soumission
      const stats = await Promise.all(
        outputs.map(async (output) => {
          // Nombre total de porteurs attendus
          let totalExpected = 0;
          if (output.targetParticipants?.length > 0) {
            totalExpected = output.targetParticipants.length;
          } else {
            const participants = await getParticipantsByTrainingId(
              output.training._id.toString(),
            );
            totalExpected = participants.length;
          }

          // Nombre de soumissions effectuées
          const submitted = await ParticipantOutput.countDocuments({
            output: output._id,
            submitted: true,
          });

          const rate =
            totalExpected > 0
              ? Math.round((submitted / totalExpected) * 100)
              : 0;

          const now = new Date();
          const dueDate = new Date(output.dueDate);
          const daysUntilDue = Math.ceil(
            (dueDate - now) / (1000 * 60 * 60 * 24),
          );
          const isOverdue = daysUntilDue < 0;

          return {
            outputId: output._id,
            title: output.title,
            trainingTitle: output.training?.title || "",
            trainingType: output.training?.type || "",
            dueDate: output.dueDate,
            daysUntilDue,
            isOverdue,
            totalExpected,
            totalSubmitted: submitted,
            submissionRate: rate,
            // "critique" si taux < 50% et deadline dans moins de 3 jours
            isCritical: rate < 50 && daysUntilDue >= 0 && daysUntilDue <= 3,
          };
        }),
      );

      // Trier : critiques en premier, puis par deadline
      stats.sort((a, b) => {
        if (a.isCritical !== b.isCritical) return a.isCritical ? -1 : 1;
        return a.daysUntilDue - b.daysUntilDue;
      });

      res.json({ success: true, data: stats });
    } catch (err) {
      console.error("❌ Erreur stats livrables:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

export default router;
