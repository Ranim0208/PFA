import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle,
  Target,
  MessageSquare,
} from "lucide-react";
import { toast } from "react-toastify";

export const SubmissionDialog = ({
  isOpen,
  onClose,
  output,
  onSubmit,
  isUpdating = false,
  loading = false,
}) => {
  const [comment, setComment] = useState(output?.submission?.notes || "");
  const [attachments, setAttachments] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setComment(output?.submission?.notes || "");
    setAttachments([]);
    setDragActive(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
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
        "application/zip",
        "application/x-zip-compressed",
      ];

      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} n'est pas un type de fichier supporté`);
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(
          `${file.name} est trop volumineux. Taille maximale : 10 Mo`
        );
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

  const handleSubmit = async () => {
    if (attachments.length === 0 && !notes.trim()) {
      toast.error("Veuillez ajouter un commentaire ou des fichiers");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        outputId: output._id,
        notes: comment.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast.error(error.message || "Erreur lors de la soumission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getDaysUntilDue = () => {
    if (!output?.dueDate) return 0;
    const today = new Date();
    const due = new Date(output.dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0;

  if (!output) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-tacir-lightgray/30">
          <DialogTitle className="text-xl font-semibold text-tacir-darkblue flex items-center gap-2">
            <div className="p-2 bg-tacir-pink/20 rounded-lg">
              <Target className="w-5 h-5 text-tacir-pink" />
            </div>
            {isUpdating ? "Modifier la soumission" : "Soumettre le livrable"}
          </DialogTitle>
          <DialogDescription className="text-tacir-darkgray">
            {output.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Output Info */}
          <div className="bg-tacir-lightgray/20 p-4 rounded-lg border border-tacir-lightgray/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-tacir-darkgray mb-1">Formation</p>
                <p className="font-medium text-tacir-darkblue">
                  {output.training?.title || "Formation"}
                </p>
              </div>
              <div>
                <p className="text-sm text-tacir-darkgray mb-1">Date limite</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-tacir-blue" />
                  <span className="font-medium text-tacir-darkblue">
                    {new Date(output.dueDate).toLocaleDateString("fr-FR")}
                  </span>
                  {isOverdue ? (
                    <Badge className="bg-tacir-pink text-white">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      En retard
                    </Badge>
                  ) : daysUntilDue <= 3 ? (
                    <Badge className="bg-tacir-orange text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      Urgent
                    </Badge>
                  ) : (
                    <Badge className="bg-tacir-green text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />À temps
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {output.description && (
              <div className="mt-4 pt-4 border-t border-tacir-lightgray/30">
                <p className="text-sm text-tacir-darkgray mb-1">Description</p>
                <p className="text-sm text-tacir-darkblue">
                  {output.description}
                </p>
              </div>
            )}

            {output.instructions && (
              <div className="mt-4 pt-4 border-t border-tacir-lightgray/30">
                <p className="text-sm text-tacir-darkgray mb-1">Instructions</p>
                <div className="bg-white p-3 rounded-lg border border-tacir-lightgray/30">
                  <p className="text-sm text-tacir-darkblue whitespace-pre-wrap">
                    {output.instructions}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <Label className="text-tacir-darkblue font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-tacir-blue" />
              Commentaire{" "}
              {!attachments.length && (
                <span className="text-tacir-pink">*</span>
              )}
            </Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Décrivez votre travail, vos réflexions, ou toute information pertinente..."
              rows={4}
              className="border border-tacir-lightgray hover:border-tacir-blue focus:border-tacir-pink rounded-lg"
              disabled={isSubmitting}
            />
            <p className="text-xs text-tacir-darkgray">
              Expliquez votre approche, les défis rencontrés, ou les résultats
              obtenus.
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <Label className="text-tacir-darkblue font-medium flex items-center gap-2">
              <Upload className="w-4 h-4 text-tacir-orange" />
              Fichiers{" "}
              {!comment.trim() && <span className="text-tacir-pink">*</span>}
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
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
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
                  Déposez vos fichiers ici ou cliquez pour sélectionner
                </span>
                <span className="text-sm text-tacir-darkgray text-center">
                  PDF, DOC, DOCX, TXT, JPG, PNG, ZIP
                  <br />
                  Taille maximale : 10 Mo par fichier
                </span>
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                <div className="text-tacir-darkblue font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Fichiers sélectionnés ({attachments.length})
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
                        className="text-tacir-darkgray hover:text-tacir-pink hover:bg-tacir-pink/10 p-1 rounded-full ml-2"
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Previous Submission Info */}
          {isUpdating && output.submission && (
            <div className="bg-tacir-blue/10 p-4 rounded-lg border border-tacir-blue/30">
              <h4 className="font-medium text-tacir-darkblue mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Soumission précédente
              </h4>
              <div className="text-sm text-tacir-darkgray space-y-1">
                <p>
                  Soumis le :{" "}
                  {new Date(
                    output.submission.submissionDate
                  ).toLocaleDateString("fr-FR")}
                </p>
                {output.submission.feedback && (
                  <div className="mt-2 p-2 bg-white rounded border border-tacir-lightgray/30">
                    <p className="font-medium text-tacir-darkblue text-xs mb-1">
                      Dernier feedback :
                    </p>
                    <p className="text-tacir-darkblue">
                      {output.submission.feedback}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Warning for overdue submissions */}
          {isOverdue && !isUpdating && (
            <div className="bg-tacir-pink/10 p-4 rounded-lg border border-tacir-pink/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-tacir-pink" />
                <span className="font-medium text-tacir-pink">
                  Attention : Soumission en retard
                </span>
              </div>
              <p className="text-sm text-tacir-darkgray">
                La date limite est dépassée de {Math.abs(daysUntilDue)} jour
                {Math.abs(daysUntilDue) !== 1 ? "s" : ""}. Votre soumission sera
                marquée comme tardive.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-tacir-lightgray/30">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border border-tacir-lightgray text-tacir-darkgray hover:bg-tacir-lightgray/20 rounded-lg px-6"
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-tacir-pink hover:bg-tacir-pink/90 text-white rounded-lg px-6"
            disabled={
              isSubmitting || (attachments.length === 0 && !comment.trim())
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isUpdating ? "Mise à jour..." : "Soumission..."}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {isUpdating ? "Mettre à jour" : "Soumettre"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
