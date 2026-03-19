// evaluationConfig.js
export const EVALUATION_OPTIONS = [
  {
    text: "Excellent",
    value: "excellent",
    description: "Dépasse toutes les attentes, innovation remarquable",
    colorClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    icon: "⭐️",
  },
  {
    text: "Très bien",
    value: "tres_bien",
    description: "Très bonne qualité, répond parfaitement aux critères",
    colorClass: "bg-teal-100 text-teal-800 border-teal-300",
    icon: "👍",
  },
  {
    text: "Bien",
    value: "bien",
    description: "Solide proposition avec quelques points à améliorer",
    colorClass: "bg-blue-100 text-blue-800 border-blue-300",
    icon: "✅",
  },
  {
    text: "Modéré",
    value: "modere",
    description: "Potentiel mais nécessite des modifications importantes",
    colorClass: "bg-amber-100 text-amber-800 border-amber-300",
    icon: "⚠️",
  },
  {
    text: "Insuffisant",
    value: "insuffisant",
    description: "Ne répond pas aux standards minimums",
    colorClass: "bg-rose-100 text-rose-800 border-rose-300",
    icon: "❌",
  },
  {
    text: "Hors concept",
    value: "hors_concept",
    description: "Ne correspond pas au cadre de cet appel",
    colorClass: "bg-gray-200 text-gray-700 border-gray-400",
    icon: "🚫",
  },
];

// Helper function to get config by value
export const getEvaluationConfig = (value) => {
  if (!value) return {};
  return EVALUATION_OPTIONS.find((opt) => opt.value === value) || {};
};

// Format evaluation text for display
export const formatEvaluationDisplayText = (value) => {
  if (!value) return "N/A";
  const option = EVALUATION_OPTIONS.find((opt) => opt.value === value);
  return option ? option.text : value;
};

// Format evaluation text for storage
export const formatEvaluationText = (text) => {
  if (!text) return "";

  // First try to find matching option
  const option = EVALUATION_OPTIONS.find(
    (opt) => opt.text.toLowerCase() === text.toLowerCase()
  );
  if (option) return option.value;

  // Fallback to string processing
  return text
    .toLowerCase()
    .normalize("NFD") // Normalize accents
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^a-z0-9_]/g, ""); // Remove special chars
};

// Direct mapping from backend values to display config
export const getEvaluationDisplayConfig = (backendValue) => {
  if (!backendValue)
    return { displayText: "N/A", colorClass: "bg-gray-100", icon: "❓" };

  const option = EVALUATION_OPTIONS.find((opt) => opt.value === backendValue);
  return option
    ? {
        displayText: option.displayText,
        colorClass: option.colorClass,
        icon: option.icon,
        description: option.description,
      }
    : {
        displayText: backendValue,
        colorClass: "bg-gray-100",
        icon: "",
      };
};
