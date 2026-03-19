import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OutputDetails } from "./OutputDetails";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Upload,
  Eye,
  MessageSquare,
  FileText,
  Download,
  Edit,
  Sparkles,
  Target,
  BookOpen,
  User,
  UserCheck,
  Send,
  X,
  Paperclip,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const ParticipantOutputCard = ({
  output,
  onSubmit,
  onViewDetails,
  onUpdateSubmission,
  onAddComment,
  currentUser,
  compact = false,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim() && onAddComment && output.submission) {
      onAddComment(output.submission._id, newComment.trim());
      setNewComment("");
      setShowCommentForm(false);
    }
  };

  const getDaysUntilDue = () => {
    const today = new Date();
    const due = new Date(output.dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusInfo = () => {
    const submission = output.submission;
    const daysUntilDue = getDaysUntilDue();
    const isOverdue = daysUntilDue < 0;

    if (!submission) {
      return {
        status: "not_started",
        label: "Non commencé",
        color: "bg-tacir-darkgray text-white",
        icon: Clock,
        canSubmit: !isOverdue,
      };
    }

    if (submission.approved) {
      return {
        status: "approved",
        label: "Approuvé",
        color: "bg-tacir-green text-white",
        icon: CheckCircle,
        canSubmit: false,
      };
    }

    if (submission.submitted) {
      return {
        status: "submitted",
        label: "Soumis - En attente",
        color: "bg-tacir-lightblue text-white",
        icon: Upload,
        canSubmit: true, // Can resubmit
      };
    }

    return {
      status: "draft",
      label: "Brouillon",
      color: "bg-tacir-orange text-white",
      icon: Edit,
      canSubmit: !isOverdue,
    };
  };

  const getDueDateBadge = () => {
    const daysUntilDue = getDaysUntilDue();
    const isOverdue = daysUntilDue < 0;
    const submission = output.submission;

    if (submission?.approved) {
      return (
        <Badge className="bg-tacir-green text-white">
          <CheckCircle className="w-3 h-3 mr-1" />
          Terminé
        </Badge>
      );
    }

    if (isOverdue) {
      return (
        <Badge className="bg-tacir-pink text-white">
          <AlertCircle className="w-3 h-3 mr-1" />
          En retard ({Math.abs(daysUntilDue)} jour
          {Math.abs(daysUntilDue) !== 1 ? "s" : ""})
        </Badge>
      );
    } else if (daysUntilDue <= 3) {
      return (
        <Badge className="bg-tacir-orange text-white">
          <Clock className="w-3 h-3 mr-1" />
          Urgent - {daysUntilDue} jour{daysUntilDue !== 1 ? "s" : ""}
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-tacir-lightblue text-white">
          <Calendar className="w-3 h-3 mr-1" />
          {daysUntilDue} jour{daysUntilDue !== 1 ? "s" : ""} restant
          {daysUntilDue !== 1 ? "s" : ""}
        </Badge>
      );
    }
  };

  // Get participant name
  const getParticipantName = () => {
    const participant = output.submission?.participant;
    if (participant?.user?.firstName && participant?.user?.lastName) {
      return `${participant.user.firstName} ${participant.user.lastName}`;
    }
    if (participant?.name?.firstName && participant?.name?.lastName) {
      return `${participant.name.firstName} ${participant.name.lastName}`;
    }
    return "Participant";
  };

  // Get mentor name
  const getMentorName = () => {
    if (
      output.submission?.evaluatedBy?.firstName &&
      output.submission?.evaluatedBy?.lastName
    ) {
      return `${output.submission.evaluatedBy.firstName} ${output.submission.evaluatedBy.lastName}`;
    }
    return "Mentor";
  };

  // Get comment sender name
  const getSenderName = (comment) => {
    if (comment.user?.firstName && comment.user?.lastName) {
      return `${comment.user.firstName} ${comment.user.lastName}`;
    }
    return comment.role === "mentor" ? "Mentor" : "Participant";
  };

  // Check if current user is the sender
  const isCurrentUser = (comment) => {
    return currentUser && comment.user?._id === currentUser._id;
  };

  const statusInfo = getStatusInfo();
  const submission = output.submission;

  if (compact) {
    return (
      <Card className="border-l-4 border-l-tacir-lightblue hover:shadow-md transition-all duration-200">
        <CardHeader>
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg text-tacir-darkblue mb-2 line-clamp-2">
                {output.title}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mb-2">
                {getDueDateBadge()}
                <Badge className={statusInfo.color}>
                  <statusInfo.icon className="w-3 h-3 mr-1" />
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
          </div>

          <CardDescription className="text-tacir-darkgray line-clamp-2">
            {output.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => setIsDetailsOpen(true)}
              className="bg-tacir-blue hover:bg-tacir-blue/90 text-white"
            >
              <Eye className="w-3 h-3 mr-1" />
              Détails
            </Button>

            {statusInfo.canSubmit && (
              <Button
                size="sm"
                onClick={() =>
                  submission ? onUpdateSubmission?.(output) : onSubmit?.(output)
                }
                className="bg-tacir-pink hover:bg-tacir-pink/90 text-white"
              >
                <Upload className="w-3 h-3 mr-1" />
                {submission ? "Resoumetre" : "Soumettre"}
              </Button>
            )}
          </div>
        </CardContent>

        {/* Details Dialog for mobile */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-tacir-darkblue">
                {output.title}
              </DialogTitle>
            </DialogHeader>
            <OutputDetails output={output} />
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-tacir-lightblue hover:shadow-lg transition-all duration-200">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 p-6 border-b border-tacir-lightgray/30">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-tacir-lightblue/20 rounded-lg flex-shrink-0">
              <Target className="w-5 h-5 text-tacir-lightblue" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl text-tacir-darkblue mb-2 break-words">
                {output.title}
              </CardTitle>
              {output.training && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-tacir-darkgray">
                    {output.training.title}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {getDueDateBadge()}
            <Badge className={statusInfo.color}>
              <statusInfo.icon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
          {statusInfo.canSubmit && (
            <Button
              size="sm"
              onClick={() =>
                submission ? onUpdateSubmission?.(output) : onSubmit?.(output)
              }
              className="bg-tacir-pink hover:bg-tacir-pink/90 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              {submission ? "Resoumetre" : "Soumettre"}
            </Button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <CardHeader>
        <CardDescription className="text-tacir-darkgray mb-4 break-words">
          {output.description}
        </CardDescription>

        {output.instructions && (
          <div className="bg-tacir-lightgray/20 p-4 rounded-lg mb-4 border border-tacir-lightgray/30">
            <h4 className="font-medium text-tacir-darkblue mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Instructions :
            </h4>
            <p className="text-sm text-tacir-darkgray break-words">
              {output.instructions}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-tacir-darkgray mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Échéance : {new Date(output.dueDate).toLocaleDateString("fr-FR")}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Créé le : {new Date(output.createdAt).toLocaleDateString("fr-FR")}
          </div>
          {output.createdBy && (
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Par : {output.createdBy.firstName} {output.createdBy.lastName}
            </div>
          )}
        </div>

        {/* Attachments */}
        {output.attachments && output.attachments.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-tacir-darkblue mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Pièces jointes :
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {output.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-tacir-lightgray/30 hover:border-tacir-blue transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="p-1 bg-tacir-blue/20 rounded-md">
                      <FileText className="w-4 h-4 text-tacir-blue" />
                    </div>
                    <span className="text-sm text-tacir-darkblue truncate">
                      {attachment.name}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const baseUrl = "https://incubation.tacir.tn";
                      const fullUrl = attachment.url.startsWith("http")
                        ? attachment.url
                        : attachment.url.startsWith("/api/")
                        ? `${baseUrl}${attachment.url}`
                        : `${baseUrl}/api/uploads${attachment.url.replace(
                            "/uploads",
                            ""
                          )}`;
                      window.open(fullUrl, "_blank");
                    }}
                    className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white ml-2"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Submission Status */}
        {submission && (
          <div className="bg-white border border-tacir-lightgray/30 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-tacir-darkblue flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Ma soumission
              </h4>
              <Badge className={statusInfo.color}>
                <statusInfo.icon className="w-3 h-3 mr-1" />
                {statusInfo.label}
              </Badge>
            </div>

            <div className="space-y-3">
              {submission.submissionDate && (
                <div className="flex items-center gap-2 text-sm text-tacir-darkgray">
                  <Calendar className="w-4 h-4" />
                  Soumis le :{" "}
                  {new Date(submission.submissionDate).toLocaleDateString(
                    "fr-FR"
                  )}
                </div>
              )}

              {submission.attachments && submission.attachments.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-tacir-darkblue mb-2">
                    Fichiers soumis :
                  </p>
                  <div className="space-y-1">
                    {submission.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-tacir-lightgray/10 rounded border border-tacir-lightgray/30"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-tacir-blue" />
                          <span className="text-sm text-tacir-darkblue">
                            {file.name}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const baseUrl = "https://incubation.tacir.tn";
                            const fullUrl = file.url.startsWith("http")
                              ? file.url
                              : file.url.startsWith("/api/")
                              ? `${baseUrl}${file.url}`
                              : `${baseUrl}/api/uploads${file.url.replace(
                                  "/uploads",
                                  ""
                                )}`;
                            window.open(fullUrl, "_blank");
                          }}
                          className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {statusInfo.canSubmit && (
                <div className="flex gap-2 pt-2 border-t border-tacir-lightgray/30">
                  <Button
                    size="sm"
                    onClick={() => onUpdateSubmission?.(output)}
                    className="bg-tacir-orange hover:bg-tacir-orange/90 text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier ma soumission
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comments Section */}
        {submission && (
          <div className="space-y-4">
            {/* Mentor Feedback */}
            {submission.feedback && (
              <div className="bg-white border border-tacir-green/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-tacir-green/20 rounded-full flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-tacir-green" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-tacir-green text-sm">
                        {getMentorName()}
                      </span>
                      <Badge className="bg-tacir-green text-white text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Feedback officiel
                      </Badge>
                      {submission.evaluatedAt && (
                        <span className="text-xs text-tacir-darkgray">
                          {new Date(submission.evaluatedAt).toLocaleDateString(
                            "fr-FR"
                          )}{" "}
                          à{" "}
                          {new Date(submission.evaluatedAt).toLocaleTimeString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      )}
                    </div>
                    <div className="bg-tacir-green/10 rounded-lg p-3 border border-tacir-green/20">
                      <p className="text-sm text-tacir-darkgray break-words leading-relaxed">
                        {submission.feedback}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Comments */}
            <div className="bg-white border border-tacir-lightgray/30 rounded-lg">
              {/* Header with sticky positioning */}
              <div className="p-4 border-b border-tacir-lightgray/30 sticky top-0 bg-white z-10">
                <h5 className="font-medium text-tacir-darkblue flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Discussion ({submission.comments.length})
                </h5>
              </div>

              {/* Messages container with better scrolling */}
              <div className="p-4">
                <div
                  className="space-y-4 h-[300px] overflow-y-auto pr-2"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#E0E0E0 transparent",
                  }}
                >
                  {/* Scrollbar styling for Webkit browsers */}
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      width: 6px;
                    }
                    div::-webkit-scrollbar-track {
                      background: transparent;
                    }
                    div::-webkit-scrollbar-thumb {
                      background-color: #e0e0e0;
                      border-radius: 3px;
                    }
                  `}</style>

                  {submission.comments.map((comment, index) => {
                    const isCurrentUserMessage = isCurrentUser(comment);
                    const isMentor = comment.role === "mentor";
                    const senderName = getSenderName(comment);

                    return (
                      <div
                        key={index}
                        className={`flex gap-3 group ${
                          isMentor ? "flex-row-reverse" : ""
                        }`}
                      >
                        {/* Avatar with hover effect */}
                        <div className="flex-shrink-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              isMentor
                                ? "bg-tacir-lightblue/20 group-hover:bg-tacir-lightblue/30"
                                : "bg-tacir-orange/20 group-hover:bg-tacir-orange/30"
                            }`}
                          >
                            {isMentor ? (
                              <UserCheck
                                className={`w-4 h-4 ${
                                  isMentor
                                    ? "text-tacir-lightblue"
                                    : "text-tacir-orange"
                                }`}
                              />
                            ) : (
                              <User
                                className={`w-4 h-4 ${
                                  isMentor
                                    ? "text-tacir-lightblue"
                                    : "text-tacir-orange"
                                }`}
                              />
                            )}
                          </div>
                        </div>

                        {/* Message Content with smooth transitions */}
                        <div
                          className={`flex-1 min-w-0 transition-all ${
                            isMentor ? "flex flex-col items-end" : ""
                          }`}
                        >
                          {/* Message Header */}
                          <div
                            className={`flex items-center gap-2 mb-1 ${
                              isMentor ? "flex-row-reverse" : ""
                            }`}
                          >
                            <span
                              className={`text-xs font-medium ${
                                isMentor
                                  ? "text-tacir-lightblue"
                                  : "text-tacir-orange"
                              }`}
                            >
                              {senderName}
                            </span>
                            {isCurrentUserMessage && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-white/80 backdrop-blur-sm"
                              >
                                Vous
                              </Badge>
                            )}
                            <span className="text-xs text-tacir-darkgray flex items-center gap-1">
                              <Clock className="w-3 h-3 opacity-70" />
                              {new Date(comment.createdAt).toLocaleDateString(
                                "fr-FR"
                              )}{" "}
                              à{" "}
                              {new Date(comment.createdAt).toLocaleTimeString(
                                "fr-FR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>

                          {/* Message Bubble with subtle animation */}
                          <div
                            className={`max-w-xs sm:max-w-md lg:max-w-lg rounded-lg p-3 transition-all duration-200 ${
                              isCurrentUserMessage
                                ? "bg-tacir-lightblue text-white rounded-br-sm hover:shadow-sm"
                                : isMentor
                                ? "bg-tacir-lightblue/10 border border-tacir-lightblue/20 text-tacir-darkgray rounded-br-sm hover:bg-tacir-lightblue/15"
                                : "bg-tacir-lightgray/30 border border-tacir-lightgray/40 text-tacir-darkgray rounded-bl-sm hover:bg-tacir-lightgray/40"
                            }`}
                          >
                            <p className="text-sm break-words leading-relaxed">
                              {comment.comment}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty state if no comments */}
                  {submission.comments.length === 0 && (
                    <div className="h-full flex items-center justify-center text-tacir-darkgray text-sm">
                      Aucun commentaire pour le moment
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Add Comment Form */}
            {showCommentForm ? (
              <div className="bg-white border border-tacir-lightgray/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-tacir-blue/20 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-tacir-blue" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="w-full resize-none focus:ring-2 focus:ring-tacir-lightblue focus:border-transparent border-tacir-lightgray/30"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCommentForm(false);
                          setNewComment("");
                        }}
                        className="border-tacir-darkgray text-tacir-darkgray hover:bg-tacir-darkgray hover:text-white"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="bg-tacir-lightblue hover:bg-tacir-lightblue/90 text-white disabled:opacity-50"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Envoyer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCommentForm(true)}
                  className="border-tacir-lightblue text-tacir-lightblue hover:bg-tacir-lightblue hover:text-white transition-colors"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ajouter un commentaire
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Call to Action for New Submissions */}
        {!submission && statusInfo.canSubmit && (
          <div className="bg-tacir-lightblue/10 p-4 rounded-lg border border-tacir-lightgray/30 text-center">
            <div className="mb-4">
              <div className="p-3 bg-tacir-pink/20 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Upload className="w-8 h-8 text-tacir-pink" />
              </div>
              <h3 className="text-lg font-semibold text-tacir-darkblue mb-2">
                Prêt à soumettre ?
              </h3>
              <p className="text-tacir-darkgray text-sm mb-4">
                Cliquez ci-dessous pour soumettre votre travail pour ce
                livrable.
              </p>
            </div>
            <Button
              onClick={() => onSubmit?.(output)}
              className="bg-tacir-pink hover:bg-tacir-pink/90 text-white px-6"
            >
              <Upload className="w-4 h-4 mr-2" />
              Commencer la soumission
            </Button>
          </div>
        )}

        {/* Overdue Notice */}
        {!statusInfo.canSubmit && !submission?.approved && (
          <div className="bg-tacir-pink/10 p-4 rounded-lg border border-tacir-pink/30 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-tacir-pink" />
              <span className="font-medium text-tacir-pink">Délai dépassé</span>
            </div>
            <p className="text-sm text-tacir-darkgray">
              La date limite de soumission est dépassée. Contactez votre mentor
              si nécessaire.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
