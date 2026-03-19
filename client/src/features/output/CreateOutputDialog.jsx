import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Target,
  Upload,
  X,
  CheckCircle,
  ChevronDown,
  Loader2,
  Users,
  Search,
  FileText,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { typeConfig } from "../trainings/components/style.config";
import { getParticipantsForMentor } from "@/services/trainings/trainingTracking";
import { toast } from "react-toastify";

export const CreateOutputDialog = ({
  trainings = [],
  onOutputCreated,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    dueDate: "",
    targetParticipants: "all",
    trainingId: "",
  });
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  // Fetch participants when training is selected
  // Fetch participants when training is selected
  useEffect(() => {
    if (!formData.trainingId) {
      setParticipants([]);
      return;
    }

    const fetchParticipants = async () => {
      try {
        setIsLoadingParticipants(true);
        const response = await getParticipantsForMentor({
          trainingId: formData.trainingId,
          limit: 1000,
        });

        if (response.success) {
          // The API returns grouped data by training type, so we need to flatten it
          const allParticipants = response.data.flatMap((group) =>
            group.participants.map((participant) => ({
              ...participant,
              trainingId: group.trainings[0]?.id || formData.trainingId,
              trainingTitle: group.trainings[0]?.title || "",
              trainingType: group.trainingType,
              user: participant.user || {
                // Ensure user object exists
                firstName: participant.firstName,
                lastName: participant.lastName,
                email: participant.email,
                name:
                  participant.name ||
                  `${participant.firstName || ""} ${
                    participant.lastName || ""
                  }`.trim(),
              },
            }))
          );
          setParticipants(allParticipants);
        } else {
          toast.error(response.message || "Failed to fetch participants");
        }
      } catch (error) {
        console.error("Error fetching participants:", error);
        toast.error(error.message || "Failed to fetch participants");
      } finally {
        setIsLoadingParticipants(false);
      }
    };

    fetchParticipants();
  }, [formData.trainingId]);
  // Reset form when dialog closes
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      instructions: "",
      dueDate: "",
      targetParticipants: "all",
      trainingId: "",
    });
    setSelectedParticipants([]);
    setAttachments([]);
    setSearchTerm("");
    setDragActive(false);
    setParticipants([]);
  };
  // Filter participants based on search term
  const filteredParticipants = participants.filter((participant) => {
    if (!searchTerm) return true;

    const name = participant.user?.name || participant.name || "";
    const email = participant.user?.email || participant.email || "";

    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      if (
        (field === "trainingId" || field === "targetParticipants") &&
        value !== prev[field]
      ) {
        setSelectedParticipants([]);
      }
      return { ...prev, [field]: value };
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  const addFiles = (files) => {
    const validFiles = files.filter((file) => {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];

      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type`);
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum file size is 10MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setAttachments((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleParticipant = (participant) => {
    setSelectedParticipants((prev) =>
      prev.some((p) => p._id === participant._id)
        ? prev.filter((p) => p._id !== participant._id)
        : [...prev, participant]
    );
  };

  const handleSubmit = async () => {
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.dueDate ||
      !formData.trainingId
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (
      formData.targetParticipants === "specific" &&
      selectedParticipants.length === 0
    ) {
      toast.error("Please select at least one participant");
      return;
    }

    setIsSubmitting(true);
    try {
      const outputData = {
        ...formData,
        targetParticipants:
          formData.targetParticipants === "specific"
            ? selectedParticipants.map((p) => p._id)
            : [],
      };

      await onOutputCreated(outputData, attachments);
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating output:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getParticipantName = (participant) => {
    if (participant.user) {
      return (
        participant.user.name ||
        `${participant.user.firstName || ""} ${
          participant.user.lastName || ""
        }`.trim() ||
        participant.name ||
        "Unknown"
      );
    }
    return (
      participant.name ||
      `${participant.firstName || ""} ${participant.lastName || ""}`.trim() ||
      "Unknown"
    );
  };

  const getParticipantEmail = (participant) => {
    return participant.user?.email || participant.email || "No email";
  };
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetForm();
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="bg-tacir-pink hover:bg-pink-400 text-white shadow-md hover:shadow-lg"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Créer un output
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-tacir-lightgray/30">
          <DialogTitle className="text-xl font-semibold text-tacir-darkblue flex items-center gap-2">
            <div className="p-2 bg-tacir-pink/20 rounded-lg">
              <Target className="w-5 h-5 text-tacir-pink" />
            </div>
            Créer un nouveau livrable de formation
          </DialogTitle>
          <DialogDescription className="text-tacir-darkgray">
            Créez un devoir engageant pour vos participants
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Training Selection */}
          <div className="space-y-2">
            <Label className="text-tacir-darkblue font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-tacir-blue" />
              Formation <span className="text-tacir-pink">*</span>
            </Label>

            <Select
              value={formData.trainingId}
              onValueChange={(value) => handleInputChange("trainingId", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="border border-tacir-lightgray hover:border-tacir-blue focus:border-tacir-pink rounded-lg h-12">
                <SelectValue placeholder="Select a training program" />
              </SelectTrigger>

              <SelectContent className="rounded-lg border border-tacir-lightgray">
                {trainings.map((training) => {
                  const config = typeConfig[training.type] || {};
                  return (
                    <SelectItem
                      key={training._id}
                      value={training._id}
                      className="rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-tacir-darkblue">
                          {training.title}
                        </span>
                        {config && (
                          <span
                            className={`ml-auto text-xs px-2 py-0.5 rounded-full ${config.lightBg} ${config.textColor}`}
                          >
                            {config.title}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-tacir-darkblue font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-tacir-pink" />
                Titre <span className="text-tacir-pink">*</span>
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Business Model Canvas Workshop"
                className="border border-tacir-lightgray hover:border-tacir-blue focus:border-tacir-pink rounded-lg h-12"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-tacir-darkblue font-medium">
                Description <span className="text-tacir-pink">*</span>
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Provide a compelling description..."
                rows={3}
                className="border border-tacir-lightgray hover:border-tacir-blue focus:border-tacir-pink rounded-lg"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-tacir-darkblue font-medium">
                Instructions détaillées
              </Label>
              <Textarea
                value={formData.instructions}
                onChange={(e) =>
                  handleInputChange("instructions", e.target.value)
                }
                placeholder="Step-by-step instructions..."
                rows={4}
                className="border border-tacir-lightgray hover:border-tacir-blue focus:border-tacir-pink rounded-lg"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-tacir-darkblue font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-tacir-green" />
                  Date limite <span className="text-tacir-pink">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  min={
                    new Date(Date.now() + 86400000).toISOString().split("T")[0]
                  }
                  className="border border-tacir-lightgray hover:border-tacir-blue focus:border-tacir-pink rounded-lg h-12"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-tacir-darkblue font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-tacir-lightblue" />
                  Participants cibles
                </Label>
                <Select
                  value={formData.targetParticipants}
                  onValueChange={(value) =>
                    handleInputChange("targetParticipants", value)
                  }
                  disabled={!formData.trainingId || isSubmitting}
                >
                  <SelectTrigger className="border border-tacir-lightgray hover:border-tacir-blue focus:border-tacir-pink rounded-lg h-12">
                    <SelectValue placeholder="Select participants" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border border-tacir-lightgray">
                    <SelectItem value="all">Tous les participants</SelectItem>
                    <SelectItem value="specific">
                      Participants spécifiques
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Participant Selection */}
          {formData.targetParticipants === "specific" && (
            <div className="space-y-3 p-4 bg-tacir-lightgray/20 rounded-lg border border-tacir-lightgray/30">
              <div className="flex justify-between items-center">
                <Label className="text-tacir-darkblue font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-tacir-green" />
                  Sélectionner des participants ({
                    selectedParticipants.length
                  }{" "}
                  sélectionnés)
                </Label>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-tacir-darkgray" />
                  <Input
                    type="text"
                    placeholder="Search participants..."
                    className="pl-9 border border-tacir-lightgray hover:border-tacir-blue focus:border-tacir-pink rounded-lg h-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={isSubmitting || isLoadingParticipants}
                  />
                </div>
              </div>

              {isLoadingParticipants ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-6 h-6 animate-spin text-tacir-blue" />
                </div>
              ) : participants.length === 0 ? (
                <div className="bg-white/80 p-6 rounded-lg text-center border-2 border-dashed border-tacir-lightgray">
                  {formData.trainingId ? (
                    <div className="space-y-2">
                      <AlertCircle className="w-8 h-8 mx-auto text-tacir-darkgray" />
                      <p className="text-tacir-darkgray">
                        Aucun participant trouvé pour cette formation
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Target className="w-8 h-8 mx-auto text-tacir-blue" />
                      <p className="text-tacir-darkgray">
                        Veuillez d'abord sélectionner une formation
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="max-h-60 overflow-y-auto border border-tacir-lightgray rounded-lg bg-white/50">
                    <div className="divide-y divide-tacir-lightgray">
                      {filteredParticipants.map((participant) => {
                        const name = getParticipantName(participant);
                        const email = getParticipantEmail(participant);

                        return (
                          <div
                            key={participant._id}
                            onClick={() => toggleParticipant(participant)}
                            className={`p-3 cursor-pointer transition-all hover:bg-tacir-lightgray/30 ${
                              selectedParticipants.some(
                                (p) => p._id === participant._id
                              )
                                ? "bg-tacir-pink/10 border-l-2 border-tacir-pink"
                                : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-tacir-blue rounded-full flex items-center justify-center text-white font-semibold">
                                  {name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-tacir-darkblue">
                                    {name}
                                  </p>
                                  <p className="text-xs text-tacir-darkgray">
                                    {email}
                                  </p>
                                </div>
                              </div>
                              {selectedParticipants.some(
                                (p) => p._id === participant._id
                              ) ? (
                                <CheckCircle className="w-5 h-5 text-tacir-green" />
                              ) : (
                                <div className="w-5 h-5 border border-tacir-darkgray rounded-full"></div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedParticipants.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedParticipants.map((participant) => (
                        <Badge
                          key={participant._id}
                          className="bg-tacir-pink/20 text-tacir-darkblue hover:bg-tacir-pink/30 px-3 py-1 text-sm border border-tacir-lightblue/30"
                        >
                          {getParticipantName(participant)}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleParticipant(participant);
                            }}
                            className="ml-2 hover:text-tacir-pink rounded-full p-0.5 hover:bg-white/50"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {/* File Attachments */}
          <div className="space-y-3">
            <Label className="text-tacir-darkblue font-medium flex items-center gap-2">
              <Upload className="w-4 h-4 text-tacir-orange" />
              Pièces jointes
            </Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 transition-all ${
                dragActive
                  ? "border-tacir-pink bg-tacir-pink/10"
                  : "border-tacir-lightgray hover:border-tacir-blue"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                disabled={isSubmitting}
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="p-3 bg-tacir-orange/20 rounded-full mb-3">
                  <Upload className="w-6 h-6 text-tacir-orange" />
                </div>
                <span className="font-medium text-tacir-darkblue mb-1">
                  Déposez vos fichiers ici ou cliquez pour télécharger
                </span>
                <span className="text-sm text-tacir-darkgray">
                  Formats supportés : PDF, DOC, DOCX, TXT, JPG, PNG (Max : 10 Mo
                  chacun)
                </span>
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                <div className="text-tacir-darkblue font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Fichiers joints ({attachments.length}) ({attachments.length})
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-tacir-lightgray hover:border-tacir-blue"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="p-1 bg-tacir-blue/20 rounded-md">
                          <FileText className="w-4 h-4 text-tacir-blue" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-tacir-darkblue truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-tacir-darkgray">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-tacir-darkgray hover:text-tacir-pink hover:bg-tacir-pink/10 p-1 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-tacir-lightgray/30">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border border-tacir-lightgray text-tacir-darkgray hover:bg-tacir-lightgray/20 rounded-lg px-6"
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            className=" bg-tacir-pink  hover:to-tacir-pink text-white rounded-lg px-6"
            disabled={
              isSubmitting ||
              !formData.title.trim() ||
              !formData.description.trim() ||
              !formData.dueDate ||
              !formData.trainingId ||
              (formData.targetParticipants === "specific" &&
                selectedParticipants.length === 0)
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Créer le livrable
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
