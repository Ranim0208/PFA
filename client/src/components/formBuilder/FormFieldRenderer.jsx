import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Trash2, GripVertical, Star, Copy } from "lucide-react";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { generateId } from "../../lib/idGenerator";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";

const FormFieldRenderer = ({
  field,
  onRemove,
  onClick,
  isSelected,
  previewMode,
  dragAttributes, // Add drag attributes prop
  dragListeners, // Add drag listeners prop
  isDragging, // Add dragging state prop
}) => {
  const renderFieldInput = () => {
    switch (field.type) {
      case "radio":
        return (
          <RadioGroup
            className={
              field.layout === "inline" ? "flex gap-4 flex-wrap" : "space-y-2"
            }
          >
            {field.options?.map((option, index) => {
              const optionId = option._id || generateId();
              const inputId = `${field.id}-${optionId}`;
              const key = field.isTemplate
                ? `${field.id}-${optionId}`
                : `${field.id}-${optionId}-${index}`;

              return (
                <div key={key} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={inputId}
                    className="text-tacir-blue border-tacir-lightgray/50"
                  />
                  <Label
                    htmlFor={inputId}
                    className="flex flex-col cursor-pointer"
                  >
                    <span className="text-tacir-darkblue font-medium">
                      {option.label.fr}
                    </span>
                    <span className="text-sm text-tacir-darkgray">
                      {option.label.ar}
                    </span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        );

      case "checkbox":
        return (
          <div
            className={
              field.layout === "inline" ? "flex gap-4 flex-wrap" : "space-y-2"
            }
          >
            {field.options?.map((option, index) => {
              const optionId = option._id || generateId();
              const inputId = `${field.id}-${optionId}`;
              const key = field.isTemplate
                ? `${field.id}-${optionId}`
                : `${field.id}-${optionId}-${index}`;

              return (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={inputId}
                    className="text-tacir-blue border-tacir-lightgray/50 data-[state=checked]:bg-tacir-blue"
                  />
                  <Label
                    htmlFor={inputId}
                    className="flex flex-col cursor-pointer"
                  >
                    <span className="text-tacir-darkblue font-medium">
                      {option.label.fr}
                    </span>
                    <span className="text-sm text-tacir-darkgray">
                      {option.label.ar}
                    </span>
                  </Label>
                </div>
              );
            })}
          </div>
        );

      case "select":
        return (
          <Select>
            <SelectTrigger className="border-tacir-lightgray/50 focus:ring-tacir-blue/20">
              <SelectValue
                placeholder={field.placeholder?.fr || "Sélectionnez une option"}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => {
                const optionId = option._id || generateId();
                const key = field.isTemplate
                  ? `${field.id}-${optionId}`
                  : `${field.id}-${optionId}-${index}`;

                return (
                  <SelectItem key={key} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label.fr}</span>
                      <span className="text-sm text-tacir-darkgray">
                        {option.label.ar}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );

      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder?.fr || `Entrez ${field.label.fr}`}
            className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-tacir-blue/20 min-h-[100px]"
          />
        );

      case "section":
        return (
          <div className="py-3">
            <div className="border-t border-tacir-lightgray/30"></div>
          </div>
        );

      case "divider":
        return (
          <div className="py-2">
            <div className="border-t border-tacir-lightgray/50 border-dashed"></div>
          </div>
        );

      default:
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder?.fr || `Entrez ${field.label.fr}`}
            className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-tacir-blue/20"
          />
        );
    }
  };

  const getFieldIcon = () => {
    const icons = {
      text: "T",
      email: "@",
      number: "#",
      phone: "📞",
      textarea: "¶",
      select: "▼",
      radio: "○",
      checkbox: "☑",
      date: "📅",
      file: "📎",
      section: "⤵",
      divider: "―",
    };
    return icons[field.type] || "?";
  };

  return (
    <div
      className={`relative p-4 rounded-lg border transition-all duration-200 cursor-pointer group ${
        isSelected
          ? "border-tacir-blue bg-tacir-blue/5 ring-2 ring-tacir-blue/20 shadow-md"
          : "border-tacir-lightgray/30 bg-white hover:border-tacir-blue/50 hover:shadow-sm"
      } ${isDragging ? "opacity-50 scale-95 rotate-2 cursor-grabbing" : ""}`}
      onClick={onClick}
    >
      {/* Drag Handle - Positionné en haut à gauche à l'intérieur du champ */}
      {!previewMode && (
        <div
          {...dragAttributes}
          {...dragListeners}
          className="absolute left-2 top-2 z-20 cursor-grab active:cursor-grabbing text-tacir-darkgray/60 hover:text-tacir-blue transition-colors p-1 rounded hover:bg-tacir-blue/10"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      {/* Badge Template */}
      {field.isTemplate && (
        <Badge
          variant="secondary"
          className="absolute -top-2 -right-2 text-xs bg-tacir-yellow text-tacir-blue border-tacir-blue/20"
        >
          Modèle
        </Badge>
      )}

      {/* En-tête du champ - Ajusté pour laisser de l'espace pour la poignée */}
      <div className="flex justify-between items-start mb-3 pl-6">
        {" "}
        {/* Added pl-6 for drag handle space */}
        <div className="flex items-start gap-3 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-tacir-blue/10 rounded-full flex items-center justify-center text-tacir-blue text-sm font-medium">
              {getFieldIcon()}
            </div>
          </div>

          <div className="flex-1">
            {!field.hideLabel &&
              field.type !== "section" &&
              field.type !== "divider" && (
                <Label className="flex flex-col">
                  <span className="text-tacir-darkblue font-medium text-sm">
                    {field.label.fr}
                    {field.required && (
                      <span className="text-tacir-pink ml-1">*</span>
                    )}
                  </span>
                  <span className="text-xs text-tacir-darkgray mt-1">
                    {field.label.ar}
                  </span>
                </Label>
              )}
            {(field.type === "section" || field.type === "divider") && (
              <Label className="flex flex-col">
                <span className="text-tacir-darkblue font-medium text-sm">
                  {field.type === "section" ? "Titre de Section" : "Séparateur"}
                </span>
                <span className="text-xs text-tacir-darkgray mt-1">
                  {field.type === "section" ? "Section Title" : "Divider"}
                </span>
              </Label>
            )}
          </div>
        </div>
        {!previewMode && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-tacir-darkgray hover:text-tacir-pink hover:bg-tacir-pink/10"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Champ de saisie */}
      <div className="mt-2 pl-6">
        {" "}
        {/* Added pl-6 for drag handle space */}
        {renderFieldInput()}
      </div>

      {/* Indicateur requis */}
      {field.required && (
        <div className="flex items-center gap-1 text-tacir-pink text-xs mt-2 pl-6">
          {" "}
          {/* Added pl-6 */}
          <Star className="h-3 w-3 fill-current" />
          <span>Requis / مطلوب</span>
        </div>
      )}

      {/* Type de champ */}
      <div className="mt-2 pl-6">
        {" "}
        {/* Added pl-6 for drag handle space */}
        <Badge
          variant="outline"
          className="text-xs bg-tacir-lightgray/20 text-tacir-darkgray"
        >
          {field.type}
        </Badge>
      </div>
    </div>
  );
};

export default FormFieldRenderer;
