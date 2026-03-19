"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getTemplates, getFormById } from "../../services/forms/formServices";
import FormPreview from "./FormPreview";
import ComponentPanel from "./ComponentPanel";
import MetadataEditor from "./MetadataEditor";
import FormCanvas from "./FormCanvas";
import SettingsSidebar from "./SettingsSidebar";
import { Button } from "../ui/button";
import { generateId } from "../../lib/idGenerator";
import {
  ChevronUp,
  ChevronDown,
  Settings,
  Copy,
  Menu,
  X,
  PanelLeftClose,
  PanelRightClose,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";

const FormBuilder = ({ existingFormId }) => {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");

  const [selectedField, setSelectedField] = useState(null);
  const [showPredefined, setShowPredefined] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [metadataExpanded, setMetadataExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isUsingTemplate, setIsUsingTemplate] = useState(false);
  const [mobilePanel, setMobilePanel] = useState(null);

  const [formData, setFormData] = useState({
    title: { fr: "", ar: "" },
    description: { fr: "", ar: "" },
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    eventLocation: { fr: "", ar: "" },
    prizes: [],
    fields: [],
    eventDates: [],
    region: { fr: "", ar: "" },
    imageUrl: "", // ← ajouté
  });

  const [formStatus, setFormStatus] = useState({
    published: false,
    validated: false,
  });

  // Upload util + handler
  async function uploadImageFile(file) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body: fd });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(msg || "Upload échoué");
    }
    const data = await res.json();
    if (!data?.url) throw new Error("Réponse d’upload invalide");
    return data.url;
  }

  const handleUploadImage = async (file) => {
    try {
      if (!file) return;
      const okTypes = ["image/png", "image/jpeg", "image/webp"];
      if (!okTypes.includes(file.type)) throw new Error("Type d'image invalide");
      if (file.size > 5 * 1024 * 1024) throw new Error("Image trop volumineuse (>5 Mo)");
      const url = await uploadImageFile(file);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
      toast.success("Image importée avec succès");
    } catch (e) {
      toast.error(e.message || "Erreur lors de l'upload de l'image");
    }
  };

  // Chargement des données
  useEffect(() => {
    const loadFormData = async () => {
      setLoading(true);
      try {
        if (templateId) {
          const templateForm = await getFormById(templateId);
          if (templateForm) {
            setIsUsingTemplate(true);
            const templateFields = templateForm.fields.map((field) => ({
              _id: field._id,
              id: generateId(),
              type: field.type,
              label: field.label || { fr: "Nouveau champ", ar: "حقل جديد" },
              name: field.name || `field_${generateId()}`,
              required: field.required ?? false,
              placeholder: field.placeholder || { fr: "", ar: "" },
              options: ["select", "radio", "checkbox"].includes(field.type)
                ? field.options?.map((option) => ({
                    ...option,
                    id: option._id || option.tempId || generateId(),
                  })) || []
                : undefined,
              isFromTemplate: true,
              templateFieldId: field._id,
            }));

            setFormData({
              title: {
                fr: `Copie de ${templateForm.title.fr}`,
                ar: `نسخة من ${templateForm.title.ar}`,
              },
              description: templateForm.description || { fr: "", ar: "" },
              startDate: new Date().toISOString(),
              endDate: new Date().toISOString(),
              eventLocation: templateForm.eventLocation || { fr: "", ar: "" },
              prizes: templateForm.prizes || [],
              fields: templateFields,
              eventDates: templateForm.eventDates || [],
              region: { fr: "", ar: "" },
              imageUrl: templateForm.imageUrl || "", // ← conserve si présent
            });

            // Un template devient un nouveau brouillon
            setFormStatus({ published: false, validated: false });

            toast.success("Modèle appliqué avec succès! Vous pouvez maintenant le modifier.", {
              duration: 4000,
            });
          }
        } else if (existingFormId) {
          const existingForm = await getFormById(existingFormId);
          if (existingForm) {
            const processedFields = existingForm.fields.map((field) => ({
              _id: field._id,
              id: field._id || generateId(),
              type: field.type,
              label: field.label || { fr: "Nouveau champ", ar: "حقل جديد" },
              name: field.name || `field_${field._id || generateId()}`,
              required: field.required ?? false,
              placeholder: field.placeholder || { fr: "", ar: "" },
              options: ["select", "radio", "checkbox"].includes(field.type)
                ? field.options?.map((option) => ({
                    ...option,
                    id: option._id || option.tempId || generateId(),
                  })) || []
                : undefined,
              isFromTemplate: field.isFromTemplate || false,
              templateFieldId: field.templateFieldId || null,
            }));

            setFormData({
              ...existingForm,
              fields: processedFields,
              region: existingForm.region?.name || { fr: "", ar: "" },
              imageUrl: existingForm.imageUrl || "", // ← conserve si présent
            });

            setFormStatus({
              published: existingForm.published || false,
              validated: existingForm.validated || false,
            });

            if (existingForm.published) {
              toast.warning("Ce formulaire est publié. Les modifications sont limitées.", {
                autoClose: 5000,
              });
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement du formulaire:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    loadFormData();
  }, [existingFormId, templateId]);

  // Charger les templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error("Échec du chargement des modèles:", error);
      }
    };
    loadTemplates();
  }, []);

  // Métadonnées
  const handleMetadataChange = (updatedMetadata) => {
    setFormData((prev) => ({ ...prev, ...updatedMetadata }));
  };

  // Champs (inchangé dans l’esprit)
  const handleAddField = (field, isFromTemplate = false, insertIndex = null) => {
    if (formStatus.published) {
      toast.error("Impossible d'ajouter des champs à un formulaire publié. Veuillez d'abord le dépublier.");
      return;
    }
    const mapOptions = (options) =>
      options?.map((option) => ({
        ...option,
        id: option._id || option.tempId || generateId(),
      })) || [];
    const newField = isFromTemplate
      ? {
          id: field.id || generateId(),
          type: field.type,
          label: field.label || { fr: "Nouveau champ", ar: "حقل جديد" },
          name: field.name || `field_${generateId()}`,
          required: field.required ?? false,
          placeholder: field.placeholder || { fr: "", ar: "" },
          options: ["select", "radio", "checkbox"].includes(field.type)
            ? mapOptions(field.options)
            : undefined,
          isFromTemplate: true,
          templateFieldId: field._id,
          ...(field.layout && { layout: field.layout }),
        }
      : {
          id: generateId(),
          type: field.type || field,
          label: { fr: `Nouveau ${field.type || field}`, ar: "حقل جديد" },
          name: `field_${generateId()}`,
          required: false,
          placeholder: { fr: "", ar: "" },
          options: ["select", "radio", "checkbox"].includes(field.type)
            ? mapOptions(field.options)
            : undefined,
          isFromTemplate: false,
          templateFieldId: null,
        };
    setFormData((prev) => {
      const newFields = [...prev.fields];
      if (insertIndex !== null && insertIndex >= 0 && insertIndex <= newFields.length) {
        newFields.splice(insertIndex, 0, newField);
      } else {
        newFields.push(newField);
      }
      return { ...prev, fields: newFields };
    });
    setSelectedField(newField);
    if (typeof window !== "undefined" && window.innerWidth < 1024) setMobilePanel("settings");
  };

  const handleUpdateField = (updatedField) => {
    if (formStatus.published) {
      toast.error("Impossible de modifier les champs d'un formulaire publié. Veuillez d'abord le dépublier.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.map((field) => {
        if (field.id === updatedField.id) {
          if (field.isFromTemplate) {
            return { ...field, required: updatedField.required, placeholder: updatedField.placeholder };
          }
          return { ...field, ...updatedField, _id: field._id };
        }
        return field;
      }),
    }));
    setSelectedField(updatedField);
  };

  const handleRemoveField = (fieldId) => {
    if (formStatus.published) {
      toast.error("Impossible de supprimer des champs d'un formulaire publié. Veuillez d'abord le dépublier.");
      return;
    }
    setFormData((prev) => ({ ...prev, fields: prev.fields.filter((f) => f.id !== fieldId) }));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
      if (typeof window !== "undefined" && window.innerWidth < 1024) setMobilePanel(null);
    }
  };

  const handleSelectField = (field) => {
    setSelectedField(field);
    if (typeof window !== "undefined" && window.innerWidth < 1024) setMobilePanel("settings");
  };

  const handleReorderFields = (reorderedFields) => {
    if (formStatus.published) {
      toast.error("Impossible de réorganiser les champs d'un formulaire publié. Veuillez d'abord le dépublier.");
      return;
    }
    const fieldsWithIds = reorderedFields.map((f) => ({ ...f, _id: f._id }));
    setFormData((prev) => ({ ...prev, fields: fieldsWithIds }));
  };

  const handleOverlayClick = () => {
    setMobilePanel(null);
    setSelectedField(null);
  };

  const handleFormUpdateError = (error) => {
    console.error("Erreur de mise à jour du formulaire:", error);
    if (error.includes("FORM_PUBLISHED_NO_UPDATE") || error.includes("formulaire publié")) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="font-semibold">Formulaire publié</p>
            <p className="text-sm">Impossible de modifier un formulaire publié</p>
          </div>
        </div>,
        { autoClose: 7000 }
      );
    } else {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="font-semibold">Erreur de mise à jour</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>,
        { autoClose: 5000 }
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-46px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tacir-blue mx-auto"></div>
          <p className="mt-4 text-tacir-darkgray">
            {templateId ? "Chargement du modèle..." : "Chargement du formulaire..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-46px)] bg-tacir-white bg-gradient-to-r from-tacir-blue/5 to-tacir-lightblue/5 relative">
      {/* Alerte publié */}
      {formStatus.published && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-yellow-100 border-b border-yellow-300 p-3">
          <div className="flex items-center justify-center gap-2 text-yellow-800">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">Formulaire publié</span>
            <span className="text-sm">- Les modifications sont restreintes</span>
          </div>
        </div>
      )}

      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-3 bg-white border-b border-tacir-lightgray/30 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobilePanel(mobilePanel === "components" ? null : "components")}
            className="p-2"
          >
            <Menu className="h-5 w-5 text-tacir-darkblue" />
          </Button>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-tacir-darkblue">Créateur</h2>
            {isUsingTemplate && !formStatus.published && (
              <span className="flex items-center gap-1 text-xs text-tacir-blue bg-tacir-blue/10 px-2 py-1 rounded-full">
                <Copy className="h-3 w-3" />
                Nouveau
              </span>
            )}
            {formStatus.published && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                <AlertCircle className="h-3 w-3" />
                Publié
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FormPreview
            fields={formData.fields}
            metadata={formData}
            existingFormId={existingFormId}
            onError={handleFormUpdateError}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobilePanel(mobilePanel === "settings" ? null : "settings")}
            className="p-2"
            disabled={!selectedField}
          >
            <Settings className="h-5 w-5 text-tacir-darkblue" />
          </Button>
        </div>
      </div>

      {/* Component Panel */}
      <div
        className={`
        lg:w-80 lg:static lg:transform-none lg:border-r
        fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-tacir-lightgray/30 
        transform transition-transform duration-300 ease-in-out
        ${mobilePanel === "components" ? "translate-x-0" : "lg:translate-x-0 -translate-x-full"}
      `}
      >
        <div className="h-full flex flex-col">
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-tacir-lightgray/30">
            <h3 className="text-lg font-semibold text-tacir-darkblue">Composants</h3>
            <Button variant="ghost" size="sm" onClick={() => setMobilePanel(null)} className="p-2">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ComponentPanel
            onAddField={handleAddField}
            templates={templates}
            showPredefined={showPredefined}
            setShowPredefined={setShowPredefined}
            onTemplateApply={(templateFields) => {
              if (formStatus.published) {
                toast.error("Impossible d'ajouter des champs template à un formulaire publié.");
                return;
              }
              setFormData((prev) => ({
                ...prev,
                fields: [
                  ...prev.fields,
                  ...templateFields.map((field) => ({
                    _id: field._id,
                    id: generateId(),
                    type: field.type,
                    label: field.label,
                    name: field.name || `field_${generateId()}`,
                    required: field.required,
                    placeholder: field.placeholder || { fr: "", ar: "" },
                    options: ["select", "radio", "checkbox"].includes(field.type)
                      ? field.options?.map((option) => ({
                          ...option,
                          id: option.id || option._id || generateId(),
                        }))
                      : undefined,
                    isFromTemplate: true,
                    templateFieldId: field._id,
                  })),
                ],
              }));
              if (typeof window !== "undefined" && window.innerWidth < 1024) setMobilePanel(null);
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:min-h-0">
        <div className="hidden lg:flex px-6 py-3 border-b border-tacir-lightgray/30 bg-white shadow-sm items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-tacir-darkblue">Aperçu du Formulaire</h2>
            {isUsingTemplate && !formStatus.published && (
              <span className="flex items-center gap-2 text-sm text-tacir-blue bg-tacir-blue/10 px-3 py-1 rounded-full">
                <Copy className="h-4 w-4" />
                Nouveau depuis modèle
              </span>
            )}
            {formStatus.published && (
              <span className="flex items-center gap-2 text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                <AlertCircle className="h-4 w-4" />
                Formulaire publié
              </span>
            )}
          </div>
          <FormPreview
            fields={formData.fields}
            metadata={formData}
            existingFormId={existingFormId}
            onError={handleFormUpdateError}
          />
        </div>

        {/* Metadata Section */}
        <div className="p-4 border-b border-tacir-lightgray/30 bg-white overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base lg:text-lg font-bold text-tacir-darkblue flex items-center gap-2 lg:gap-3">
              <div className="p-2 bg-tacir-blue/10 rounded-lg">
                <Settings className="h-4 lg:h-5 w-4 lg:w-5 text-tacir-blue" />
              </div>
              <span className="hidden sm:inline">Métadonnées du Formulaire</span>
              <span className="sm:hidden">Métadonnées</span>
            </h3>
            <Button
              onClick={() => setMetadataExpanded(!metadataExpanded)}
              variant="outline"
              size="sm"
              className="text-tacir-blue border-tacir-blue/30 hover:bg-tacir-blue/10 text-xs lg:text-sm"
            >
              {metadataExpanded ? (
                <>
                  <ChevronUp className="h-3 lg:h-4 w-3 lg:w-4 mr-1" />
                  <span className="hidden sm:inline">Réduire</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 lg:h-4 w-3 lg:w-4 mr-1" />
                  <span className="hidden sm:inline">Développer</span>
                </>
              )}
            </Button>
          </div>
          {metadataExpanded && (
            <div className="overflow-auto">
              <MetadataEditor
                metadata={formData}
                onChange={handleMetadataChange}
                onUploadImage={handleUploadImage} // ← passe l’upload au MetadataEditor
                isPublished={formStatus.published}
              />
            </div>
          )}
        </div>

        {/* Design Area */}
        <div className="flex-1 overflow-hidden bg-gradient-to-br from-tacir-blue/2 to-tacir-lightblue/2">
          <FormCanvas
            fields={formData.fields}
            onAddField={handleAddField}
            onSelectField={handleSelectField}
            onReorderFields={handleReorderFields}
            onRemoveField={handleRemoveField}
            selectedFieldId={selectedField?.id}
            isPublished={formStatus.published}
          />
        </div>
      </div>

      {/* Settings Sidebar */}
      <div
        className={`
        lg:w-80 lg:static lg:transform-none lg:border-l
        fixed inset-y-0 right-0 z-40 w-80 bg-white border-l border-tacir-lightgray/30
        transform transition-transform duration-300 ease-in-out
        ${
          mobilePanel === "settings" ||
          (selectedField && typeof window !== "undefined" && window.innerWidth >= 1024)
            ? "translate-x-0"
            : "lg:translate-x-0 translate-x-full"
        }
      `}
      >
        <div className="h-full flex flex-col">
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-tacir-lightgray/30">
            <h3 className="text-lg font-semibold text-tacir-darkblue">Paramètres</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMobilePanel(null);
                setSelectedField(null);
              }}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <SettingsSidebar
            selectedField={selectedField}
            onUpdateField={handleUpdateField}
            onRemoveField={handleRemoveField}
            isPublished={formStatus.published}
          />
        </div>
      </div>

      {/* Overlay */}
      {mobilePanel && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => { setMobilePanel(null); setSelectedField(null); }} />
      )}

      {/* FABs */}
      <div className="lg:hidden fixed bottom-6 right-6 z-30 flex flex-col gap-3">
        {!mobilePanel && (
          <>
            <Button
              onClick={() => setMobilePanel("components")}
              className="bg-tacir-blue hover:bg-tacir-darkblue text-white rounded-full p-3 shadow-lg"
              size="sm"
            >
              <PanelLeftClose className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => setMobilePanel("settings")}
              className="bg-tacir-green hover:bg-tacir-darkgreen text-white rounded-full p-3 shadow-lg"
              size="sm"
              disabled={!selectedField}
            >
              <PanelRightClose className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
