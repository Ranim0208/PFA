import admin from "../config/firebase.js";
import NotificationPreference from "../models/NotificationPreference.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import RegionalCoordinator from "../models/RegionalCoordinator.js";
import AcceptedParticipant from "../models/AcceptedParticipant.js";
import TrainingOutput from "../models/TrainingOutput.js";

// Ajouter la fonction
export const notifyPendingRegionalValidation = async (creathon) => {
  console.log("🔔 notifyPendingRegionalValidation:", creathon.title);

  if (!creathon.region)
    return console.warn("⚠️  Pas de région sur le créathon");

  // Trouver le coordinateur régional de la même région que le créathon
  const regionalCoord = await RegionalCoordinator.findOne({
    region: creathon.region,
  }).select("user");

  if (!regionalCoord)
    return console.warn("⚠️  Pas de RegionalCoordinator pour cette région");

  const tokens = await getTokensForUsers([regionalCoord.user.toString()]);
  console.log("📱 Tokens RegionalCoordinator:", tokens.length);
  if (!tokens.length) return;

  await sendNotification(
    tokens,
    `⏳ Créathon en attente de validation`,
    `Le créathon "${creathon.title}" attend votre validation régionale`,
    { eventId: creathon._id.toString(), eventType: "creathon" },
  );
};
const cleanInvalidTokens = async (tokens, responses) => {
  const invalidTokens = tokens.filter((_, i) => {
    const err = responses[i]?.error?.code;
    return (
      err === "messaging/registration-token-not-registered" ||
      err === "messaging/invalid-registration-token"
    );
  });
  if (!invalidTokens.length) return;
  await NotificationPreference.updateMany(
    { "fcmTokens.token": { $in: invalidTokens } },
    { $pull: { fcmTokens: { token: { $in: invalidTokens } } } },
  );
  console.log(`🧹 ${invalidTokens.length} tokens invalides supprimés`);
};

// Sauvegarde la notification en BDD pour chaque destinataire (historique)
const saveNotificationsForUsers = async (
  userIds,
  title,
  body,
  eventType,
  eventId,
) => {
  if (!userIds || !userIds.length) return;
  try {
    const docs = userIds.map((userId) => ({
      user: userId,
      title,
      body,
      eventType,
      eventId: eventId || undefined,
      isRead: false,
    }));
    await Notification.insertMany(docs, { ordered: false });
    console.log(`💾 ${docs.length} notifications sauvegardées en BDD`);
  } catch (err) {
    console.error("❌ Erreur sauvegarde notifications BDD:", err);
  }
};

// userIds optionnel : si fourni, sauvegarde en BDD pour l'historique
const sendNotification = async (
  tokens,
  title,
  body,
  data = {},
  userIds = [],
) => {
  // Sauvegarder en BDD pour tous les destinataires (même hors-ligne)
  if (userIds.length) {
    await saveNotificationsForUsers(
      userIds,
      title,
      body,
      data.eventType,
      data.eventId,
    );
  }

  if (!tokens || !tokens.length) return;

  // FCM exige que toutes les valeurs du champ `data` soient des strings
  const stringData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, String(v ?? "")]),
  );

  // sendEachForMulticast accepte max 500 tokens par appel
  const CHUNK_SIZE = 500;
  const chunks = [];
  for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
    chunks.push(tokens.slice(i, i + CHUNK_SIZE));
  }

  let totalSuccess = 0;
  let totalFailure = 0;
  const allTokensFlat = [];
  const allResponsesFlat = [];

  try {
    for (const chunk of chunks) {
      const message = {
        notification: { title, body },
        data: stringData,
        tokens: chunk,
      };
      const response = await admin.messaging().sendEachForMulticast(message);
      totalSuccess += response.successCount;
      totalFailure += response.failureCount;
      response.responses.forEach((resp, i) => {
        if (!resp.success) console.error(`❌ Token ${i}:`, resp.error);
      });
      allTokensFlat.push(...chunk);
      allResponsesFlat.push(...response.responses);
    }
    console.log(`✅ ${totalSuccess} envoyées, ❌ ${totalFailure} échecs`);
    await cleanInvalidTokens(allTokensFlat, allResponsesFlat);
  } catch (error) {
    console.error("❌ Erreur envoi notification:", error);
  }
};

