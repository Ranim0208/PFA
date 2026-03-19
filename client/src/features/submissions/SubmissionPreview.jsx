"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Download,
  FileText,
  MessageSquare,
  Star,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  Plus,
  Edit3,
  X,
  Eye,
  RefreshCw,
  Copy,
  File,
  Image,
  FileArchive,
} from "lucide-react";
import { EVALUATION_OPTIONS, getEvaluationConfig } from "./evaluationConfig";
import { apiBaseUrl } from "@/utils/constants";
import {
  leaveFeedbackOnSubmission,
  changeSubmissionStatus,
  addOrUpdatePreselectionEvaluation,
} from "@/services/forms/submissionService";
import { formatEvaluationText } from "./evaluationConfig";

const statusVariants = {
  submitted: "bg-tacir-yellow/20 text-tacir-yellow border-tacir-yellow/30",
  under_review: "bg-tacir-blue/20 text-tacir-blue border-tacir-blue/30",
  accepted: "bg-tacir-green/20 text-tacir-green border-tacir-green/30",
  acceptedAfterCreathon:
    "bg-tacir-lightblue/20 text-tacir-lightblue border-tacir-lightblue/30",
  rejected: "bg-tacir-pink/20 text-tacir-pink border-tacir-pink/30",
};

const statusIcons = {
  submitted: <Clock className="h-4 w-4" />,
  under_review: <Filter className="h-4 w-4" />,
  accepted: <CheckCircle className="h-4 w-4" />,
  acceptedAfterCreathon: <Star className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
};

// File type detection and icon mapping
const getFileIcon = (mimetype, fileName) => {
  if (mimetype?.includes("pdf")) return "📄";
  if (mimetype?.includes("image")) return "🖼️";
  if (
    mimetype?.includes("word") ||
    fileName?.endsWith(".doc") ||
    fileName?.endsWith(".docx")
  )
    return "📝";
  if (
    mimetype?.includes("excel") ||
    fileName?.endsWith(".xls") ||
    fileName?.endsWith(".xlsx")
  )
    return "📊";
  if (
    mimetype?.includes("zip") ||
    fileName?.endsWith(".rar") ||
    fileName?.endsWith(".7z")
  )
    return "📦";
  if (mimetype?.includes("text") || fileName?.endsWith(".txt")) return "📃";
  return "📎";
};

