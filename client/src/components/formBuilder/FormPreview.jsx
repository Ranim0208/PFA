"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import FormFieldRenderer from "./FormFieldRenderer";
import {
  Eye,
  Calendar,
  MapPin,
  Trophy,
  Save,
  CheckCircle,
  Clock,
  Globe,
  Award,
  FileText,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { createForm, updateForm } from "../../services/forms/formServices";

const FormPreview = ({ fields, metadata, existingFormId, onError }) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!metadata.region?.fr || !metadata.region?.ar) {
      toast.error("Veuillez spécifier la région en français et en arabe");
      return;
    }

    const payload = {
      ...metadata,
      fields,
      ...(existingFormId && { _id: existingFormId }),
    };

    try {
      setLoading(true);
      const response = existingFormId
        ? await updateForm(existingFormId, payload)
        : await createForm(payload);

      if (response) {
        toast.success(
          existingFormId
            ? "Formulaire mis à jour avec succès ! 🎉"
            : "Formulaire créé avec succès ! 🎉"
        );
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Form submission error:", error);

      // Appeler le callback d'erreur si fourni
      if (onError) {
        onError(error.message || "Erreur lors de la mise à jour du formulaire");
      } else {
        // Fallback vers les toasts standards
        if (error.message) {
          const errors = error.message.split(/,\s*/);
          errors.forEach((msg) => toast.error(msg.trim()));
        } else {
          toast.error("Une erreur inattendue s'est produite.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFormStatus = () => {
    if (!metadata.startDate || !metadata.endDate) return "incomplete";

    const now = new Date();
    const startDate = new Date(metadata.startDate);
    const endDate = new Date(metadata.endDate);

    if (now < startDate) return "upcoming";
    if (now > endDate) return "ended";
    return "active";
  };

  const statusConfig = {
    incomplete: {
      label: "Incomplet",
      color: "text-tacir-darkgray bg-tacir-lightgray",
    },
    upcoming: {
      label: "À venir",
      color: "text-tacir-blue bg-tacir-lightblue/30",
    },
    active: { label: "Actif", color: "text-tacir-green bg-tacir-green/20" },
    ended: { label: "Terminé", color: "text-tacir-pink bg-tacir-pink/20" },
  };

  const status = getFormStatus();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-tacir-darkblue hover:bg-tacir-darkblue text-white text-sm py-2 h-9">
          <Eye className="h-3.5 w-3.5" />
          {existingFormId ? "Aperçu & Mise à jour" : "Aperçu & Créer"}
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[95vh] !max-w-2xl p-0 overflow-hidden flex flex-col">
        {/* DialogHeader with visually hidden DialogTitle for accessibility */}
        <DialogHeader className="sr-only">
          <DialogTitle>
            {existingFormId
              ? "Aperçu et mise à jour du formulaire"
              : "Aperçu et création du formulaire"}
          </DialogTitle>
        </DialogHeader>

        {/* Header with tabs */}
        <div className="flex border-b border-tacir-lightgray bg-white">
          <button
            className={`flex-1 py-3 px-4 text-xs font-medium flex items-center justify-center gap-1 ${
              activeTab === "preview"
                ? "text-tacir-blue border-b-2 border-tacir-blue"
                : "text-tacir-darkgray hover:text-tacir-darkblue"
            }`}
            onClick={() => setActiveTab("preview")}
          >
            <Eye className="h-3.5 w-3.5" />
            Aperçu
          </button>
          <button
            className={`flex-1 py-3 px-4 text-xs font-medium flex items-center justify-center gap-1 ${
              activeTab === "details"
                ? "text-tacir-blue border-b-2 border-tacir-blue"
                : "text-tacir-darkgray hover:text-tacir-darkblue"
            }`}
            onClick={() => setActiveTab("details")}
          >
            <FileText className="h-3.5 w-3.5" />
            Détails
          </button>
          <button
            className={`flex-1 py-3 px-4 text-xs font-medium flex items-center justify-center gap-1 ${
              activeTab === "fields"
                ? "text-tacir-blue border-b-2 border-tacir-blue"
                : "text-tacir-darkgray hover:text-tacir-darkblue"
            }`}
            onClick={() => setActiveTab("fields")}
          >
            <Users className="h-3.5 w-3.5" />
            Champs ({fields.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Header with image */}
          {metadata?.imageUrl ? (
            <div className="w-full h-40 overflow-hidden relative">
              <img
                src={metadata.imageUrl}
                alt="En-tête du formulaire"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4">
                <div className="text-white">
                  <h1 className="text-xl font-bold">
                    {metadata?.title?.fr || "Formulaire Sans Titre"}
                  </h1>
                  <p className="text-sm opacity-90">
                    {metadata?.description?.fr || ""}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-28 bg-gradient-to-r from-tacir-lightgray to-tacir-lightblue/30 flex items-center justify-center p-4">
              <div className="flex items-center gap-2 text-tacir-darkblue">
                <ImageIcon className="h-6 w-6 opacity-70" />
                <div>
                  <h1 className="text-xl font-bold">
                    {metadata?.title?.fr || "Formulaire Sans Titre"}
                  </h1>
                  <p className="text-xs opacity-80">
                    {metadata?.description?.fr || "Aucune description fournie"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 space-y-4">
            {/* Status Badge */}
            <div className="flex justify-between items-center">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status].color}`}
              >
                {statusConfig[status].label}
              </span>
              <div className="flex items-center gap-1 text-xs text-tacir-darkgray">
                <Clock className="h-3.5 w-3.5" />
                {metadata?.startDate && formatDate(metadata.startDate)} -{" "}
                {metadata?.endDate && formatDate(metadata.endDate)}
              </div>
            </div>

            {activeTab === "preview" && (
              <div className="space-y-4">
                {/* Title Section */}
                <div className="text-center space-y-2 py-2">
                  <h1 className="text-2xl font-bold text-tacir-darkblue">
                    {metadata?.title?.fr || "Formulaire Sans Titre"}
                  </h1>
                  <h2 className="text-xl text-tacir-darkblue text-right font-arabic">
                    {metadata?.title?.ar || "نموذج بدون عنوان"}
                  </h2>
                </div>

                {/* Description Section */}
                {(metadata?.description?.fr || metadata?.description?.ar) && (
                  <div className="space-y-2 p-4 bg-tacir-lightgray/30 rounded-lg border border-tacir-lightgray">
                    <div className="flex items-center gap-2 text-tacir-blue mb-2">
                      <FileText className="h-4 w-4" />
                      <h3 className="font-semibold text-sm">Description</h3>
                    </div>
                    {metadata?.description?.fr && (
                      <p className="text-tacir-darkgray text-sm leading-relaxed">
                        {metadata.description.fr}
                      </p>
                    )}
                    {metadata?.description?.ar && (
                      <p className="text-tacir-darkgray text-sm text-right leading-relaxed font-arabic">
                        {metadata.description.ar}
                      </p>
                    )}
                  </div>
                )}

                {/* Event Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Dates */}
                  <div className="p-3 bg-white rounded-lg border border-tacir-lightgray space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-tacir-blue" />
                      <h3 className="font-semibold text-sm text-tacir-darkblue">
                        Période de Candidature
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-tacir-lightgray/30 rounded text-xs">
                        <span className="text-tacir-darkgray">Début:</span>
                        <span className="font-medium text-tacir-darkblue">
                          {metadata?.startDate
                            ? formatDate(metadata.startDate)
                            : "Non spécifié"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-tacir-lightgray/30 rounded text-xs">
                        <span className="text-tacir-darkgray">Fin:</span>
                        <span className="font-medium text-tacir-darkblue">
                          {metadata?.endDate
                            ? formatDate(metadata.endDate)
                            : "Non spécifié"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="p-3 bg-white rounded-lg border border-tacir-lightgray space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-tacir-green" />
                      <h3 className="font-semibold text-sm text-tacir-darkblue">
                        Lieu de l'Événement
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2 bg-tacir-lightgray/30 rounded text-xs">
                        <p className="text-tacir-darkblue font-medium">
                          {metadata?.eventLocation?.fr || "Non spécifié"}
                        </p>
                        {metadata?.eventLocation?.ar && (
                          <p className="text-tacir-darkgray text-right mt-1 font-arabic text-xs">
                            {metadata.eventLocation.ar}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Region */}
                <div className="p-3 bg-white rounded-lg border border-tacir-lightgray">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-tacir-blue" />
                    <h3 className="font-semibold text-sm text-tacir-darkblue">
                      Région
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="p-2 bg-tacir-lightgray/30 rounded text-xs">
                      <p className="text-xs text-tacir-darkgray mb-1 uppercase tracking-wide">
                        Français
                      </p>
                      <p className="text-tacir-darkblue font-medium">
                        {metadata?.region?.fr || "Non spécifié"}
                      </p>
                    </div>
                    <div className="p-2 bg-tacir-lightgray/30 rounded text-xs">
                      <p className="text-xs text-tacir-darkgray mb-1 uppercase tracking-wide text-right">
                        العربية
                      </p>
                      <p className="text-tacir-darkblue font-medium text-right font-arabic">
                        {metadata?.region?.ar || "غير محدد"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preview of first 3 fields */}
                {fields.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-tacir-lightgray">
                    <h3 className="font-semibold text-sm text-tacir-darkblue flex items-center gap-1">
                      <Users className="h-4 w-4 text-tacir-blue" />
                      Aperçu des Champs
                    </h3>
                    <div className="space-y-2">
                      {fields.slice(0, 3).map((field, index) => (
                        <div
                          key={index}
                          className="p-3 bg-tacir-lightgray/20 rounded border border-tacir-lightgray"
                        >
                          <FormFieldRenderer field={field} previewMode />
                        </div>
                      ))}
                      {fields.length > 3 && (
                        <div className="text-center text-xs text-tacir-darkgray py-1">
                          + {fields.length - 3} autres champs
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "details" && (
              <div className="space-y-4">
                {/* Event Dates */}
                {metadata?.eventDates?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-tacir-darkblue flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-tacir-blue" />
                      Dates Importantes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {metadata.eventDates.map((event, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white rounded-lg border border-tacir-lightgray"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-tacir-blue bg-tacir-blue/10 px-2 py-1 rounded-full">
                              Date #{index + 1}
                            </span>
                          </div>
                          <p className="font-semibold text-tacir-darkblue text-sm mb-1">
                            {event.date
                              ? formatDate(event.date)
                              : "Date non spécifiée"}
                          </p>
                          {event.description?.fr && (
                            <p className="text-xs text-tacir-darkgray mb-1">
                              {event.description.fr}
                            </p>
                          )}
                          {event.description?.ar && (
                            <p className="text-xs text-tacir-darkgray text-right font-arabic">
                              {event.description.ar}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prizes Section */}
                {metadata?.prizes?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-tacir-darkblue flex items-center gap-1">
                      <Award className="h-4 w-4 text-tacir-yellow" />
                      Prix
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {metadata.prizes.map((prize, index) => (
                        <div
                          key={index}
                          className="p-3 bg-tacir-yellow/10 rounded-lg border border-tacir-yellow/20"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-tacir-yellow bg-tacir-yellow/20 px-2 py-1 rounded-full">
                              Prix #{index + 1}
                            </span>
                            <span className="text-lg font-bold text-tacir-yellow">
                              {prize?.amount || 0} DT
                            </span>
                          </div>
                          {prize?.description?.fr && (
                            <p className="text-tacir-darkblue text-sm mb-1">
                              {prize.description.fr}
                            </p>
                          )}
                          {prize?.description?.ar && (
                            <p className="text-tacir-darkblue text-sm text-right font-arabic">
                              {prize.description.ar}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Metadata Summary */}
                <div className="p-3 bg-white rounded-lg border border-tacir-lightgray">
                  <h3 className="font-semibold text-sm text-tacir-darkblue mb-3 flex items-center gap-1">
                    <FileText className="h-4 w-4 text-tacir-darkgray" />
                    Résumé du Formulaire
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-tacir-darkgray">Statut</p>
                      <p
                        className={`font-medium text-xs inline-block px-2 py-1 rounded-full ${statusConfig[status].color}`}
                      >
                        {statusConfig[status].label}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-tacir-darkgray">
                        Nombre de champs
                      </p>
                      <p className="font-medium text-tacir-darkblue text-sm">
                        {fields.length} champs
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-tacir-darkgray">
                        Date de création
                      </p>
                      <p className="font-medium text-tacir-darkblue text-sm">
                        {new Date().toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-tacir-darkgray">
                        Dernière modification
                      </p>
                      <p className="font-medium text-tacir-darkblue text-sm">
                        {new Date().toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "fields" && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-tacir-darkblue">
                  Champs du Formulaire ({fields.length})
                </h3>

                {fields?.length > 0 ? (
                  <div className="space-y-3">
                    {fields.map((field, index) => {
                      const fieldId =
                        field._id || `temp-${index}-${Date.now()}`;
                      return (
                        <div
                          key={`field-${fieldId}-${index}`}
                          className="p-3 bg-white rounded-lg border border-tacir-lightgray"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-tacir-blue bg-tacir-blue/10 px-2 py-1 rounded-full">
                              {field.type}
                            </span>
                            <span className="text-xs text-tacir-darkgray">
                              {field.required ? "Requis" : "Optionnel"}
                            </span>
                          </div>
                          <FormFieldRenderer field={field} previewMode />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-tacir-darkgray bg-tacir-lightgray/30 rounded-lg border border-dashed border-tacir-lightgray">
                    <FileText className="h-8 w-8 mx-auto opacity-40 mb-2" />
                    <p className="text-sm">
                      Aucun champ n'a été ajouté au formulaire
                    </p>
                    <p className="text-xs mt-1">
                      Ajoutez des champs depuis le panneau de composants
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <form
              onSubmit={handleSubmit}
              className="pt-4 border-t border-tacir-lightgray"
            >
              <Button
                type="submit"
                className="w-full py-4 text-sm bg-tacir-blue hover:bg-tacir-darkblue text-white"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Traitement...
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {existingFormId ? (
                      <Save className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {existingFormId
                      ? "Mettre à jour le Formulaire"
                      : "Créer le Formulaire"}
                  </div>
                )}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormPreview;
