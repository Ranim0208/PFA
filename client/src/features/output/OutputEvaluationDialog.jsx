"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  FileText,
  Download,
  MessageSquare,
} from "lucide-react";

export const EvaluationDialog = ({
  isOpen,
  onClose,
  submission,
  onEvaluate,
  loading = false,
}) => {
  const [evaluation, setEvaluation] = useState({
    approved: false,
    feedback: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (submission) {
      setEvaluation({
        approved: submission.approved || false,
        feedback: submission.feedback || "",
      });
      setError(null);
    }
  }, [submission]);

  const handleEvaluate = async () => {
    if (!evaluation.feedback.trim()) {
      setError("Feedback is required");
      return;
    }

    if (evaluation.feedback.trim().length < 20) {
      setError("Feedback should be at least 20 characters");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onEvaluate(submission._id, {
        // First arg is ID, second is evaluation data
        approved: evaluation.approved,
        feedback: evaluation.feedback,
      });
      onClose();
    } catch (error) {
      console.error("Error evaluating submission:", error);
      setError(error.message || "Failed to save evaluation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEvaluation({ approved: false, feedback: "" });
    setError(null);
    onClose();
  };

  if (!submission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-tacir-darkblue flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Evaluate Submission
          </DialogTitle>
          <DialogDescription>
            Review and provide feedback for{" "}
            {submission.participant?.user?.name || submission.participant?.name}
            's submission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submission Details */}
          <div className="space-y-4">
            <Alert className="border-tacir-lightblue">
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">
                      {submission.participant?.user?.name ||
                        submission.participant?.name}
                    </span>
                    <Badge className="bg-tacir-lightblue text-white">
                      {submission.participant?.user?.email ||
                        submission.participant?.email}
                    </Badge>
                  </div>

                  {submission.fileName && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>File: {submission.fileName}</span>
                      {submission.fileUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(submission.fileUrl, "_blank")
                          }
                          className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  )}

                  {submission.submissionDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Submitted:{" "}
                        {new Date(submission.submissionDate).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>

          <Separator />

          {/* Evaluation Form */}
          <div className="space-y-4">
            <div>
              <Label className="text-tacir-darkblue font-medium mb-3 block">
                Evaluation Decision
              </Label>
              <div className="flex gap-3">
                <Button
                  variant={evaluation.approved ? "default" : "outline"}
                  onClick={() =>
                    setEvaluation((prev) => ({ ...prev, approved: true }))
                  }
                  className={
                    evaluation.approved
                      ? "bg-tacir-green hover:bg-tacir-green/90 text-white"
                      : "border-tacir-green text-tacir-green hover:bg-tacir-green hover:text-white"
                  }
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant={!evaluation.approved ? "default" : "outline"}
                  onClick={() =>
                    setEvaluation((prev) => ({ ...prev, approved: false }))
                  }
                  className={
                    !evaluation.approved
                      ? "bg-tacir-pink hover:bg-tacir-pink/90 text-white"
                      : "border-tacir-pink text-tacir-pink hover:bg-tacir-pink hover:text-white"
                  }
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Needs Revision
                </Button>
              </div>
            </div>

            <div>
              <Label
                htmlFor="feedback"
                className="text-tacir-darkblue font-medium"
              >
                Feedback <span className="text-tacir-pink">*</span>
              </Label>
              <Textarea
                id="feedback"
                value={evaluation.feedback}
                onChange={(e) =>
                  setEvaluation((prev) => ({
                    ...prev,
                    feedback: e.target.value,
                  }))
                }
                placeholder={
                  evaluation.approved
                    ? "Provide positive feedback and suggestions for improvement..."
                    : "Explain what needs to be revised and provide specific guidance..."
                }
                rows={5}
                className="border-tacir-lightblue focus:ring-tacir-blue mt-2"
              />
              <p className="text-xs text-tacir-darkgray mt-1">
                {evaluation.feedback.length}/1000 characters (minimum 20)
              </p>
            </div>

            {/* Previous Feedback (if exists) */}
            {submission.feedback &&
              submission.feedback !== evaluation.feedback && (
                <div className="bg-tacir-lightgray p-4 rounded-lg">
                  <h4 className="font-medium text-tacir-darkblue mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Previous Feedback
                  </h4>
                  <p className="text-sm text-tacir-darkgray">
                    {submission.feedback}
                  </p>
                  {submission.evaluatedBy && (
                    <p className="text-xs text-tacir-darkgray mt-2">
                      By: {submission.evaluatedBy.name} on{" "}
                      {new Date(submission.evaluatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="border-tacir-darkgray text-tacir-darkgray hover:bg-tacir-lightgray"
          >
            Cancel
          </Button>
          <Button
            onClick={handleEvaluate}
            disabled={
              isSubmitting ||
              !evaluation.feedback.trim() ||
              evaluation.feedback.trim().length < 20
            }
            className="bg-tacir-blue hover:bg-tacir-darkblue text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Evaluation
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
