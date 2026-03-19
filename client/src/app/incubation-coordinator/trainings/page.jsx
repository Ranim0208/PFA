"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  approveTrainingRequest,
  rejectTrainingRequest,
} from "@/services/trainings/training";
import { getStatusBadge } from "@/features/trainings/components/style.config";
import {
  Check,
  X,
  Clock,
  Calendar,
  MapPin,
  BookOpen,
  Users,
  Filter,
  Search,
  ChevronDown,
  BarChart3,
  Grid3x3,
  List,
  RefreshCw,
  Eye,
  ChevronRight,
  User,
  Users as CohortIcon,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getTrainings } from "@/services/trainings/training";
import Loader from "@/components/ui/Loader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "@/components/common/CustomPagination";
import InteractiveCalendar from "@/features/trainings/components/InteractiveCalendar";
import { ApprovalModal } from "@/features/trainings/modals/ApprovalModal";
import { RejectionModal } from "@/features/trainings/modals/RejectionModal";
import TrainingFilters from "@/features/trainings/components/TrainingFilters";
import TrainingDetailsModal from "@/features/trainings/components/TrainingDetailsModal";
import { typeConfig } from "@/features/trainings/components/style.config";
import { getTrainerNames } from "@/utils/common";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function TrainingValidationPage() {
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [sessionType, setSessionType] = useState("in-person");
  const [meetingLink, setMeetingLink] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    cohorts: "all",
    type: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    formation: 0,
    bootcamp: 0,
    mentoring: 0,
  });
  const [allCohorts, setAllCohorts] = useState([]);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Auto-detect mobile and force grid view
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchApprovedTrainings = async () => {
      try {
        const response = await getTrainings({
          status: "approved",
          limit: 1000,
        });
        setCalendarEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch approved trainings:", error);
        setCalendarEvents([]);
      }
    };

    if (activeTab === "calendar") {
      fetchApprovedTrainings();
    }
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getTrainings({
        status: filters.status === "all" ? undefined : filters.status,
        type: filters.type === "all" ? undefined : filters.type,
        cohort: filters.cohorts === "all" ? undefined : filters.cohorts,
        search: filters.search || undefined,
        page: pagination.page,
        limit: pagination.limit,
      });

      setRequests(response.data || []);
      setPagination(
        response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        }
      );

      const cohorts = new Set();
      (response.data || []).forEach((request) => {
        (request.cohorts || []).forEach((cohort) => cohorts.add(cohort));
      });
      setAllCohorts(Array.from(cohorts));

      if (response.pagination?.total) {
        const statsResponse = await getTrainings({ limit: 1000 });
        const allData = statsResponse.data || [];

        setStats({
          total: allData.length,
          pending: allData.filter((t) => t.status === "pending").length,
          approved: allData.filter((t) => t.status === "approved").length,
          rejected: allData.filter((t) => t.status === "rejected").length,
          formation: allData.filter((t) => t.type === "formation").length,
          bootcamp: allData.filter((t) => t.type === "bootcamp").length,
          mentoring: allData.filter((t) => t.type === "mentoring").length,
        });
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      toast.error("Erreur lors du chargement des demandes");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filters, pagination.page, pagination.limit]);

  const handleApprove = (request, e) => {
    e?.stopPropagation();
    setSelectedRequest(request);
    setApproveOpen(true);
    setSessionType(request.sessionType || "in-person");
    setLocation(request.location || "");
    setMeetingLink(request.meetLink || "");
  };

  const handleReject = (request, e) => {
    e?.stopPropagation();
    setSelectedRequest(request);
    setRejectOpen(true);
    setRejectReason("");
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;

    if (sessionType === "in-person" && !location) {
      toast.error("Veuillez sélectionner un emplacement");
      return;
    }

    setIsProcessing(true);
    try {
      const approvalData = {
        location: sessionType === "in-person" ? location : undefined,
        sessionType,
        meetingLink:
          sessionType === "online"
            ? meetingLink || "https://meet.jit.si/temp-" + Date.now()
            : undefined,
      };

      const updatedTraining = await approveTrainingRequest(
        selectedRequest._id,
        approvalData
      );

      setRequests((prev) =>
        prev.map((r) => (r._id === updatedTraining._id ? updatedTraining : r))
      );
      setApproveOpen(false);
      toast.success("Demande approuvée avec succès");
    } catch (error) {
      console.error("Error approving training:", error);
      toast.error("Erreur lors de l'approbation");
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmReject = async () => {
    if (!selectedRequest) return;
    if (!rejectReason || rejectReason.trim().length < 10) {
      toast.error(
        "Veuillez fournir une raison de refus (au moins 10 caractères)"
      );
      return;
    }

    setIsProcessing(true);
    try {
      const updatedTraining = await rejectTrainingRequest(selectedRequest._id, {
        rejectionReason: rejectReason,
      });

      setRequests(
        requests.map((req) =>
          req._id === selectedRequest._id
            ? {
                ...req,
                status: "rejected",
                rejectionReason: updatedTraining.rejectionReason,
                rejectedAt: new Date().toISOString(),
              }
            : req
        )
      );

      setRejectOpen(false);
      toast.success(updatedTraining.message || "Demande rejetée avec succès");
    } catch (error) {
      toast.error(error.message);
      console.error("Rejection failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleViewDetails = (training) => {
    setSelectedTraining(training);
    setDetailsModalOpen(true);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      cohorts: "all",
      type: "all",
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== "all") count++;
    if (filters.cohorts !== "all") count++;
    if (filters.type !== "all") count++;
    return count;
  };

  if (loading && requests.length === 0) {
    return <Loader />;
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-tacir-lightgray/30 min-h-screen">
      {/* Enhanced Header with Stats */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-tacir-lightgray p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col space-y-4 sm:space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-tacir-darkblue rounded-lg sm:rounded-xl shadow-sm">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-tacir-darkblue">
                  Validation des Demandes
                </h1>
                <p className="text-tacir-darkgray text-xs sm:text-sm">
                  Consultez et validez les demandes de formation
                </p>
              </div>
            </div>

            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-tacir-blue text-tacir-blue hover:bg-tacir-lightblue/10 flex-shrink-0"
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-tacir-lightblue/10 border-tacir-lightblue/30 hover:shadow-md transition-all duration-200">
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-tacir-darkblue">
                      Total
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-tacir-darkblue">
                      {stats.total}
                    </p>
                  </div>
                  <div className="p-2 bg-tacir-blue/20 rounded-lg">
                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-tacir-blue" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-tacir-yellow/10 border-tacir-yellow/30 hover:shadow-md transition-all duration-200">
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-tacir-yellow">
                      En Attente
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-tacir-yellow">
                      {stats.pending}
                    </p>
                  </div>
                  <div className="p-2 bg-tacir-yellow/20 rounded-lg">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-tacir-yellow" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-tacir-green/10 border-tacir-green/30 hover:shadow-md transition-all duration-200">
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-tacir-green">
                      Approuvés
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-tacir-green">
                      {stats.approved}
                    </p>
                  </div>
                  <div className="p-2 bg-tacir-green/20 rounded-lg">
                    <Check className="h-5 w-5 sm:h-6 sm:w-6 text-tacir-green" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-tacir-pink/10 border-tacir-pink/30 hover:shadow-md transition-all duration-200">
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-tacir-pink">
                      Rejetés
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-tacir-pink">
                      {stats.rejected}
                    </p>
                  </div>
                  <div className="p-2 bg-tacir-pink/20 rounded-lg">
                    <X className="h-5 w-5 sm:h-6 sm:w-6 text-tacir-pink" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full bg-white shadow-sm rounded-lg border border-tacir-lightgray p-1 mb-4 sm:mb-6">
          <TabsTrigger
            value="requests"
            className="flex-1 data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-2.5"
          >
            Demandes
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="flex-1 data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-2.5"
          >
            Calendrier
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4 sm:space-y-6">
          {/* Enhanced Filters Section */}
          <Card className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-tacir-lightgray p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
              {/* Search and Filter Row - Side by side on mobile */}
              <div className="flex flex-row gap-3 w-full sm:flex-1 sm:max-w-md">
                {/* Search Input */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-tacir-darkgray" />
                    <Input
                      placeholder="Rechercher une formation..."
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                      className="pl-10 pr-4 py-2.5 w-full border-tacir-lightgray focus:border-tacir-blue text-sm"
                    />
                  </div>
                </div>

                {/* Filter Button - Beside search on mobile */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2 border-tacir-darkgray/30 text-tacir-darkblue hover:text-tacir-blue text-sm whitespace-nowrap flex-shrink-0"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden xs:inline">Filtres</span>
                  {getActiveFilterCount() > 0 && (
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-tacir-blue text-white text-xs">
                      {getActiveFilterCount()}
                    </Badge>
                  )}
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform hidden xs:block",
                      showFilters && "rotate-180"
                    )}
                  />
                </Button>
              </div>

              {/* View Toggle - Only on desktop */}
              <div className="hidden lg:block">
                <Tabs value="grid" className="w-auto">
                  <TabsList className="bg-tacir-lightgray/50 p-1">
                    <TabsTrigger
                      value="list"
                      className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-tacir-darkblue"
                    >
                      <List className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="grid"
                      className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-tacir-darkblue"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Active Filters */}
            {getActiveFilterCount() > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-tacir-lightgray">
                {filters.search && (
                  <Badge className="bg-tacir-lightblue text-tacir-darkblue gap-1 pr-1 text-xs">
                    <Search className="w-3 h-3" />"
                    {filters.search.length > 12
                      ? filters.search.substring(0, 12) + "..."
                      : filters.search}
                    "
                    <button
                      onClick={() => setFilters({ ...filters, search: "" })}
                      className="hover:text-tacir-blue ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.status !== "all" && (
                  <Badge className="bg-tacir-lightblue text-tacir-darkblue gap-1 pr-1 text-xs">
                    Statut: {filters.status}
                    <button
                      onClick={() => setFilters({ ...filters, status: "all" })}
                      className="hover:text-tacir-blue ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.type !== "all" && (
                  <Badge className="bg-tacir-lightblue text-tacir-darkblue gap-1 pr-1 text-xs">
                    Type: {filters.type}
                    <button
                      onClick={() => setFilters({ ...filters, type: "all" })}
                      className="hover:text-tacir-blue ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.cohorts !== "all" && (
                  <Badge className="bg-tacir-lightblue text-tacir-darkblue gap-1 pr-1 text-xs">
                    Cohorte: {filters.cohorts}
                    <button
                      onClick={() => setFilters({ ...filters, cohorts: "all" })}
                      className="hover:text-tacir-blue ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs h-6 sm:h-7 text-tacir-darkgray hover:text-tacir-blue"
                >
                  Tout effacer
                </Button>
              </div>
            )}

            {/* Filters Dropdown */}
            {showFilters && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-tacir-lightgray">
                <TrainingFilters
                  filters={filters}
                  setFilters={setFilters}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  cohorts={allCohorts.map((c) => ({ value: c, label: c }))}
                />
              </div>
            )}
          </Card>

          {/* Results Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-tacir-green rounded-full"></div>
              <span className="font-medium text-tacir-darkblue text-sm">
                {requests.length} demande{requests.length !== 1 ? "s" : ""}
                {getActiveFilterCount() > 0 && " trouvée(s)"}
              </span>
            </div>
            <span className="text-sm text-tacir-darkgray">
              Total: <span className="font-semibold">{pagination.total}</span>
            </span>
          </div>

          {/* Enhanced Grid View - Always used on mobile */}
          <div className="space-y-3 sm:space-y-4">
            {requests.length === 0 ? (
              <Card className="p-6 sm:p-8 text-center border-tacir-lightgray bg-white">
                <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-tacir-lightgray mx-auto mb-3 sm:mb-4" />
                <p className="text-tacir-darkgray font-medium text-sm sm:text-base">
                  Aucune demande trouvée avec les filtres actuels
                </p>
                {getActiveFilterCount() > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-3 sm:mt-4 border-tacir-blue text-tacir-blue hover:bg-tacir-lightblue/10 text-sm"
                  >
                    Effacer les filtres
                  </Button>
                )}
              </Card>
            ) : (
              // Grid View - Always used on mobile, optional on desktop
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {requests.map((request) => (
                  <Card
                    key={request._id}
                    className={cn(
                      "p-4 sm:p-5 bg-white border-tacir-lightgray hover:shadow-lg transition-all duration-300 cursor-pointer group border-2",
                      hoveredCard === request._id
                        ? "border-tacir-blue shadow-lg"
                        : "border-tacir-lightgray hover:border-tacir-blue"
                    )}
                    onClick={() => handleViewDetails(request)}
                    onMouseEnter={() => setHoveredCard(request._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="space-y-3 sm:space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-medium text-white",
                            typeConfig[request.type]?.bgColor ||
                              "bg-tacir-darkblue"
                          )}
                        >
                          {typeConfig[request.type]?.title || request.type}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(request.status)}
                          <Eye className="w-4 h-4 text-tacir-darkgray opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-tacir-darkblue text-base sm:text-lg leading-tight group-hover:text-tacir-blue transition-colors line-clamp-2">
                        {request.title}
                      </h3>

                      {/* Info Grid */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-tacir-darkgray">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-tacir-blue flex-shrink-0" />
                          <span>
                            {formatDate(request.startDate)} • {request.time}
                          </span>
                        </div>

                        {request.proposedLocation && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-tacir-darkgray">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-tacir-blue flex-shrink-0" />
                            <span className="line-clamp-1">
                              {request.proposedLocation}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs sm:text-sm text-tacir-darkgray">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-tacir-blue flex-shrink-0" />
                          <span className="line-clamp-1">
                            {getTrainerNames(request.trainers)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs sm:text-sm text-tacir-darkgray">
                          <CohortIcon className="w-3 h-3 sm:w-4 sm:h-4 text-tacir-blue flex-shrink-0" />
                          <span className="line-clamp-1">
                            {request.cohorts?.join(", ") || "Non spécifié"}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      {request.status === "pending" && (
                        <div className="flex gap-2 pt-3 border-t border-tacir-lightgray">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-tacir-pink text-tacir-pink hover:bg-tacir-pink/10 text-xs h-8"
                            onClick={(e) => handleReject(request, e)}
                          >
                            <X className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-tacir-green hover:bg-tacir-darkblue text-white text-xs h-8"
                            onClick={(e) => handleApprove(request, e)}
                          >
                            <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {requests.length > 0 && (
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-tacir-lightgray">
              <Pagination
                page={pagination.page}
                limit={pagination.limit}
                total={pagination.total}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4 sm:space-y-6">
          <Card className="p-4 sm:p-6 shadow-sm rounded-lg sm:rounded-xl bg-white border border-tacir-lightgray">
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
      {/* Modals */}
      <ApprovalModal
        isOpen={approveOpen}
        onClose={() => setApproveOpen(false)}
        training={selectedRequest}
        sessionType={sessionType}
        setSessionType={setSessionType}
        location={location}
        setLocation={setLocation}
        meetingLink={meetingLink}
        setMeetingLink={setMeetingLink}
        isProcessing={isProcessing}
        onApprove={confirmApprove}
      />
      <RejectionModal
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        training={selectedRequest}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        isProcessing={isProcessing}
        onReject={confirmReject}
      />
      {detailsModalOpen && selectedTraining && (
        <TrainingDetailsModal
          training={selectedTraining}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedTraining(null);
          }}
        />
      )}
    </div>
  );
}
