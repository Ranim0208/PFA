"use client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Card } from "../../components/ui/card";
import {
  Text as TextIcon,
  Mail,
  MessageSquare,
  Hash,
  Phone,
  List,
  CircleDot,
  CheckSquare,
  Calendar,
  Upload,
  Heading,
  Minus,
  Search,
  Grid3X3,
  ListTree,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getTemplateFields } from "../../services/forms/formServices";
import { Input } from "../../components/ui/input";

// Définir les composants prédéfinis
const predefinedComponents = [
  {
    type: "text",
    label: "Champ Texte",
    icon: TextIcon,
    description: "Champ de saisie de texte basique",
    category: "Saisie",
  },
  {
    type: "email",
    label: "Email",
    icon: Mail,
    description: "Champ email avec validation",
    category: "Saisie",
  },
  {
    type: "textarea",
    label: "Zone de Texte",
    icon: MessageSquare,
    description: "Champ de texte multiligne",
    category: "Saisie",
  },
  {
    type: "number",
    label: "Nombre",
    icon: Hash,
    description: "Champ numérique",
    category: "Saisie",
  },
  {
    type: "phone",
    label: "Téléphone",
    icon: Phone,
    description: "Champ de numéro de téléphone",
    category: "Saisie",
  },
  {
    type: "select",
    label: "Liste Déroulante",
    icon: List,
    description: "Sélection déroulante",
    category: "Sélection",
  },
  {
    type: "radio",
    label: "Boutons Radio",
    icon: CircleDot,
    description: "Options de sélection unique",
    category: "Sélection",
  },
  {
    type: "checkbox",
    label: "Cases à Cocher",
    icon: CheckSquare,
    description: "Options de sélection multiple",
    category: "Sélection",
  },
  {
    type: "date",
    label: "Sélecteur de Date",
    icon: Calendar,
    description: "Sélection de date",
    category: "Spécial",
  },
  {
    type: "file",
    label: "Téléchargement de Fichier",
    icon: Upload,
    description: "Chargement de fichier",
    category: "Spécial",
  },
  {
    type: "section",
    label: "Titre de Section",
    icon: Heading,
    description: "En-tête de section",
    category: "Mise en page",
  },
  {
    type: "divider",
    label: "Séparateur",
    icon: Minus,
    description: "Séparateur visuel",
    category: "Mise en page",
  },
];

