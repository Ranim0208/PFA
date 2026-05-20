import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  MessageSquare,
} from "lucide-react";

// Mock API function - replace with actual API call
const submitParticipantOutput = async (
  outputId,
  submissionData,
  attachments
) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate successful submission
  return {
    success: true,
    data: {
      id: Date.now(),
      submitted: true,
      submissionDate: new Date().toISOString(),
      ...submissionData,
    },
  };
};

export const ParticipantSubmissionDialog = ({
  output,
  participantSubmission,
  onSubmissionComplete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    notes: "", // Optional notes that will go into comments
  });
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const resetForm = () => {
    setSubmissionData({ notes: "" });
    setAttachments([]);
    setUploadProgress(0);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (attachments.length === 0) {
      alert("Please attach at least one file for your submission");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Send the notes as part of submission data - backend will handle adding to comments
      await onSubmit({
        outputId: output._id,
        notes: comment.trim(), // This matches the backend expectation
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      setUploadProgress(100);
      setTimeout(() => {
        resetForm();
        setIsOpen(false);
        onSubmissionComplete?.();
      }, 500);
    } catch (error) {
      console.error("Error submitting output:", error);
      alert("Failed to submit output. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysUntilDue = () => {
    const today = new Date();
    const due = new Date(output.dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0;
  const isAlreadySubmitted = participantSubmission?.submitted;

  const getDueDateStatus = () => {
    if (isOverdue) {
      return {
        text: `Overdue by ${Math.abs(daysUntilDue)} day${
          Math.abs(daysUntilDue) !== 1 ? "s" : ""
        }`,
        color: "tacir-pink",
        icon: AlertCircle,
      };
    } else if (daysUntilDue <= 3) {
      return {
        text: `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}`,
        color: "tacir-yellow",
        icon: Clock,
      };
    } else {
      return {
        text: `${daysUntilDue} days remaining`,
        color: "tacir-green",
        icon: CheckCircle,
      };
    }
  };

  const dueDateStatus = getDueDateStatus();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isAlreadySubmitted ? (
          <Button
            variant="outline"
            className="border-tacir-green text-tacir-green hover:bg-tacir-green hover:text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            View Submission
          </Button>
        ) : (
          <Button
            className={`${
              isOverdue
                ? "bg-tacir-pink hover:bg-tacir-pink/90"
                : "bg-tacir-blue hover:bg-tacir-darkblue"
            } text-white`}
          >
            <Upload className="w-4 h-4 mr-2" />
            Submit Work
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-tacir-darkblue flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {isAlreadySubmitted ? "View Submission" : "Submit Assignment"}
          </DialogTitle>
          <DialogDescription>{output.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Details */}
          <div className="space-y-4">
            <Alert className="border-tacir-lightblue">
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      Due Date: {new Date(output.dueDate).toLocaleDateString()}
                    </span>
                    <Badge className={`bg-${dueDateStatus.color} text-white`}>
                      <dueDateStatus.icon className="w-3 h-3 mr-1" />
                      {dueDateStatus.text}
                    </Badge>
                  </div>
                  <p className="text-sm">{output.description}</p>
                </div>
              </AlertDescription>
            </Alert>

            {output.instructions && (
              <div className="bg-tacir-lightgray/20 p-4 rounded-lg border border-tacir-lightgray/30">
                <h4 className="font-medium text-tacir-darkblue mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Instructions
                </h4>
                <p className="text-sm text-tacir-darkgray whitespace-pre-wrap">
                  {output.instructions}
                </p>
              </div>
            )}
          </div>

          {/* Current Submission Status */}
          {isAlreadySubmitted && (
            <div className="space-y-4">
              <Alert className="border-tacir-green">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Submission Status</span>
                      <Badge
                        className={`${
                          participantSubmission.approved
                            ? "bg-tacir-green"
                            : "bg-tacir-lightblue"
                        } text-white`}
                      >
                        {participantSubmission.approved
                          ? "Approved"
                          : "Under Review"}
                      </Badge>
                    </div>
                    <p className="text-sm">
                      Submitted on:{" "}
                      {new Date(
                        participantSubmission.submissionDate
                      ).toLocaleDateString()}
                    </p>
                    {participantSubmission.attachments &&
                      participantSubmission.attachments.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Files submitted:</span>
                          <ul className="list-disc list-inside ml-2 mt-1">
                            {participantSubmission.attachments.map(
                              (file, index) => (
                                <li key={index}>{file.name}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Show initial submission comment from comments array */}
              {participantSubmission.comments &&
                participantSubmission.comments.length > 0 &&
                participantSubmission.comments[0].role === "participant" && (
                  <div className="bg-tacir-lightblue/10 p-4 rounded-lg border border-tacir-lightblue/30">
                    <h4 className="font-medium text-tacir-lightblue mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Submission Notes
                    </h4>
                    <p className="text-sm text-tacir-darkgray whitespace-pre-wrap">
                      {participantSubmission.comments[0].comment}
                    </p>
                    <p className="text-xs text-tacir-darkgray mt-2">
                      Added on:{" "}
                      {new Date(
                        participantSubmission.comments[0].createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}

              {participantSubmission.feedback && (
                <div className="bg-tacir-green/10 p-4 rounded-lg border border-tacir-green/30">
                  <h4 className="font-medium text-tacir-green mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Mentor Feedback
                  </h4>
                  <p className="text-sm text-tacir-darkgray whitespace-pre-wrap">
                    {participantSubmission.feedback}
                  </p>
                  {participantSubmission.evaluatedBy && (
                    <p className="text-xs text-tacir-darkgray mt-2">
                      By: {participantSubmission.evaluatedBy.firstName}{" "}
                      {participantSubmission.evaluatedBy.lastName} on{" "}
                      {new Date(
                        participantSubmission.evaluatedAt
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="border-tacir-darkgray text-tacir-darkgray hover:bg-tacir-lightgray"
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Submission Form for new submissions */}
          {!isAlreadySubmitted && (
            <div className="space-y-6">
              {/* File Upload */}
              <div className="space-y-3">
                <Label className="text-tacir-darkblue font-medium">
                  Upload Files <span className="text-tacir-pink">*</span>
                </Label>
                <div className="border-2 border-dashed border-tacir-lightblue rounded-lg p-6">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="submission-upload"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.ppt,.pptx"
                  />
                  <label
                    htmlFor="submission-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-12 h-12 text-tacir-lightblue mb-3" />
                    <span className="text-tacir-darkblue font-medium">
                      Click to upload your files
                    </span>
                    <span className="text-sm text-tacir-darkgray mt-1">
                      PDF, DOC, DOCX, TXT, JPG, PNG, PPT, PPTX (Max 10MB each)
                    </span>
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-tacir-darkblue font-medium">
                      Selected Files:
                    </Label>
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-tacir-lightgray/30 rounded-lg border border-tacir-lightgray/30"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-tacir-blue" />
                          <span className="text-sm text-tacir-darkblue">
                            {file.name}
                          </span>
                          <span className="text-xs text-tacir-darkgray">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeAttachment(index)}
                          className="text-tacir-pink hover:bg-tacir-pink/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Optional Notes */}
              <div>
                <Label
                  htmlFor="notes"
                  className="text-tacir-darkblue font-medium"
                >
                  Submission Notes (Optional)
                </Label>
                <p className="text-xs text-tacir-darkgray mt-1 mb-2">
                  Add any comments or explanations about your submission. This
                  will appear in the discussion thread.
                </p>
                <Textarea
                  id="notes"
                  value={submissionData.notes}
                  onChange={(e) =>
                    setSubmissionData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Optional: Add any comments or explanations about your submission..."
                  rows={3}
                  className="border-tacir-lightblue focus:ring-tacir-blue"
                />
              </div>

              {/* Upload Progress */}
              {isSubmitting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-tacir-darkblue">
                      Uploading submission...
                    </span>
                    <span className="text-tacir-darkgray">
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="border-tacir-darkgray text-tacir-darkgray hover:bg-tacir-lightgray"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || attachments.length === 0}
                  className="bg-tacir-blue hover:bg-tacir-darkblue text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit Assignment
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
