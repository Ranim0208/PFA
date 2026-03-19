import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Coffee,
  Utensils,
  Bus,
  Camera,
  Video,
  Archive,
  Presentation,
  Film,
  MessageSquare,
  Home,
  PenTool,
  BookOpen,
  Briefcase,
  DollarSign,
  Star,
  MessageCircle,
  Monitor,
  Globe,
  X,
} from "lucide-react";

const TrainingDetailsModal = ({ training, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié";
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const getActivityLabel = (activity) => {
    const activities = {
      training: "Formation",
      créa: "Créa",
      innov: "Innov",
      archi: "Archi",
      diffusion: "Diffusion",
      eco: "Eco",
    };
    return activities[activity] || activity;
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "destructive";
      case "rescheduled":
        return "info";
      default:
        return "outline";
    }
  };

  const renderSectionHeader = (title, icon) => (
    <div className="flex items-center mb-3 sm:mb-4">
      {icon &&
        React.cloneElement(icon, {
          className: "w-4 h-4 sm:w-5 sm:h-5 mr-2 text-tacir-blue",
        })}
      <h3 className="text-base sm:text-lg font-semibold text-tacir-darkblue">
        {title}
      </h3>
    </div>
  );

  const renderDetailItem = (label, value, icon) => (
    <div className="space-y-1 mb-3 sm:mb-4">
      <div className="flex items-center text-sm font-medium text-tacir-darkgray">
        {icon && React.cloneElement(icon, { className: "w-4 h-4 mr-2" })}
        {label}
      </div>
      <p className="text-sm text-gray-700 pl-6 break-words">
        {value || "Non spécifié"}
      </p>
    </div>
  );

  const renderListItems = (items, getLabel, getIcon) => (
    <ul className="space-y-2">
      {items?.map((item, index) => (
        <li key={index} className="flex items-start space-x-2">
          {getIcon && (
            <span className="mt-0.5">
              {React.cloneElement(getIcon(item), {
                className: "w-4 h-4 text-tacir-darkgray",
              })}
            </span>
          )}
          <span className="text-sm text-gray-700 break-words">
            {getLabel(item)}
          </span>
        </li>
      ))}
    </ul>
  );

  const logisticsIcons = {
    catering: <Utensils />,
    perdiem_meals: <Utensils />,
    coffee_break: <Coffee />,
    perdiem_transport: <Bus />,
  };

  const travelIcons = {
    hebergement_restauration: <Home />,
    materiel: <PenTool />,
    salles_reunion: <Users />,
  };

  const communicationIcons = {
    photo: <Camera />,
    video: <Video />,
    archivage: <Archive />,
    presentation: <Presentation />,
    rollup: <Film />,
    streaming: <Video />,
    autre: <MessageSquare />,
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-lg sm:rounded-xl">
        <DialogHeader className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg sm:text-xl font-bold text-tacir-darkblue">
              Détails de la formation
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-tacir-lightgray"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* Basic Information */}
          <div className="bg-white p-4 sm:p-5 rounded-lg border border-gray-200 shadow-sm">
            {renderSectionHeader("Informations de base", <BookOpen />)}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {renderDetailItem("Titre", training?.title)}
              {renderDetailItem("Type", training?.type)}
              {renderDetailItem(
                "Activité du composant",
                getActivityLabel(training?.componentActivity)
              )}
              <div className="space-y-1">
                <div className="flex items-center text-sm font-medium text-tacir-darkgray">
                  <span className="mr-2">Statut:</span>
                </div>
                <Badge
                  variant={getStatusVariant(training?.status)}
                  className="capitalize text-xs sm:text-sm"
                >
                  {training?.status}
                </Badge>
              </div>
              {training?.description &&
                renderDetailItem("Description", training?.description)}
            </div>
          </div>

          {/* Dates & Location */}
          <div className="bg-white p-4 sm:p-5 rounded-lg border border-gray-200 shadow-sm">
            {renderSectionHeader("Dates et lieu", <Calendar />)}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {renderDetailItem(
                "Dates",
                `${formatDate(training?.startDate)}${
                  training?.endDate
                    ? ` au ${formatDate(training?.endDate)}`
                    : ""
                }`,
                <Calendar />
              )}
              {renderDetailItem("Heure", training?.time, <Clock />)}

              {training?.sessionType &&
                renderDetailItem(
                  "Type de session",
                  training?.sessionType === "online"
                    ? "En ligne"
                    : "Présentiel",
                  training?.sessionType === "online" ? <Monitor /> : <MapPin />
                )}

              {training?.sessionType === "online" &&
                training?.meetingLink &&
                renderDetailItem(
                  "Lien de la session",
                  training?.meetingLink,
                  <Globe />
                )}

              {training?.sessionType === "in-person" &&
                training?.proposedLocation &&
                renderDetailItem(
                  "Lieu proposé",
                  training?.proposedLocation,
                  <MapPin />
                )}

              {!training?.sessionType &&
                training?.location &&
                renderDetailItem("Lieu", training?.location, <MapPin />)}

              {renderDetailItem(
                "Participants maximum",
                training?.maxParticipants,
                <Users />
              )}
            </div>
          </div>

          {/* People */}
          <div className="bg-white p-4 sm:p-5 rounded-lg border border-gray-200 shadow-sm">
            {renderSectionHeader("Personnes impliquées", <Users />)}
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-tacir-darkgray">
                  <User className="w-4 h-4 mr-2" />
                  Formateurs:
                </div>
                {training?.trainers?.length > 0 ? (
                  renderListItems(
                    training?.trainers,
                    (trainer) =>
                      `${trainer?.personalInfo?.fullName || "Inconnu"} - ${
                        trainer?.personalInfo?.specialization || "Non spécifié"
                      }`,
                    () => <User />
                  )
                ) : (
                  <p className="text-sm text-gray-700 pl-6">Non spécifié</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-tacir-darkgray">
                  <User className="w-4 h-4 mr-2" />
                  Coordinateurs d'incubation:
                </div>
                {training?.incubationCoordinators?.length > 0 ? (
                  renderListItems(
                    training?.incubationCoordinators,
                    (coordinator) =>
                      `${coordinator?.firstName} ${coordinator?.lastName} (${coordinator?.email})`,
                    () => <User />
                  )
                ) : (
                  <p className="text-sm text-gray-700 pl-6">Non spécifié</p>
                )}
              </div>
            </div>
          </div>

          {/* Cohorts */}
          {training?.cohorts?.length > 0 && (
            <div className="bg-white p-4 sm:p-5 rounded-lg border border-gray-200 shadow-sm">
              {renderSectionHeader("Cohortes cibles", <Users />)}
              <div className="flex flex-wrap gap-2">
                {training?.cohorts.map((cohort, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-tacir-blue text-tacir-blue bg-tacir-blue/10 text-xs"
                  >
                    {cohort}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 border-t border-tacir-lightgray">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue/10 text-sm sm:text-base"
            >
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrainingDetailsModal;
