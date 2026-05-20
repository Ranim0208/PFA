"use client";
import { useState } from "react";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Search,
  Plus,
  FileText,
  Calendar,
  MapPin,
  Award,
  Users,
  Star,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";

const TemplateManager = ({
  open,
  onOpenChange,
  templates,
  onApplyTemplate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { value: "all", label: "Tous", count: templates.length },
    {
      value: "event",
      label: "Événements",
      count: templates.filter((t) => t.templateCategory === "event").length,
    },
    {
      value: "contest",
      label: "Concours",
      count: templates.filter((t) => t.templateCategory === "contest").length,
    },
    {
      value: "application",
      label: "Candidatures",
      count: templates.filter((t) => t.templateCategory === "application")
        .length,
    },
    {
      value: "survey",
      label: "Enquêtes",
      count: templates.filter((t) => t.templateCategory === "survey").length,
    },
    {
      value: "custom",
      label: "Personnalisés",
      count: templates.filter((t) => t.templateCategory === "custom").length,
    },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.title.ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.fr
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      template.description?.ar
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      template.templateTags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      activeCategory === "all" || template.templateCategory === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const getTemplateIcon = (template) => {
    const icons = {
      event: <Calendar className="h-5 w-5 text-tacir-blue" />,
      contest: <Award className="h-5 w-5 text-tacir-yellow" />,
      application: <Users className="h-5 w-5 text-tacir-green" />,
      survey: <FileText className="h-5 w-5 text-tacir-pink" />,
      custom: <Star className="h-5 w-5 text-tacir-lightblue" />,
    };
    return (
      icons[template.templateCategory] || (
        <FileText className="h-5 w-5 text-tacir-darkgray" />
      )
    );
  };

  const getCategoryColor = (category) => {
    const colors = {
      event: "bg-tacir-blue/10 text-tacir-blue border-tacir-blue/20",
      contest: "bg-tacir-yellow/10 text-tacir-yellow border-tacir-yellow/20",
      application: "bg-tacir-green/10 text-tacir-green border-tacir-green/20",
      survey: "bg-tacir-pink/10 text-tacir-pink border-tacir-pink/20",
      custom:
        "bg-tacir-lightblue/10 text-tacir-lightblue border-tacir-lightblue/20",
    };
    return (
      colors[category] ||
      "bg-tacir-lightgray text-tacir-darkgray border-tacir-lightgray"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] lg:max-w-[90vw] lg:w-[90vw] xl:max-w-[85vw] xl:w-[85vw] 2xl:max-w-[80vw] 2xl:w-[80vw] max-h-[90vh] overflow-hidden flex flex-col p-0 mx-auto">
        <DialogHeader className="px-6 py-4 border-b border-tacir-lightgray/30 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-tacir-darkblue flex items-center gap-3">
                <div className="p-2 bg-tacir-blue/10 rounded-lg">
                  <FileText className="h-6 w-6 text-tacir-blue" />
                </div>
                Gestionnaire de modèles
              </DialogTitle>
              <DialogDescription className="text-tacir-darkgray mt-1">
                Sélectionnez un modèle pour créer un nouveau formulaire
                rapidement
              </DialogDescription>
            </div>
            <div className="text-sm text-tacir-darkgray">
              {filteredTemplates.length} modèle
              {filteredTemplates.length !== 1 ? "s" : ""} disponible
              {filteredTemplates.length !== 1 ? "s" : ""}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col bg-tacir-lightgray/20">
          {/* Search and Filters */}
          <div className="p-6 pb-4 bg-white border-b border-tacir-lightgray/30">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search Bar */}
              <div className="lg:flex-1">
                <div className="relative max-w-2xl w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-tacir-darkgray" />
                  <Input
                    placeholder="Rechercher des modèles par nom, description ou mot-clé..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10 h-11 border-tacir-lightgray/50 focus:border-tacir-blue text-base w-full"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tacir-darkgray hover:text-tacir-pink transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Tabs */}
              <div className="lg:w-auto overflow-x-auto">
                <Tabs
                  value={activeCategory}
                  onValueChange={setActiveCategory}
                  className="w-full"
                >
                  <TabsList className="bg-tacir-lightgray/30 p-1 flex-nowrap whitespace-nowrap min-w-max">
                    {categories.map((category) => (
                      <TabsTrigger
                        key={category.value}
                        value={category.value}
                        className="text-sm data-[state=active]:bg-white data-[state=active]:text-tacir-darkblue data-[state=active]:shadow-sm whitespace-nowrap px-3 py-2"
                      >
                        {category.label}
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-tacir-lightgray text-tacir-darkgray text-xs min-w-[20px] flex items-center justify-center"
                        >
                          {category.count}
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-auto p-6">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12 text-tacir-darkgray flex-1 flex flex-col items-center justify-center">
                {searchTerm || activeCategory !== "all" ? (
                  <div className="space-y-4">
                    <Search className="h-20 w-20 mx-auto text-tacir-lightgray" />
                    <p className="text-xl font-semibold text-tacir-darkblue">
                      Aucun modèle trouvé
                    </p>
                    <p className="text-tacir-darkgray text-lg">
                      {searchTerm
                        ? `Aucun résultat pour "${searchTerm}"`
                        : `Aucun modèle dans la catégorie "${
                            categories.find((c) => c.value === activeCategory)
                              ?.label
                          }"`}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setActiveCategory("all");
                      }}
                      className="mt-4 border-tacir-blue text-tacir-blue hover:bg-tacir-blue/10 px-6 py-2"
                    >
                      Réinitialiser les filtres
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6 max-w-md">
                    <FileText className="h-24 w-24 mx-auto text-tacir-lightgray" />
                    <p className="text-xl font-semibold text-tacir-darkblue">
                      Aucun modèle disponible
                    </p>
                    <p className="text-tacir-darkgray text-lg leading-relaxed">
                      Créez votre premier modèle en enregistrant un formulaire
                      existant comme modèle réutilisable
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template._id}
                    className="p-6 hover:shadow-lg lg:max-w-lg transition-all duration-300 border-tacir-lightgray/50 group cursor-pointer bg-white flex flex-col h-full min-w-0" // Added min-w-0 to prevent overflow
                  >
                    {/* Header with Icon and Title */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-tacir-lightgray/30 rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                        {getTemplateIcon(template)}
                      </div>

                      <div className="flex-1 min-w-0">
                        {" "}
                        {/* Added min-w-0 */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-tacir-darkblue text-lg leading-tight line-clamp-2 group-hover:text-tacir-blue transition-colors break-words">
                            {template.title.fr}
                          </h3>
                          <Badge
                            className={`text-xs border ${getCategoryColor(
                              template.templateCategory
                            )} flex-shrink-0`}
                          >
                            {template.templateCategory}
                          </Badge>
                        </div>
                        {/* Description */}
                        <p className="text-tacir-darkgray text-sm leading-relaxed line-clamp-3 break-words">
                          {template.description?.fr ||
                            "Aucune description fournie"}
                        </p>
                      </div>
                    </div>

                    {/* Template Metadata */}
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-tacir-darkgray">
                          <span className="flex items-center gap-1 bg-tacir-lightblue/10 text-tacir-lightblue px-2 py-1 rounded-full">
                            <FileText className="h-3 w-3" />
                            {template.fields?.length || 0} champs
                          </span>
                          {template.templateUsageCount > 0 && (
                            <span className="flex items-center gap-1 bg-tacir-green/10 text-tacir-green px-2 py-1 rounded-full">
                              <Users className="h-3 w-3" />
                              {template.templateUsageCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      {template.templateTags?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {template.templateTags
                            .slice(0, 3)
                            .map((tag, index) => (
                              <span
                                key={index}
                                className="bg-tacir-lightgray/50 text-tacir-darkgray text-xs px-2 py-1 rounded-full break-words max-w-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          {template.templateTags.length > 3 && (
                            <span className="text-tacir-darkgray text-xs px-2 py-1">
                              +{template.templateTags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        size="sm"
                        className="w-full bg-tacir-blue hover:bg-tacir-darkblue text-white transition-all duration-300 group-hover:scale-105 mt-3"
                        onClick={() => onApplyTemplate(template._id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Utiliser ce modèle
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateManager;
