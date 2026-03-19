import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  User,
  Award,
} from "lucide-react";
import TrainingDetailsModal from "../components/TrainingDetailsModal";
import { useState } from "react";

export function TrainingCard({ training, onUpdate, onDelete }) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);

  const getEventTypeColor = (type) => {
    switch (type) {
      case "formation":
        return "bg-gradient-to-r from-tacir-pink to-tacir-blue";
      case "bootcamp":
        return "bg-gradient-to-r from-tacir-blue to-tacir-lightblue";
      case "mentoring":
        return "bg-gradient-to-r from-tacir-green to-tacir-lightblue";
      default:
        return "bg-gradient-to-r from-tacir-darkgray to-tacir-lightgray";
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case "formation":
        return <BookOpen className="w-6 h-6 text-white" />;
      case "bootcamp":
        return <Award className="w-6 h-6 text-white" />;
      case "mentoring":
        return <User className="w-6 h-6 text-white" />;
      default:
        return <BookOpen className="w-6 h-6 text-white" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const handleDetailsClick = () => {
    setSelectedTraining(training);
    setShowDetails(true);
  };

  return (
    <>
      <Card className="p-6 shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div
              className={`w-12 h-12 ${getEventTypeColor(
                training.type
              )} rounded-xl flex items-center justify-center`}
            >
              {getEventTypeIcon(training.type)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-tacir-darkblue mb-2">
                {training.title}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-tacir-darkgray">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-tacir-lightblue" />
                  {formatDate(training.startDate)}
                  {training.endDate && ` - ${formatDate(training.endDate)}`}
                </div>
                {training.time ||
                  (training.duration && (
                    <div className="flex  items-center">
                      <Clock className="w-4 h-4 mr-2 text-tacir-yellow" />
                      {training.time}{" "}
                      {training.duration && `(${training.duration} jours)`}
                    </div>
                  ))}
                {training.location ||
                  (training.meetLink && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-tacir-green" />
                      {training.location || training.meetLink || "N/A"}
                    </div>
                  ))}

                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-tacir-darkgray" />
                  {training.maxParticipants || "N/A"} participants
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                {training.cohorts?.map((cohort, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-tacir-lightblue text-tacir-lightblue"
                  >
                    {cohort}
                  </Badge>
                ))}
                <span className="text-sm text-tacir-darkgray">
                  {training.trainers?.length > 0 && (
                    <>
                      Formateurs:{" "}
                      {training.trainers
                        .map(
                          (trainer) =>
                            trainer?.personalInfo?.fullName || "Inconnu"
                        )
                        .join(", ")}
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-3">
            <TrainingStatusBadge status={training.status} />
            <div className="flex space-x-2">
              {training.status === "pending" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-tacir-yellow text-tacir-yellow hover:bg-tacir-yellow hover:text-white"
                  onClick={() => onUpdate(training)}
                >
                  Modifier
                </Button>
              )}
              {training.status === "rejected" && (
                <Button
                  size="sm"
                  className="bg-tacir-yellow hover:bg-tacir-yellow/90 text-white"
                  onClick={() => onUpdate(training)}
                >
                  Reprogrammer
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white"
                onClick={handleDetailsClick}
              >
                Détails
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {showDetails && selectedTraining && (
        <TrainingDetailsModal
          training={selectedTraining}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}

function TrainingStatusBadge({ status }) {
  const statusClasses = {
    pending: "bg-tacir-yellow/20 text-tacir-yellow",
    approved: "bg-tacir-green/20 text-tacir-green",
    rejected: "bg-tacir-pink/20 text-tacir-pink",
    rescheduled: "bg-tacir-blue/20 text-tacir-blue",
  };

  const statusText = {
    pending: "En attente",
    approved: "Approuvé",
    rejected: "Rejeté",
    rescheduled: "Reprogrammé",
  };

  return (
    <span
      className={`${statusClasses[status]} px-3 py-1 rounded-full text-sm font-medium`}
    >
      {statusText[status]}
    </span>
  );
}
