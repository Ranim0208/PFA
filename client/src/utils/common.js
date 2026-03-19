export const getTrainerNames = (trainers) => {
  if (!trainers || trainers.length === 0) return "Non spécifié";
  return trainers
    .map((t) => t.personalInfo?.fullName || "Formateur inconnu")
    .join(", ");
};