const toIdArray = (field) => {
  if (!field) return [];
  const items = Array.isArray(field) ? field : [field];
  return items
    .map((u) => {
      const target = u?.user ?? u;
      return (target?._id ?? target)?.toString();
    })
    .filter(Boolean);
};

const getTokensForUsers = async (userIds) => {
  if (!userIds || !userIds.length) return [];
  const preferences = await NotificationPreference.find({
    user: { $in: userIds },
    enabled: true,
  });
  return preferences
    .flatMap((p) => p.fcmTokens.map((t) => t.token))
    .filter(Boolean);
};

const EVENT_TYPE_LABEL = {
  creathon: "Créathon",
  formation: "Formation",
  bootcamp: "Bootcamp",
  mentorat: "Mentorat",
  mentoring: "Mentorat", // ← type réel dans le modèle Training
};

export const notifyPendingComponentValidation = async (creathon) => {
  console.log("🔔 notifyPendingComponentValidation:", creathon.title);
  const targetId = toIdArray(creathon.coordinators?.componentCoordinator)[0];
  if (!targetId) return console.warn("⚠️  Pas de componentCoordinator");
  console.log("🎯 componentCoordinator:", targetId);
  const tokens = await getTokensForUsers([targetId]);
  console.log("📱 Tokens:", tokens.length);
  await sendNotification(
    tokens,
    `⏳ Nouveau créathon à valider`,
    `Le créathon "${creathon.title}" est en attente de votre validation`,
    { eventId: creathon._id.toString(), eventType: "creathon" },
    [targetId],
  );
};

export const notifyPendingIncubationValidation = async (event) => {
  console.log("🔔 notifyPendingIncubationValidation:", event.title);
  let targetIds = [];

  if (event.coordinators?.generalCoordinator) {
    targetIds = toIdArray(event.coordinators.generalCoordinator);
    console.log("🎯 Créathon — generalCoordinator:", targetIds);
  } else if (event.incubationCoordinators?.length) {
    targetIds = toIdArray(event.incubationCoordinators);
    console.log("🎯 Formation/Bootcamp — incubationCoordinators:", targetIds);
  } else {
    console.warn("⚠️  Fallback tous IncubationCoordinators");
    const all = await User.find({
      roles: "IncubationCoordinator",
      isArchived: false,
    }).select("_id");
    targetIds = all.map((u) => u._id.toString());
  }

  targetIds = [...new Set(targetIds.filter(Boolean))];
  if (!targetIds.length) return;
  const tokens = await getTokensForUsers(targetIds);
  console.log("📱 Tokens:", tokens.length);

  const label = EVENT_TYPE_LABEL[event.type] || "Créathon";
  await sendNotification(
    tokens,
    `⏳ ${label} en attente de validation`,
    `"${event.title}" est en attente de votre validation`,
    { eventId: event._id.toString(), eventType: event.type || "creathon" },
    targetIds,
  );
};

export const notifyNewEvent = async (event) => {
  console.log("🔔 notifyNewEvent:", event.title, "| type:", event.type);

  // Pour les créathons : notifier tous les utilisateurs (événement public)
  // Pour formation / bootcamp / mentoring : notifier uniquement les participants directs
  let userIds;

  if (event.type === "creathon") {
    const allUsers = await User.find({ isArchived: false }).select("_id");
    userIds = allUsers.map((u) => u._id.toString());
  } else {
    // Notifier uniquement les personnes liées à l'événement
    userIds = [
      ...toIdArray(event.componentCoordinator),
      ...toIdArray(event.incubationCoordinators),
      ...toIdArray(event.trainers),
      ...toIdArray(event.participants),
    ];
    userIds = [...new Set(userIds.filter(Boolean))];
  }

  console.log("👥 Utilisateurs à notifier:", userIds.length);

  if (!userIds.length) return;

  const tokens = await getTokensForUsers(userIds);
  console.log("📱 Tokens:", tokens.length);

  const label = EVENT_TYPE_LABEL[event.type] || "Créathon";
  await sendNotification(
    tokens,
    `🎉 Nouvel événement — ${label}`,
    `"${event.title}" a été validé et ajouté au calendrier`,
    { eventId: event._id.toString(), eventType: event.type || "creathon" },
    userIds,
  );
};

