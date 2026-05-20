import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  X,
  Mail,
  Phone,
  Calendar,
  Clock,
  FileText,
  Award,
  CheckCircle,
  MapPin,
  User,
  BookOpen,
  Star,
  MessageSquare,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getBirthDate,
  getPhoneNumber,
  getProjectTitle,
  displayText,
} from "./participantDataUtils";
import { typeConfig } from "@/features/trainings/components/style.config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { BilingualDisplay } from "@/utils/BilingualText";

export default function ParticipantDetailModal({ participant, onClose }) {
  const trainingType = typeConfig[participant.trainingType] || {
    textColor: "text-tacir-gray",
    bgColor: "bg-tacir-darkblue/10",
    title: participant.trainingType,
  };

  // Extract submission data
  const submission = participant.submission;
  const answers = participant.answers || [];
  const files = participant.files || [];
  const mentorEvaluations = submission?.mentorEvaluations || [];
  const mentorFeedbacks = submission?.mentorFeedbacks || [];
  const preselectionEvaluations = submission?.preselectionEvaluations || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <Card className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border-tacir-lightblue">
        <CardHeader className="relative border-b p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div className={`p-2 sm:p-3 rounded-lg ${trainingType.bgColor} flex-shrink-0`}>
                <User className={`w-5 h-5 sm:w-6 sm:h-6 ${trainingType.textColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-tacir-darkblue text-base sm:text-lg md:text-xl truncate">
                  {participant.user?.firstName} {participant.user?.lastName}
                </CardTitle>
                <CardDescription className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary" className={`${trainingType.bgColor} text-xs`}>
                    {trainingType.title}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{displayText(participant.region?.name)}</span>
                  </Badge>
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"
              onClick={onClose}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4 md:p-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="profile" className="text-xs sm:text-sm px-2 py-2">
                Profil
              </TabsTrigger>
              <TabsTrigger value="application" className="text-xs sm:text-sm px-2 py-2">
                Candidature
              </TabsTrigger>
              <TabsTrigger value="evaluations" className="text-xs sm:text-sm px-2 py-2">
                Évaluations
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="pt-4 sm:pt-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                {/* Contact Information */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-lightblue" />
                    <h3 className="font-medium text-tacir-darkblue text-sm sm:text-base">
                      Informations de contact
                    </h3>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <InfoRow
                      icon={<Mail className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-lightblue" />}
                      label="Email"
                      value={participant.user?.email}
                    />
                    <InfoRow
                      icon={<Phone className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-lightblue" />}
                      label="Téléphone"
                      value={getPhoneNumber(participant)}
                    />
                    <InfoRow
                      icon={
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-lightblue" />
                      }
                      label="Date de naissance"
                      value={getBirthDate(participant)}
                    />
                    <InfoRow
                      icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-lightblue" />}
                      label="Inscrit le"
                      value={new Date(participant.createdAt).toLocaleDateString(
                        "fr-FR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    />
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-green" />
                    <h3 className="font-medium text-tacir-darkblue text-sm sm:text-base">
                      Détails du projet
                    </h3>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Titre du projet
                      </p>
                      <p className="font-medium text-sm sm:text-base break-words">
                        {getProjectTitle(participant) || "Non spécifié"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Formation suivie
                      </p>
                      <p className="font-medium text-sm sm:text-base break-words">
                        {participant.relatedTraining?.title || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Statut</p>
                      <Badge className="bg-tacir-green/10 text-tacir-green hover:bg-tacir-green/20 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Actif
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Application Tab */}
            <TabsContent value="application" className="pt-4 sm:pt-6">
              <div className="space-y-4 sm:space-y-6">
                {/* Form Answers Section */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-lightblue" />
                    <h3 className="font-medium text-tacir-darkblue text-sm sm:text-base">
                      Réponses du formulaire
                    </h3>
                  </div>

                  {answers.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="max-h-[200px] sm:max-h-[250px] overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
                        {answers.map((answer, index) => (
                          <div key={index} className="space-y-2 sm:space-y-3">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="flex-shrink-0 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-tacir-lightblue/10 flex items-center justify-center">
                                <span className="text-xs font-medium text-tacir-darkblue">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                {answer.field?.label ? (
                                  <div className="space-y-1">
                                    <h4 className="font-medium text-tacir-darkblue text-xs sm:text-sm break-words">
                                      {answer.field.label.fr}
                                    </h4>
                                    {answer.field.label.ar && (
                                      <h4
                                        className="font-medium text-tacir-darkblue text-xs sm:text-sm break-words"
                                        dir="rtl"
                                      >
                                        {answer.field.label.ar}
                                      </h4>
                                    )}
                                  </div>
                                ) : (
                                  <h4 className="font-medium text-tacir-darkblue text-xs sm:text-sm">
                                    Question {index + 1}
                                  </h4>
                                )}

                                {answer.value ? (
                                  <div className="mt-1 sm:mt-2 p-2 sm:p-3 bg-white rounded-md border border-gray-200">
                                    <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words">
                                      {answer.value}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-xs sm:text-sm text-muted-foreground italic mt-2">
                                    Pas de réponse fournie
                                  </p>
                                )}
                              </div>
                            </div>
                            {index < answers.length - 1 && (
                              <Separator className="my-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4 text-center">
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        Aucune réponse disponible
                      </p>
                    </div>
                  )}
                </div>

                {/* Attached Files Section */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-lightblue" />
                    <h3 className="font-medium text-tacir-darkblue text-sm sm:text-base">
                      Fichiers joints
                    </h3>
                  </div>

                  {files.length > 0 ? (
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4"
                        >
                          <div className="space-y-2">
                            {file.field?.label ? (
                              <div className="space-y-1">
                                <h4 className="font-medium text-tacir-darkblue text-xs sm:text-sm break-words">
                                  {file.field.label.fr}
                                </h4>
                                {file.field.label.ar && (
                                  <h4
                                    className="font-medium text-tacir-darkblue text-xs break-words"
                                    dir="rtl"
                                  >
                                    {file.field.label.ar}
                                  </h4>
                                )}
                              </div>
                            ) : (
                              <h4 className="font-medium text-tacir-darkblue text-xs sm:text-sm">
                                Fichier {index + 1}
                              </h4>
                            )}

                            <div className="space-y-2 mt-2">
                              {file.urls.map((url, urlIndex) => (
                                <a
                                  key={urlIndex}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-tacir-lightblue flex-shrink-0" />
                                  <span className="text-xs sm:text-sm text-tacir-darkblue truncate flex-1">
                                    Document {urlIndex + 1}
                                  </span>
                                  <span className="text-xs text-muted-foreground flex-shrink-0">
                                    Ouvrir
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4 text-center">
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        Aucun fichier joint disponible
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Evaluations Tab */}
            <TabsContent value="evaluations" className="pt-4 sm:pt-6">
              <div className="space-y-4 sm:space-y-6">
                {/* Mentor Evaluations */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-yellow" />
                    <h3 className="font-medium text-tacir-darkblue text-sm sm:text-base">
                      Évaluations du mentor
                    </h3>
                  </div>

                  {mentorEvaluations.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="max-h-[200px] sm:max-h-[300px] min-h-[100px] overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                        {mentorEvaluations.map((evalItem, index) => (
                          <div key={index} className="space-y-2 sm:space-y-3">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-3">
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className="flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-tacir-yellow/10 flex items-center justify-center">
                                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-tacir-yellow" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-xs sm:text-sm truncate">
                                    {evalItem.mentorId?.firstName}{" "}
                                    {evalItem.mentorId?.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(evalItem.date).toLocaleDateString(
                                      "fr-FR",
                                      {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      }
                                    )}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-white text-xs flex-shrink-0">
                                {evalItem.evaluation}
                              </Badge>
                            </div>

                            {evalItem.comment && (
                              <div className="ml-0 sm:ml-11 pl-0 sm:pl-1">
                                <div className="p-2 sm:p-3 bg-white rounded-md border border-gray-200">
                                  <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words">
                                    {evalItem.comment}
                                  </p>
                                </div>
                              </div>
                            )}

                            {index < mentorEvaluations.length - 1 && (
                              <Separator className="my-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4 text-center">
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        Aucune évaluation de mentor disponible
                      </p>
                    </div>
                  )}
                </div>

                {/* Mentor Feedbacks */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-blue" />
                    <h3 className="font-medium text-tacir-darkblue text-sm sm:text-base">
                      Commentaires du mentor
                    </h3>
                  </div>

                  {mentorFeedbacks.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="max-h-[200px] sm:max-h-[300px] min-h-[100px] overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                        {mentorFeedbacks.map((feedback, index) => (
                          <div key={index} className="space-y-2 sm:space-y-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-tacir-blue/10 flex items-center justify-center">
                                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-tacir-blue" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-xs sm:text-sm truncate">
                                  {feedback.mentorId?.firstName}{" "}
                                  {feedback.mentorId?.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(feedback.date).toLocaleDateString(
                                    "fr-FR",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="ml-0 sm:ml-11 pl-0 sm:pl-1">
                              <div className="p-2 sm:p-3 bg-white rounded-md border border-gray-200">
                                <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words">
                                  {feedback.content}
                                </p>
                              </div>
                            </div>

                            {index < mentorFeedbacks.length - 1 && (
                              <Separator className="my-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4 text-center">
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        Aucun commentaire de mentor disponible
                      </p>
                    </div>
                  )}
                </div>

                {/* Preselection Evaluations */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-purple" />
                    <h3 className="font-medium text-tacir-darkblue text-sm sm:text-base">
                      Évaluations de présélection
                    </h3>
                  </div>

                  {preselectionEvaluations.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="max-h-[200px] sm:max-h-[300px] min-h-[100px] overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                        {preselectionEvaluations.map((evalItem, index) => (
                          <div key={index} className="space-y-2 sm:space-y-3">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-3">
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className="flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-tacir-purple/10 flex items-center justify-center">
                                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-tacir-purple" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-xs sm:text-sm truncate">
                                    {evalItem.coordinatorId?.firstName}{" "}
                                    {evalItem.coordinatorId?.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(evalItem.date).toLocaleDateString(
                                      "fr-FR",
                                      {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      }
                                    )}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-white text-xs flex-shrink-0">
                                {evalItem.evaluation}
                              </Badge>
                            </div>

                            {index < preselectionEvaluations.length - 1 && (
                              <Separator className="my-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4 text-center">
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        Aucune évaluation de présélection disponible
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 sm:gap-3 border-t p-3 sm:p-4 md:p-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto text-sm"
          >
            Fermer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  const displayValue =
    value && typeof value === "object" && "fr" in value ? (
      <BilingualDisplay text={value} />
    ) : (
      <div className="break-words">{value || "Non spécifié"}</div>
    );

  return (
    <div className="flex items-start gap-2 sm:gap-3">
      <div className="p-1.5 sm:p-2 rounded-lg bg-tacir-lightblue/10 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
        <div className="font-medium text-xs sm:text-sm mt-0.5">{displayValue}</div>
      </div>
    </div>
  );
}
