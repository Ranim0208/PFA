"use client";
import { useState, useEffect } from "react";
import { ParticipantOutputCard } from "@/features/output/ParticipantOutputCard";
import { SubmissionDialog } from "@/features/output/OutputSubmissionDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/features/output/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  List,
  Grid,
  Target,
  Clock,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Calendar,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  getMyOutputs,
  submitParticipantOutput,
  updateParticipantSubmission,
} from "@/services/outputs/output";
import { toast } from "react-toastify";

const ParticipantOutputsPage = () => {
  const [outputs, setOutputs] = useState([]);
  const [filteredOutputs, setFilteredOutputs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    notStarted: 0,
    submitted: 0,
    approved: 0,
    overdue: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedOutput, setSelectedOutput] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    sort: "dueDate-asc",
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        setLoading(true);
        const outputsRes = await getMyOutputs();
        console.log("outputs", outputsRes);
        setOutputs(outputsRes.data || []);
        setFilteredOutputs(outputsRes.data || []);
        setStats(
          outputsRes.stats || {
            total: 0,
            notStarted: 0,
            submitted: 0,
            approved: 0,
            overdue: 0,
          }
        );
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Erreur lors du chargement des livrables");
        setOutputs([]);
        setFilteredOutputs([]);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...outputs];

    // Apply search filter
    if (filters.search) {
      result = result.filter(
        (output) =>
          output.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
          output.description
            ?.toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status !== "all") {
      result = result.filter((output) => {
        if (filters.status === "not_started") return !output.submission;
        if (filters.status === "submitted")
          return output.submission?.submitted && !output.submission?.approved;
        if (filters.status === "approved") return output.submission?.approved;
        if (filters.status === "overdue") {
          const due = new Date(output.dueDate);
          const today = new Date();
          return due < today && !output.submission?.approved;
        }
        return true;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      if (filters.sort === "dueDate-asc") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (filters.sort === "dueDate-desc") {
        return new Date(b.dueDate) - new Date(a.dueDate);
      } else if (filters.sort === "title-asc") {
        return a.title?.localeCompare(b.title);
      } else if (filters.sort === "title-desc") {
        return b.title?.localeCompare(a.title);
      }
      return 0;
    });

    setFilteredOutputs(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, outputs]);

  const getPaginatedOutputs = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOutputs.slice(startIndex, endIndex);
  };

  const handleSubmission = async (submissionData) => {
    try {
      const result = await submitParticipantOutput(submissionData.outputId, {
        notes: submissionData.notes,
        attachments: submissionData.attachments,
      });
      toast.success(result.message || "Soumission réussie !");
      setIsDialogOpen(false);
      // Refresh data
      const res = await getMyOutputs();
      setOutputs(res.data || []);
      setStats(res.stats || stats);
    } catch (error) {
      throw error;
    }
  };

  const handleUpdate = async (outputId, submissionData, attachments) => {
    try {
      await updateParticipantSubmission(outputId, submissionData, attachments);
      // Refresh data
      const res = await getMyOutputs();
      setOutputs(res.data || []);
      setStats(res.stats || stats);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Échec de la mise à jour:", error);
    }
  };

  const openSubmissionDialog = (output, isUpdate = false) => {
    setSelectedOutput(output);
    setIsUpdating(isUpdate);
    setIsDialogOpen(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Determine empty state type
  const getEmptyStateConfig = () => {
    if (initialLoading) {
      return {
        type: "loading",
        title: "Chargement de vos livrables...",
        description:
          "Veuillez patienter pendant que nous chargeons vos données.",
        icon: <Loader2 className="w-12 h-12 text-tacir-blue animate-spin" />,
      };
    }

    if (outputs.length === 0) {
      return {
        type: "no-outputs",
        title: "Aucun livrable assigné",
        description:
          "Vous n'avez aucun livrable pour le moment. Revenez plus tard ou contactez votre administrateur.",
        icon: <FileText className="w-12 h-12 text-tacir-darkgray" />,
      };
    }

    if (filteredOutputs.length === 0) {
      if (filters.search || filters.status !== "all") {
        return {
          type: "no-results",
          title: "Aucun résultat trouvé",
          description:
            "Aucun livrable ne correspond à vos critères de recherche. Essayez de modifier vos filtres.",
          icon: <Search className="w-12 h-12 text-tacir-darkgray" />,
        };
      }
      return {
        type: "empty-filtered",
        title: "Aucun livrable disponible",
        description: "Aucun livrable ne correspond aux critères sélectionnés.",
        icon: <Filter className="w-12 h-12 text-tacir-darkgray" />,
      };
    }

    return null;
  };

  const emptyStateConfig = getEmptyStateConfig();

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-tacir-darkblue mb-2">
          Mes Livrables
        </h1>
        <p className="text-sm sm:text-base text-tacir-darkgray">
          Gérez vos soumissions et suivez votre progression
        </p>
      </div>

      {/* Stats Cards - Responsive grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard
          title="Total"
          value={stats.total}
          icon={<Target className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="bg-tacir-blue/10 text-tacir-blue"
          loading={initialLoading}
        />
        <StatCard
          title="À faire"
          value={stats.notStarted}
          icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="bg-tacir-orange/10 text-tacir-orange"
          loading={initialLoading}
        />
        <StatCard
          title="Soumis"
          value={stats.submitted}
          icon={<Upload className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="bg-tacir-lightblue/10 text-tacir-lightblue"
          loading={initialLoading}
        />
        <StatCard
          title="Approuvés"
          value={stats.approved}
          icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="bg-tacir-green/10 text-tacir-green"
          loading={initialLoading}
        />
        <StatCard
          title="En retard"
          value={stats.overdue}
          icon={<AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="bg-tacir-pink/10 text-tacir-pink"
          loading={initialLoading}
        />
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-tacir-lightgray/30 p-4 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-tacir-darkgray" />
            <Input
              placeholder="Rechercher un livrable..."
              className="pl-10 text-sm sm:text-base"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 ${
                viewMode === "list"
                  ? "bg-tacir-blue hover:bg-tacir-blue/90 text-white"
                  : "bg-transparent hover:bg-tacir-lightgray/20"
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden xs:inline">Liste</span>
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 ${
                viewMode === "grid"
                  ? "bg-tacir-blue hover:bg-tacir-blue/90 text-white"
                  : "bg-transparent hover:bg-tacir-lightgray/20"
              }`}
            >
              <Grid className="w-4 h-4" />
              <span className="hidden xs:inline">Grille</span>
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <Label className="text-sm text-tacir-darkgray mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Statut
            </Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-full text-sm sm:text-base">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="not_started">À faire</SelectItem>
                <SelectItem value="submitted">Soumis</SelectItem>
                <SelectItem value="approved">Approuvés</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Filter */}
          <div>
            <Label className="text-sm text-tacir-darkgray mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Trier par
            </Label>
            <Select
              value={filters.sort}
              onValueChange={(value) => handleFilterChange("sort", value)}
            >
              <SelectTrigger className="w-full text-sm sm:text-base">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate-asc">
                  Date limite (croissant)
                </SelectItem>
                <SelectItem value="dueDate-desc">
                  Date limite (décroissant)
                </SelectItem>
                <SelectItem value="title-asc">Titre (A-Z)</SelectItem>
                <SelectItem value="title-desc">Titre (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items per page for mobile */}
          <div className="block xl:hidden">
            <Label className="text-sm text-tacir-darkgray mb-1">
              Éléments par page
            </Label>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full text-sm sm:text-base">
                <SelectValue placeholder="Éléments par page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  search: "",
                  status: "all",
                  sort: "dueDate-asc",
                })
              }
              className="w-full text-sm sm:text-base"
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2">
          <TabsTrigger
            value="all"
            onClick={() => handleFilterChange("status", "all")}
            className="text-xs sm:text-sm px-2 sm:px-4"
          >
            Tous ({stats.total})
          </TabsTrigger>
          <TabsTrigger
            value="not_started"
            onClick={() => handleFilterChange("status", "not_started")}
            className="text-xs sm:text-sm px-2 sm:px-4"
          >
            À faire ({stats.notStarted})
          </TabsTrigger>
          <TabsTrigger
            value="submitted"
            onClick={() => handleFilterChange("status", "submitted")}
            className="text-xs sm:text-sm px-2 sm:px-4"
          >
            Soumis ({stats.submitted})
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            onClick={() => handleFilterChange("status", "approved")}
            className="text-xs sm:text-sm px-2 sm:px-4"
          >
            Approuvés ({stats.approved})
          </TabsTrigger>
          <TabsTrigger
            value="overdue"
            onClick={() => handleFilterChange("status", "overdue")}
            className="text-xs sm:text-sm px-2 sm:px-4"
          >
            En retard ({stats.overdue})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Loading State */}
      {initialLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-tacir-blue animate-spin mx-auto mb-4" />
            <p className="text-tacir-darkgray">
              Chargement de vos livrables...
            </p>
          </div>
        </div>
      )}

      {/* Empty States */}
      {!initialLoading && emptyStateConfig && (
        <EmptyState
          config={emptyStateConfig}
          hasFilters={filters.search || filters.status !== "all"}
          onResetFilters={() =>
            setFilters({
              search: "",
              status: "all",
              sort: "dueDate-asc",
            })
          }
        />
      )}

      {/* Outputs List */}
      {!initialLoading && !emptyStateConfig && (
        <>
          {/* Results Count */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-tacir-darkgray">
              {filteredOutputs.length} livrable
              {filteredOutputs.length > 1 ? "s" : ""} trouvé
              {filteredOutputs.length > 1 ? "s" : ""}
            </p>
            {loading && (
              <Loader2 className="w-4 h-4 text-tacir-blue animate-spin" />
            )}
          </div>

          {/* Outputs Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6">
              {getPaginatedOutputs().map((output) => (
                <ParticipantOutputCard
                  key={output._id}
                  output={output}
                  compact={true}
                  onSubmit={() => openSubmissionDialog(output)}
                  onUpdateSubmission={() => openSubmissionDialog(output, true)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {getPaginatedOutputs().map((output) => (
                <ParticipantOutputCard
                  key={output._id}
                  output={output}
                  compact={false}
                  onSubmit={() => openSubmissionDialog(output)}
                  onUpdateSubmission={() => openSubmissionDialog(output, true)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredOutputs.length > 0 && (
            <Pagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredOutputs.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1);
              }}
            />
          )}
        </>
      )}

      {/* Submission Dialog */}
      <SubmissionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        output={selectedOutput}
        onSubmit={handleSubmission}
      />
    </div>
  );
};

const StatCard = ({ title, value, icon, color, loading = false }) => {
  return (
    <div
      className={`p-3 sm:p-4 rounded-xl ${color} flex items-center justify-between`}
    >
      <div>
        <p className="text-xs sm:text-sm font-medium text-tacir-darkgray">
          {title}
        </p>
        <p className="text-xl sm:text-2xl font-bold">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : value}
        </p>
      </div>
      <div className="p-2 bg-white/30 rounded-full">{icon}</div>
    </div>
  );
};

const EmptyState = ({ config, hasFilters, onResetFilters }) => {
  const getActionButton = () => {
    if (config.type === "no-results" && hasFilters) {
      return (
        <Button variant="outline" onClick={onResetFilters} className="mt-4">
          Réinitialiser les filtres
        </Button>
      );
    }

    if (config.type === "no-outputs") {
      return (
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Actualiser la page
        </Button>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-tacir-lightgray/30 p-6 sm:p-8 text-center">
      <div className="mx-auto max-w-md">
        <div className="p-4 bg-tacir-lightgray/20 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 flex items-center justify-center">
          {config.icon}
        </div>
        <h3 className="text-lg sm:text-xl font-medium text-tacir-darkblue mb-2">
          {config.title}
        </h3>
        <p className="text-tacir-darkgray mb-4 text-sm sm:text-base">
          {config.description}
        </p>
        {getActionButton()}
      </div>
    </div>
  );
};

export default ParticipantOutputsPage;
