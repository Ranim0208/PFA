"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  FileText,
  X,
  Plus,
  Tag,
  FolderOpen,
  Calendar,
  Award,
  Users,
  Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SaveAsTemplateDialog = ({
  open,
  onOpenChange,
  form,
  onSave,
  loading,
}) => {
  const [templateData, setTemplateData] = useState({
    title: {
      fr: form?.title?.fr ? `Modèle - ${form.title.fr}` : "",
      ar: form?.title?.ar ? `قالب - ${form.title.ar}` : "",
    },
    description: {
      fr: form?.description?.fr || "",
      ar: form?.description?.ar || "",
    },
    category: "custom",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");

  const handleSave = () => {
    if (!templateData.title.fr.trim()) {
      return;
    }
    onSave(templateData);
  };

  const addTag = () => {
    if (tagInput.trim() && !templateData.tags.includes(tagInput.trim())) {
      setTemplateData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTemplateData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const categories = [
    {
      value: "event",
      label: "Événement",
      icon: Calendar,
      color: "text-tacir-blue",
    },
    {
      value: "contest",
      label: "Concours",
      icon: Award,
      color: "text-tacir-yellow",
    },
    {
      value: "application",
      label: "Candidature",
      icon: Users,
      color: "text-tacir-green",
    },
    {
      value: "survey",
      label: "Enquête",
      icon: FileText,
      color: "text-tacir-pink",
    },
    {
      value: "custom",
      label: "Personnalisé",
      icon: Star,
      color: "text-tacir-lightblue",
    },
  ];

  const getCategoryIcon = (categoryValue) => {
    const category = categories.find((cat) => cat.value === categoryValue);
    const Icon = category?.icon || FileText;
    return (
      <Icon className={`h-4 w-4 ${category?.color || "text-tacir-darkgray"}`} />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-tacir-lightgray/30 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tacir-green/10 rounded-lg">
              <FileText className="h-6 w-6 text-tacir-green" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-tacir-darkblue">
                Enregistrer comme modèle
              </DialogTitle>
              <DialogDescription className="text-tacir-darkgray">
                Créez un modèle réutilisable à partir de ce formulaire
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 bg-tacir-lightgray/20">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Form Summary */}
            <Card className="p-4 bg-white border-tacir-lightgray/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tacir-blue/10 rounded-lg">
                  <FileText className="h-5 w-5 text-tacir-blue" />
                </div>
                <div>
                  <h4 className="font-semibold text-tacir-darkblue">
                    Formulaire source
                  </h4>
                  <p className="text-sm text-tacir-darkgray">
                    {form?.title?.fr || "Sans titre"} •{" "}
                    {form?.fields?.length || 0} champs
                  </p>
                </div>
              </div>
            </Card>

            {/* Template Configuration */}
            <Card className="p-6 bg-white border-tacir-lightgray/30">
              <div className="space-y-6">
                {/* Titles and Descriptions Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* French Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-tacir-blue rounded-full"></div>
                      <Label className="text-sm font-semibold text-tacir-darkblue">
                        Version Française
                      </Label>
                    </div>

                    <div>
                      <Label
                        htmlFor="title-fr"
                        className="text-sm font-medium text-tacir-darkblue"
                      >
                        Titre du modèle *
                      </Label>
                      <Input
                        id="title-fr"
                        value={templateData.title.fr}
                        onChange={(e) =>
                          setTemplateData((prev) => ({
                            ...prev,
                            title: { ...prev.title, fr: e.target.value },
                          }))
                        }
                        placeholder="Donnez un nom significatif à votre modèle"
                        className="mt-2 border-tacir-lightgray/50 focus:border-tacir-blue"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="desc-fr"
                        className="text-sm font-medium text-tacir-darkblue"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="desc-fr"
                        value={templateData.description.fr}
                        onChange={(e) =>
                          setTemplateData((prev) => ({
                            ...prev,
                            description: {
                              ...prev.description,
                              fr: e.target.value,
                            },
                          }))
                        }
                        placeholder="Décrivez l'utilisation prévue de ce modèle..."
                        rows={4}
                        className="mt-2 border-tacir-lightgray/50 focus:border-tacir-blue resize-none"
                      />
                    </div>
                  </div>

                  {/* Arabic Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-tacir-green rounded-full"></div>
                      <Label className="text-sm font-semibold text-tacir-darkblue">
                        النسخة العربية
                      </Label>
                    </div>

                    <div>
                      <Label
                        htmlFor="title-ar"
                        className="text-sm font-medium text-tacir-darkblue"
                      >
                        عنوان النموذج
                      </Label>
                      <Input
                        id="title-ar"
                        value={templateData.title.ar}
                        onChange={(e) =>
                          setTemplateData((prev) => ({
                            ...prev,
                            title: { ...prev.title, ar: e.target.value },
                          }))
                        }
                        placeholder="أعط اسمًا ذا معنى للنموذج الخاص بك"
                        dir="rtl"
                        className="mt-2 border-tacir-lightgray/50 focus:border-tacir-blue"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="desc-ar"
                        className="text-sm font-medium text-tacir-darkblue"
                      >
                        الوصف
                      </Label>
                      <Textarea
                        id="desc-ar"
                        value={templateData.description.ar}
                        onChange={(e) =>
                          setTemplateData((prev) => ({
                            ...prev,
                            description: {
                              ...prev.description,
                              ar: e.target.value,
                            },
                          }))
                        }
                        placeholder="صف الاستخدام المقصود لهذا النموذج..."
                        dir="rtl"
                        rows={4}
                        className="mt-2 border-tacir-lightgray/50 focus:border-tacir-blue resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Category and Tags */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-tacir-lightgray/30">
                  {/* Category */}
                  <div>
                    <Label className="text-sm font-semibold text-tacir-darkblue flex items-center gap-2 mb-3">
                      <FolderOpen className="h-4 w-4 text-tacir-blue" />
                      Catégorie
                    </Label>
                    <Select
                      value={templateData.category}
                      onValueChange={(value) =>
                        setTemplateData((prev) => ({
                          ...prev,
                          category: value,
                        }))
                      }
                    >
                      <SelectTrigger className="border-tacir-lightgray/50 focus:border-tacir-blue">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(templateData.category)}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => {
                          const Icon = category.icon;
                          return (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                              className="flex items-center gap-2"
                            >
                              <Icon className={`h-4 w-4 ${category.color}`} />
                              {category.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags */}
                  <div>
                    <Label className="text-sm font-semibold text-tacir-darkblue flex items-center gap-2 mb-3">
                      <Tag className="h-4 w-4 text-tacir-blue" />
                      Mots-clés
                    </Label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ajouter un mot-clé..."
                          className="flex-1 border-tacir-lightgray/50 focus:border-tacir-blue"
                        />
                        <Button
                          type="button"
                          onClick={addTag}
                          variant="outline"
                          size="sm"
                          className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue/10"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {templateData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
                          {templateData.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-tacir-lightblue/20 text-tacir-darkblue border-tacir-lightblue/30 pr-1"
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="ml-1 hover:text-tacir-pink transition-colors"
                                aria-label={`Supprimer ${tag}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-tacir-lightgray/30 bg-white gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none border-tacir-darkgray/30 text-tacir-darkgray hover:bg-tacir-lightgray/50"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !templateData.title.fr.trim()}
            className="flex-1 sm:flex-none bg-tacir-green hover:bg-tacir-green/90 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Création...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Créer le modèle
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveAsTemplateDialog;
