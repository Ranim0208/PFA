// utils/evaluationTextFormatter.js

export const formatEvaluationText = (evaluationText) => {
  // Create a mapping of back-end format to human-friendly text
  const evaluationMap = {
    tres_bien: "Très bien",
    bien: "Bien",
    modere: "Modéré",
    insuffisant: "Insuffisant",
    hors_concept: "Hors concept",
    excellent: "Excellent",
  };

  // Return the human-readable text or the same text if not found
  return evaluationMap[evaluationText] || evaluationText;
};
