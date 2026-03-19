import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { generateId } from "../../lib/idGenerator";
import {
  Trash2,
  Plus,
  Settings,
  Info,
  Minus,
  Type,
  Hash,
  Calendar,
  Upload,
  List,
  Circle,
  Square,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";

const SettingsSidebar = ({ selectedField, onUpdateField, onRemoveField }) => {
  const handleChange = (property, value, language) => {
    if (!selectedField) return;

    if (language) {
      onUpdateField({
        ...selectedField,
        [property]: {
          ...selectedField[property],
          [language]: value,
        },
      });
    } else {
      onUpdateField({
        ...selectedField,
        [property]: value,
      });
    }
  };

  const handleAddOption = () => {
    if (!selectedField) return;

    const currentOptions = selectedField.options || [];
    const newOption = {
      tempId: generateId(),
      label: {
        fr: `Option ${currentOptions.length + 1}`,
        ar: `${currentOptions.length + 1} الخيار`,
      },
      value: `option${currentOptions.length + 1}`,
    };

    onUpdateField({
      ...selectedField,
      options: [...currentOptions, newOption],
    });
  };

  const handleOptionChange = (optionId, property, value, language) => {
    if (!selectedField?.options) return;

    const updatedOptions = selectedField.options.map((option) => {
      const currentOptionId = option._id
        ? option._id.toString()
        : option.tempId;
      if (currentOptionId === optionId) {
        return language
          ? {
              ...option,
              label: {
                ...option.label,
                [language]: value,
              },
            }
          : { ...option, [property]: value };
      }
      return option;
    });

    onUpdateField({
      ...selectedField,
      options: updatedOptions,
    });
  };

  const handleRemoveOption = (optionId) => {
    if (!selectedField?.options) return;

    const updatedOptions = selectedField.options.filter((option) => {
      const currentOptionId = option._id
        ? option._id.toString()
        : option.tempId;
      return currentOptionId !== optionId;
    });

    onUpdateField({
      ...selectedField,
      options: updatedOptions,
    });
  };

  const handleTemplateToggle = (checked) => {
    if (!selectedField) return;

    console.log("🔄 Template toggle:", checked, "for field:", selectedField.id);

    const updatedField = {
      ...selectedField,
      isTemplate: checked,
      // Only set templateId if it's being converted to a template
      templateId: checked ? selectedField.templateId || selectedField.id : null,
    };

    console.log("📤 Sending updated field:", updatedField);
    onUpdateField(updatedField);
  };

  const handleRequiredToggle = (checked) => {
    if (!selectedField) return;

    console.log("🔄 Required toggle:", checked, "for field:", selectedField.id);

    const updatedField = {
      ...selectedField,
      required: checked,
    };

    console.log("📤 Sending updated field (required):", updatedField);
    onUpdateField(updatedField);
  };

  const getFieldIcon = () => {
    const icons = {
      text: <Type className="h-4 w-4" />,
      email: <Type className="h-4 w-4" />,
      number: <Hash className="h-4 w-4" />,
      phone: <Type className="h-4 w-4" />,
      textarea: <Type className="h-4 w-4" />,
      select: <List className="h-4 w-4" />,
      radio: <Circle className="h-4 w-4" />,
      checkbox: <Square className="h-4 w-4" />,
      date: <Calendar className="h-4 w-4" />,
      file: <Upload className="h-4 w-4" />,
      section: <Type className="h-4 w-4" />,
      divider: <Minus className="h-4 w-4" />,
    };
    return icons[selectedField.type] || <Settings className="h-4 w-4" />;
  };

  if (!selectedField) {
    return (
      <div className="w-80 border-l bg-white border-tacir-lightgray/30 p-6 overflow-auto h-full shadow-lg flex flex-col items-center justify-center">
        <div className="text-center text-tacir-darkgray">
          <Settings className="h-12 w-12 mx-auto mb-4 text-tacir-lightgray" />
          <h3 className="text-lg font-medium text-tacir-darkblue mb-2">
            Aucun champ sélectionné
          </h3>
          <p className="text-sm text-tacir-darkgray">
            Sélectionnez un champ pour modifier ses propriétés
          </p>
        </div>
      </div>
    );
  }

  // Debug info
  console.log("🔧 SettingsSidebar - Selected Field:", {
    id: selectedField.id,
    type: selectedField.type,
    isTemplate: selectedField.isTemplate,
    required: selectedField.required,
    templateId: selectedField.templateId,
  });

  // In SettingsSidebar - update the template detection logic
  if (selectedField.isFromTemplate || selectedField.isTemplate) {
    return (
      <div className="w-80 bg-white border-l border-tacir-lightgray/30 p-6 overflow-auto h-full shadow-lg">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-tacir-green/10 rounded-lg">
              {getFieldIcon()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-tacir-darkblue">
                Paramètres du Modèle
              </h2>
              <Badge
                variant="outline"
                className="bg-tacir-green/10 text-tacir-green border-tacir-green/20"
              >
                Modèle
              </Badge>
            </div>
          </div>

          <div className="bg-tacir-yellow/10 border border-tacir-yellow/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-tacir-yellow mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-tacir-darkblue mb-1">
                  Champ {selectedField.isFromTemplate ? "du Modèle" : "Modèle"}
                </p>
                <p className="text-xs text-tacir-darkgray">
                  {selectedField.isFromTemplate
                    ? "Ceci est un champ provenant d'un modèle. Seules des propriétés limitées peuvent être modifiées."
                    : "Ceci est un champ modèle. Seules des propriétés limitées peuvent être modifiées."}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Editable fields for templates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-tacir-lightgray/10 rounded-lg">
              <Label
                htmlFor="field-required"
                className="text-tacir-darkblue font-medium"
              >
                Requis
              </Label>
              <Switch
                id="field-required"
                checked={selectedField.required || false}
                onCheckedChange={handleRequiredToggle}
              />
            </div>

            {[
              "text",
              "email",
              "textarea",
              "number",
              "phone",
              "select",
            ].includes(selectedField.type) && (
              <div className="space-y-3 p-3 bg-tacir-lightgray/10 rounded-lg">
                <Label className="text-tacir-darkblue font-medium">
                  Texte indicatif
                </Label>
                <Input
                  value={selectedField.placeholder?.fr || ""}
                  onChange={(e) =>
                    handleChange("placeholder", e.target.value, "fr")
                  }
                  placeholder="Texte indicatif en français"
                  className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
                />
                <Input
                  value={selectedField.placeholder?.ar || ""}
                  onChange={(e) =>
                    handleChange("placeholder", e.target.value, "ar")
                  }
                  placeholder="النص التوضيحي بالعربية"
                  className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
                />
              </div>
            )}

            <Button
              variant="destructive"
              className="w-full bg-tacir-pink hover:bg-tacir-pink/90"
              onClick={() => onRemoveField(selectedField.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer le Champ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-tacir-lightgray/30 p-6 overflow-auto h-full shadow-lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-tacir-blue/10 rounded-lg">
            {getFieldIcon()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-tacir-darkblue">
              Paramètres du Champ
            </h2>
            <Badge
              variant="outline"
              className="bg-tacir-lightgray/20 text-tacir-darkgray"
            >
              {selectedField.type}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="space-y-5">
          {/* Label Settings */}
          <div className="space-y-3">
            <Label className="text-tacir-darkblue font-medium">Libellé</Label>
            <Input
              value={selectedField.label?.fr || ""}
              onChange={(e) => handleChange("label", e.target.value, "fr")}
              placeholder="Libellé en français"
              className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
            />
            <Input
              value={selectedField.label?.ar || ""}
              onChange={(e) => handleChange("label", e.target.value, "ar")}
              placeholder="التسمية بالعربية"
              className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
            />
          </div>

          {/* Field Name */}
          <div className="space-y-2">
            <Label
              htmlFor="field-name"
              className="text-tacir-darkblue font-medium"
            >
              Nom du Champ
            </Label>
            <Input
              id="field-name"
              value={selectedField.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
            />
          </div>

          {/* Placeholder */}
          {["text", "email", "textarea", "number", "phone", "select"].includes(
            selectedField.type
          ) && (
            <div className="space-y-3">
              <Label className="text-tacir-darkblue font-medium">
                Texte indicatif
              </Label>
              <Input
                value={selectedField.placeholder?.fr || ""}
                onChange={(e) =>
                  handleChange("placeholder", e.target.value, "fr")
                }
                placeholder="Texte indicatif en français"
                className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
              />
              <Input
                value={selectedField.placeholder?.ar || ""}
                onChange={(e) =>
                  handleChange("placeholder", e.target.value, "ar")
                }
                placeholder="النص التوضيحي بالعربية"
                className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
              />
            </div>
          )}

          {/* Default Value */}
          {["text", "email", "textarea", "number", "phone"].includes(
            selectedField.type
          ) && (
            <div className="space-y-2">
              <Label
                htmlFor="field-default"
                className="text-tacir-darkblue font-medium"
              >
                Valeur par Défaut
              </Label>
              <Input
                id="field-default"
                value={selectedField.defaultValue || ""}
                onChange={(e) => handleChange("defaultValue", e.target.value)}
                className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
              />
            </div>
          )}

          {/* Toggles */}
          <div className="space-y-3 p-3 bg-tacir-lightgray/10 rounded-lg">
            {[
              "text",
              "email",
              "textarea",
              "number",
              "phone",
              "select",
              "radio",
              "checkbox",
              "date",
              "file",
            ].includes(selectedField.type) && (
              <div className="flex items-center justify-between">
                <Label htmlFor="field-required" className="text-tacir-darkblue">
                  Requis
                </Label>
                <Switch
                  id="field-required"
                  checked={selectedField.required || false}
                  onCheckedChange={handleRequiredToggle}
                />
              </div>
            )}

            {[
              "text",
              "email",
              "textarea",
              "number",
              "phone",
              "select",
              "radio",
              "checkbox",
              "date",
              "file",
            ].includes(selectedField.type) && (
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="field-hide-label"
                  className="text-tacir-darkblue"
                >
                  Masquer le Libellé
                </Label>
                <Switch
                  id="field-hide-label"
                  checked={selectedField.hideLabel || false}
                  onCheckedChange={(checked) =>
                    handleChange("hideLabel", checked)
                  }
                />
              </div>
            )}

            {/* Template Toggle - Only show for non-template fields */}
            {!selectedField.isFromTemplate && (
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="field-is-template"
                  className="text-tacir-darkblue"
                >
                  Enregistrer comme Modèle
                </Label>
                <Switch
                  id="field-is-template"
                  checked={selectedField.isTemplate || false}
                  onCheckedChange={handleTemplateToggle}
                />
              </div>
            )}
          </div>

          {/* Validation */}
          {["text", "email", "number", "phone"].includes(
            selectedField.type
          ) && (
            <div className="space-y-2">
              <Label
                htmlFor="field-validation"
                className="text-tacir-darkblue font-medium"
              >
                Validation
              </Label>
              <Select
                value={selectedField.validation || "none"}
                onValueChange={(value) => handleChange("validation", value)}
              >
                <SelectTrigger className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20">
                  <SelectValue placeholder="Sélectionner une validation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {selectedField.type === "email" && (
                    <SelectItem value="email">Email</SelectItem>
                  )}
                  {selectedField.type === "phone" && (
                    <SelectItem value="phone">Téléphone</SelectItem>
                  )}
                  {selectedField.type === "number" && (
                    <SelectItem value="number">Numérique uniquement</SelectItem>
                  )}
                  <SelectItem value="required">Requis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Layout Options */}
          {["radio", "checkbox"].includes(selectedField.type) && (
            <div className="space-y-2">
              <Label
                htmlFor="field-layout"
                className="text-tacir-darkblue font-medium"
              >
                Mise en Page
              </Label>
              <Select
                value={selectedField.layout || "vertical"}
                onValueChange={(value) => handleChange("layout", value)}
              >
                <SelectTrigger className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vertical">Verticale</SelectItem>
                  <SelectItem value="inline">Inline / Horizontale</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Options Editor */}
          {["select", "radio", "checkbox"].includes(selectedField.type) && (
            <Card className="bg-tacir-lightgray/10 border-tacir-lightgray/30">
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-sm font-medium text-tacir-darkblue">
                  Options
                </CardTitle>
                <CardDescription className="text-xs text-tacir-darkgray">
                  Ajouter ou modifier les options du champ
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  {selectedField.options?.map((option) => {
                    const optionId = option._id
                      ? option._id.toString()
                      : option.tempId;

                    return (
                      <div
                        key={`option-${optionId}`}
                        className="p-3 bg-white rounded-lg border border-tacir-lightgray/30 space-y-2"
                      >
                        <Input
                          value={option.label?.fr || ""}
                          onChange={(e) =>
                            handleOptionChange(
                              optionId,
                              "label",
                              e.target.value,
                              "fr"
                            )
                          }
                          placeholder="Libellé français"
                          className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
                        />
                        <Input
                          value={option.label?.ar || ""}
                          onChange={(e) =>
                            handleOptionChange(
                              optionId,
                              "label",
                              e.target.value,
                              "ar"
                            )
                          }
                          placeholder="التسمية بالعربية"
                          className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            value={option.value || ""}
                            onChange={(e) =>
                              handleOptionChange(
                                optionId,
                                "value",
                                e.target.value
                              )
                            }
                            placeholder="Valeur"
                            className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20 flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveOption(optionId)}
                            className="text-tacir-pink hover:text-tacir-pink/80 hover:bg-tacir-pink/10 h-9 w-9"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-tacir-blue text-tacir-blue hover:bg-tacir-blue/10"
                    onClick={handleAddOption}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une Option
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delete Button */}
          <Button
            variant="destructive"
            className="w-full bg-tacir-pink hover:bg-tacir-pink/90"
            onClick={() => onRemoveField(selectedField.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer le Champ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar;
