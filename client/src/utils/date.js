export const formatDate = (dateString) => {
  if (!dateString) return "Non spécifié";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
