"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import CandidatureFormFieldRenderer from "./formFieldPreview";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
  Calendar,
  MapPin,
  FileText,
  Users,
  Image as ImageIcon,
  Clock,
  Award,
  Globe,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useState } from "react";

const CandidatureFormDetailsPreview = ({ form, open, onOpenChange }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!form) return null;

  const {
    title,
    description,
    imageUrl,
    eventDates,
    eventLocation,
    prizes,
    fields,
    region,
    startDate,
    endDate,
    createdAt,
    updatedAt,
  } = form;

  // Date formatting utility
  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié";
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Function to render links in description with better mobile handling
  const renderDescriptionWithLinks = (text) => {
    if (!text) return null;
    return text.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-3 text-sm sm:text-base leading-relaxed break-words">
        {paragraph.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
          part.match(/^https?:\/\//) ? (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-tacir-lightblue hover:underline break-all"
            >
              {part}
            </a>
          ) : (
            part
          )
        )}
      </p>
    ));
  };

  const getFormStatus = () => {
    if (!startDate || !endDate) return "incomplete";

    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return "upcoming";
    if (now > end) return "ended";
    return "active";
  };

  const statusConfig = {
    incomplete: {
      label: "Incomplet",
      color: "text-gray-700 bg-gray-100",
    },
    upcoming: {
      label: "À venir",
      color: "text-blue-700 bg-blue-100",
    },
    active: { label: "Actif", color: "text-green-700 bg-green-100" },
    ended: { label: "Terminé", color: "text-red-700 bg-red-100" },
  };

  const status = getFormStatus();

  const scrollTabs = (direction) => {
    const tabContainer = document.getElementById('tab-container');
    const scrollAmount = 200;
    if (tabContainer) {
      const newScroll = direction === 'right' 
        ? tabContainer.scrollLeft + scrollAmount
        : tabContainer.scrollLeft - scrollAmount;
      tabContainer.scrollTo({ left: newScroll, behavior: 'smooth' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:!max-w-2xl w-full h-full sm:h-[90vh] sm:max-h-[90vh] p-0 overflow-hidden flex flex-col sm:mx-4 sm:rounded-lg">
        <VisuallyHidden asChild>
          <DialogTitle>Détails du Formulaire</DialogTitle>
        </VisuallyHidden>

        {/* Mobile Header with Close Button */}
        <div className="sm:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-3">
            Détails du Formulaire
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Header with tabs - Mobile optimized */}
        <div className="flex border-b border-gray-200 bg-white shrink-0 relative">
          {/* Mobile scroll buttons */}
          <div className="md:hidden absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 flex items-center">
            <button
              onClick={() => scrollTabs('left')}
              className="p-1 bg-white rounded-full shadow-sm border"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
          </div>
          <div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 flex items-center justify-end">
            <button
              onClick={() => scrollTabs('right')}
              className="p-1 bg-white rounded-full shadow-sm border"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div 
            id="tab-container"
            className="flex overflow-x-auto scrollbar-hide flex-1 px-8 md:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button
              className={`flex-shrink-0 py-3 px-3 sm:px-4 text-xs font-medium flex items-center justify-center gap-1 min-w-[100px] ${
                activeTab === "overview"
                  ? "text-tacir-lightblue border-b-2 border-tacir-lightblue"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <FileText className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden xs:inline truncate">Aperçu</span>
              <span className="xs:hidden truncate">Vue</span>
            </button>
            <button
              className={`flex-shrink-0 py-3 px-3 sm:px-4 text-xs font-medium flex items-center justify-center gap-1 min-w-[100px] ${
                activeTab === "details"
                  ? "text-tacir-lightblue border-b-2 border-tacir-lightblue"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("details")}
            >
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden xs:inline truncate">Détails</span>
              <span className="xs:hidden truncate">Infos</span>
            </button>
            <button
              className={`flex-shrink-0 py-3 px-3 sm:px-4 text-xs font-medium flex items-center justify-center gap-1 min-w-[100px] ${
                activeTab === "fields"
                  ? "text-tacir-lightblue border-b-2 border-tacir-lightblue"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("fields")}
            >
              <Users className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden xs:inline truncate">Champs</span>
              <span className="xs:hidden truncate">({fields?.length || 0})</span>
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Header with image - Mobile optimized */}
            {imageUrl ? (
              <div className="w-full h-32 sm:h-48 overflow-hidden relative rounded-lg sm:rounded-xl">
                <img
                  src={imageUrl}
                  alt="En-tête du formulaire"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4 sm:p-6">
                  <div className="text-white w-full">
                    <h1 className="text-lg sm:text-2xl font-bold line-clamp-2 break-words">
                      {title?.fr || "Formulaire Sans Titre"}
                    </h1>
                    <p className="text-xs sm:text-sm opacity-90 line-clamp-2 break-words mt-1">
                      {description?.fr?.substring(0, 100) || ""}
                      {description?.fr?.length > 100 ? "..." : ""}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-24 sm:h-32 bg-gradient-to-r from-gray-100 to-blue-50 flex items-center justify-center p-4 sm:p-6 rounded-lg sm:rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3 text-tacir-darkblue w-full">
                  <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 opacity-70 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-2xl font-bold line-clamp-2 break-words">
                      {title?.fr || "Formulaire Sans Titre"}
                    </h1>
                    <p className="text-xs sm:text-sm opacity-80 line-clamp-2 break-words mt-1">
                      {description?.fr?.substring(0, 80) ||
                        "Aucune description fournie"}
                      {description?.fr?.length > 80 ? "..." : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status and dates - Mobile optimized */}
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${statusConfig[status].color} self-start whitespace-nowrap`}
              >
                {statusConfig[status].label}
              </span>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 min-w-0">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-center xs:text-right break-words min-w-0">
                  {formatDate(startDate)} - {formatDate(endDate)}
                </span>
              </div>
            </div>

            {activeTab === "overview" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Title Section */}
                <div className="text-center space-y-2 sm:space-y-3 py-2 sm:py-3">
                  <h1 className="text-xl sm:text-3xl font-bold text-tacir-darkblue break-words px-1 leading-tight">
                    {title?.fr || "Formulaire Sans Titre"}
                  </h1>
                  {title?.ar && (
                    <h1 className="text-lg sm:text-2xl text-tacir-darkblue font-arabic break-words px-1 leading-tight">
                      {title.ar}
                    </h1>
                  )}
                </div>

                {/* Description Section */}
                {(description?.fr || description?.ar) && (
                  <div className="space-y-3 sm:space-y-4 p-4 bg-gray-100 rounded-lg sm:rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 text-tacir-darkblue mb-2 sm:mb-3">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <h3 className="font-semibold text-sm sm:text-base">Description</h3>
                    </div>
                    <div className="max-w-full overflow-hidden">
                      {description?.fr && (
                        <div className="text-gray-700 leading-relaxed break-words">
                          {renderDescriptionWithLinks(description.fr)}
                        </div>
                      )}
                      {description?.ar && (
                        <div className="text-gray-700 text-right leading-relaxed font-arabic border-t pt-3 sm:pt-4 mt-3 sm:mt-4 break-words">
                          {renderDescriptionWithLinks(description.ar)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {/* Important Dates */}
                  {eventDates?.length > 0 && (
                    <div className="bg-white p-4 rounded-lg sm:rounded-xl shadow-sm border space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-tacir-darkblue flex-shrink-0" />
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                          Dates Importantes
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {eventDates.map((event, index) => (
                          <div
                            key={index}
                            className="border-l-4 border-red-100 pl-3 sm:pl-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                              <div className="space-y-1 flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                                  {formatDate(event.date)}
                                </p>
                                {event.description?.fr && (
                                  <p className="text-gray-700 text-xs sm:text-sm break-words leading-relaxed">
                                    {event.description.fr}
                                  </p>
                                )}
                              </div>
                              {event.description?.ar && (
                                <div className="text-right flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                                    {formatDate(event.date)}
                                  </p>
                                  <p className="text-gray-700 text-xs sm:text-sm font-arabic break-words leading-relaxed">
                                    {event.description.ar}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Event Location */}
                  {eventLocation && (
                    <div className="bg-white p-4 rounded-lg sm:rounded-xl shadow-sm border space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-tacir-green flex-shrink-0" />
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                          Lieu de l'Événement
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          {eventLocation?.fr && (
                            <p className="text-gray-700 text-sm sm:text-base flex-1 break-words leading-relaxed">
                              {eventLocation.fr}
                            </p>
                          )}
                          {eventLocation?.ar && (
                            <p className="text-gray-700 text-sm sm:text-base flex-1 text-right font-arabic break-words leading-relaxed">
                              {eventLocation.ar}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Region */}
                {region && (
                  <div className="bg-white p-4 rounded-lg sm:rounded-xl shadow-sm border">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-tacir-darkblue flex-shrink-0" />
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words">Région</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {region?.fr && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide break-words">
                            Français
                          </p>
                          <p className="text-gray-900 font-medium text-sm sm:text-base break-words leading-relaxed">
                            {region.fr}
                          </p>
                        </div>
                      )}
                      {region?.ar && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide text-right break-words">
                            العربية
                          </p>
                          <p className="text-gray-900 font-medium text-sm sm:text-base text-right font-arabic break-words leading-relaxed">
                            {region.ar}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Preview of first 3 fields */}
                {fields?.length > 0 && (
                  <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-tacir-darkblue flex-shrink-0" />
                      <span className="break-words">Aperçu des Champs</span>
                    </h3>
                    <div className="space-y-3">
                      {fields.slice(0, 3).map((field, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <CandidatureFormFieldRenderer
                            field={field}
                            previewMode
                          />
                        </div>
                      ))}
                      {fields.length > 3 && (
                        <div className="text-center text-xs sm:text-sm text-gray-500 py-2">
                          + {fields.length - 3} autres champs
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "details" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Event Dates */}
                {eventDates?.length > 0 && (
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-tacir-darkblue flex-shrink-0" />
                      <span className="break-words">Dates Importantes</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {eventDates.map((event, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white rounded-lg sm:rounded-xl border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <span className="text-xs sm:text-sm font-medium text-tacir-blue bg-blue-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                              Date #{index + 1}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm sm:text-base mb-2 break-words">
                            {event.date
                              ? formatDate(event.date)
                              : "Date non spécifiée"}
                          </p>
                          {event.description?.fr && (
                            <p className="text-gray-700 text-xs sm:text-sm mb-2 break-words leading-relaxed">
                              {event.description.fr}
                            </p>
                          )}
                          {event.description?.ar && (
                            <p className="text-gray-700 text-xs sm:text-sm text-right font-arabic break-words leading-relaxed">
                              {event.description.ar}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prizes Section */}
                {prizes?.length > 0 && (
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                      <Award className="h-4 w-4 sm:h-5 sm:w-5 text-tacir-orange flex-shrink-0" />
                      <span className="break-words">Prix et Récompenses</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {prizes.map((prize, index) => (
                        <div
                          key={index}
                          className="p-3 bg-yellow-50 rounded-lg sm:rounded-xl border border-yellow-200"
                        >
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <span className="text-xs sm:text-sm font-medium text-tacir-yellow bg-yellow-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                              Prix #{index + 1}
                            </span>
                            <span className="text-base sm:text-lg font-bold text-tacir-yellow whitespace-nowrap">
                              {prize?.amount || 0} DT
                            </span>
                          </div>
                          {prize?.description?.fr && (
                            <p className="text-gray-900 text-sm sm:text-base mb-2 break-words leading-relaxed">
                              {prize.description.fr}
                            </p>
                          )}
                          {prize?.description?.ar && (
                            <p className="text-gray-900 text-sm sm:text-base text-right font-arabic break-words leading-relaxed">
                              {prize.description.ar}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Metadata Summary */}
                <div className="p-3 bg-white rounded-lg sm:rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
                    <span className="break-words">Informations du Formulaire</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-gray-600 break-words">Statut</p>
                      <p
                        className={`font-medium text-xs sm:text-sm inline-block px-2 sm:px-3 py-1 rounded-full ${statusConfig[status].color} break-words`}
                      >
                        {statusConfig[status].label}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-gray-600 break-words">Nombre de champs</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base break-words">
                        {fields?.length || 0} champs
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-gray-600 break-words">Date de création</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base break-words">
                        {createdAt ? formatDate(createdAt) : "Non spécifié"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-gray-600 break-words">
                        Dernière modification
                      </p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base break-words">
                        {updatedAt ? formatDate(updatedAt) : "Non spécifié"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "fields" && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                  Champs du Formulaire ({fields?.length || 0})
                </h3>

                {fields?.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {fields.map((field, index) => {
                      const fieldId =
                        field._id || `temp-${index}-${Date.now()}`;
                      return (
                        <div
                          key={`field-${fieldId}-${index}`}
                          className="p-3 bg-white rounded-lg sm:rounded-xl border border-gray-200"
                        >
                          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-2 sm:mb-3">
                            <span className="text-xs sm:text-sm font-medium text-tacir-lightblue bg-tacir-lightblue/10 px-2 sm:px-3 py-1 rounded-full self-start break-words">
                              {field.type}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                              {field.required ? "Requis" : "Optionnel"}
                            </span>
                          </div>
                          <CandidatureFormFieldRenderer
                            field={field}
                            previewMode
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg sm:rounded-xl border border-dashed border-gray-300">
                    <FileText className="h-8 w-8 sm:h-10 sm:w-10 mx-auto opacity-40 mb-2 sm:mb-3" />
                    <p className="text-sm sm:text-base break-words">
                      Aucun champ n'a été ajouté au formulaire
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CandidatureFormDetailsPreview;