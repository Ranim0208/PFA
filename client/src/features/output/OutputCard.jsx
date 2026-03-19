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
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Upload,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SubmissionDetails } from "./SubmissionDeatilsCard"; // We'll create this separately

export const OutputCard = ({
  output,
  userRole = "mentor",
  onEvaluate,
  onViewSubmission,
  onAddComment,
}) => {
  const getSubmissionStats = () => {
    const submissions = output.participantSubmissions || [];
    const submitted = submissions.filter((s) => s.submitted).length;
    const approved = submissions.filter((s) => s.approved).length;
    const pending = submissions.filter(
      (s) => s.submitted && !s.approved
    ).length;
    const total = output.targetParticipants?.length || 0;
    const isCollective = total === 0;

    return {
      submitted,
      approved,
      pending,
      total: isCollective ? submissions.length : total,
      isCollective,
    };
  };

  const getDaysUntilDue = () => {
    const today = new Date();
    const due = new Date(output.dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressPercentage = () => {
    const stats = getSubmissionStats();
    if (stats.total === 0) return 0;
    return (stats.approved / stats.total) * 100;
  };

  const stats = getSubmissionStats();
  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0;
  const progressPercentage = getProgressPercentage();

  const getDueDateBadge = () => {
    if (isOverdue) {
      return (
        <Badge className="bg-tacir-pink text-white">
          <AlertCircle className="w-3 h-3 mr-1" />
          En retard ({Math.abs(daysUntilDue)} jours)
        </Badge>
      );
    } else if (daysUntilDue <= 3) {
      return (
        <Badge className="bg-tacir-yellow text-white">
          <Clock className="w-3 h-3 mr-1" />
          Échéance dans {daysUntilDue} jour{daysUntilDue !== 1 ? "s" : ""}
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-tacir-green text-white">
          <Calendar className="w-3 h-3 mr-1" />
          {daysUntilDue} jours restants
        </Badge>
      );
    }
  };

  return (
    <Card className="border-l-4 border-l-tacir-lightblue hover:shadow-lg transition-all duration-200 w-full">
      {/* Top Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-4 border-b border-tacir-lightgray/30">
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <CardTitle className="text-xl text-tacir-darkblue break-words">
            {output.title}
          </CardTitle>
          {getDueDateBadge()}
        </div>

        {userRole === "mentor" && (
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 w-full lg:w-auto">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-tacir-lightblue text-white">
                {stats.submitted}/{stats.total} soumis
              </Badge>
              <Badge className="bg-tacir-green text-white">
                {stats.approved}/{stats.total} approuvés
              </Badge>
              {stats.pending > 0 && (
                <Badge className="bg-tacir-yellow text-white">
                  {stats.pending} en attente
                </Badge>
              )}
            </div>

            <div className="w-full sm:w-40 lg:w-32">
              <div className="flex items-center justify-between text-xs text-tacir-darkgray mb-1">
                <span>Progression</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardHeader>
        <CardDescription className="text-tacir-darkgray mb-3 break-words">
          {output.description}
        </CardDescription>

        {output.instructions && (
          <div className="bg-tacir-lightgray p-3 rounded-lg mb-3">
            <h4 className="font-medium text-tacir-darkblue mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Instructions :
            </h4>
            <p className="text-sm text-tacir-darkgray break-words">
              {output.instructions}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-tacir-darkgray">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Échéance : {new Date(output.dueDate).toLocaleDateString("fr-FR")}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {stats.isCollective
              ? "Tâche collective"
              : `${stats.total} participant${stats.total !== 1 ? "s" : ""}`}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Créé le : {new Date(output.createdAt).toLocaleDateString("fr-FR")}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Submissions */}
        <div className="space-y-4">
          {output.participantSubmissions?.length > 0 &&
            output.participantSubmissions.map((submission) => (
              <SubmissionCard
                key={submission._id}
                submission={submission}
                userRole={userRole}
                onEvaluate={onEvaluate}
                onViewSubmission={onViewSubmission}
                onAddComment={onAddComment}
              />
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SubmissionCard = ({
  submission,
  userRole,
  onEvaluate,
  onViewSubmission,
  onAddComment,
}) => {
  const [expanded, setExpanded] = useState(false);

  const getSubmissionStatusBadge = () => {
    if (!submission.submitted) {
      return (
        <Badge
          variant="outline"
          className="border-tacir-darkgray text-tacir-darkgray"
        >
          <Clock className="w-3 h-3 mr-1" />
          Non soumis
        </Badge>
      );
    }

    if (submission.approved) {
      return (
        <Badge className="bg-tacir-green text-white">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approuvé
        </Badge>
      );
    }

    return (
      <Badge className="bg-tacir-lightblue text-white">
        <Upload className="w-3 h-3 mr-1" />
        Soumis
      </Badge>
    );
  };

  const getParticipantName = () => {
    const participant = submission.participant;
    if (participant?.user?.firstName && participant?.user?.lastName) {
      return `${participant.user.firstName} ${participant.user.lastName}`;
    }
    if (participant?.name?.firstName && participant?.name?.lastName) {
      return `${participant.name.firstName} ${participant.name.lastName}`;
    }
    return "Participant inconnu";
  };

  return (
    <div className="border rounded-lg bg-white hover:bg-tacir-lightgray/30 transition-colors">
      {/* Main submission info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-tacir-darkgray" />
            <span className="font-medium text-tacir-darkblue">
              {getParticipantName()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {getSubmissionStatusBadge()}
          </div>

          {submission.submissionDate && (
            <span className="text-xs text-tacir-darkgray">
              Soumis le :{" "}
              {new Date(submission.submissionDate).toLocaleDateString("fr-FR")}
            </span>
          )}

          {submission.evaluatedAt && (
            <span className="text-xs text-tacir-darkgray">
              Évalué le :{" "}
              {new Date(submission.evaluatedAt).toLocaleDateString("fr-FR")}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          {submission.submitted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="border-tacir-lightblue text-tacir-lightblue"
            >
              {expanded ? (
                <ChevronUp className="w-3 h-3 mr-1" />
              ) : (
                <ChevronDown className="w-3 h-3 mr-1" />
              )}
              {expanded ? "Masquer" : "Détails"}
            </Button>
          )}

          {userRole === "mentor" &&
            submission.submitted &&
            !submission.approved && (
              <Button
                size="sm"
                className="bg-tacir-green hover:bg-tacir-green/90 text-white"
                onClick={() => onEvaluate?.(submission)}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Évaluer
              </Button>
            )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && submission.submitted && (
        <div className="border-t bg-tacir-lightgray/30">
          <SubmissionDetails
            submission={submission}
            userRole={userRole}
            onViewSubmission={onViewSubmission}
            onAddComment={onAddComment}
          />
        </div>
      )}
    </div>
  );
};
