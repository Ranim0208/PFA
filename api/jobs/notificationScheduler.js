import cron from "node-cron";
import Creathon from "../models/Creathon.js";
import Training from "../models/Training.js";
import TrainingOutput from "../models/TrainingOutput.js";
import ParticipantOutput from "../models/ParticipantOutput.js";
import { getParticipantsByTrainingId } from "../helpers/trainingOutput.js";
import AcceptedParticipant from "../models/AcceptedParticipant.js";
import {
  notifyEventReminder,
  notifyOutputReminder,
  notifyLowSubmissionRate,
} from "../services/notificationService.js";

// Seuil critique : taux < 50% et deadline dans 3 jours ou moins
const LOW_RATE_THRESHOLD = 50;
const LOW_RATE_DAYS = [3, 1]; // alerter à J-3 et J-1

const shouldNotify = (daysUntil, hoursUntil) =>
  daysUntil >= 0 || hoursUntil > 0;

const startNotificationScheduler = () => {
  cron.schedule("* * * * *", async () => {
    console.log("🔔 Vérification des rappels...");

    const now = new Date();
    const currentHourTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
    ).getTime();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const formatDate = (date) => date.toISOString().split("T")[0];

    try {
      // ─── CRÉATHONS ───────────────────────────────────────────
      const upcomingCreathons = await Creathon.find({
        "dates.startDate": {
          $gte: new Date(formatDate(now)),
          $lte: new Date(formatDate(in30Days) + "T23:59:59"),
        },
        status: {
          $in: ["planned", "draft", "published", "ongoing", "validated"],
        },
      }).populate(
        "coordinators.componentCoordinator coordinators.generalCoordinator",
      );

      for (const event of upcomingCreathons) {
        const startDate = new Date(event.dates.startDate);
        const daysUntil = Math.round(
          (new Date(formatDate(startDate)) - new Date(formatDate(now))) /
            (1000 * 60 * 60 * 24),
        );
        const hoursUntil = Math.round(
          (new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            startDate.getHours(),
          ).getTime() -
            currentHourTime) /
            (1000 * 60 * 60),
        );
        if (shouldNotify(daysUntil, hoursUntil)) {
          await notifyEventReminder(
            {
              ...event.toObject(),
              type: "creathon",
              startDate: event.dates.startDate,
            },
            daysUntil,
            hoursUntil,
          );
        }
      }

      // ─── TRAININGS / BOOTCAMPS / MENTORATS ───────────────────
      const upcomingTrainings = await Training.find({
        startDate: {
          $gte: new Date(formatDate(now)),
          $lte: new Date(formatDate(in30Days) + "T23:59:59"),
        },
        status: "approved",
      }).populate("componentCoordinator incubationCoordinators trainers");

      for (const event of upcomingTrainings) {
        const startDate = new Date(event.startDate);
        const daysUntil = Math.round(
          (new Date(formatDate(startDate)) - new Date(formatDate(now))) /
            (1000 * 60 * 60 * 24),
        );
        const hoursUntil = Math.round(
          (new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            startDate.getHours(),
          ).getTime() -
            currentHourTime) /
            (1000 * 60 * 60),
        );
        if (shouldNotify(daysUntil, hoursUntil)) {
          await notifyEventReminder(
            { ...event.toObject(), type: event.type },
            daysUntil,
            hoursUntil,
          );
        }
      }

      // ─── RAPPELS LIVRABLES (porteurs de projets) ─────────────
      const upcomingOutputs = await TrainingOutput.find({
        dueDate: {
          $gte: new Date(formatDate(now)),
          $lte: new Date(formatDate(in30Days) + "T23:59:59"),
        },
      }).populate("training", "title type cohorts");

      for (const output of upcomingOutputs) {
        const dueDate = new Date(output.dueDate);
        const daysUntil = Math.round(
          (new Date(formatDate(dueDate)) - new Date(formatDate(now))) /
            (1000 * 60 * 60 * 24),
        );
        const hoursUntil = Math.round(
          (new Date(
            dueDate.getFullYear(),
            dueDate.getMonth(),
            dueDate.getDate(),
            dueDate.getHours(),
          ).getTime() -
            currentHourTime) /
            (1000 * 60 * 60),
        );

        // Rappel aux porteurs de projets
        if (shouldNotify(daysUntil, hoursUntil)) {
          await notifyOutputReminder(output, daysUntil, hoursUntil);
        }

        // ─── ALERTE TAUX BAS (coordinateur d'incubation) ──────
        if (LOW_RATE_DAYS.includes(daysUntil)) {
          // Calculer le taux de soumission actuel
          let totalExpected = 0;
          if (output.targetParticipants?.length > 0) {
            totalExpected = output.targetParticipants.length;
          } else {
            const participants = await getParticipantsByTrainingId(
              output.training._id?.toString() || output.training.toString(),
            );
            totalExpected = participants.length;
          }

          if (totalExpected > 0) {
            const submitted = await ParticipantOutput.countDocuments({
              output: output._id,
              submitted: true,
            });
            const rate = Math.round((submitted / totalExpected) * 100);

            if (rate < LOW_RATE_THRESHOLD) {
              console.log(
                `📉 Alerte taux bas: "${output.title}" → ${rate}% à J-${daysUntil}`,
              );
              await notifyLowSubmissionRate(output, rate, daysUntil);
            }
          }
        }
      }

      console.log("✅ Rappels traités");
    } catch (error) {
      console.error("❌ Erreur scheduler:", error);
    }
  });

  console.log("⏰ Notification scheduler démarré");
};

export default startNotificationScheduler;
