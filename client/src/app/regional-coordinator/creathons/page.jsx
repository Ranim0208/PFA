"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  MapPin,
  Plus,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  BarChart3,
  Sparkles,
  Info,
  ChevronDown,
  Lightbulb,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreathonForm from "@/features/creathons/regional/creathonForm";
import {
  getCreathonsByRegion,
  getCreathonStatsByRegion,
} from "@/services/creathons/creathons";
import { toast } from "react-toastify";
import { CreathonDetails } from "@/features/creathons/regional/CreathonDetails";
import Loader from "@/components/ui/Loader";

const RegionalDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCreathon, setEditingCreathon] = useState(null);
  const [selectedCreathon, setSelectedCreathon] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [regionalStats, setRegionalStats] = useState([]);
  const [creathon, setCreathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRegion, setUserRegion] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return "";

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  useEffect(() => {
    const fetchCreathonAndStats = async () => {
      try {
        setLoading(true);

        const regionName =
          typeof window !== "undefined"
            ? localStorage.getItem("regionName")
            : "";
        const regionId =
          typeof window !== "undefined"
            ? localStorage.getItem("userRegionId") || null
            : null;

        if (!regionId || regionId === "null") {
          return;
        }

        setUserRegion(regionName);
        const [creathonRes, statsRes] = await Promise.all([
          getCreathonsByRegion(regionId),
          getCreathonStatsByRegion(regionId),
        ]);

        const currentCreathon = creathonRes || null;

        if (currentCreathon?.dates) {
          currentCreathon.startDate = currentCreathon.dates.startDate;
          currentCreathon.endDate = currentCreathon.dates.endDate;
          currentCreathon.registrationDeadline =
            currentCreathon.dates.registrationDeadline;
        }

        const stats = statsRes?.stats || {};
        setCreathon(currentCreathon);

        const updatedStats = currentCreathon
          ? [
              {
                title: "Créathon Actuel",
                value: "1",
                description: `Créathon principal de la région ${regionName}`,
                icon: Calendar,
                color: "text-tacir-lightblue",
                bgColor: "bg-tacir-lightblue/10",
              },
              {
                title: "Participants Prévus",
                value: stats.participantCount?.toString() || "0",
                description: "Estimation pour le créathon régional",
                icon: Users,
                color: "text-tacir-blue",
                bgColor: "bg-tacir-blue/10",
              },
              {
                title: "Validation",
                value: currentCreathon.validations?.componentValidation
                  ?.validatedBy
                  ? "Validé"
                  : "En attente",
                description: "Validation coordinateur de composante",
                icon: CheckCircle,
                color: currentCreathon.validations?.componentValidation
                  ?.validatedBy
                  ? "text-tacir-green"
                  : "text-tacir-yellow",
                bgColor: currentCreathon.validations?.componentValidation
                  ?.validatedBy
                  ? "bg-tacir-green/10"
                  : "bg-tacir-yellow/10",
              },
            ]
          : [
              {
                title: "Aucun Créathon",
                value: "0",
                description: "Créez votre premier créathon",
                icon: Calendar,
                color: "text-tacir-darkgray",
                bgColor: "bg-tacir-lightgray",
              },
              {
                title: "Participants",
                value: "0",
                description: "Aucun participant prévu",
                icon: Users,
                color: "text-tacir-darkgray",
                bgColor: "bg-tacir-lightgray",
              },
              {
                title: "Statut",
                value: "Non créé",
                description: "Créez un créathon pour commencer",
                icon: CheckCircle,
                color: "text-tacir-darkgray",
                bgColor: "bg-tacir-lightgray",
              },
            ];

        setRegionalStats(updatedStats);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchCreathonAndStats();
  }, []);

  const handleEdit = (creathon) => {
    if (!creathon) {
      setEditingCreathon(null);
      setShowForm(true);
      return;
    }
    const formReadyData = {
      ...creathon,
      dates: {
        startDate: creathon.startDate
          ? new Date(creathon.startDate).toISOString().split("T")[0]
          : "",
        endDate: creathon.endDate
          ? new Date(creathon.endDate).toISOString().split("T")[0]
          : "",
        registrationDeadline: creathon.registrationDeadline
          ? new Date(creathon.registrationDeadline).toISOString().split("T")[0]
          : "",
      },
      location: creathon.location || { address: "", city: "", venue: "" },
      capacity: creathon.capacity || { maxParticipants: 50, maxTeams: 10 },
      jury: creathon.jury || { numberOfJuries: 5 },
      mentors: creathon.mentors || { numberOfMentors: 10 },
      coordinators: creathon.coordinators || {
        componentCoordinator: "",
        generalCoordinator: "",
      },
      budget: creathon.budget || {
        totalBudget: 0,
        allocatedBudget: 0,
        expenses: [],
      },
      resources: creathon.resources || {
        materials: [],
        equipment: [],
        facilities: [],
      },
    };

    setEditingCreathon(formReadyData);
    setShowForm(true);
  };

  const handleView = (creathon) => {
    setSelectedCreathon(creathon);
    setShowDetails(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCreathon(null);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedCreathon(null);
  };

  const getComponentIcon = (component) => {
    switch (component) {
      case "crea":
        return <Sparkles className="h-4 w-4" />;
      case "tech":
        return <BarChart3 className="h-4 w-4" />;
      case "business":
        return <Users className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getComponentColor = (component) => {
    switch (component) {
      case "crea":
        return "bg-tacir-pink/10 text-tacir-pink border-tacir-pink";
      case "tech":
        return "bg-tacir-lightblue/10 text-tacir-lightblue border-tacir-lightblue";
      case "business":
        return "bg-tacir-green/10 text-tacir-green border-tacir-green";
      default:
        return "bg-tacir-blue/10 text-tacir-blue border-tacir-blue";
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4 mx-auto py-4 sm:py-6 md:py-6 px-3 sm:px-4 md:px-6 container bg-tacir-lightgray min-h-screen">
      {/* Header - Optimized for desktop */}
      <div className="bg-white rounded-lg sm:rounded-xl md:rounded-xl shadow-xs sm:shadow-sm md:shadow-md p-3 sm:p-4 md:p-4 border border-tacir-lightgray/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 md:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-3 flex-1 min-w-0">
            <div className="p-1.5 sm:p-2 md:p-2 bg-tacir-blue rounded-md sm:rounded-lg md:rounded-lg shadow-xs sm:shadow-sm md:shadow-md flex-shrink-0">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-tacir-darkblue break-words leading-tight">
                Gestion des Créathons Régionaux
              </h1>
              <p className="text-tacir-darkgray mt-0.5 sm:mt-1 text-xs sm:text-sm md:text-sm break-words">
                Création et gestion du créathon principal de la région{" "}
                <span className="font-semibold text-tacir-blue">
                  {userRegion}
                </span>
              </p>
            </div>
          </div>

          <Button
            onClick={() => handleEdit(creathon || null)}
            className="bg-tacir-blue hover:bg-tacir-blue/90 w-full md:w-auto mt-2 md:mt-0 text-xs sm:text-sm h-8 sm:h-9 md:h-9 justify-center min-w-[140px] sm:min-w-[160px] md:min-w-[160px]"
          >
            <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3 md:w-3 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">
              {creathon ? "Modifier le Créathon" : "Créer un Créathon"}
            </span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-3">
        {regionalStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-sm sm:hover:shadow-md transition-all duration-200 border-0 bg-white rounded-lg sm:rounded-xl md:rounded-lg overflow-hidden"
            >
              <CardContent className="p-2.5 sm:p-3 md:p-3">
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-tacir-darkgray truncate leading-tight">
                      {stat.title}
                    </p>
                    <p
                      className={`text-base sm:text-lg md:text-lg font-bold mt-1 sm:mt-2 ${stat.color} break-words leading-tight`}
                    >
                      {stat.value}
                    </p>
                    <p className="text-xs text-tacir-darkgray mt-1 line-clamp-2 leading-relaxed">
                      {stat.description}
                    </p>
                  </div>
                  <div
                    className={`p-1.5 sm:p-2 md:p-1.5 rounded-md sm:rounded-lg md:rounded-md ${stat.bgColor} flex-shrink-0 ml-1 sm:ml-2 md:ml-2`}
                  >
                    <Icon
                      className={`h-3 w-3 sm:h-4 sm:w-4 md:h-4 md:w-4 ${stat.color}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Creathon Card */}
      {creathon ? (
        <Card className="border-0 shadow-sm sm:shadow-md bg-white">
          <CardHeader className="p-3 sm:p-4 md:p-4 pb-2 sm:pb-2">
            <CardTitle className="text-tacir-darkblue text-base sm:text-lg md:text-lg">
              Crathon Principal - Région {userRegion}
            </CardTitle>
            <CardDescription className="text-tacir-darkgray text-xs sm:text-sm md:text-sm">
              Détails logistiques du créathon régional
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-4 pt-0">
            <div className="flex flex-col lg:flex-row items-start justify-between p-4 sm:p-4 md:p-4 border border-tacir-lightgray rounded-lg hover:bg-tacir-lightgray/20 transition-colors">
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-3">
                  <h4 className="text-base sm:text-lg md:text-lg font-bold text-tacir-darkblue break-words">
                    {creathon.title}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      className={`${getComponentColor(
                        creathon.component,
                      )} text-xs`}
                    >
                      {getComponentIcon(creathon.component)}
                      <span className="ml-1">
                        {creathon.component?.toUpperCase()}
                      </span>
                    </Badge>
                    <Badge
                      variant={
                        creathon.validations?.componentValidation?.validatedBy
                          ? "success"
                          : "warning"
                      }
                      className={`text-xs ${
                        creathon.validations?.componentValidation?.validatedBy
                          ? "bg-tacir-green text-white"
                          : "bg-tacir-yellow text-white"
                      }`}
                    >
                      {creathon.validations?.componentValidation?.validatedBy
                        ? "Validé"
                        : "À valider"}
                    </Badge>
                  </div>
                </div>

                <p className="text-tacir-darkgray mb-3 sm:mb-3 text-xs sm:text-sm md:text-sm break-words">
                  {creathon.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-3 mb-3 sm:mb-3">
                  <div className="flex items-center gap-2 text-tacir-darkgray text-xs sm:text-sm md:text-sm">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 md:h-3 md:w-3 text-tacir-blue flex-shrink-0" />
                    <span className="break-words">
                      {creathon.location?.venue}, {creathon.location?.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-tacir-darkgray text-xs sm:text-sm md:text-sm">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 md:h-3 md:w-3 text-tacir-blue flex-shrink-0" />
                    <span className="break-words">
                      {formatDate(creathon.dates?.startDate)} -{" "}
                      {formatDate(creathon.dates?.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-tacir-darkgray text-xs sm:text-sm md:text-sm">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 md:h-3 md:w-3 text-tacir-blue flex-shrink-0" />
                    <span className="break-words">
                      {creathon.mentors?.numberOfMentors} mentors •{" "}
                      {creathon.jury?.numberOfJuries} jurés
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-tacir-darkgray text-xs sm:text-sm md:text-sm">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 md:h-3 md:w-3 text-tacir-blue flex-shrink-0" />
                    <span className="break-words">
                      {creathon.capacity?.maxParticipants} participants max
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                <Button
                  variant="outline"
                  onClick={() => handleView(creathon)}
                  className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white flex-1 sm:flex-none text-xs h-8 sm:h-8"
                >
                  <Eye className="h-3 w-3 mr-1 sm:mr-1" />
                  <span className="truncate">Voir détails</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleEdit(creathon)}
                  className="border-tacir-lightblue text-tacir-lightblue hover:bg-tacir-lightblue hover:text-white flex-1 sm:flex-none text-xs h-8 sm:h-8"
                >
                  <Edit className="h-3 w-3 mr-1 sm:mr-1" />
                  <span className="truncate">Modifier</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Empty State Card - Reduced height for desktop */
        <Card className="border-0 shadow-sm sm:shadow-md bg-white">
          <CardContent className="p-4 sm:p-6 md:p-6 text-center">
            <div className="flex flex-col md:items-center md:justify-center gap-4">
              <div className="flex-1 md:text-center">
                <Calendar className="h-8 w-8 sm:h-10 sm:w-10 md:h-8 md:w-8 mx-auto text-tacir-darkgray/40 mb-2" />
                <h3 className="text-base sm:text-lg md:text-lg font-semibold text-tacir-darkblue mb-1">
                  Aucun créathon créé
                </h3>
                <p className="text-tacir-darkgray text-xs sm:text-sm md:text-sm">
                  Commencez par créer un créathon pour votre région {userRegion}
                </p>
              </div>
              <Button
                onClick={() => handleEdit(null)}
                className="bg-tacir-blue hover:bg-tacir-blue/90 text-xs sm:text-sm h-8 sm:h-9 md:h-9 w-full md:w-auto md:min-w-[160px]"
              >
                <Plus className="h-3 w-3 sm:h-3 sm:w-3 mr-1 sm:mr-1" />
                Créer un Créathon
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Information Card */}
      <Card className="border-0 shadow-sm sm:shadow-md bg-white hover:shadow-lg transition-all duration-300">
        <CardHeader
          className="cursor-pointer p-3 sm:p-4 md:p-4"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-tacir-darkblue flex items-center gap-2 text-sm sm:text-base md:text-base">
              <Info className="h-4 w-4 sm:h-4 sm:w-4 text-tacir-lightblue" />
              Guide de Validation - Processus Important
            </CardTitle>
            <ChevronDown
              className={`h-4 w-4 sm:h-4 sm:w-4 text-tacir-darkgray transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </CardHeader>

        <CardContent
          className={`overflow-hidden transition-all duration-500 px-3 sm:px-4 md:px-4 ${
            isExpanded ? "max-h-[500px] overflow-y-auto" : "max-h-0"
          }`}
        >
          <div className="space-y-3 sm:space-y-3 pb-2">
            {/* Process Timeline */}
            <div className="relative">
              <div className="absolute left-3 sm:left-3 top-0 h-full w-0.5 bg-tacir-lightblue/30"></div>

              <div className="flex items-start gap-3 sm:gap-3 mb-3 sm:mb-4 relative">
                <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-tacir-yellow/20 border-2 border-tacir-yellow flex items-center justify-center">
                  <span className="text-xs font-bold text-tacir-yellow">1</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-tacir-darkblue text-sm sm:text-sm">
                    Phase Régionale
                  </h4>
                  <p className="text-xs text-tacir-darkgray mt-1 break-words">
                    Vous complétez tous les détails logistiques du créathon
                  </p>
                  <Badge className="bg-tacir-yellow/20 text-tacir-yellow border-0 mt-1 text-xs">
                    En cours
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-3 mb-3 sm:mb-4 relative">
                <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-tacir-lightblue/20 border-2 border-tacir-lightblue flex items-center justify-center">
                  <span className="text-xs font-bold text-tacir-lightblue">
                    2
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-tacir-darkblue text-sm sm:text-sm">
                    Validation Composante
                  </h4>
                  <p className="text-xs text-tacir-darkgray mt-1 break-words">
                    Le coordinateur de composante valide votre création
                  </p>
                  <Badge className="bg-tacir-lightblue/20 text-tacir-lightblue border-0 mt-1 text-xs">
                    Prochainement
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-3 relative">
                <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-tacir-green/20 border-2 border-tacir-green flex items-center justify-center">
                  <span className="text-xs font-bold text-tacir-green">3</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-tacir-darkblue text-sm sm:text-sm">
                    Gestion Équipe
                  </h4>
                  <p className="text-xs text-tacir-darkgray mt-1 break-words">
                    Le coordinateur gère mentors et jury après validation
                  </p>
                  <Badge className="bg-tacir-green/20 text-tacir-green border-0 mt-1 text-xs">
                    Finalisation
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-tacir-lightgray/30 rounded-lg p-3 sm:p-3">
              <h4 className="font-semibold text-tacir-darkblue mb-2 flex items-center gap-2 text-sm sm:text-sm">
                <Lightbulb className="h-3 w-3 sm:h-3 sm:w-3 text-tacir-yellow" />
                Conseils Rapides
              </h4>
              <ul className="text-xs text-tacir-darkgray space-y-1 sm:space-y-1">
                <li className="flex items-start gap-2 break-words">
                  <span className="text-tacir-green flex-shrink-0">✓</span>
                  Vérifiez tous les détails logistiques avant soumission
                </li>
                <li className="flex items-start gap-2 break-words">
                  <span className="text-tacir-green flex-shrink-0">✓</span>
                  Assurez-vous des disponibilités des lieux et dates
                </li>
                <li className="flex items-start gap-2 break-words">
                  <span className="text-tacir-green flex-shrink-0">✓</span>
                  Coordinateur composante: contact@creathon.ma
                </li>
              </ul>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 p-2 bg-tacir-lightblue/10 rounded-lg">
              <div
                className={`w-2 h-2 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${
                  creathon
                    ? "animate-pulse bg-tacir-yellow"
                    : "bg-tacir-darkgray"
                }`}
              ></div>
              <span className="text-xs text-tacir-darkblue break-words">
                {creathon
                  ? "En attente de validation composante"
                  : "Prêt à créer votre premier créathon"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="!max-w-4xl w-[95vw] xs:w-[90vw] sm:w-full max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto mx-auto p-0 sm:p-4 md:p-4 rounded-none sm:rounded-lg">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-4 pb-2">
            <DialogTitle className="text-tacir-darkblue text-lg sm:text-xl md:text-xl">
              {editingCreathon ? "Modifier le Créathon" : "Nouveau Créathon"}
            </DialogTitle>
            <DialogDescription className="text-tacir-darkgray text-sm sm:text-sm">
              {editingCreathon
                ? "Modifiez les détails du créathon"
                : "Remplissez les informations du créathon"}
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 sm:px-6 pb-4 sm:pb-4">
            <CreathonForm
              onClose={handleCloseForm}
              creathon={editingCreathon}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-5xl w-[95vw] xs:w-[90vw] sm:w-full max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto mx-auto p-0 sm:p-4 md:p-4 rounded-none sm:rounded-lg">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-4 pb-2">
            <DialogTitle className="text-tacir-darkblue text-lg sm:text-xl md:text-xl">
              Détails du Créathon
            </DialogTitle>
            <DialogDescription className="text-tacir-darkgray text-sm sm:text-sm">
              Informations complètes sur le créathon régional
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 sm:px-6 pb-4 sm:pb-4">
            {selectedCreathon && (
              <CreathonDetails creathon={selectedCreathon} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegionalDashboard;
