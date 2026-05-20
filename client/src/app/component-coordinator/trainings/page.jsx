"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { TrainingStatsCard } from "@/features/trainings/components/TrainingStatsCard";
import TrainingFilters from "@/features/trainings/components/TrainingFilters";
import { TrainingCard } from "@/features/trainings/components/TrainingCard";
import Pagination from "@/components/common/CustomPagination";
import { getTrainings } from "@/services/trainings/training";
import { BookOpen, Clock, Award, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormationModal from "@/features/trainings/modals/FormationModal";
import BootcampModal from "@/features/trainings/modals/BootcampModal";
import MentoringModal from "@/features/trainings/modals/MentoringModal";
import InteractiveCalendar from "@/features/trainings/components/InteractiveCalendar";
import Loader from "@/components/ui/Loader";
import { typeConfig } from "@/features/trainings/components/style.config";

export default function UnifiedTrainingsPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedType, setSelectedType] = useState("all");
  const [allTrainings, setAllTrainings] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    cohorts: "all",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [modals, setModals] = useState({
    formation: false,
    bootcamp: false,
    mentoring: false,
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentTraining, setCurrentTraining] = useState(null);
  const [currentEditType, setCurrentEditType] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    formation: 0,
    bootcamp: 0,
    mentoring: 0,
  });
  const [allEvents, setAllEvents] = useState([]);

  // Fetch paginated trainings
  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true);
        const response = await getTrainings({
          type: selectedType === "all" ? undefined : selectedType,
          page: pagination.page,
          limit: pagination.limit,
          ...(filters.status !== "all" && { status: filters.status }),
          ...(filters.cohorts !== "all" && { cohort: filters.cohorts }),
          ...(filters.search && { search: filters.search }),
        });

        setAllTrainings(response.data || []);
        setPagination(
          response.pagination || {
            page: 1,
            limit: 5,
            total: 0,
            totalPages: 1,
          }
        );
      } catch (error) {
        console.error("Failed to fetch trainings:", error);
        setAllTrainings([]);
        setPagination({
          page: 1,
          limit: 5,
          total: 0,
          totalPages: 1,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, [pagination.page, pagination.limit, filters, selectedType]);

  // Fetch all trainings for stats and calendar
  useEffect(() => {
    const fetchAllTrainingsForStats = async () => {
      try {
        setStatsLoading(true);
        const response = await getTrainings({
          limit: 1000,
          ...(filters.status !== "all" && { status: filters.status }),
          ...(filters.cohorts !== "all" && { cohort: filters.cohorts }),
          ...(filters.search && { search: filters.search }),
        });
        const allData = response.data || [];

        setAllEvents(allData);
        setStats({
          total: allData.length,
          pending: allData.filter((t) => t?.status === "pending").length,
          approved: allData.filter((t) => t?.status === "approved").length,
          rejected: allData.filter((t) => t?.status === "rejected").length,
          formation: allData.filter((t) => t?.type === "formation").length,
          bootcamp: allData.filter((t) => t?.type === "bootcamp").length,
          mentoring: allData.filter((t) => t?.type === "mentoring").length,
        });
      } catch (error) {
        console.error("Failed to fetch all trainings:", error);
        setAllEvents([]);
        setStats({
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          formation: 0,
          bootcamp: 0,
          mentoring: 0,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchAllTrainingsForStats();
  }, [filters]);

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  const getFilteredTrainings = () => {
    return allTrainings;
  };

  const getUniqueCohorts = () => {
    const cohortSet = new Set();
    allEvents.forEach((training) => {
      training.cohorts?.forEach((cohort) => {
        cohortSet.add(cohort);
      });
    });
    return Array.from(cohortSet).map((cohort) => ({
      value: cohort,
      label: cohort,
    }));
  };

  const handleCreateModal = (type) => {
    setModals((prev) => ({ ...prev, [type]: true }));
  };

  const handleCloseModal = (type) => {
    setModals((prev) => ({ ...prev, [type]: false }));
  };

  const handleTrainingCreated = async () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleUpdateTraining = (training) => {
    setCurrentTraining(training);
    setCurrentEditType(training.type);
    setEditModalOpen(true);
  };

  const handleTrainingUpdated = async () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const filteredTrainings = getFilteredTrainings();

  if (loading || statsLoading) {
    return <Loader />;
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-10 min-h-screen bg-tacir-lightgray/10">
      {/* Header with Create Buttons */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-gradient-to-r bg-tacir-blue shadow-md flex-shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-800 truncate">
                  Centre de Formation
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 line-clamp-2 sm:line-clamp-1">
                  Gérez tous vos programmes de formation en un seul endroit
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
              {Object.entries(typeConfig).map(([type, config]) => (
                <Button
                  key={type}
                  onClick={() => handleCreateModal(type)}
                  className={`${config.buttonClass} text-white transition-all hover:scale-[1.02] group text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-8 sm:h-9 md:h-10 flex-1 sm:flex-initial min-w-[100px]`}
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 transition-transform group-hover:rotate-90 flex-shrink-0" />
                  <config.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1 flex-shrink-0" />
                  <span className="truncate">{config.title}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-6 border-b border-gray-200"></div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full bg-white shadow-sm rounded-lg border border-tacir-lightgray p-1 h-auto overflow-x-auto scrollbar-hide">
          <TabsTrigger
            value="dashboard"
            className="flex-1 data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white text-xs sm:text-sm py-2 px-2 sm:px-4 min-w-[80px] whitespace-nowrap"
          >
            <span className="hidden sm:inline">Tableau de Bord</span>
            <span className="sm:hidden">Tableau</span>
          </TabsTrigger>
          <TabsTrigger
            value="trainings"
            className="flex-1 data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white text-xs sm:text-sm py-2 px-2 sm:px-4 min-w-[80px] whitespace-nowrap"
          >
            <span className="hidden sm:inline">Mes Demandes</span>
            <span className="sm:hidden">Demandes</span>
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="flex-1 data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white text-xs sm:text-sm py-2 px-2 sm:px-4 min-w-[80px] whitespace-nowrap"
          >
            Calendrier
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <TrainingStatsCard
              title="Total"
              value={stats.total}
              icon={BookOpen}
              color="tacir-blue"
              borderColor="tacir-blue"
            />
            <TrainingStatsCard
              title="En Attente"
              value={stats.pending}
              icon={Clock}
              color="tacir-yellow"
              borderColor="tacir-yellow"
            />
            <TrainingStatsCard
              title="Approuvés"
              value={stats.approved}
              icon={Award}
              color="tacir-green"
              borderColor="tacir-green"
            />
            <TrainingStatsCard
              title="Rejetés"
              value={stats.rejected}
              icon={Clock}
              color="tacir-pink"
              borderColor="tacir-pink"
            />
          </div>

          {/* Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {Object.entries(typeConfig).map(([type, config]) => (
              <Card
                key={type}
                className={`p-3 sm:p-4 md:p-6 shadow rounded-lg bg-white border ${config.borderColor}`}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${config.bgColor} flex-shrink-0`}
                    >
                      <config.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-semibold text-xs sm:text-sm md:text-base ${config.textColor} truncate`}>
                        {config.title}
                      </h3>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                        {stats[type]}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  {allEvents
                    .filter((t) => t.type === type)
                    .slice(0, 3)
                    .map((training) => (
                      <div
                        key={training._id}
                        className={`p-2 rounded ${config.lightBg} border-l-4 ${config.borderColor}`}
                      >
                        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                          {training.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {training.status === "pending" && "⏳ En attente"}
                          {training.status === "approved" && "✅ Approuvé"}
                          {training.status === "rejected" && "❌ Rejeté"}
                        </p>
                      </div>
                    ))}
                  {stats[type] === 0 && (
                    <p className="text-xs sm:text-sm text-gray-400 text-center py-3 sm:py-4">
                      Aucun {type} trouvé
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trainings" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {/* Type Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              onClick={() => setSelectedType("all")}
              className={`text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-8 sm:h-9 ${
                selectedType === "all" ? "bg-tacir-blue text-white" : ""
              }`}
            >
              <span className="hidden xs:inline">Tous</span> ({stats.total})
            </Button>
            {Object.entries(typeConfig).map(([type, config]) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                onClick={() => setSelectedType(type)}
                className={`text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-8 sm:h-9 ${
                  selectedType === type
                    ? `${config.bgColor} text-white`
                    : `${config.textColor} border-current`
                }`}
              >
                <config.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                <span className="hidden xs:inline truncate">{config.title}</span> ({stats[type]})
              </Button>
            ))}
          </div>

          <TrainingFilters
            filters={filters}
            setFilters={setFilters}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            cohorts={getUniqueCohorts()}
          />

          <div className="space-y-3 sm:space-y-4">
            {filteredTrainings.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-tacir-darkgray text-sm sm:text-base">
                  {selectedType === "all"
                    ? "Aucune formation trouvée"
                    : `Aucun ${typeConfig[
                        selectedType
                      ]?.title?.toLowerCase()} trouvé`}
                </p>
              </div>
            ) : (
              filteredTrainings.map((training) => (
                <div
                  key={training._id}
                  className={`border-l-4 ${
                    typeConfig[training.type]?.borderColor
                  } bg-white rounded-r-lg shadow-sm`}
                >
                  <TrainingCard
                    training={training}
                    onUpdate={() => handleUpdateTraining(training)}
                    typeConfig={typeConfig[training.type]}
                  />
                </div>
              ))
            )}
          </div>

          <Pagination
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card className="p-3 sm:p-4 md:p-6 shadow rounded-lg bg-white border border-tacir-lightgray">
            <InteractiveCalendar
              events={allEvents.filter((event) => event.status === "approved")}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <FormationModal
        open={modals.formation}
        onOpenChange={() => handleCloseModal("formation")}
        onSuccess={handleTrainingCreated}
        mode="create"
      />

      <BootcampModal
        open={modals.bootcamp}
        onOpenChange={() => handleCloseModal("bootcamp")}
        onSuccess={handleTrainingCreated}
        mode="create"
      />

      <MentoringModal
        open={modals.mentoring}
        onOpenChange={() => handleCloseModal("mentoring")}
        onSuccess={handleTrainingCreated}
        mode="create"
      />

      {editModalOpen && currentEditType === "formation" && (
        <FormationModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSuccess={handleTrainingUpdated}
          initialData={currentTraining}
          mode="edit"
        />
      )}

      {editModalOpen && currentEditType === "bootcamp" && (
        <BootcampModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSuccess={handleTrainingUpdated}
          initialData={currentTraining}
          mode="edit"
        />
      )}

      {editModalOpen && currentEditType === "mentoring" && (
        <MentoringModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSuccess={handleTrainingUpdated}
          initialData={currentTraining}
          mode="edit"
        />
      )}
    </div>
  );
}