const formatFileSize = (bytes) => {
  if (!bytes) return "Taille inconnue";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export default function SubmissionPreview({
  submission,
  onClose,
  currentUserId,
}) {
  const queryClient = useQueryClient();
  const [newFeedback, setNewFeedback] = useState("");
  const [status, setStatus] = useState(submission?.status || "submitted");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("answers");

  useEffect(() => {
    if (submission) {
      setEvaluations(submission.preselectionEvaluations || []);
      setFeedbacks(submission.feedbacks || []);
      setStatus(submission.status || "submitted");
    }
  }, [submission]);

  // Extract files from both answers and files arrays
  const extractFilesFromSubmission = () => {
    if (!submission) return [];

    const allFiles = [];

    // 1. Extract files from answers array (detailed file objects)
    if (submission.answers) {
      submission.answers.forEach((answer) => {
        // Check if this answer contains a file object
        if (
          answer.value &&
          typeof answer.value === "object" &&
          answer.value.url
        ) {
          allFiles.push({
            url: answer.value.url,
            fieldLabel: answer.field?.label?.fr || "Fichier",
            fieldLabelAr: answer.field?.label?.ar || "ملف",
            fileName:
              answer.value.originalName || answer.value.filename || "document",
            mimetype: answer.value.mimetype || "application/octet-stream",
            size: answer.value.size || 0,
            uploadDate: answer.value.uploadedAt || null,
            type: "uploaded",
            fieldId: answer.field?._id,
            answerId: answer._id,
            source: "answers",
          });
        }
      });
    }

    // 2. Extract files from files array (URLs only)
    if (submission.files && Array.isArray(submission.files)) {
      submission.files.forEach((fileGroup) => {
        if (fileGroup.urls && Array.isArray(fileGroup.urls)) {
          fileGroup.urls.forEach((url, index) => {
            allFiles.push({
              url: url,
              fieldLabel: `Fichier ${index + 1}`,
              fieldLabelAr: `ملف ${index + 1}`,
              fileName: url.split("/").pop() || "document",
              mimetype: "unknown",
              size: 0,
              uploadDate: null,
              type: "direct_url",
              fieldId: fileGroup.field,
              source: "files",
              groupIndex: index,
            });
          });
        }
      });
    }

    return allFiles;
  };

  // Check if submission has files
  const hasFiles = extractFilesFromSubmission().length > 0;

  // Get all files from the submission
  const getAllFiles = () => {
    return extractFilesFromSubmission();
  };

  const handleEvaluationChange = async (coordinatorId, evaluationText) => {
    try {
      const formattedText = formatEvaluationText(evaluationText);

      setEvaluations((prevEvals) => {
        const existingIndex = prevEvals.findIndex(
          (e) =>
            e.coordinatorId === coordinatorId ||
            e.coordinatorId?._id === coordinatorId
        );

        if (existingIndex !== -1) {
          const updated = [...prevEvals];
          updated[existingIndex] = {
            ...updated[existingIndex],
            evaluationText: formattedText,
            date: new Date().toISOString(),
          };
          return updated;
        }

        return [
          ...prevEvals,
          {
            coordinatorId,
            evaluationText: formattedText,
            date: new Date().toISOString(),
          },
        ];
      });

      const updatedEvaluations = await addOrUpdatePreselectionEvaluation(
        submission._id,
        formattedText
      );

      setEvaluations(updatedEvaluations);
      toast.success("Évaluation mise à jour !");
      await queryClient.invalidateQueries(["submissions"]);
    } catch (err) {
      console.error("Evaluation error:", err);
      toast.error(
        err.message || "Erreur lors de la mise à jour de l'évaluation"
      );
    }
  };

  // Normalize file URL: if backend returns relative `/uploads/...`, prefix with API origin
  const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, "");
  const normalizeUrl = (url) => {
    if (!url) return url;
    try {
      if (/^https?:\/\//i.test(url)) return url;
      // relative path starting with /uploads
      if (url.startsWith("/uploads")) return `${apiOrigin}${url}`;
      // also handle paths that may omit leading slash
      if (url.startsWith("uploads")) return `${apiOrigin}/${url}`;
      return url;
    } catch (e) {
      return url;
    }
  };

  const handleAddFeedback = async () => {
    if (!newFeedback.trim()) return;

    setIsSubmittingFeedback(true);
    try {
      const tempFeedback = {
        content: newFeedback,
        date: new Date().toISOString(),
        _id: `temp-${Date.now()}`,
      };

      setFeedbacks((prev) => [...prev, tempFeedback]);
      setNewFeedback("");

      const updatedFeedbacks = await leaveFeedbackOnSubmission(
        submission._id,
        newFeedback
      );

      setFeedbacks(updatedFeedbacks);
      toast.success("Feedback ajouté !");
      await queryClient.invalidateQueries(["submissions"]);
    } catch (err) {
      console.error(err);
      setFeedbacks(submission.feedbacks || []);
      toast.error("Erreur lors de l'ajout du feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const filteredAnswers = submission?.answers?.filter(
    (ans) =>
      ans.field?.label?.fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(ans.value).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!submission) return null;

  return (
    <Dialog open={!!submission} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-full h-full sm:max-w-4xl lg:max-w-4xl m-0 p-0 overflow-hidden rounded-none sm:rounded-lg">
        {/* Header - Fully Responsive */}
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b bg-tacir-lightgray/30 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-tacir-darkblue flex-shrink-0" />
                <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-tacir-darkblue truncate">
                  Détails de la Candidature
                </DialogTitle>
              </div>
              <DialogDescription className="text-tacir-darkgray text-sm sm:text-base">
                Consultez et gérez tous les détails de cette soumission
              </DialogDescription>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <Badge
                className={`px-2 sm:px-3 py-1 rounded-full flex items-center gap-1 text-xs sm:text-sm ${statusVariants[status]} flex-shrink-0`}
              >
                {statusIcons[status]}
                <span className="capitalize truncate max-w-[80px] sm:max-w-none">
                  {status}
                </span>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 sm:hidden flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content Area - Fully Responsive */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col px-3 sm:px-4 pt-3 sm:pt-4 min-h-0"
          >
            {/* Tabs Navigation - Responsive */}
            <TabsList className="grid w-full grid-cols-4 gap-1 mb-3 sm:mb-4 p-1 h-auto min-h-[40px] bg-tacir-lightgray/30">
              <TabsTrigger
                value="answers"
                className="flex flex-col items-center gap-1 py-2 text-xs h-auto min-h-[36px] data-[state=active]:bg-white data-[state=active]:text-tacir-blue"
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs">Réponses</span>
              </TabsTrigger>
              <TabsTrigger
                value="files"
                className="flex flex-col items-center gap-1 py-2 text-xs h-auto min-h-[36px] data-[state=active]:bg-white data-[state=active]:text-tacir-blue relative"
                disabled={!hasFiles}
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs">Fichiers</span>
                {hasFiles && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-tacir-blue text-white rounded-full text-[10px] flex items-center justify-center">
                    {getAllFiles().length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="feedback"
                className="flex flex-col items-center gap-1 py-2 text-xs h-auto min-h-[36px] data-[state=active]:bg-white data-[state=active]:text-tacir-blue"
              >
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs">Feedback</span>
              </TabsTrigger>
              <TabsTrigger
                value="evaluations"
                className="flex flex-col items-center gap-1 py-2 text-xs h-auto min-h-[36px] data-[state=active]:bg-white data-[state=active]:text-tacir-blue"
              >
                <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs">Évals</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content - Fully Scrollable */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {/* Answers Tab - Fully Scrollable */}
              <TabsContent
                value="answers"
                className="h-full mt-0 flex-1 flex flex-col min-h-0"
              >
                <Card className="h-full border-0 shadow-none flex flex-col min-h-0">
                  <CardHeader className="pb-3 px-0 sticky top-0 bg-white z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <CardTitle className="text-base sm:text-lg lg:text-xl">
                        Réponses du formulaire
                      </CardTitle>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tacir-darkgray h-3 w-3 sm:h-4 sm:w-4" />
                        <Input
                          placeholder="Rechercher..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 sm:pl-10 text-sm h-9"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-auto px-0 min-h-0">
                    <ScrollArea className="h-full w-full">
                      <div className="space-y-3 pr-4 pb-4">
                        {filteredAnswers?.length === 0 ? (
                          <div className="text-center py-8 text-tacir-darkgray">
                            <FileText className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm sm:text-base">
                              {searchTerm
                                ? "Aucune réponse trouvée."
                                : "Aucune réponse disponible."}
                            </p>
                            {searchTerm && (
                              <Button
                                variant="outline"
                                onClick={() => setSearchTerm("")}
                                className="mt-2"
                                size="sm"
                              >
                                Effacer la recherche
                              </Button>
                            )}
                          </div>
                        ) : (
                          filteredAnswers?.map((ans, i) => {
                            const isFileAnswer =
                              typeof ans.value === "object" &&
                              ans.value !== null &&
                              ans.value.url;
                            const fieldLabel =
                              ans.field?.label?.fr?.toLowerCase() || "";
                            const isFileField =
                              fieldLabel.includes("fichier") ||
                              fieldLabel.includes("file") ||
                              fieldLabel.includes("document");

                            return (
                              <div
                                key={
                                  ans._id || `${ans.field?._id}-${ans.value}`
                                }
                                className="border rounded-lg p-3 sm:p-4 bg-white hover:shadow-sm transition-shadow"
                              >
                                <Label className="text-sm font-semibold text-tacir-darkblue flex items-start gap-2 mb-2">
                                  <span className="bg-tacir-lightblue/20 p-1 rounded text-xs flex-shrink-0 mt-0.5">
                                    {i + 1}
                                  </span>
                                  <span className="break-words flex-1">
                                    {ans.field?.label?.fr}
                                    {isFileField && isFileAnswer && (
                                      <Badge
                                        variant="outline"
                                        className="ml-2 bg-tacir-green/20 text-tacir-green text-xs"
                                      >
                                        Fichier joint
                                      </Badge>
                                    )}
                                  </span>
                                </Label>
                                <div className="text-sm text-tacir-darkgray p-2 bg-tacir-lightgray/30 rounded break-words whitespace-pre-wrap">
                                  {isFileAnswer ? (
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-tacir-blue flex-shrink-0" />
                                      <span className="truncate flex-1">
                                        {ans.value.originalName ||
                                          ans.value.filename ||
                                          "Fichier"}
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          window.open(
                                            normalizeUrl(ans.value.url),
                                            "_blank"
                                          )
                                        }
                                        className="gap-1 flex-shrink-0"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        <span className="text-xs">Ouvrir</span>
                                      </Button>
                                    </div>
                                  ) : (
                                    String(ans.value) || (
                                      <span className="text-tacir-darkgray/50 italic">
                                        Non renseigné
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Files Tab - Fully Scrollable */}
              <TabsContent
                value="files"
                className="h-full mt-0 flex-1 flex flex-col min-h-0"
              >
                <Card className="h-full border-0 shadow-none flex flex-col min-h-0">
                  <CardHeader className="px-0 sticky top-0 bg-white z-10">
                    <CardTitle className="text-base sm:text-lg lg:text-xl flex items-center gap-2">
                      <FileText className="h-5 w-5 text-tacir-blue" />
                      Fichiers joints {hasFiles && `(${getAllFiles().length})`}
                    </CardTitle>
                    {hasFiles && (
                      <p className="text-xs text-tacir-darkgray mt-1">
                        Tous les fichiers téléchargés par le candidat
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 overflow-auto px-0 min-h-0">
                    <ScrollArea className="h-full w-full">
                      <div className="space-y-3 pr-4 pb-4">
                        {!hasFiles ? (
                          <div className="text-center py-8 text-tacir-darkgray">
                            <FileText className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm sm:text-base font-medium">
                              Aucun fichier joint à cette candidature.
                            </p>
                            <p className="text-xs text-tacir-darkgray/70 mt-2">
                              Les fichiers sont automatiquement détectés depuis
                              les champs de type fichier du formulaire.
                            </p>
                          </div>
                        ) : (
                          getAllFiles().map((file, index) => (
                            <div
                              key={`${file.fieldId}-${
                                file.answerId || file.source
                              }-${index}`}
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition-all gap-3 group"
                            >
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                {/* File Icon */}
                                <div className="p-3 bg-tacir-lightblue/20 rounded-lg flex-shrink-0 group-hover:bg-tacir-lightblue/30 transition-colors">
                                  <span className="text-2xl">
                                    {getFileIcon(file.mimetype, file.fileName)}
                                  </span>
                                </div>

                                {/* File Details */}
                                <div className="min-w-0 flex-1">
                                  {/* Field Labels (Bilingual) */}
                                  <div className="flex items-center gap-2 mb-2">
                                    <p className="font-semibold text-tacir-darkblue text-sm">
                                      {file.fieldLabel}
                                    </p>
                                    {file.fieldLabelAr && (
                                      <>
                                        <span className="text-tacir-darkgray/50">
                                          •
                                        </span>
                                        <p className="font-semibold text-tacir-darkblue text-sm arabic-text">
                                          {file.fieldLabelAr}
                                        </p>
                                      </>
                                    )}
                                    {/* Source badge */}
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        file.source === "answers"
                                          ? "bg-tacir-green/20 text-tacir-green border-tacir-green/30"
                                          : "bg-tacir-blue/20 text-tacir-blue border-tacir-blue/30"
                                      }`}
                                    >
                                      {file.source === "answers"
                                        ? "Réponse"
                                        : "Fichier"}
                                    </Badge>
                                  </div>

                                  {/* File Name */}
                                  <p className="text-sm text-tacir-darkgray font-medium truncate mb-1">
                                    {file.fileName}
                                  </p>

                                  {/* File Metadata */}
                                  <div className="flex flex-wrap items-center gap-3 text-xs text-tacir-darkgray/70">
                                    {file.size > 0 && (
                                      <span className="flex items-center gap-1">
                                        <Download className="h-3 w-3" />
                                        {formatFileSize(file.size)}
                                      </span>
                                    )}
                                    {file.uploadDate && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(
                                          file.uploadDate
                                        ).toLocaleDateString("fr-FR", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        })}
                                      </span>
                                    )}
                                    {file.type === "direct_url" && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-tacir-yellow/20 text-tacir-yellow border-tacir-yellow/30"
                                      >
                                        Lien direct
                                      </Badge>
                                    )}
                                    {file.type === "uploaded" && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-tacir-green/20 text-tacir-green border-tacir-green/30"
                                      >
                                        Téléchargé
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    window.open(
                                      normalizeUrl(file.url),
                                      "_blank"
                                    )
                                  }
                                  className="gap-2 flex-1 sm:flex-none hover:bg-tacir-blue hover:text-white transition-colors"
                                  disabled={!file.url}
                                >
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="text-xs sm:text-sm">
                                    Voir
                                  </span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (file.url) {
                                      // Create a temporary anchor to download
                                      const link = document.createElement("a");
                                      link.href = normalizeUrl(file.url);
                                      link.download = file.fileName;
                                      link.target = "_blank";
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      toast.success("Téléchargement démarré !");
                                    }
                                  }}
                                  className="gap-2 flex-1 sm:flex-none hover:bg-tacir-green hover:text-white transition-colors"
                                  disabled={!file.url}
                                >
                                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="text-xs sm:text-sm">
                                    Télécharger
                                  </span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (file.url) {
                                      navigator.clipboard.writeText(
                                        normalizeUrl(file.url)
                                      );
                                      toast.success(
                                        "URL copiée dans le presse-papier !"
                                      );
                                    }
                                  }}
                                  className="gap-2 hover:bg-tacir-lightgray transition-colors p-2"
                                  disabled={!file.url}
                                  title="Copier l'URL"
                                >
                                  <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="sr-only">Copier</span>
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Feedback Tab - Fully Scrollable */}
              <TabsContent
                value="feedback"
                className="h-full mt-0 flex-1 flex flex-col min-h-0"
              >
                <Card className="h-full border-0 shadow-none flex flex-col min-h-0">
                  <CardHeader className="px-0 sticky top-0 bg-white z-10">
                    <CardTitle className="text-base sm:text-lg lg:text-xl">
                      Avis des Coordinateurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-auto space-y-4 px-0 min-h-0">
                    <ScrollArea className="flex-1">
                      <div className="space-y-3 pr-4">
                        {feedbacks.length === 0 ? (
                          <div className="text-center py-8 text-tacir-darkgray">
                            <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm sm:text-base">
                              Aucun feedback pour le moment.
                            </p>
                          </div>
                        ) : (
                          feedbacks.map((fb) => (
                            <div
                              key={fb._id}
                              className="rounded-lg border bg-white p-3 sm:p-4 hover:shadow-sm transition-shadow"
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-tacir-lightblue/20 rounded-full flex-shrink-0">
                                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-tacir-lightblue" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm mb-2 text-tacir-darkgray break-words whitespace-pre-wrap">
                                    {fb.content}
                                  </div>
                                  <div className="text-xs text-tacir-darkgray/70 flex items-center gap-2 flex-wrap">
                                    <span>Coord. : {fb.user || "Inconnu"}</span>
                                    <span>•</span>
                                    <Calendar className="h-3 w-3" />
                                    {fb.date
                                      ? new Date(fb.date).toLocaleDateString(
                                          "fr-FR",
                                          {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          }
                                        )
                                      : "Date inconnue"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>

                    <Separator />

                    <div className="space-y-3 p-4 bg-tacir-lightgray/30 rounded-lg">
                      <Label className="text-tacir-darkblue text-sm sm:text-base font-semibold">
                        Ajouter un feedback
                      </Label>
                      <Textarea
                        value={newFeedback}
                        onChange={(e) => setNewFeedback(e.target.value)}
                        placeholder="Partagez votre retour sur cette candidature..."
                        className="min-h-[100px] text-sm resize-none"
                      />
                      <Button
                        onClick={handleAddFeedback}
                        disabled={isSubmittingFeedback || !newFeedback.trim()}
                        className="gap-2 bg-tacir-blue hover:bg-tacir-darkblue w-full sm:w-auto"
                        size="sm"
                      >
                        {isSubmittingFeedback ? (
                          <>
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            <span className="text-xs sm:text-sm">Ajout...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">
                              Ajouter le feedback
                            </span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Evaluations Tab - Fully Scrollable */}
              <TabsContent
                value="evaluations"
                className="h-full mt-0 flex-1 flex flex-col min-h-0"
              >
                <Card className="h-full border-0 shadow-none flex flex-col min-h-0">
                  <CardHeader className="px-0 sticky top-0 bg-white z-10">
                    <CardTitle className="text-base sm:text-lg lg:text-xl">
                      Évaluations des coordinateurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-auto space-y-4 px-0 min-h-0">
                    <ScrollArea className="flex-1">
                      <div className="space-y-3 pr-4">
                        {evaluations.length === 0 ? (
                          <div className="text-center py-8 text-tacir-darkgray">
                            <Star className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm sm:text-base">
                              Aucune évaluation pour le moment.
                            </p>
                          </div>
                        ) : (
                          evaluations.map((evaluation, idx) => {
                            const config = getEvaluationConfig(
                              evaluation.evaluationText
                            );
                            const isOwner =
                              evaluation.coordinatorId === currentUserId ||
                              evaluation.coordinatorId?._id === currentUserId;

                            return (
                              <div
                                key={idx}
                                className="rounded-lg border bg-white p-3 sm:p-4 hover:shadow-sm transition-shadow"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div
                                      className={`p-2 rounded-full ${config.bgColor} flex-shrink-0`}
                                    >
                                      <span className="text-base sm:text-lg">
                                        {config.icon}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div
                                        className={`font-semibold text-sm sm:text-base ${config.textColor} mb-1 break-words`}
                                      >
                                        {evaluation.evaluationText}
                                      </div>
                                      {evaluation.comment && (
                                        <div className="text-sm text-tacir-darkgray mb-2 break-words whitespace-pre-wrap">
                                          {evaluation.comment}
                                        </div>
                                      )}
                                      <div className="text-xs text-tacir-darkgray/70 flex items-center gap-2 flex-wrap">
                                        <User className="h-3 w-3" />
                                        {evaluation.coordinator ||
                                          "Coordinateur inconnu"}
                                        <span>•</span>
                                        <Calendar className="h-3 w-3" />
                                        {evaluation.date
                                          ? new Date(
                                              evaluation.date
                                            ).toLocaleDateString("fr-FR", {
                                              day: "2-digit",
                                              month: "2-digit",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          : "Date inconnue"}
                                      </div>
                                    </div>
                                  </div>
                                  {isOwner && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="gap-1 flex-shrink-0"
                                        >
                                          <Edit3 className="h-3 w-3" />
                                          <span className="sr-only sm:not-sr-only text-xs">
                                            Modifier
                                          </span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent className="w-72 max-w-[90vw]">
                                        <div className="space-y-2 p-2">
                                          <h4 className="font-medium text-sm text-tacir-darkblue">
                                            Modifier l'évaluation
                                          </h4>
                                          {EVALUATION_OPTIONS.map((option) => (
                                            <DropdownMenuItem
                                              key={option.text}
                                              onClick={() =>
                                                handleEvaluationChange(
                                                  currentUserId,
                                                  option.value
                                                )
                                              }
                                              className="flex items-start gap-3 p-2 cursor-pointer hover:bg-tacir-lightgray/30 rounded-md"
                                            >
                                              <span className="text-lg mt-0.5 flex-shrink-0">
                                                {option.icon}
                                              </span>
                                              <div className="min-w-0">
                                                <p className="font-medium text-sm break-words">
                                                  {option.text}
                                                </p>
                                                <p className="text-xs text-tacir-darkgray mt-1 break-words">
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
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>

                    {!evaluations.some(
                      (e) =>
                        e.coordinatorId === currentUserId ||
                        e.coordinatorId?._id === currentUserId
                    ) && (
                      <div className="border-2 border-dashed border-tacir-lightgray rounded-lg p-4 sm:p-6 text-center bg-tacir-lightgray/20">
                        <Star className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 text-tacir-darkgray/50" />
                        <p className="text-tacir-darkgray mb-3 text-sm sm:text-base">
                          Vous n'avez pas encore évalué cette candidature
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="gap-2 bg-tacir-blue hover:bg-tacir-darkblue w-full sm:w-auto">
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="text-xs sm:text-sm">
                                Ajouter une évaluation
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-72 max-w-[90vw]">
                            <div className="space-y-2 p-2">
                              <h4 className="font-medium text-sm text-tacir-darkblue">
                                Sélectionnez une évaluation
                              </h4>
                              {EVALUATION_OPTIONS.map((option) => (
                                <DropdownMenuItem
                                  key={option.text}
                                  onClick={() =>
                                    handleEvaluationChange(
                                      currentUserId,
                                      option.value
                                    )
                                  }
                                  className="flex items-start gap-3 p-2 cursor-pointer hover:bg-tacir-lightgray/30 rounded-md"
                                >
                                  <span className="text-lg mt-0.5 flex-shrink-0">
                                    {option.icon}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm break-words">
                                      {option.text}
                                    </p>
                                    <p className="text-xs text-tacir-darkgray mt-1 break-words">
                                      {option.description}
                                    </p>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
