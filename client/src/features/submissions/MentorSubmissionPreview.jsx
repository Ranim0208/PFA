"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getEvaluationConfig,
  formatEvaluationText,
  formatEvaluationDisplayText,
  getEvaluationDisplayConfig,
  EVALUATION_OPTIONS,
} from "./evaluationConfig";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { FileText, MessageSquare, Star, User, Users } from "lucide-react";
import {
  addMentorEvaluation,
  addMentorFeedback,
} from "@/services/forms/submissionService";

const MentorSubmissionPreview = ({
  submission,
  onClose,
  currentUserId,
  onEvaluationAdded,
}) => {
  const queryClient = useQueryClient();
  const [newFeedback, setNewFeedback] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [coordinatorFeedbacks, setCoordinatorFeedbacks] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [coordinatorEvaluations, setCoordinatorEvaluations] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [evaluationComment, setEvaluationComment] = useState("");
  const [activeTab, setActiveTab] = useState("project");

  useEffect(() => {
    if (submission) {
      setFeedbacks(submission.mentorFeedbacks || []);
      setCoordinatorFeedbacks(submission.feedbacks || []);
      setEvaluations(submission.mentorEvaluations || []);
      setCoordinatorEvaluations(submission.preselectionEvaluations || []);
    }
  }, [submission]);

  const handleAddFeedback = async () => {
    if (!newFeedback.trim()) return;

    setIsSubmittingFeedback(true);
    try {
      const response = await addMentorFeedback(submission._id, {
        content: newFeedback.trim(),
      });

      setFeedbacks([...feedbacks, response.data]);
      setNewFeedback("");
      toast.success("Feedback added successfully");
      onClose();
      queryClient.invalidateQueries(["mentorSubmissions"]);
    } catch (error) {
      toast.error("Failed to add feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleAddEvaluation = async () => {
    if (!selectedEvaluation) return;

    try {
      const response = await addMentorEvaluation(submission._id, {
        evaluation: formatEvaluationText(selectedEvaluation.text),
        comment: evaluationComment,
      });

      setEvaluations([...evaluations, response.data]);
      setSelectedEvaluation(null);
      setEvaluationComment("");
      onEvaluationAdded();
      onClose();
      toast.success("Evaluation added successfully");
      queryClient.invalidateQueries(["mentorSubmissions"]);
    } catch (error) {
      toast.error("Failed to add evaluation");
    }
  };

  const statusBadgeVariant = {
    pending: "secondary",
    reviewed: "warning",
    accepted: "success",
    rejected: "destructive",
  };

  const getFieldValue = (value) => {
    if (typeof value === "object") {
      return value.fr || value.ar || Object.values(value).join(", ");
    }
    return String(value);
  };

  const getFieldLabel = (label) => {
    if (typeof label === "object") {
      return label.fr || label.ar || "Field";
    }
    return label || "Field";
  };

  const isCandidateNameField = (answer) => {
    if (!answer.field?.label) return false;

    const label = getFieldLabel(answer.field.label).toLowerCase();
    return ["nom", "name", "candidat"].some((term) => label.includes(term));
  };

  if (!submission) return null;
  return (
    <Dialog open={!!submission} onOpenChange={onClose}>
      <DialogContent className="!max-w-6xl w-full h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-semibold">
                Project Review
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={statusBadgeVariant[submission.status]}>
                  {submission.status}
                </Badge>
                <span className="text-sm text-gray-500">
                  Submitted on{" "}
                  {new Date(submission.submittedAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="project">
              <FileText className="w-4 h-4 mr-2" /> Project
            </TabsTrigger>
            <TabsTrigger value="files">
              <FileText className="w-4 h-4 mr-2" /> Files
            </TabsTrigger>
            <TabsTrigger value="evaluations">
              <Star className="w-4 h-4 mr-2" /> Evaluations
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <MessageSquare className="w-4 h-4 mr-2" /> Feedback
            </TabsTrigger>
          </TabsList>

          {/* Project Tab */}
          <TabsContent value="project">
            <div className="space-y-6">
              {/* Project Overview */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Project Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Form Title</Label>
                    <p className="p-2 bg-gray-50 rounded-md">
                      {getFieldValue(submission.form?.title)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      Candidate Name
                    </Label>
                    <p className="p-2 bg-gray-50 rounded-md">
                      {getFieldValue(
                        submission.answers.find(isCandidateNameField)?.value
                      ) || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Project Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {submission.answers
                    .filter((answer) => !isCandidateNameField(answer))
                    .map((answer, index) => (
                      <div key={index} className="space-y-1">
                        <Label className="font-medium">
                          {getFieldLabel(answer.field?.label)}
                        </Label>
                        <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                          {getFieldValue(answer.value)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Attached Files</h3>
              {submission.files.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {submission.files.map((file, index) =>
                    file.urls.map((url, urlIndex) => (
                      <div
                        key={`${index}-${urlIndex}`}
                        className="p-3 border rounded-md hover:bg-gray-50 flex flex-col"
                      >
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          {getFieldLabel(file.field?.label) ||
                            `File ${urlIndex + 1}`}
                        </a>
                        <span className="text-xs text-gray-500 mt-1 truncate">
                          {url.split("/").pop()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No files attached</p>
              )}
            </div>
          </TabsContent>

          {/* Evaluations Tab */}
          <TabsContent value="evaluations">
            <div className="space-y-6">
              {/* Coordinator Evaluations */}
              {coordinatorEvaluations.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Users className="w-5 h-5" /> Coordinator Evaluations
                  </h3>
                  <div className="space-y-3">
                    {coordinatorEvaluations.map((evaluation, index) => {
                      // Use evaluationText from backend response
                      const displayText = formatEvaluationDisplayText(
                        evaluation.evaluationText
                      );
                      const config = getEvaluationConfig(
                        evaluation.evaluationText
                      );

                      return (
                        <div
                          key={`coordinator-${index}`}
                          className={`p-4 rounded-md ${
                            config.colorClass || "bg-gray-100"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <p className="font-medium">
                                  {evaluation.coordinator || "Coordinator"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg">{config.icon}</span>
                                <p className="font-semibold">{displayText}</p>
                              </div>
                              {evaluation.comment && (
                                <p className="mt-1 text-sm whitespace-pre-wrap">
                                  {evaluation.comment}
                                </p>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(evaluation.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Separator />
                </div>
              )}

              {/* Mentor Evaluations */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <User className="w-5 h-5" /> Mentor Evaluations
                </h3>
                {evaluations?.length > 0 ? (
                  <div className="space-y-3">
                    {evaluations.map((evaluation, index) => {
                      const safeEvaluationText =
                        evaluation?.evaluationText || "unknown";

                      const { displayText, colorClass, icon } =
                        getEvaluationDisplayConfig(safeEvaluationText);

                      const isOwner =
                        evaluation?.mentorId === currentUserId ||
                        evaluation?.mentorId?._id === currentUserId;

                      return (
                        <div
                          key={`mentor-${index}`}
                          className={`p-4 rounded-md ${colorClass}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <p className="font-medium">
                                  {evaluation?.mentor || "Mentor"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg">{icon}</span>
                                <p className="font-semibold">{displayText}</p>
                              </div>
                              {evaluation?.comment && (
                                <p className="mt-1 text-sm whitespace-pre-wrap">
                                  {evaluation.comment}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm text-gray-600">
                                {evaluation?.date
                                  ? new Date(
                                      evaluation.date
                                    ).toLocaleDateString()
                                  : "No date"}
                              </div>
                              {isOwner && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      Edit
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="w-72">
                                    <div className="space-y-2 p-2">
                                      <h4 className="font-medium text-sm">
                                        Update Evaluation
                                      </h4>
                                      {EVALUATION_OPTIONS.map((option) => (
                                        <DropdownMenuItem
                                          key={option.value}
                                          onClick={() => {
                                            setSelectedEvaluation(option);
                                            setEvaluationComment(
                                              evaluation.comment || ""
                                            );
                                          }}
                                          className="flex items-start gap-3"
                                        >
                                          <span className="text-lg">
                                            {option.icon}
                                          </span>
                                          <div>
                                            <p className="font-medium">
                                              {option.text}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                              {option.description}
                                            </p>
                                          </div>
                                        </DropdownMenuItem>
                                      ))}
                                    </div>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No evaluations yet</p>
                )}

                <Separator />

                {/* Add Evaluation Form - Always Visible */}
                <div className="space-y-4">
                  <h4 className="font-medium">Add Your Evaluation</h4>
                  <div className="space-y-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          {selectedEvaluation ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {selectedEvaluation.icon}
                              </span>
                              {selectedEvaluation.text}
                            </div>
                          ) : (
                            "Select an evaluation"
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-72">
                        <div className="space-y-2 p-2">
                          <h4 className="font-medium text-sm">
                            Select Evaluation
                          </h4>
                          {EVALUATION_OPTIONS.map((option) => (
                            <DropdownMenuItem
                              key={option.value}
                              onClick={() => setSelectedEvaluation(option)}
                              className="flex items-start gap-3"
                            >
                              <span className="text-lg">{option.icon}</span>
                              <div>
                                <p className="font-medium">{option.text}</p>
                                <p className="text-xs text-gray-600">
                                  {option.description}
                                </p>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div>
                      <Label>Comments (Optional)</Label>
                      <Textarea
                        placeholder="Add your comments here..."
                        value={evaluationComment}
                        onChange={(e) => setEvaluationComment(e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleAddEvaluation}
                      disabled={!selectedEvaluation}
                      className="w-full sm:w-auto"
                    >
                      Submit Evaluation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <div className="space-y-6">
              {/* Coordinator Feedback */}
              {coordinatorFeedbacks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Users className="w-5 h-5" /> Coordinator Feedback
                  </h3>
                  <ScrollArea className="h-64 rounded-md border">
                    <div className="p-4 space-y-4">
                      {coordinatorFeedbacks.map((feedback, index) => (
                        <div
                          key={`coordinator-fb-${index}`}
                          className="space-y-2"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <p className="font-medium">
                                {feedback.user || "Coordinator"}
                              </p>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(feedback.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap pl-6">
                            {feedback.content}
                          </p>
                          {index < coordinatorFeedbacks.length - 1 && (
                            <Separator />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <Separator />
                </div>
              )}

              {/* Mentor Feedback */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <User className="w-5 h-5" /> Mentor Feedback
                </h3>
                {feedbacks.length > 0 ? (
                  <ScrollArea className="h-64 rounded-md border">
                    <div className="p-4 space-y-4">
                      {feedbacks.map((feedback, index) => {
                        // Use the most reliable source for mentor name
                        const mentorName =
                          feedback.mentor ||
                          feedback.user ||
                          (feedback.mentorObj
                            ? `${feedback.mentorObj.firstName || ""} ${
                                feedback.mentorObj.lastName || ""
                              }`.trim()
                            : "Mentor inconnu");

                        return (
                          <div key={`mentor-fb-${index}`} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <p className="font-medium">{mentorName}</p>
                              </div>
                              <span className="text-sm text-gray-500">
                                {feedback.date
                                  ? new Date(feedback.date).toLocaleDateString()
                                  : "Date inconnue"}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap pl-6">
                              {feedback.content}
                            </p>
                            {index < feedbacks.length - 1 && <Separator />}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-gray-500">
                    No mentor feedback yet
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Add Feedback</Label>
                <Textarea
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  placeholder="Enter your feedback here..."
                />
                <Button
                  onClick={handleAddFeedback}
                  disabled={isSubmittingFeedback || !newFeedback.trim()}
                >
                  {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MentorSubmissionPreview;