const DraggableComponentCard = ({
  component,
  onAddField,
  isTemplate = false,
}) => {
  const handleDragStart = (e) => {
    const dragData = {
      component: component,
      isTemplate: isTemplate,
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "copy";

    // Add visual feedback
    setTimeout(() => {
      if (e.target) {
        e.target.style.opacity = "0.6";
      }
    }, 0);
  };

  const handleDragEnd = (e) => {
    // Reset visual feedback
    if (e.target) {
      e.target.style.opacity = "1";
    }
  };

  const Icon = isTemplate ? ListTree : component.icon;

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="p-3 cursor-grab hover:cursor-grab active:cursor-grabbing hover:border-tacir-blue/50 hover:shadow-md transition-all duration-200 border-tacir-lightgray/30 group select-none"
      onClick={() => onAddField(component, isTemplate)}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg group-hover:scale-105 transition-all ${
            isTemplate
              ? "bg-tacir-green/10 group-hover:bg-tacir-green/20"
              : "bg-tacir-blue/10 group-hover:bg-tacir-blue/20"
          }`}
        >
          <Icon
            className={`h-4 w-4 ${
              isTemplate ? "text-tacir-green" : "text-tacir-blue"
            }`}
          />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-tacir-darkblue text-sm flex items-center gap-2">
            {isTemplate ? component.label.fr : component.label}
            <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-xs text-tacir-darkgray mt-1">
            {isTemplate ? component.label.ar : component.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="inline-block text-xs px-2 py-1 bg-tacir-lightgray/30 text-tacir-darkgray rounded-full">
              {isTemplate ? component.type : component.category}
            </span>
            {isTemplate && (
              <span className="text-xs text-tacir-green font-medium">
                Modèle
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Drag indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-2 h-2 bg-tacir-blue rounded-full"></div>
        <div className="w-2 h-2 bg-tacir-blue rounded-full mt-1"></div>
        <div className="w-2 h-2 bg-tacir-blue rounded-full mt-1"></div>
      </div>
    </Card>
  );
};

const ComponentPanel = ({ onAddField, setShowPredefined }) => {
  const [templateFields, setTemplateFields] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    getTemplateFields({ page: 1, pageSize: 30 }).then(setTemplateFields);
  }, []);

  const categories = ["all", "Saisie", "Sélection", "Spécial", "Mise en page"];
  const filteredPredefined = predefinedComponents.filter((component) => {
    const matchesSearch =
      component.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || component.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredTemplates = templateFields.filter((field) => {
    return (
      field.label.fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.label.ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="w-80 bg-white border-r border-tacir-lightgray/30 h-full overflow-auto flex flex-col shadow-sm">
      {/* En-tête */}
      <div className="p-4 border-b border-tacir-lightgray/30 bg-gradient-to-r from-tacir-blue/5 to-tacir-lightblue/5">
        <h2 className="text-lg font-semibold text-tacir-darkblue mb-3 flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-tacir-blue" />
          Palette des Champs
        </h2>

        {/* Barre de recherche */}
        <div className="relative bg-white rounded-lg mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-tacir-darkgray" />
          <Input
            placeholder="Rechercher un champ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-tacir-lightgray/50 focus:border-tacir-blue"
          />
        </div>

        {/* Instructions */}
        <div className="text-xs text-tacir-darkgray bg-tacir-lightgray/20 p-2 rounded-lg">
          <p className="flex items-center gap-1">
            <span className="w-2 h-2 bg-tacir-blue rounded-full"></span>
            Cliquez ou glissez vers le formulaire
          </p>
        </div>
      </div>

      <Tabs defaultValue="predefined" className="w-full flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b border-tacir-lightgray/30 bg-white">
          <TabsTrigger
            value="predefined"
            className="flex-1 data-[state=active]:bg-tacir-blue data-[state=active]:text-white data-[state=active]:shadow-sm"
            onClick={() => setShowPredefined(true)}
          >
            Prédéfini
          </TabsTrigger>
          <TabsTrigger
            value="custom"
            className="flex-1 data-[state=active]:bg-tacir-blue data-[state=active]:text-white data-[state=active]:shadow-sm"
            onClick={() => setShowPredefined(false)}
          >
            Modèles
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="predefined"
          className="flex-1 overflow-auto p-0 m-0"
        >
          {/* Filtres de catégorie */}
          <div className="p-3 border-b border-tacir-lightgray/30 bg-tacir-lightgray/10">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    activeCategory === category
                      ? "bg-tacir-blue text-white"
                      : "bg-white text-tacir-darkgray border border-tacir-lightgray/50 hover:bg-tacir-lightgray/20"
                  }`}
                >
                  {category === "all" ? "Tous" : category}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 space-y-2">
            {filteredPredefined.length > 0 ? (
              filteredPredefined.map((component) => (
                <DraggableComponentCard
                  key={component.type}
                  component={component}
                  onAddField={onAddField}
                  isTemplate={false}
                />
              ))
            ) : (
              <div className="text-center p-6 text-tacir-darkgray">
                <Search className="h-8 w-8 mx-auto mb-2 text-tacir-lightgray" />
                <p className="text-sm">Aucun champ trouvé</p>
                <p className="text-xs mt-1">
                  Essayez avec d'autres termes de recherche
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="flex-1 overflow-auto p-0 m-0">
          <div className="p-3 space-y-2">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((field) => (
                <DraggableComponentCard
                  key={field._id}
                  component={field}
                  onAddField={onAddField}
                  isTemplate={true}
                />
              ))
            ) : (
              <div className="text-center p-6 text-tacir-darkgray">
                <ListTree className="h-8 w-8 mx-auto mb-2 text-tacir-lightgray" />
                <p className="text-sm">Aucun modèle trouvé</p>
                <p className="text-xs mt-1">
                  {searchTerm
                    ? "Essayez avec d'autres termes de recherche"
                    : "Créez votre premier modèle"}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComponentPanel;
