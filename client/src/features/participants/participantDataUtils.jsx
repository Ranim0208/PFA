export const getProjectTitle = (participant) => {
  const titleAnswer = participant.answers?.find(
    (a) =>
      a.field?.name === "Titre provisoire" ||
      a.field?.name === "الاسم (المؤقت) للمشروع"
  );
  return titleAnswer?.value || "Untitled Project";
};

export const getPhoneNumber = (participant) => {
  const phoneAnswer = participant.answers?.find(
    (a) =>
      a.field?.name === "Numéro de téléphone" || a.field?.name === "رقم الهاتف"
  );
  return phoneAnswer?.value || participant.user?.phone || "N/A";
};

export const getBirthDate = (participant) => {
  const birthAnswer = participant.answers?.find(
    (a) =>
      a.field?.name === "Date de naissance" || a.field?.name === "تاريخ الولادة"
  );
  return birthAnswer?.value
    ? new Date(birthAnswer.value).toLocaleDateString()
    : "N/A";
};
export const getTrainingStatus = (training) => {
  const now = new Date();
  const startDate = new Date(training.startDate);
  const endDate = new Date(training.endDate);

  if (now < startDate) return "upcoming";
  if (now >= startDate && now <= endDate) return "active";
  return "completed";
};

export const displayText = (textObj, preferredLang = "fr") => {
  if (!textObj) return "N/A";
  if (typeof textObj === "string") return textObj;
  return textObj[preferredLang] || textObj.fr || textObj.ar || "N/A";
};
// Add this to participantUtils.js
// Add this to participantUtils.js
export const calculateTrainingStats = (participants) => {
  const stats = {
    total: participants.length,
    byType: {},
    byStatus: { active: 0, upcoming: 0, completed: 0 },
  };

  participants.forEach((participant) => {
    const type = participant.trainingType || "Unknown";
    stats.byType[type] = (stats.byType[type] || 0) + 1;

    const trainingObj = participant.relatedTraining;
    if (trainingObj) {
      const status = getTrainingStatus(trainingObj);
      if (status && stats.byStatus[status] !== undefined) {
        stats.byStatus[status]++;
      }
    }
  });

  return stats;
};