export const notifyEventReminder = async (event, daysUntil, hoursUntil) => {
  const directUserIds = [
    ...toIdArray(event.coordinators?.componentCoordinator),
    ...toIdArray(event.coordinators?.generalCoordinator),
    ...toIdArray(event.componentCoordinator),
    ...toIdArray(event.incubationCoordinators),
    ...toIdArray(event.trainers),
    ...toIdArray(event.participants),
    ...toIdArray(event.mentors?.members),
    ...toIdArray(event.jury?.members),
  ];
  const uniqueIds = [...new Set(directUserIds.filter(Boolean))];

  const preferences = await NotificationPreference.find({
    user: { $in: uniqueIds },
    enabled: true,
  }).select("fcmTokens preferences");

  const tokens = preferences
    .filter((p) => {
      const { reminders = [] } = p.preferences;
      return reminders.some(
        (r) =>
          (r.unit === "days" && r.value === daysUntil) ||
          (r.unit === "hours" && r.value === hoursUntil),
      );
    })
    .flatMap((p) => p.fcmTokens.map((t) => t.token))
    .filter(Boolean);

  if (!tokens.length) return;
  const label = EVENT_TYPE_LABEL[event.type] || "Créathon";
  await sendNotification(
    tokens,
    `Rappel — ${label} approche !`,
    `${event.title} commence le ${new Date(event.dates?.startDate || event.startDate).toLocaleDateString("fr-FR")}`,
    { eventId: event._id.toString(), eventType: event.type || "creathon" },
    uniqueIds,
  );
};

export const notifyReschedule = async (event, oldDate) => {
  const allUsers = await User.find({ isArchived: false }).select("_id");
  const userIds = allUsers.map((u) => u._id.toString());
  const tokens = await getTokensForUsers(userIds);
  await sendNotification(
    tokens,
    `📅 Date modifiée — ${event.title}`,
    `Nouvelle date : ${new Date(event.startDate).toLocaleDateString("fr-FR")}`,
    { eventId: event._id.toString(), eventType: event.type || "creathon" },
    userIds,
  );
};
export const notifyNewTrainingOutput = async (output, training) => {
  console.log(
    "🔔 notifyNewTrainingOutput:",
    output.title,
    "| training:",
    training._id,
  );

  // Récupérer les porteurs de projets (AcceptedParticipant) liés à cette formation
  // via les cohorts (régions) de la formation
  let userIds = [];

  if (output.targetParticipants && output.targetParticipants.length > 0) {
    // Livrable pour des participants spécifiques
    const participants = await AcceptedParticipant.find({
      _id: { $in: output.targetParticipants },
    }).select("user");
    userIds = participants.map((p) => p.user.toString());
  } else {
    // Livrable pour tous les participants de la formation
    const { getParticipantsByTrainingId } =
      await import("../helpers/trainingOutput.js");
    const participants = await getParticipantsByTrainingId(
      training._id.toString(),
    );
    userIds = participants.map(
      (p) => p.user._id?.toString() || p.user.toString(),
    );
  }

  userIds = [...new Set(userIds.filter(Boolean))];
  console.log("👥 Porteurs de projets à notifier:", userIds.length);

  if (!userIds.length) return;

  const tokens = await getTokensForUsers(userIds);
  console.log("📱 Tokens:", tokens.length);

  const label = EVENT_TYPE_LABEL[training.type] || "Formation";
  await sendNotification(
    tokens,
    `📋 Nouveau livrable — ${label}`,
    `"${output.title}" a été ajouté à la formation "${training.title}"`,
    {
      eventId: training._id.toString(),
      eventType: training.type || "formation",
    },
    userIds,
  );
};

