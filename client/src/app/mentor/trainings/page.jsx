"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrainingStatsCard } from "@/features/trainings/components/TrainingStatsCard";
import { ToastContainer } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  Clock,
  Calendar,
  MapPin,
  BookOpen,
  Users,
  Video,
  Home,
  Search,
  TrendingUp,
  Award,
  PlayCircle,
  ChevronRight,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getMentorTrainings } from "@/services/trainings/training";
import Loader from "@/components/ui/Loader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InteractiveCalendar from "@/features/trainings/components/InteractiveCalendar";
import {
  typeConfig,
  getStatusBadge,
} from "@/features/trainings/components/style.config";
import Pagination from "@/components/common/CustomPagination";
import MentoringSessionModal from "@/features/trainings/modals/MentoringSessionModal";
import FormationAttendanceModal from "@/features/trainings/modals/FormationAttendanceModal";

export default function MentorTrainingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [isFormationModalOpen, setIsFormationModalOpen] = useState(false);
  const [selectedFormationTraining, setSelectedFormationTraining] =
    useState(null);
  
  const openFormationAttendanceModal = (training) => {
    setSelectedFormationTraining(training);
    setIsFormationModalOpen(true);
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Enhanced filtering logic
  const getFilteredTrainings = (filterType = "all") => {
    let filtered = trainings;

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((t) => t.type === selectedType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    // Filter by time period
    const now = new Date();
    if (filterType === "upcoming") {
      filtered = filtered.filter((t) => new Date(t.startDate) > now);
    } else if (filterType === "past") {
      filtered = filtered.filter((t) => new Date(t.startDate) < now);
    }

    return filtered.sort((a, b) => {
      if (filterType === "past") {
        return new Date(b.startDate) - new Date(a.startDate);
      }
      return new Date(a.startDate) - new Date(b.startDate);
    });
  };

  // Group trainings by type with enhanced stats
  const getTrainingStats = () => {
    const upcoming = getFilteredTrainings("upcoming");
    const past = getFilteredTrainings("past");

    return {
      total: trainings.length,
      upcoming: upcoming.length,
      past: past.length,
      formation: trainings.filter((t) => t.type === "formation").length,
      bootcamp: trainings.filter((t) => t.type === "bootcamp").length,
      mentoring: trainings.filter((t) => t.type === "mentoring").length,
      completed: past.filter((t) => t.status === "approved").length,
      pending: trainings.filter((t) => t.status === "pending").length,
    };
  };

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true);
        const response = await getMentorTrainings({
          page: pagination.page,
          limit: pagination.limit,
        });

        const trainingsData = Array.isArray(response.data) ? response.data : [];
        setTrainings(trainingsData);

        // Update pagination from response
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 1,
        }));

        // Calendar events logic
        const events = trainingsData.filter(
          (training) => training.status === "approved"
        );
        setCalendarEvents(events);
      } catch (error) {
        console.error("Failed to fetch trainings:", error);
        toast.error("Erreur lors du chargement des formations");
        setTrainings([]);
        setCalendarEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, [pagination.page, pagination.limit]);

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleTrainingClick = (training) => {
    router.push(`/mentor/trainings/${training.type}/${training._id}`);
  };

  // Function to open modal
  const openModal = async (training) => {
    if (training.type !== "mentoring") {
      toast.error(
        "La création de sessions n'est disponible que pour les mentorats"
      );
      return;
    }

    setSelectedTraining(training);
    setIsModalOpen(true);
  };

  const renderSessionDetails = (training) => {
    const sessionDetails = training.sessionDetails || {};
    return (
      <div className="flex flex-wrap gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">{formatDate(training.startDate)}</span>
          {training.time && (
            <span className="text-gray-400 hidden sm:inline">• {training.time}</span>
          )}
        </div>

        {sessionDetails.location &&
          sessionDetails.sessionType === "in-person" && (
            <div className="flex items-center gap-1">
              <Home className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{sessionDetails.location}</span>
            </div>
          )}

        {sessionDetails.sessionType === "online" && (
          <div className="flex items-center gap-1">
            <Video className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>En ligne</span>
          </div>
        )}

        {training.cohorts && training.cohorts.length > 0 && (
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{training.cohorts.join(", ")}</span>
          </div>
        )}
      </div>
    );
  };

  const renderTrainingCard = (training, showActions = false) => {
    const IconComponent = typeConfig[training.type]?.icon || BookOpen;

    return (
      <Card
        key={training._id}
        className={`group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-tacir-blue`}
        onClick={() => handleTrainingClick(training)}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div
                className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                  typeConfig[training.type]?.bgColor || "bg-tacir-blue"
                }`}
              >
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm sm:text-lg text-gray-900 group-hover:text-tacir-darkblue transition-colors truncate">
                  {training.title}
                </h4>
                <span
                  className={`text-xs sm:text-sm font-medium ${
                    typeConfig[training.type]?.textColor || "text-tacir-blue"
                  }`}
                >
                  {training.type}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {getStatusBadge(training.status)}
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-tacir-darkblue transition-colors hidden sm:block" />
            </div>
          </div>

          {training.description && (
            <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
              {training.description}
            </p>
          )}

          {renderSessionDetails(training)}

          {showActions && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-2">
                {training.type === "mentoring" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs sm:text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(training);
                    }}
                  >
                    Gérer sessions
                  </Button>
                )}
                {(training.type === "formation" ||
                  training.type === "bootcamp") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs sm:text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openFormationAttendanceModal(training);
                    }}
                  >
                    Gérer présence
                  </Button>
                )}

                {training.sessionDetails?.meetLink && 
                 training.type !== "mentoring" && (
                  <Button
                    size="sm"
                    className="flex-1 bg-tacir-green hover:bg-green-700 text-xs sm:text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(training.sessionDetails.meetLink, "_blank");
                    }}
                  >
                    <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Rejoindre
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const stats = getTrainingStats();

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-tacir-lightgray min-h-screen">
      {/* Header - Responsive */}
      <div className="mb-4 sm:mb-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 border border-tacir-lightgray/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-gradient-to-r bg-tacir-blue shadow-md flex-shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Mes Formations
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Gérez et suivez vos formations
                </p>
              </div>
            </div>

            {/* Quick Stats - Mobile Grid */}
            <div className="grid grid-cols-3 sm:flex gap-3 sm:gap-6">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-tacir-darkblue">
                  {stats.total}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-600">
                  {stats.upcoming}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">À venir</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-blue-600">
                  {stats.completed}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                  Terminées
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Container - Responsive */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-3 sm:p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs List - Responsive with scroll */}
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex sm:grid sm:w-full sm:grid-cols-4 bg-white shadow-sm rounded-lg border border-gray-200 min-w-max sm:min-w-0">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap"
              >
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger
                value="upcoming"
                className="data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap"
              >
                À Venir ({stats.upcoming})
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap"
              >
                Passées ({stats.past})
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap"
              >
                Calendrier
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab - Responsive */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              <TrainingStatsCard
                title="Total Formations"
                value={stats.total}
                icon={BookOpen}
                color="tacir-blue"
                borderColor="tacir-blue"
              />
              <TrainingStatsCard
                title="À Venir"
                value={stats.upcoming}
                icon={TrendingUp}
                color="tacir-green"
                borderColor="tacir-green"
              />
              <TrainingStatsCard
                title="Terminées"
                value={stats.completed}
                icon={Award}
                color="tacir-purple"
                borderColor="tacir-purple"
              />
            </div>

            {/* Training Type Cards - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {["formation", "bootcamp", "mentoring"].map((type) => {
                const IconComponent = BookOpen;
                return (
                  <Card
                    key={type}
                    className={`border-t-4 ${typeConfig[type].borderColor} hover:shadow-lg transition-shadow`}
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div
                          className={`p-2 sm:p-3 rounded-lg ${typeConfig[type].bgColor}`}
                        >
                          <IconComponent className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg">
                            {typeConfig[type].title}
                          </h3>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900">
                            {stats[type]}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        {trainings
                          .filter((t) => t.type === type)
                          .slice(0, 3)
                          .map((training) => (
                            <div
                              key={training._id}
                              className="p-2 sm:p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                              onClick={() => handleTrainingClick(training)}
                            >
                              <h4 className="font-medium text-sm sm:text-base text-gray-900 truncate">
                                {training.title}
                              </h4>
                              <div className="flex items-center justify-between mt-1 gap-2">
                                <span className="text-xs sm:text-sm text-gray-500 truncate">
                                  {formatDate(training.startDate)}
                                </span>
                                {getStatusBadge(training.status)}
                              </div>
                            </div>
                          ))}

                        {stats[type] === 0 && (
                          <p className="text-xs sm:text-sm text-gray-400 text-center py-3 sm:py-4">
                            Aucune formation {type}
                          </p>
                        )}
                      </div>

                      {stats[type] > 3 && (
                        <Button
                          variant="link"
                          className={`mt-2 sm:mt-3 p-0 text-xs sm:text-sm ${typeConfig[type].textColor}`}
                          onClick={() => {
                            setSelectedType(type);
                            setActiveTab("upcoming");
                          }}
                        >
                          Voir toutes →
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Recent Activity - Responsive */}
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-blue" />
                Prochaines Sessions
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {getFilteredTrainings("upcoming")
                  .slice(0, 5)
                  .map((training) => {
                    const IconComponent =
                      typeConfig[training.type]?.icon || BookOpen;
                    return (
                      <div
                        key={training._id}
                        className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors gap-2"
                        onClick={() => handleTrainingClick(training)}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div
                            className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                              typeConfig[training.type]?.bgColor ||
                              "bg-tacir-blue"
                            }`}
                          >
                            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-sm sm:text-base text-gray-900 truncate">
                              {training.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                              {formatDate(training.startDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          {getStatusBadge(training.status)}
                          <ChevronRight className="w-4 h-4 text-gray-400 hidden sm:block" />
                        </div>
                      </div>
                    );
                  })}

                {getFilteredTrainings("upcoming").length === 0 && (
                  <p className="text-center text-gray-500 py-6 sm:py-8 text-sm">
                    Aucune formation à venir
                  </p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Upcoming and Past Tabs - Responsive */}
          {["upcoming", "past"].map((tabType) => (
            <TabsContent
              key={tabType}
              value={tabType}
              className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
            >
              {/* Filters - Mobile Stacked */}
              <Card className="p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="w-full">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                      <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 sm:pl-10 text-sm h-9 sm:h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:flex">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-full sm:w-48 text-xs sm:text-sm h-9 sm:h-10">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        {Object.entries(typeConfig).map(([type, config]) => (
                          <SelectItem key={type} value={type}>
                            {config.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-48 text-xs sm:text-sm h-9 sm:h-10">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="approved">Approuvé</SelectItem>
                        <SelectItem value="rejected">Rejeté</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Training List - Responsive */}
              <div className="space-y-3 sm:space-y-4">
                {getFilteredTrainings(tabType).length === 0 ? (
                  <Card className="p-8 sm:p-12 text-center">
                    <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      Aucune formation{" "}
                      {tabType === "upcoming" ? "à venir" : "passée"}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {tabType === "upcoming"
                        ? "Vos prochaines formations apparaîtront ici"
                        : "Vos formations terminées apparaîtront ici"}
                    </p>
                  </Card>
                ) : (
                  getFilteredTrainings(tabType).map((training) =>
                    renderTrainingCard(training, true)
                  )
                )}
              </div>
              
              {getFilteredTrainings(tabType).length > 0 && (
                <Pagination
                  page={pagination.page}
                  limit={pagination.limit}
                  total={getFilteredTrainings(tabType).length}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              )}
            </TabsContent>
          ))}

          {/* Calendar Tab - Responsive */}
          <TabsContent value="calendar" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-blue" />
                  Calendrier des Formations
                </h3>

                {/* Calendar Legend - Responsive */}
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {Object.entries(typeConfig).map(([type, config]) => (
                    <div key={type} className="flex items-center gap-1.5 sm:gap-2">
                      <div
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${config.bgColor}`}
                      />
                      <span className="text-xs sm:text-sm text-gray-600">
                        {config.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <InteractiveCalendar
                events={calendarEvents}
                eventColors={{
                  formation: typeConfig.formation.bgColor,
                  bootcamp: typeConfig.bootcamp.bgColor,
                  mentoring: typeConfig.mentoring.bgColor,
                }}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <MentoringSessionModal
        training={selectedTraining}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <FormationAttendanceModal
        training={selectedFormationTraining}
        isOpen={isFormationModalOpen}
        onClose={() => setIsFormationModalOpen(false)}
      />

      <ToastContainer position="bottom-left" />
    </div>
  );
}