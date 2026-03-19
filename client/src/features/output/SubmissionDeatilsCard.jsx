// SubmissionDetails.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  FileText,
  Download,
  Paperclip,
  Send,
  X,
  CheckCircle,
  User,
  UserCheck,
  Clock,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export const SubmissionDetails = ({
  submission,
  onAddComment,
  currentUser,
}) => {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState("");
  const handleAddComment = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(submission._id, newComment.trim());
      setNewComment("");
      setShowCommentForm(false);
    }
  };

  // Get participant name
  const getParticipantName = () => {
    const participant = submission.participant;
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
    if (submission.evaluatedBy?.firstName && submission.evaluatedBy?.lastName) {
      return `${submission.evaluatedBy.firstName} ${submission.evaluatedBy.lastName}`;
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

  return (
    <div className="p-4 space-y-6">
      {/* Attachments */}
      {submission.attachments && submission.attachments.length > 0 && (
        <div className="bg-white border border-tacir-lightgray/30 rounded-lg p-4">
          <h5 className="font-medium text-tacir-darkblue mb-3 flex items-center gap-2">
            <Paperclip className="w-4 h-4" />
            Fichiers joints ({submission.attachments.length})
          </h5>
          <div className="space-y-2">
            {submission.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-tacir-lightgray/20 rounded-lg border border-tacir-lightgray/30 hover:border-tacir-blue transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0 p-2 bg-tacir-blue/20 rounded-md">
                    <FileText className="w-4 h-4 text-tacir-blue" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-tacir-darkgray block truncate">
                      {attachment.name}
                    </span>
                    <Badge variant="outline" className="text-xs mt-1">
                      {attachment.type}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
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
                  className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white ml-3 flex-shrink-0"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Télécharger
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
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

      {/* Comments Thread */}
      {/* Comments Thread */}
      {submission.comments && submission.comments.length > 0 && (
        <div className="bg-white border border-tacir-lightgray/30 rounded-lg">
          {/* Sticky header */}
          <div className="p-4 border-b border-tacir-lightgray/30 sticky top-0 bg-white z-10">
            <h5 className="font-medium text-tacir-darkblue flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Discussion ({submission.comments.length})
            </h5>
          </div>

          {/* Messages container with custom scrollbar */}
          <div className="p-4">
            <div
              className="space-y-4 h-[300px] overflow-y-auto pr-2"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#E0E0E0 transparent",
              }}
            >
              {/* Scrollbar styling */}
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
                const senderName = getSenderName(comment); // Using getSenderName function

                return (
                  <div
                    key={index}
                    className={`flex gap-3 group ${
                      isMentor ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
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

                    {/* Message Content */}
                    <div
                      className={`flex-1 min-w-0 ${
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

                      {/* Message Bubble */}
                      <div
                        className={`max-w-xs sm:max-w-md lg:max-w-lg rounded-lg p-3 ${
                          isCurrentUserMessage
                            ? "bg-tacir-lightblue text-white rounded-br-sm"
                            : isMentor
                            ? "bg-tacir-lightblue/10 border border-tacir-lightblue/20 text-tacir-darkgray rounded-br-sm"
                            : "bg-tacir-lightgray/30 border border-tacir-lightgray/40 text-tacir-darkgray rounded-bl-sm"
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
            </div>
          </div>
        </div>
      )}
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
  );
};