// Rappel de dépôt de livrable pour les porteurs de projets
// Respecte les préférences de rappel de chaque utilisateur
export const notifyOutputReminder = async (output, daysUntil, hoursUntil) => {
  console.log(
    `🔔 notifyOutputReminder: "${output.title}" | J-${daysUntil} H-${hoursUntil}`,
  );

  // 1. Récupérer les porteurs de projets concernés
  let userIds = [];

  if (output.targetParticipants && output.targetParticipants.length > 0) {
    const participants = await AcceptedParticipant.find({
      _id: { $in: output.targetParticipants },
    }).select("user");
    userIds = participants.map((p) => p.user.toString());
  } else {
    const { getParticipantsByTrainingId } =
      await import("../helpers/trainingOutput.js");
    const participants = await getParticipantsByTrainingId(
      output.training._id?.toString() || output.training.toString(),
    );
    userIds = participants.map(
      (p) => p.user._id?.toString() || p.user.toString(),
    );
  }

  userIds = [...new Set(userIds.filter(Boolean))];
  if (!userIds.length) return;

  // 2. Filtrer selon les préférences de rappel de chaque utilisateur
  const preferences = await NotificationPreference.find({
    user: { $in: userIds },
    enabled: true,
  }).select("user fcmTokens preferences");

  const matchingPrefs = preferences.filter((p) => {
    const { reminders = [] } = p.preferences || {};
    return reminders.some(
      (r) =>
        (r.unit === "days" && r.value === daysUntil) ||
        (r.unit === "hours" && r.value === hoursUntil),
    );
  });

  if (!matchingPrefs.length) return;

  const matchingUserIds = matchingPrefs.map((p) => p.user.toString());
  const tokens = matchingPrefs
    .flatMap((p) => p.fcmTokens.map((t) => t.token))
    .filter(Boolean);

  console.log(
    `📱 ${matchingUserIds.length} porteurs à notifier, ${tokens.length} tokens`,
  );

  if (!tokens.length && !matchingUserIds.length) return;

  const timeLabel =
    daysUntil > 0
      ? `dans ${daysUntil} jour${daysUntil > 1 ? "s" : ""}`
      : `dans ${hoursUntil} heure${hoursUntil > 1 ? "s" : ""}`;

  const trainingTitle = output.training?.title || "votre formation";

  await sendNotification(
    tokens,
    `📋 Rappel livrable — ${output.title}`,
    `Le livrable "${output.title}" (${trainingTitle}) est à déposer ${timeLabel}`,
    {
      eventId: output._id.toString(),
      eventType: "output_reminder",
    },
    matchingUserIds,
  );
};

// Alerte aux coordinateurs d'incubation : taux de soumission critique
export const notifyLowSubmissionRate = async (
  output,
  submissionRate,
  daysUntilDue,
) => {
  console.log(
    `🔔 notifyLowSubmissionRate: "${output.title}" | ${submissionRate}% | J-${daysUntilDue}`,
  );

  // Récupérer tous les coordinateurs d'incubation
  const incubationCoordinators = await User.find({
    roles: "incubationCoordinator",
    isArchived: false,
  }).select("_id");

  const userIds = incubationCoordinators.map((u) => u._id.toString());
  if (!userIds.length) return;

  const tokens = await getTokensForUsers(userIds);

  const trainingTitle = output.training?.title || "une formation";
  const deadlineLabel =
    daysUntilDue === 0
      ? "aujourd'hui"
      : `dans ${daysUntilDue} jour${daysUntilDue > 1 ? "s" : ""}`;

  await sendNotification(
    tokens,
    `📉 Taux de soumission faible — ${output.title}`,
    `Seulement ${submissionRate}% de soumissions pour "${output.title}" (${trainingTitle}). Deadline ${deadlineLabel}.`,
    { eventId: output._id.toString(), eventType: "low_submission_alert" },
    userIds,
  );
};
