"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  BookOpen,
  Loader2,
  AlertCircle,
  Filter,
  Search,
  X,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { getTrainings } from "@/services/trainings/training";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "@/components/common/CustomPagination";
import InteractiveCalendar from "@/features/trainings/components/InteractiveCalendar";
import { TrainingStatsCard } from "@/features/trainings/components/TrainingStatsCard";
import TrainingDetailsModal from "@/features/trainings/components/TrainingDetailsModal";
import { typeConfig } from "@/features/trainings/components/style.config";
import { apiClient } from "@/hooks/apiClient";
import { apiBaseUrl } from "@/utils/constants";
import TrainingFiltersProjectHolder from "@/features/trainings/components/TrainingFiltersProjectHolder";
import MentoringPresenceModal from "@/features/trainings/modals/MentoringPresenceModal";
import { getTrainerNames } from "@/utils/common";

// Define training types for filtering
const TRAINING_TYPES = [
  { value: "all", label: "Tous les types" },
  { value: "formation", label: "Formations" },
  { value: "bootcamp", label: "Bootcamps" },
  { value: "mentoring", label: "Sessions de mentorat" },
];

export default function ProjectHolderTrainingsPage() {
  const [activeTab, setActiveTab] = useState("trainings");
  const [trainingSubTab, setTrainingSubTab] = useState("upcoming");
  const [allTrainings, setAllTrainings] = useState([]);
  const [filteredTrainings, setFilteredTrainings] = useState([]);
  const [displayedTrainings, setDisplayedTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    formation: 0,
    bootcamp: 0,
    mentoring: 0,
    upcoming: 0,
    past: 0,
  });
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [userRegion, setUserRegion] = useState(null);
  const [regionLoading, setRegionLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mentoringModalOpen, setMentoringModalOpen] = useState(false);
  const [selectedMentoring, setSelectedMentoring] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const matchesUserRegion = (cohort) => {
    if (!userRegion || !cohort) return false;

    const expectedCohortFormat = `${userRegion.name} / ${userRegion.arabicName}`;
    return cohort.toLowerCase() === expectedCohortFormat.toLowerCase();
  };

  const fetchUserRegion = async () => {
    try {
      setRegionLoading(true);
      const response = await apiClient(
        `${apiBaseUrl}/accepted-participants/me`
      );

      if (response.data?.region) {
        setUserRegion({
          _id: response.data.region._id,
          name: response.data.region.name.fr.toLowerCase(),
          arabicName: response.data.region.name.ar,
        });
      } else {
        throw new Error("No region assigned");
      }
    } catch (err) {
      console.error("Region fetch error:", err);
      setError("Erreur lors du chargement des informations de région");
      toast.error("Erreur lors du chargement de votre région");
    } finally {
      setRegionLoading(false);
    }
  };

  const filterTrainingsByRegion = (trainings) => {
    if (!userRegion) return [];
    return trainings.filter(
      (training) =>
        training.cohorts &&
        training.cohorts.some((cohort) => matchesUserRegion(cohort))
    );
  };

  const applyFilters = (trainings) => {
    const now = new Date();
    return trainings.filter((training) => {
      // Filtre par date
      const trainingDate = new Date(training.startDate);
      if (trainingSubTab === "upcoming" && trainingDate < now) return false;
      if (trainingSubTab === "past" && trainingDate >= now) return false;

      // Type filter
      if (filters.type !== "all" && training.type !== filters.type) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = training.title
          ?.toLowerCase()
          .includes(searchLower);
        const matchesDescription = training.description
          ?.toLowerCase()
          .includes(searchLower);
        const matchesLocation = training.location
          ?.toLowerCase()
          .includes(searchLower);
        const matchesTrainer = getTrainerNames(training.trainers)
          .toLowerCase()
          .includes(searchLower);

        if (
          !(
            matchesTitle ||
            matchesDescription ||
            matchesLocation ||
            matchesTrainer
          )
        ) {
          return false;
        }
      }

      return true;
    });
  };

  const fetchTrainingsData = async () => {
    try {
      setLoading(true);
      const response = await getTrainings({
        status: "approved",
        limit: 1000,
      });

      const regionTrainings = filterTrainingsByRegion(response.data || []);
      setAllTrainings(regionTrainings);

      // Calcul des stats avec séparation upcoming/past
      const now = new Date();
      const upcomingTrainings = regionTrainings.filter(
        (t) => new Date(t.startDate) >= now
      );
      const pastTrainings = regionTrainings.filter(
        (t) => new Date(t.startDate) < now
      );

      setStats({
        total: regionTrainings.length,
        formation: regionTrainings.filter((t) => t.type === "formation").length,
        bootcamp: regionTrainings.filter((t) => t.type === "bootcamp").length,
        mentoring: regionTrainings.filter((t) => t.type === "mentoring").length,
        upcoming: upcomingTrainings.length,
        past: pastTrainings.length,
      });
    } catch (err) {
      console.error("Trainings fetch error:", err);
      setError("Erreur lors du chargement des formations");
      toast.error("Erreur lors du chargement des formations");
      setAllTrainings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const response = await getTrainings({
        status: "approved",
        limit: 1000,
      });

      setCalendarEvents(filterTrainingsByRegion(response.data || []));
    } catch (err) {
      console.error("Calendar events error:", err);
      setCalendarEvents([]);
    }
  };

  useEffect(() => {
    fetchUserRegion();
  }, []);

  useEffect(() => {
    if (userRegion) {
      fetchTrainingsData();
      if (activeTab === "calendar") {
        fetchCalendarEvents();
      }
    }
  }, [userRegion, activeTab]);

  // Appliquer les filtres et la pagination
  useEffect(() => {
    if (!userRegion) return;

    // Appliquer les filtres
    const filtered = applyFilters(allTrainings);
    setFilteredTrainings(filtered);

    // Calculer la pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / pagination.limit);

    setPagination((prev) => ({
      ...prev,
      page: 1,
      total,
      totalPages,
    }));
  }, [allTrainings, filters, userRegion, trainingSubTab]);

  // Mettre à jour les formations affichées
  useEffect(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    setDisplayedTrainings(filteredTrainings.slice(start, end));
  }, [filteredTrainings, pagination.page, pagination.limit]);

  // Réinitialiser la pagination lors du changement d'onglet
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [trainingSubTab]);

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      type: "all",
    });
  };

  // Update handleViewDetails function
  const handleViewDetails = (training) => {
    // For online mentoring, open the special modal
    if (training.type === "mentoring" && training.sessionType === "online") {
      setSelectedMentoring(training);
      setMentoringModalOpen(true);
    }
    // For other types, use the regular modal
    else {
      setSelectedTraining(training);
      setDetailsModalOpen(true);
    }
  };

  // Close modals when training is cleared
  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedTraining(null);
  };

  const handleCloseMentoringModal = () => {
    setMentoringModalOpen(false);
    setSelectedMentoring(null);
  };

  // Determine empty state type
  const getEmptyStateConfig = () => {
    if (regionLoading || loading) {
      return {
        type: "loading",
        title: "Chargement de vos formations...",
        description:
          "Veuillez patienter pendant que nous chargeons vos données.",
        icon: <Loader2 className="w-12 h-12 text-tacir-blue animate-spin" />,
      };
    }

    if (error || !userRegion) {
      return {
        type: "error",
        title: "Erreur de chargement",
        description:
          error ||
          "Vous n'êtes pas associé à une région. Veuillez contacter l'administrateur.",
        icon: <AlertCircle className="w-12 h-12 text-red-500" />,
      };
    }

    if (allTrainings.length === 0) {
      return {
        type: "no-trainings",
        title: "Aucune formation disponible",
        description:
          "Aucune formation n'est actuellement disponible pour votre région.",
        icon: <BookOpen className="w-12 h-12 text-tacir-darkgray" />,
      };
    }

    if (filteredTrainings.length === 0) {
      if (filters.search || filters.type !== "all") {
        return {
          type: "no-results",
          title: "Aucune formation trouvée",
          description:
            "Aucune formation ne correspond à vos critères de recherche.",
          icon: <Search className="w-12 h-12 text-tacir-darkgray" />,
        };
      }
      return {
        type: "empty-tab",
        title:
          trainingSubTab === "upcoming"
            ? "Aucune formation à venir"
            : "Aucune formation passée",
        description:
          trainingSubTab === "upcoming"
            ? "Vous n'avez aucune formation programmée pour le moment."
            : "Vous n'avez aucune formation terminée pour le moment.",
        icon: <Calendar className="w-12 h-12 text-tacir-darkgray" />,
      };
    }

    return null;
  };

  const emptyStateConfig = getEmptyStateConfig();

  if (regionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-tacir-blue mx-auto mb-4" />
          <p className="text-tacir-darkgray">
            Chargement de vos informations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r bg-tacir-blue shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-tacir-darkblue">
                Mes Formations
              </h1>
              <p className="text-sm text-tacir-darkgray">
                Consultez vos formations, bootcamps et sessions de mentorat
              </p>
            </div>
          </div>
          {userRegion && (
            <div className="bg-tacir-lightblue px-4 py-2 rounded-lg">
              <p className="text-sm font-medium text-tacir-darkblue">
                Région:{" "}
                {userRegion.name.charAt(0).toUpperCase() +
                  userRegion.name.slice(1)}
              </p>
            </div>
          )}
        </div>

        {/* Error State */}
        {emptyStateConfig?.type === "error" && (
          <Card className="p-6 bg-red-50 border-red-200 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">
                  {emptyStateConfig.title}
                </h3>
                <p className="text-red-700 text-sm mt-1">
                  {emptyStateConfig.description}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Main Content */}
        {!emptyStateConfig?.type && (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="flex w-full bg-white shadow-sm rounded-lg border border-tacir-lightgray mb-6">
              <TabsTrigger
                value="trainings"
                className="flex-1 data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white text-sm sm:text-base"
              >
                Liste
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="flex-1 data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white text-sm sm:text-base"
              >
                Calendrier
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trainings" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <TrainingStatsCard
                  title="Total"
                  value={stats.total}
                  icon={BookOpen}
                  color="tacir-blue"
                  borderColor="tacir-blue"
                  loading={loading}
                />
                <TrainingStatsCard
                  title="Formations"
                  value={stats.formation}
                  icon={BookOpen}
                  color="tacir-blue"
                  borderColor="tacir-blue"
                  loading={loading}
                />
                <TrainingStatsCard
                  title="Bootcamps"
                  value={stats.bootcamp}
                  icon={BookOpen}
                  color="tacir-yellow"
                  borderColor="tacir-yellow"
                  loading={loading}
                />
                <TrainingStatsCard
                  title="Mentorat"
                  value={stats.mentoring}
                  icon={BookOpen}
                  color="tacir-green"
                  borderColor="tacir-green"
                  loading={loading}
                />
              </div>

              {/* Filters Section */}
              <Card className="p-4 sm:p-6 border border-tacir-lightgray">
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-tacir-darkgray" />
                    <Input
                      placeholder="Rechercher une formation..."
                      className="pl-10 text-sm sm:text-base"
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                    />
                  </div>

                  {/* Type Filter */}
                  <div className="flex gap-2">
                    <select
                      value={filters.type}
                      onChange={(e) =>
                        handleFilterChange("type", e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-tacir-lightgray rounded-lg text-sm sm:text-base"
                    >
                      {TRAINING_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {(filters.search || filters.type !== "all") && (
                      <Button
                        variant="outline"
                        onClick={resetFilters}
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">Réinitialiser</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sub Tabs */}
                <Tabs
                  value={trainingSubTab}
                  onValueChange={setTrainingSubTab}
                  className="w-full"
                >
                  <TabsList className="flex w-full bg-white shadow-sm rounded-lg border border-tacir-lightgray">
                    <TabsTrigger
                      value="upcoming"
                      className="flex-1 data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white text-sm"
                    >
                      À venir ({stats.upcoming})
                    </TabsTrigger>
                    <TabsTrigger
                      value="past"
                      className="flex-1 data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white text-sm"
                    >
                      Passées ({stats.past})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </Card>

              {/* Trainings List */}
              {emptyStateConfig ? (
                <EmptyState
                  config={emptyStateConfig}
                  onResetFilters={resetFilters}
                  hasFilters={filters.search || filters.type !== "all"}
                />
              ) : (
                <>
                  {/* Results Count */}
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-tacir-darkgray">
                      {filteredTrainings.length} formation
                      {filteredTrainings.length > 1 ? "s" : ""}{" "}
                      {trainingSubTab === "upcoming" ? "à venir" : "passée"}
                      {filteredTrainings.length > 1 ? "s" : ""}
                    </p>
                    {loading && (
                      <Loader2 className="w-4 h-4 text-tacir-blue animate-spin" />
                    )}
                  </div>

                  {/* Trainings Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {displayedTrainings.map((training) => (
                      <Card
                        key={training._id}
                        className={`p-4 border-l-4 ${
                          typeConfig[training.type]?.borderColor ||
                          "border-tacir-lightblue"
                        } hover:shadow-md transition-shadow cursor-pointer h-full`}
                        onClick={() => handleViewDetails(training)}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <h3 className="text-base font-semibold text-tacir-darkblue line-clamp-2">
                              {training.title}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                typeConfig[training.type]?.bgColor ||
                                "bg-tacir-darkblue"
                              } text-white flex-shrink-0 ml-2`}
                            >
                              {typeConfig[training.type]?.title ||
                                training.type}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm text-tacir-darkgray">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-tacir-blue flex-shrink-0" />
                              <span>
                                {formatDate(training.startDate)} •{" "}
                                {training.time}
                              </span>
                            </div>
                            {training.location && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-tacir-blue flex-shrink-0" />
                                <span className="line-clamp-1">
                                  {training.location}
                                </span>
                              </div>
                            )}
                          </div>

                          {training.description && (
                            <p className="text-sm text-tacir-darkgray line-clamp-2">
                              {training.description}
                            </p>
                          )}

                          <div className="text-sm text-tacir-darkgray">
                            <p className="font-medium text-tacir-darkblue">
                              Formateur:
                            </p>
                            <p className="line-clamp-1">
                              {getTrainerNames(training.trainers)}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {filteredTrainings.length > 0 && (
                    <Pagination
                      page={pagination.page}
                      limit={pagination.limit}
                      total={pagination.total}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      onLimitChange={handleLimitChange}
                    />
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="w-8 h-8 text-tacir-blue animate-spin" />
                </div>
              ) : calendarEvents.length === 0 ? (
                <EmptyState
                  config={{
                    type: "no-trainings",
                    title: "Aucune formation au calendrier",
                    description:
                      "Aucune formation n'est planifiée pour votre région.",
                    icon: (
                      <Calendar className="w-12 h-12 text-tacir-darkgray" />
                    ),
                  }}
                />
              ) : (
                <Card className="p-4 sm:p-6 shadow rounded-lg bg-white border border-tacir-lightgray">
                  <InteractiveCalendar
                    events={calendarEvents}
                    eventColors={{
                      formation: typeConfig.formation.bgColor,
                      bootcamp: typeConfig.bootcamp.bgColor,
                      mentoring: typeConfig.mentoring.bgColor,
                    }}
                  />
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Empty State for main content */}
        {emptyStateConfig &&
          emptyStateConfig.type !== "error" &&
          emptyStateConfig.type !== "loading" && (
            <EmptyState
              config={emptyStateConfig}
              onResetFilters={resetFilters}
              hasFilters={filters.search || filters.type !== "all"}
            />
          )}

        {/* Modals - Only render when they should be open */}
        {mentoringModalOpen && (
          <MentoringPresenceModal
            open={mentoringModalOpen}
            onOpenChange={handleCloseMentoringModal}
            training={selectedMentoring}
          />
        )}

        {detailsModalOpen && (
          <TrainingDetailsModal
            open={detailsModalOpen}
            onOpenChange={handleCloseDetailsModal}
            training={selectedTraining}
          />
        )}
      </div>
    </div>
  );
}

// Empty State Component
const EmptyState = ({ config, onResetFilters, hasFilters }) => {
  const getActionButton = () => {
    if (config.type === "no-results" && hasFilters) {
      return (
        <Button variant="outline" onClick={onResetFilters} className="mt-4">
          Réinitialiser les filtres
        </Button>
      );
    }

    if (config.type === "no-trainings") {
      return (
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Actualiser
        </Button>
      );
    }

    return null;
  };

  return (
    <Card className="p-8 text-center border-tacir-lightgray">
      <div className="mx-auto max-w-md">
        <div className="p-4 bg-tacir-lightgray/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          {config.icon}
        </div>
        <h3 className="text-lg font-medium text-tacir-darkblue mb-2">
          {config.title}
        </h3>
        <p className="text-tacir-darkgray mb-4">{config.description}</p>
        {getActionButton()}
      </div>
    </Card>
  );
};
