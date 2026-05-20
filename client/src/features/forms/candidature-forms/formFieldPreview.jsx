// CandidatureFormFieldRenderer.jsx
"use client";

import { Badge } from "@/components/ui/badge";
import {
  Type,
  FileText,
  Hash,
  Mail,
  Phone,
  Link,
  Calendar,
  Upload,
  Image as ImageIcon,
  ChevronDown,
  Circle,
  CheckSquare,
  Minus,
} from "lucide-react";

const CandidatureFormFieldRenderer = ({ field, previewMode = true }) => {
  // Fonction pour obtenir l'icône du type de champ
  const getFieldIcon = (type) => {
    const icons = {
      text: <Type className="h-4 w-4" />,
      textarea: <FileText className="h-4 w-4" />,
      number: <Hash className="h-4 w-4" />,
      email: <Mail className="h-4 w-4" />,
      phone: <Phone className="h-4 w-4" />,
      url: <Link className="h-4 w-4" />,
      date: <Calendar className="h-4 w-4" />,
      file: <Upload className="h-4 w-4" />,
      image: <ImageIcon className="h-4 w-4" />,
      select: <ChevronDown className="h-4 w-4" />,
      radio: <Circle className="h-4 w-4" />,
      checkbox: <CheckSquare className="h-4 w-4" />,
      section: <Minus className="h-4 w-4" />,
      divider: <Minus className="h-4 w-4" />,
    };
    return icons[type] || <Type className="h-4 w-4" />;
  };

  // Fonction pour obtenir le label du type de champ
  const getFieldTypeLabel = (type) => {
    const labels = {
      text: "Texte court",
      textarea: "Texte long",
      number: "Nombre",
      email: "Email",
      phone: "Téléphone",
      url: "URL",
      date: "Date",
      file: "Fichier",
      image: "Image",
      select: "Liste déroulante",
      radio: "Boutons radio",
      checkbox: "Cases à cocher",
      section: "Section",
      divider: "Séparateur",
    };
    return labels[type] || "Champ personnalisé";
  };

  // Rendu des options pour les champs radio, checkbox, select
  const renderOptionsPreview = (options, type) => {
    if (!options || options.length === 0) {
      return (
        <div className="text-sm text-gray-500 italic text-center py-3 bg-gray-50 rounded border">
          Aucune option configurée
        </div>
      );
    }

    return (
      <div className="space-y-2 mt-2">
        {options.map((option, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-2 bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors"
          >
            {/* Icône selon le type */}
            <div className="flex-shrink-0">
              {type === "radio" && (
                <div className="h-4 w-4 border-2 border-gray-400 rounded-full" />
              )}
              {type === "checkbox" && (
                <div className="h-4 w-4 border-2 border-gray-400 rounded" />
              )}
              {type === "select" && (
                <div className="h-4 w-4 bg-gray-100 border border-gray-300 rounded flex items-center justify-center">
                  <ChevronDown className="h-3 w-3 text-gray-500" />
                </div>
              )}
            </div>

            {/* Labels français et arabe */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                <span className="text-sm font-medium text-gray-900 break-words">
                  {option.label?.fr || `Option ${index + 1}`}
                </span>
                {option.label?.ar && (
                  <span className="text-sm text-gray-700 text-right font-arabic break-words">
                    {option.label.ar}
                  </span>
                )}
              </div>

              {/* Valeur de l'option */}
              {option.value && (
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Valeur: {option.value}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Rendu en mode preview pour chaque type de champ
  const renderPreviewField = () => {
    const commonInputPreview = "h-10 bg-gray-100 rounded w-full mt-2";
    const commonFilePreview =
      "flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded bg-white mt-2";

    switch (field.type) {
      case "text":
        return <div className={commonInputPreview} />;

      case "textarea":
        return <div className="h-24 bg-gray-100 rounded w-full mt-2" />;

      case "number":
        return <div className={commonInputPreview} />;

      case "email":
        return (
          <div className={commonFilePreview}>
            <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm text-gray-500">
                {field.placeholder?.fr || "exemple@email.com"}
              </div>
            </div>
          </div>
        );

      case "phone":
        return (
          <div className={commonFilePreview}>
            <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm text-gray-500">
                {field.placeholder?.fr || "+216 XX XXX XXX"}
              </div>
            </div>
          </div>
        );

      case "url":
        return (
          <div className={commonFilePreview}>
            <Link className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm text-gray-500">
                {field.placeholder?.fr || "https://exemple.com"}
              </div>
            </div>
          </div>
        );

      case "date":
        return (
          <div className={commonFilePreview}>
            <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm text-gray-500">
                {field.placeholder?.fr || "JJ/MM/AAAA"}
              </div>
            </div>
          </div>
        );

      case "file":
        return (
          <div className={commonFilePreview}>
            <Upload className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm text-gray-500">
                {field.placeholder?.fr || "Cliquez pour choisir un fichier"}
              </div>
              {field.accept && (
                <div className="text-xs text-gray-400 mt-1">
                  Types: {field.accept}
                </div>
              )}
            </div>
          </div>
        );

      case "image":
        return (
          <div className={commonFilePreview}>
            <ImageIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm text-gray-500">
                {field.placeholder?.fr || "Cliquez pour choisir une image"}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Formats: JPEG, PNG, GIF, WebP
              </div>
            </div>
          </div>
        );

      case "radio":
        return renderOptionsPreview(field.options, "radio");

      case "checkbox":
        return renderOptionsPreview(field.options, "checkbox");

      case "select":
        return (
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between p-3 border border-gray-300 rounded bg-white">
              <span className="text-sm text-gray-500">
                {field.placeholder?.fr || "Sélectionnez une option..."}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
            {field.options && field.options.length > 0 && (
              <div className="text-xs text-gray-500 text-center">
                {field.options.length} option(s) disponible(s)
              </div>
            )}
          </div>
        );

      case "section":
        return (
          <div className="py-4 mt-2">
            <div className="border-t-2 border-gray-400" />
            {field.description && (
              <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                {field.description.fr && (
                  <p className="text-sm text-gray-700 text-center">
                    {field.description.fr}
                  </p>
                )}
                {field.description.ar && (
                  <p className="text-sm text-gray-700 text-center font-arabic mt-1">
                    {field.description.ar}
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case "divider":
        return (
          <div className="py-3 mt-2">
            <div className="border-t border-gray-300 border-dashed" />
          </div>
        );

      default:
        return <div className={commonInputPreview} />;
    }
  };

  // Rendu spécial pour les sections et séparateurs
  if (field.type === "divider" || field.type === "section") {
    return (
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              {getFieldIcon(field.type)}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {field.type === "section"
                  ? field.label?.fr || "Section"
                  : "Séparateur"}
              </div>
              {field.label?.ar && (
                <div className="text-xs text-gray-600 mt-1 font-arabic">
                  {field.label.ar}
                </div>
              )}
            </div>
          </div>
          <Badge variant="outline" className="text-xs bg-white">
            {getFieldTypeLabel(field.type)}
          </Badge>
        </div>
        {renderPreviewField()}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      {/* En-tête du champ */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
            {getFieldIcon(field.type)}
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            {/* Labels français et arabe */}
            {!field.hideLabel && (
              <div className="space-y-1">
                <div className="text-sm font-semibold text-gray-900 break-words">
                  {field.label?.fr || "Sans titre"}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </div>
                {field.label?.ar && (
                  <div className="text-sm font-semibold text-gray-900 text-right font-arabic break-words">
                    {field.label.ar}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {field.description && (
              <div className="space-y-1 text-xs text-gray-600">
                {field.description.fr && (
                  <p className="break-words">{field.description.fr}</p>
                )}
                {field.description.ar && (
                  <p className="text-right font-arabic break-words">
                    {field.description.ar}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Badges type et requis */}
        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
          <Badge
            variant="outline"
            className="text-xs bg-gray-100 text-gray-700"
          >
            {getFieldTypeLabel(field.type)}
          </Badge>
          {field.required && (
            <Badge
              variant="outline"
              className="text-xs bg-red-50 text-red-700 border-red-200"
            >
              Requis
            </Badge>
          )}
        </div>
      </div>

      {/* Champ de saisie en mode preview */}
      <div className="mt-3">{renderPreviewField()}</div>

      {/* Informations supplémentaires */}
      {(field.helpText || field.placeholder) && (
        <div className="space-y-1 text-xs text-gray-500 pt-2 border-t border-gray-100">
          {field.helpText?.fr && (
            <p className="break-words">{field.helpText.fr}</p>
          )}
          {field.helpText?.ar && (
            <p className="text-right font-arabic break-words">
              {field.helpText.ar}
            </p>
          )}
          {field.placeholder?.fr && !field.helpText && (
            <p className="break-words">Placeholder: {field.placeholder.fr}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidatureFormFieldRenderer;
