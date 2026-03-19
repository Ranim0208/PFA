import { GraduationCap, Flame, UserRound, Clock, Check, X } from "lucide-react";
// Type configurations with colors
export const typeConfig = {
  formation: {
    title: "Formations",
    color: "white",
    bgColor: "bg-tacir-pink",
    borderColor: "border-tacir-pink",
    textColor: "text-pink-600",
    lightBg: "bg-tacir-pink/10",
    icon: GraduationCap,
    buttonClass: "bg-tacir-pink hover:bg-pink-700",
  },
  bootcamp: {
    title: "Bootcamps",
    color: "white",
    bgColor: "bg-tacir-lightblue",
    borderColor: "border-tacir-lightblue",
    textColor: "text-tacir-lightblue",
    lightBg: "bg-tacir-lightblue/10",
    icon: Flame,
    buttonClass: "bg-tacir-lightblue hover:bg-cyan-600",
  },
  mentoring: {
    title: "Sessions de Mentorat",
    color: "white",
    bgColor: "bg-tacir-green",
    borderColor: "border-tacir-green",
    textColor: "text-tacir-green",
    lightBg: "bg-tacir-green/10",
    icon: UserRound,
    buttonClass: "bg-tacir-green hover:bg-green-700",
  },
};

export const getStatusBadge = (status) => {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tacir-yellow text-tacir-darkblue">
          <Clock className="w-3 h-3 mr-1" /> En attente
        </span>
      );
    case "approved":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tacir-green text-white">
          <Check className="w-3 h-3 mr-1" /> Approuvé
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tacir-pink text-white">
          <X className="w-3 h-3 mr-1" /> Rejeté
        </span>
      );
    default:
      return null;
  }
};

export const displayText = (textObj, preferredLang = "fr") => {
  if (!textObj) return "N/A";
  if (typeof textObj === "string") return textObj;
  return textObj[preferredLang] || textObj.fr || textObj.ar || "N/A";
};

export const getTrainingStatus = (training) => {
  const now = new Date();
  const startDate = new Date(training.startDate);
  const endDate = new Date(training.endDate);

  if (now < startDate) return "upcoming";
  if (now >= startDate && now <= endDate) return "active";
  return "completed";
};
