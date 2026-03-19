"use client";
import React, { useState, useEffect } from "react";
import { CreateOutputDialog } from "@/features/output/CreateOutputDialog";
import { OutputCard } from "@/features/output/OutputCard";
import { EvaluationDialog } from "@/features/output/OutputEvaluationDialog";
import {
  getTrainingOutputs,
  createTrainingOutput,
  deleteTrainingOutput,
  evaluateParticipantOutput,
  getMentorSubmissionsByTraining,
} from "@/services/outputs/output";
import { getMentorTrainings } from "@/services/trainings/training";
import { toast } from "react-toastify";
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Download,
  User,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  Award,
  BarChart2,
  List,
  Grid,
  MessageSquare,
} from "lucide-react";
import { typeConfig } from "@/features/trainings/components/style.config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addSubmissionComment } from "@/services/outputs/output";
import { getMentorSubmissions } from "@/services/outputs/output";

const MentorOutputManagement = () => {
  const [outputs, setOutputs] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [submissionSearchTerm, setSubmissionSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [submissionSortBy, setSubmissionSortBy] = useState("submissionDate");
  const [submissionSortOrder, setSubmissionSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("list");
  const [filterStatus, setFilterStatus] = useState("all");
  const [submissionFilterStatus, setSubmissionFilterStatus] = useState("all");
  const [trainings, setTrainings] = useState([]);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [statsExpanded, setStatsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("outputs");
  const [stats, setStats] = useState({});
  const [submissionStats, setSubmissionStats] = useState({});
  const [comments, setComments] = useState([]);

  // Récupérer les formations du mentor
  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const response = await getMentorTrainings();
        setTrainings(response.data);
        if (response.data.length > 0) {
          setSelectedTraining(response.data[0]._id);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchTrainings();
  }, []);

  // Fetch outputs when training is selected
  useEffect(() => {
    if (!selectedTraining) return;

    const fetchOutputs = async () => {
      try {
        setLoading(true);
        const response = await getTrainingOutputs(selectedTraining);

        // Add validation here
        const validOutputs = (response.data || []).filter(
          (output) => output?._id
        );

        console.log("Outputs with submissions:", response);
        setOutputs(validOutputs);
        setStats(response.stats || {});
      } catch (error) {
        console.error("Error fetching outputs:", error);
        toast.error(error.message || "Failed to load outputs");
      } finally {
        setLoading(false);
      }
    };

    fetchOutputs();
  }, [selectedTraining]);

  // Fetch all submissions for mentor (filtered by training)
  const fetchSubmissions = async () => {
    try {
      setSubmissionsLoading(true);

      let response;
      if (selectedTraining && selectedTraining !== "all") {
        // Use training-specific endpoint
        response = await getMentorSubmissionsByTraining(selectedTraining, {
          status: submissionFilterStatus,
          search: submissionSearchTerm,
          sortBy: submissionSortBy,
          sortOrder: submissionSortOrder,
        });
      } else {
        // Use general endpoint with training filter
        response = await getMentorSubmissions({
          status: submissionFilterStatus,
          search: submissionSearchTerm,
          sortBy: submissionSortBy,
          sortOrder: submissionSortOrder,
          trainingId: selectedTraining,
        });
      }

      setSubmissions(response.data || []);
      setSubmissionStats(response.stats || {});
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error(error.message || "Failed to load submissions");
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Fetch submissions when tab changes to submissions, filters change, or training changes
  useEffect(() => {
    if (activeTab === "submissions" && selectedTraining) {
      fetchSubmissions();
    }
  }, [
    activeTab,
    submissionFilterStatus,
    submissionSearchTerm,
    submissionSortBy,
    submissionSortOrder,
    selectedTraining,
  ]);

  // Handle output creation
  const handleCreateOutput = async (outputData, attachments) => {
    try {
      const response = await createTrainingOutput(
        outputData.trainingId,
        outputData,
        attachments
      );
      setOutputs((prev) => [response.data, ...prev]);
      toast.success("🎉 Deliverable created successfully!");
      return response;
    } catch (error) {
      console.error("Error creating output:", error);
      toast.error(error.message || "Failed to create deliverable");
      throw error;
    }
  };

  // Handle output deletion
  const handleDeleteOutput = async (outputId) => {
    try {
      await deleteTrainingOutput(outputId);
      setOutputs((prev) => prev.filter((output) => output._id !== outputId));
      toast.success("Deliverable deleted successfully");
    } catch (error) {
      console.error("Error deleting output:", error);
      toast.error(error.message || "Failed to delete deliverable");
    }
  };

  const handleAddComment = async (submissionId, comment) => {
    const result = await addSubmissionComment(submissionId, comment);

    if (result.success) {
      // Update UI with the new comment
      const newComment = result.data;
      setComments((prev) => [...prev, newComment]);
      toast.success(result.message);
    } else {
      toast.error(result.message);
      if (result.error) {
        console.error("Comment error details:", result.error);
      }
    }
  };

  // Handle submission evaluation
  const handleEvaluate = async (submissionId, evaluationData) => {
    console.log("evaluation data", evaluationData);
    try {
      const response = await evaluateParticipantOutput(
        submissionId, // This will become the route param
        {
          feedback: evaluationData.feedback,
          approved: evaluationData.approved,
        }
      );

      // Update outputs with new evaluation
      setOutputs((prev) =>
        prev.map((output) => {
          if (!output.participantSubmissions) return output;

          return {
            ...output,
            participantSubmissions: output.participantSubmissions.map((sub) =>
              sub._id === submissionId
                ? {
                    ...sub,
                    approved: evaluationData.approved,
                    feedback: evaluationData.feedback,
                    evaluatedAt: new Date().toISOString(),
                  }
                : sub
            ),
          };
        })
      );

      // Update submissions list if on submissions tab
      if (activeTab === "submissions") {
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub._id === submissionId
              ? {
                  ...sub,
                  approved: evaluationData.approved,
                  feedback: evaluationData.feedback,
                  evaluatedAt: new Date().toISOString(),
                  status: evaluationData.approved ? "approved" : "submitted",
                }
              : sub
          )
        );
      }

      toast.success(
        "✅ " + (response.message || "Evaluation submitted successfully")
      );
    } catch (error) {
      console.error("Error evaluating submission:", error);
      toast.error(error.message || "Failed to submit evaluation");
      throw error;
    }
  };

  const handleViewSubmission = (submission) => {
    if (submission.attachments && submission.attachments.length > 0) {
      window.open(submission.attachments[0].url, "_blank");
    }
  };

  // Enhanced statistics calculation
  const getEnhancedStats = () => {
    if (activeTab === "submissions") {
      return submissionStats;
    }
    return stats;
  };

  // Filter and sort outputs
  const filteredOutputs = (outputs || [])
    .filter((output) => {
      if (!output || !output._id) return false; // Skip invalid outputs

      const matchesSearch =
        output.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        output.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "overdue" && output.isOverdue) ||
        (filterStatus === "pending" &&
          output.submissionStats?.totalPending > 0) ||
        (filterStatus === "completed" &&
          output.submissionStats?.totalExpected > 0 &&
          output.submissionStats?.totalApproved ===
            output.submissionStats?.totalExpected);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Add null checks in sort comparator
      if (!a || !b) return 0;

      if (sortBy === "title") {
        return sortOrder === "asc"
          ? (a.title || "").localeCompare(b.title || "")
          : (b.title || "").localeCompare(a.title || "");
      } else if (sortBy === "createdAt") {
        return sortOrder === "asc"
          ? new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
          : new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else {
        return sortOrder === "asc"
          ? new Date(a.dueDate || 0) - new Date(b.dueDate || 0)
          : new Date(b.dueDate || 0) - new Date(a.dueDate || 0);
      }
    });

  if (loading) {
    return (
      <div className="flex flex-col w-full items-center justify-center h-96 gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-tacir-lightgray rounded-full animate-spin"></div>
          <div className="w-20 h-20 border-4 border-tacir-pink border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-tacir-darkblue mb-2">
            Loading your deliverables...
          </p>
          <p className="text-tacir-darkgray">
            Please wait while we load the data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6">
      {/* Section En-tête */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md p-4 sm:p-6 mb-4 sm:mb-6 border border-tacir-lightgray/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-tacir-lightblue rounded-lg sm:rounded-xl shadow-sm sm:shadow-md">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-tacir-darkblue break-words">
                Gestion des Livrables
              </h1>
              <p className="text-tacir-darkgray text-sm sm:text-base break-words">
                Créez, gérez et suivez les livrables de formation pour vos
                participants
              </p>
            </div>
          </div>

          <div className="w-full lg:w-auto">
            <CreateOutputDialog
              trainings={trainings}
              participants={participants}
              onOutputCreated={handleCreateOutput}
            />
          </div>
        </div>
      </div>

      {/* Filtre de Formation */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md p-4 sm:p-6 mb-4 sm:mb-6 border border-tacir-lightgray/30">
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
          {/* Sélecteur de Programme de Formation */}
          <div className="lg:col-span-3">
            {trainings.length > 0 && (
              <Select
                value={selectedTraining}
                onValueChange={setSelectedTraining}
              >
                <SelectTrigger className="border border-tacir-lightgray hover:border-tacir-blue focus:border-tacir-pink rounded-lg w-full !h-11 sm:!h-12 bg-white">
                  <SelectValue placeholder="Sélectionnez une formation" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border border-tacir-lightgray bg-white">
                  {trainings.map((training) => {
                    const config = typeConfig[training.type] || {};
                    return (
                      <SelectItem
                        key={training._id}
                        value={training._id}
                        className="rounded-md my-1"
                      >
                        <div className="flex items-center gap-2 py-1">
                          {config.icon && (
                            <config.icon
                              className={`${config.textColor} w-4 h-4 flex-shrink-0`}
                            />
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-tacir-darkblue truncate">
                              {training.title}
                            </span>
                            {config.title && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full w-fit mt-1 ${config.lightBg} ${config.textColor}`}
                              >
                                {config.title}
                              </span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Filtres & Recherche */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-12 gap-3">
              {/* Barre de Recherche */}
              <div className="lg:col-span-5 xs:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-tacir-darkgray" />
                  <Input
                    type="text"
                    placeholder="Rechercher des livrables..."
                    className="pl-9 sm:pl-10 border border-tacir-lightgray hover:border-tacir-blue focus:border-tacir-pink rounded-lg !h-11 sm:!h-12 text-sm sm:text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Filtre par Statut */}
              <div className="lg:col-span-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="border border-tacir-lightgray hover:border-tacir-blue focus:border-tacir-pink rounded-lg !h-11 sm:!h-12 text-sm sm:text-base">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border border-tacir-lightgray bg-white">
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="overdue">En retard</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="completed">Terminés</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Trier par */}
              <div className="lg:col-span-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="border border-tacir-lightgray hover:border-tacir-blue focus:border-tacir-pink rounded-lg !h-11 sm:!h-12 text-sm sm:text-base">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border border-tacir-lightgray bg-white">
                    <SelectItem value="dueDate">Date d'échéance</SelectItem>
                    <SelectItem value="title">Titre</SelectItem>
                    <SelectItem value="createdAt">Date de création</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ordre + Affichage */}
              <div className="lg:col-span-3 flex gap-2">
                <Button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  variant="outline"
                  className="flex-1 h-11 sm:h-12 border border-tacir-lightgray hover:border-tacir-blue hover:bg-tacir-blue/10 rounded-lg transition-colors text-xs sm:text-sm"
                >
                  {sortOrder === "asc" ? "Croissant" : "Décroissant"}
                </Button>
                <Button
                  onClick={() =>
                    setViewMode(viewMode === "list" ? "grid" : "list")
                  }
                  variant="outline"
                  className="h-11 sm:h-12 px-3 sm:px-4 border border-tacir-lightgray hover:border-tacir-blue hover:bg-tacir-blue/10 rounded-lg transition-colors"
                >
                  {viewMode === "list" ? (
                    <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <List className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aperçu des Statistiques */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md p-4 sm:p-6 mb-4 sm:mb-6 border border-tacir-lightgray/30">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-tacir-darkblue flex items-center gap-2">
            <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-blue" />
            Tableau de Bord Analytique
          </h2>
          <button
            onClick={() => setStatsExpanded(!statsExpanded)}
            className="p-2 hover:bg-tacir-lightgray/20 rounded-lg transition-colors"
          >
            {statsExpanded ? (
              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-darkgray" />
            ) : (
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-darkgray" />
            )}
          </button>
        </div>

        {statsExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <div className="bg-tacir-lightblue/10 p-3 sm:p-4 rounded-lg border border-tacir-lightblue/30">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-tacir-darkgray truncate">
                    Total Livrables
                  </p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-tacir-blue">
                    {stats.totalOutputs || 0}
                  </p>
                </div>
                <div className="p-1.5 sm:p-2 bg-tacir-blue/20 rounded-lg flex-shrink-0 ml-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-blue" />
                </div>
              </div>
            </div>

            <div className="bg-tacir-pink/10 p-3 sm:p-4 rounded-lg border border-tacir-pink/30">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-tacir-darkgray truncate">
                    En retard
                  </p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-tacir-pink">
                    {stats.overdue || 0}
                  </p>
                </div>
                <div className="p-1.5 sm:p-2 bg-tacir-pink/20 rounded-lg flex-shrink-0 ml-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-pink" />
                </div>
              </div>
            </div>

            <div className="bg-tacir-orange/10 p-3 sm:p-4 rounded-lg border border-tacir-orange/30">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-tacir-darkgray truncate">
                    En attente
                  </p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-tacir-orange">
                    {stats.pendingReview || 0}
                  </p>
                </div>
                <div className="p-1.5 sm:p-2 bg-tacir-orange/20 rounded-lg flex-shrink-0 ml-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-orange" />
                </div>
              </div>
            </div>

            <div className="bg-tacir-green/10 p-3 sm:p-4 rounded-lg border border-tacir-green/30">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-tacir-darkgray truncate">
                    Terminés
                  </p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-tacir-green">
                    {stats.completed || 0}
                  </p>
                </div>
                <div className="p-1.5 sm:p-2 bg-tacir-green/20 rounded-lg flex-shrink-0 ml-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-green" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Affichage des Livrables */}
      {filteredOutputs.length === 0 ? (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md p-6 sm:p-8 md:p-12 text-center border border-tacir-lightgray/30">
          <div className="max-w-md mx-auto">
            <div className="p-4 sm:p-6 bg-tacir-lightgray/20 rounded-full w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
              <FileText className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-tacir-darkgray" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-tacir-darkblue mb-3 sm:mb-4">
              {searchTerm || filterStatus !== "all"
                ? "Aucun livrable ne correspond à vos critères"
                : "Aucun livrable trouvé pour cette formation"}
            </h3>
            <p className="text-tacir-darkgray text-sm sm:text-base mb-4 sm:mb-6">
              {searchTerm
                ? "Essayez d'ajuster votre recherche ou vos filtres"
                : "Créez votre premier livrable pour commencer"}
            </p>
            <div className="flex justify-center">
              <CreateOutputDialog
                trainings={trainings}
                onOutputCreated={handleCreateOutput}
                loading={loading}
              />
            </div>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredOutputs.map((output) => (
            <div
              key={output._id}
              className="bg-white rounded-lg shadow-sm sm:shadow-md border border-tacir-lightgray/30 hover:shadow-lg transition-all min-w-0"
            >
              <OutputCard
                output={output}
                userRole="mentor"
                onEvaluate={(submission) => {
                  setSelectedSubmission(submission);
                  setIsEvaluating(true);
                }}
                onViewSubmission={handleViewSubmission}
                onDelete={() => handleDeleteOutput(output._id)}
                compact
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredOutputs.map((output) => (
            <div
              key={output._id}
              className="bg-white rounded-lg shadow-sm sm:shadow-md border border-tacir-lightgray/30 hover:shadow-lg transition-all"
            >
              <OutputCard
                output={output}
                userRole="mentor"
                onEvaluate={(submission) => {
                  setSelectedSubmission(submission);
                  setIsEvaluating(true);
                }}
                onAddComment={handleAddComment}
                onViewSubmission={handleViewSubmission}
                onDelete={() => handleDeleteOutput(output._id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Dialogue d'Évaluation */}
      <EvaluationDialog
        isOpen={isEvaluating}
        onClose={() => {
          setIsEvaluating(false);
          setSelectedSubmission(null);
        }}
        submission={selectedSubmission}
        onEvaluate={handleEvaluate}
      />

      {/* Dialogue de Visualisation de Soumission */}
      {isViewing && selectedSubmission && (
        <Dialog open={isViewing} onOpenChange={setIsViewing}>
          <DialogContent className="max-w-[95vw] sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-2xl bg-white border border-tacir-lightgray/30 p-0">
            <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b border-tacir-lightgray/30">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <div className="p-2 bg-tacir-blue/20 rounded-lg">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-blue" />
                </div>
                <span className="text-tacir-darkblue">
                  Détails de la Soumission
                </span>
              </DialogTitle>
              <DialogDescription className="text-tacir-darkgray text-sm sm:text-base">
                {selectedSubmission.participant?.user?.name ||
                  selectedSubmission.participant?.name}
                {" - Soumission"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 p-4 sm:p-6">
              <div className="bg-tacir-lightgray/20 p-3 sm:p-4 rounded-lg border border-tacir-lightgray/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <p className="text-xs sm:text-sm text-tacir-darkgray mb-1">
                        Participant
                      </p>
                      <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-tacir-lightgray/30">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-tacir-blue rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                          {(
                            selectedSubmission.participant?.user?.name ||
                            selectedSubmission.participant?.name ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-tacir-darkblue text-sm sm:text-base truncate">
                            {selectedSubmission.participant?.user?.name ||
                              selectedSubmission.participant?.name}
                          </p>
                          <p className="text-xs text-tacir-darkgray truncate">
                            {selectedSubmission.participant?.user?.email ||
                              selectedSubmission.participant?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs sm:text-sm text-tacir-darkgray mb-1">
                        Soumis le
                      </p>
                      <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-tacir-lightgray/30">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-tacir-blue" />
                        <span className="text-xs sm:text-sm text-tacir-darkblue">
                          {new Date(
                            selectedSubmission.submissionDate
                          ).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <p className="text-xs sm:text-sm text-tacir-darkgray mb-1">
                        Statut
                      </p>
                      <div className="flex items-center gap-2">
                        {selectedSubmission.approved ? (
                          <Badge className="bg-tacir-green/20 text-tacir-green border border-tacir-green/30 text-xs">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Approuvé
                          </Badge>
                        ) : selectedSubmission.submitted ? (
                          <Badge className="bg-tacir-blue/20 text-tacir-blue border border-tacir-blue/30 text-xs">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Soumis
                          </Badge>
                        ) : (
                          <Badge className="bg-tacir-darkgray/20 text-tacir-darkgray border border-tacir-darkgray/30 text-xs">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Non soumis
                          </Badge>
                        )}
                      </div>
                    </div>

                    {selectedSubmission.evaluatedAt && (
                      <div>
                        <p className="text-xs sm:text-sm text-tacir-darkgray mb-1">
                          Évalué le
                        </p>
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-tacir-lightgray/30">
                          <Award className="w-3 h-3 sm:w-4 sm:h-4 text-tacir-green" />
                          <span className="text-xs sm:text-sm text-tacir-darkblue">
                            {new Date(
                              selectedSubmission.evaluatedAt
                            ).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedSubmission.fileUrl && (
                <div className="bg-white p-3 sm:p-4 rounded-lg border border-tacir-lightgray/30">
                  <h4 className="font-medium text-tacir-darkblue mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-orange" />
                    Fichier Soumis
                  </h4>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-tacir-lightgray/20 p-2 sm:p-3 rounded-lg border border-tacir-lightgray/30 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 bg-tacir-blue/20 rounded-md flex-shrink-0">
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-tacir-blue" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-tacir-darkblue text-sm sm:text-base truncate">
                          {selectedSubmission.fileName}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        window.open(selectedSubmission.fileUrl, "_blank")
                      }
                      className="bg-tacir-blue hover:bg-tacir-blue/90 text-white rounded-lg text-xs sm:text-sm h-8 sm:h-9 sm:flex-shrink-0"
                      size="sm"
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              )}

              {selectedSubmission.feedback && (
                <div className="bg-white p-3 sm:p-4 rounded-lg border border-tacir-lightgray/30">
                  <h4 className="font-medium text-tacir-darkblue mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-pink" />
                    Feedback
                  </h4>
                  <div className="bg-tacir-lightgray/20 p-2 sm:p-3 rounded-lg border border-tacir-lightgray/30">
                    <p className="text-tacir-darkblue whitespace-pre-wrap text-sm sm:text-base">
                      {selectedSubmission.feedback}
                    </p>
                    {selectedSubmission.evaluatedBy && (
                      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-tacir-lightgray/30">
                        <p className="text-xs text-tacir-darkgray flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Évalué par : {selectedSubmission.evaluatedBy.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MentorOutputManagement;
