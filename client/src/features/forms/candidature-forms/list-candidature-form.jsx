"use client";
import { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  getAllForms,
  deleteFormById,
  publishValidatedForms,
  saveFormAsTemplate,
  getAllTemplates,
} from "../../../services/forms/formServices";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { DataTablePagination } from "../../../components/common/table/DataTablePagination";
import { DataTableViewOptions } from "../../../components/common/table/DataTableViewOptions";
import { DataTableCreatedByFilter } from "./DataTableCreatedByFilter";
import DeleteFormDialog from "./DeleteCandidatureFormDialog";
import { getCandidatureFormColumns } from "./columns";
import CandidatureFormDetailsPreview from "./FormDetails-preview";
import TemplateManager from "@/components/formBuilder/TemplateManager";
import SaveAsTemplateDialog from "./SaveAsTemplateDialog";
import {
  Users,
  FileText,
  Plus,
  Search,
  Filter,
  Upload,
  RefreshCw,
  ChevronDown,
  Eye,
  Copy,
  Star,
  Edit,
  Trash2,
  MoreHorizontal,
  Sparkles,
  CheckCircle,
  Clock,
  Calendar,
  BarChart3,
  Grid3x3,
  List,
  X,
} from "lucide-react";
import { DataTableSearch } from "./DataTableSearch";
import { DataTableTemplateFilter } from "./DataTableTemplateFilter";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const CandidatureFormsTable = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [createdByFilter, setCreatedByFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formToDelete, setFormToDelete] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [saveAsTemplateDialogOpen, setSaveAsTemplateDialogOpen] =
    useState(false);
  const [selectedFormForTemplate, setSelectedFormForTemplate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [templateFilter, setTemplateFilter] = useState("forms");
  const [viewMode, setViewMode] = useState("table");

  const [rowSelection, setRowSelection] = useState({});

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    templates: 0,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const handlePreview = (form) => {
    setPreviewForm(form);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    await fetchTemplates();
    setRefreshing(false);
  };

  const columnsConfig = getCandidatureFormColumns({
    onPreview: handlePreview,
    onConfirmDelete: (form) => {
      setFormToDelete(form);
      setDialogOpen(true);
    },
    onSaveAsTemplate: (form) => {
      setSelectedFormForTemplate(form);
      setSaveAsTemplateDialogOpen(true);
    },
    onUseAsTemplate: (form) => {
      router.push(
        `/incubation-coordinator/candidatures/ajouter-candidature?templateId=${form._id}`
      );
    },
    onEdit: (form) => {
      router.push(`/incubation-coordinator/candidatures/edit/${form._id}`);
    },
  });

  const handleDelete = async () => {
    try {
      await deleteFormById(formToDelete._id);
      toast.success("✅ Formulaire supprimé avec succès");
      setDialogOpen(false);
      setFormToDelete(null);
      refreshData();
    } catch (error) {
      toast.error("❌ Erreur lors de la suppression");
      console.error(error);
    }
  };

  const handlePublishForm = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const ids = selectedRows.map((row) => row.original._id);

    if (ids.length === 0) {
      return toast.warn(
        "📝 Veuillez sélectionner au moins un formulaire à publier."
      );
    }

    try {
      const response = await publishValidatedForms(ids);
      const { message, modifiedCount, success } = response;

      if (!success && modifiedCount === 0) {
        toast.info(message || "ℹ️ Aucun formulaire n'a été publié.");
      } else {
        toast.success("🎉 " + (message || "Formulaires publiés avec succès !"));
      }

      setRowSelection(() => ({}));
      await refreshData();
    } catch (error) {
      toast.error(
        error.message ||
          "❌ Une erreur est survenue lors de la publication des formulaires."
      );
    }
  };

  const handleSaveAsTemplate = async (templateData) => {
    try {
      setTemplateLoading(true);
      await saveFormAsTemplate(selectedFormForTemplate._id, templateData);
      toast.success("⭐ Modèle enregistré avec succès !");
      setSaveAsTemplateDialogOpen(false);
      setSelectedFormForTemplate(null);
      await refreshData();
    } catch (error) {
      toast.error("❌ Erreur lors de l'enregistrement du modèle");
      console.error(error);
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleApplyTemplate = async (templateId) => {
    try {
      router.push(
        `/incubation-coordinator/candidatures/ajouter-candidature?templateId=${templateId}`
      );
      setTemplateDialogOpen(false);
    } catch (error) {
      toast.error("❌ Erreur lors de l'application du modèle");
      console.error(error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await getAllTemplates();
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  // Fetch stats separately for accurate counting
  const fetchStats = async () => {
    try {
      // Get all forms (not templates)
      const formsResponse = await getAllForms({
        page: 1,
        pageSize: 10000,
        isTemplate: false,
      });

      // Get all templates
      const templatesResponse = await getAllForms({
        page: 1,
        pageSize: 10000,
        isTemplate: true,
      });

      const allForms = formsResponse.data || [];
      const allTemplates = templatesResponse.data || [];

      // Count published forms (validated AND published)
      const published = allForms.filter(
        (form) => form.validated && form.published
      ).length;

      // Count drafts (not validated OR not published)
      const drafts = allForms.filter(
        (form) => !form.validated || !form.published
      ).length;

      setStats({
        total: allForms.length,
        published,
        drafts,
        templates: allTemplates.length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const table = useReactTable({
    data,
    columns: columnsConfig,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: Math.ceil(totalItems / pagination.pageSize),
    state: {
      sorting,
      pagination,
      rowSelection,
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAllForms({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        sortField: sorting[0]?.id || "createdAt",
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
        createdBy: createdByFilter,
        search: searchTerm,
        isTemplate:
          templateFilter === "forms"
            ? false
            : templateFilter === "templates"
            ? true
            : undefined,
      });
      setData(response.data);
      setTotalItems(response.pagination.total);

      // Fetch stats separately
      await fetchStats();
    } catch (error) {
      console.error("Error fetching forms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTemplates();
  }, [pagination, sorting, createdByFilter, searchTerm, templateFilter]);

  const handleTemplateFilterChange = (value) => {
    setTemplateFilter(value);
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const getStatusBadge = (form) => {
    if (form.isTemplate) {
      return (
        <Badge className="bg-tacir-pink text-white text-xs font-medium border-0">
          <Star className="h-3 w-3 mr-1" />
          Modèle
        </Badge>
      );
    }

    if (form.validated && form.published) {
      return (
        <Badge className="bg-tacir-green text-white text-xs font-medium border-0">
          <CheckCircle className="h-3 w-3 mr-1" />
          Validé & Publié
        </Badge>
      );
    }

    if (form.validated && !form.published) {
      return (
        <Badge className="bg-tacir-blue text-white text-xs font-medium border-0">
          <CheckCircle className="h-3 w-3 mr-1" />
          Validé
        </Badge>
      );
    }

    return (
      <Badge className="bg-tacir-yellow text-white text-xs font-medium border-0">
        <Clock className="h-3 w-3 mr-1" />
        Brouillon
      </Badge>
    );
  };

  const getFieldCount = (form) => {
    return form.fields?.length || 0;
  };

  const GridViewActions = ({ form }) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlePreview(form)}
        className="flex-1 text-tacir-blue hover:bg-tacir-lightblue/10 hover:text-tacir-darkblue"
      >
        <Eye className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          router.push(
            `/incubation-coordinator/candidatures/modifier-candidature/${form._id}`
          )
        }
        className="text-tacir-green hover:bg-tacir-green/10"
      >
        <Edit className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setSelectedFormForTemplate(form);
          setSaveAsTemplateDialogOpen(true);
        }}
        className="text-tacir-yellow hover:bg-tacir-yellow/10"
      >
        <Star className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-tacir-darkgray hover:bg-tacir-lightgray"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() =>
              router.push(
                `/incubation-coordinator/candidatures/ajouter-candidature?templateId=${form._id}`
              )
            }
            className="text-tacir-blue cursor-pointer"
          >
            <Copy className="h-4 w-4 mr-2" />
            Utiliser comme modèle
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setFormToDelete(form);
              setDialogOpen(true);
            }}
            className="text-tacir-pink cursor-pointer"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 bg-tacir-lightgray/30 min-h-screen">
      {/* Enhanced Header with Stats */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-md border border-tacir-lightgray p-4 sm:p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="p-2 sm:p-3 bg-tacir-darkblue rounded-lg flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-tacir-darkblue">
                    Formulaires des candidatures
                  </h1>
                  <Badge
                    variant="secondary"
                    className="bg-tacir-lightblue/20 text-tacir-darkblue text-xs"
                  >
                    {stats.total}
                  </Badge>
                </div>
                <p className="text-tacir-darkgray text-xs sm:text-sm">
                  Gérez et suivez tous vos formulaires de candidature
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

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-tacir-lightblue/10 border-tacir-lightblue/30 hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-tacir-darkblue">
                      Total
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-tacir-darkblue">
                      {stats.total}
                    </p>
                  </div>
                  <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-tacir-blue opacity-70" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-tacir-green/10 border-tacir-green/30 hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-tacir-green">
                      Publiés
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-tacir-green">
                      {stats.published}
                    </p>
                  </div>
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-tacir-green opacity-70" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-tacir-yellow/10 border-tacir-yellow/30 hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-tacir-yellow">
                      Brouillons
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-tacir-yellow">
                      {stats.drafts}
                    </p>
                  </div>
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-tacir-yellow opacity-70" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-tacir-pink/10 border-tacir-pink/30 hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-tacir-pink">
                      Modèles
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-tacir-pink">
                      {stats.templates}
                    </p>
                  </div>
                  <Star className="h-6 w-6 sm:h-8 sm:w-8 text-tacir-pink opacity-70" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Action Bar - Compact Version */}
      {/* Enhanced Action Bar - Desktop Optimized */}
      <div className="bg-white rounded-xl shadow-md border border-tacir-lightgray/30 p-4 md:p-6 mb-4 md:mb-6">
        {/* Action Buttons Only - No duplicate view toggle */}
        <div className="flex flex-col lg:flex-row gap-3">
          <Button
            variant="destructive"
            onClick={handlePublishForm}
            disabled={Object.keys(rowSelection).length === 0}
            className="bg-tacir-pink hover:bg-tacir-pink/90 text-white px-4 lg:px-6 py-2.5 text-sm font-medium shadow-sm transition-all w-full lg:w-auto justify-center lg:justify-start min-w-[140px]"
          >
            <Upload className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="flex items-center gap-1.5">
              Publier
              {Object.keys(rowSelection).length > 0 && (
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-bold min-w-5">
                  {Object.keys(rowSelection).length}
                </span>
              )}
            </span>
          </Button>

          <Button
            onClick={() => setTemplateDialogOpen(true)}
            className="bg-tacir-blue hover:bg-tacir-blue/90 text-white px-4 lg:px-6 py-2.5 text-sm font-medium shadow-sm transition-all w-full lg:w-auto justify-center lg:justify-start min-w-[120px]"
          >
            <Sparkles className="h-4 w-4 mr-2 flex-shrink-0" />
            Modèles
          </Button>

          <Button
            asChild
            className="bg-tacir-green hover:bg-tacir-green/90 text-white px-4 lg:px-6 py-2.5 text-sm font-medium shadow-sm transition-all w-full lg:w-auto justify-center lg:justify-start min-w-[140px]"
          >
            <Link
              href="/incubation-coordinator/candidatures/ajouter-candidature"
              className="flex items-center justify-center lg:justify-start"
            >
              <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
              Nouveau formulaire
            </Link>
          </Button>
        </div>
      </div>
      {/* Enhanced Compact Filters Section */}
      <div className="bg-white rounded-xl shadow-md border border-tacir-lightgray/30 p-4 md:p-6">
        {/* Desktop: All in one row */}
        <div className="hidden lg:flex items-center justify-between gap-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 flex-1">
            {/* Search Bar using DataTableSearch */}
            <div className="flex-1 max-w-md">
              <DataTableSearch
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Rechercher par titre, description..."
                className="w-full"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <DataTableTemplateFilter
                value={templateFilter}
                onChange={handleTemplateFilterChange}
              />
              <DataTableCreatedByFilter
                value={createdByFilter}
                onChange={(val) => {
                  setCreatedByFilter(val);
                  setPagination({ ...pagination, pageIndex: 0 });
                }}
                data={data}
              />
            </div>
          </div>

          {/* Stats and View Toggle */}
          <div className="flex items-center gap-6">
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-tacir-green rounded-full"></div>
                <span className="font-medium text-tacir-darkblue">
                  {table.getRowModel().rows.length} formulaire
                  {table.getRowModel().rows.length !== 1 ? "s" : ""}
                  {(searchTerm ||
                    createdByFilter ||
                    templateFilter !== "forms") &&
                    " trouvé(s)"}
                </span>
              </div>
              <div className="w-px h-4 bg-tacir-darkgray/30"></div>
              <span className="text-tacir-darkgray">
                Total: <span className="font-semibold">{totalItems}</span>
              </span>
            </div>

            {/* View Toggle */}
            <Tabs
              value={viewMode}
              onValueChange={setViewMode}
              className="w-auto"
            >
              <TabsList className="bg-tacir-lightgray/50 p-1">
                <TabsTrigger
                  value="table"
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

        {/* Mobile: Compact Layout */}
        <div className="lg:hidden space-y-3">
          {/* Search Bar using DataTableSearch */}
          <DataTableSearch
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Rechercher..."
            className="w-full"
          />

          {/* Mobile Stats and Filter Toggle */}
          <div className="flex items-center justify-between">
            {/* Stats */}
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-tacir-green rounded-full"></div>
              <span className="font-medium text-tacir-darkblue">
                {table.getRowModel().rows.length} formulaire
                {table.getRowModel().rows.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="gap-2 h-9 border-tacir-darkgray/30 text-tacir-darkblue hover:text-tacir-blue"
            >
              <Filter className="w-4 h-4" />
              Filtres
              {(searchTerm ||
                createdByFilter ||
                templateFilter !== "forms") && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-tacir-blue text-white text-xs">
                  {(searchTerm ? 1 : 0) +
                    (createdByFilter ? 1 : 0) +
                    (templateFilter !== "forms" ? 1 : 0)}
                </Badge>
              )}
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  showMobileFilters && "rotate-180"
                )}
              />
            </Button>
          </div>
        </div>

        {/* Active Filters Badges */}
        {(searchTerm || createdByFilter || templateFilter !== "forms") && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-tacir-lightgray">
            {searchTerm && (
              <Badge
                variant="secondary"
                className="bg-tacir-lightblue text-tacir-darkblue gap-1 pr-1"
              >
                <Search className="w-3 h-3" />"{searchTerm.substring(0, 15)}
                {searchTerm.length > 15 ? "..." : ""}"
                <button
                  onClick={() => handleSearchChange("")}
                  className="hover:text-tacir-blue ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {createdByFilter && (
              <Badge
                variant="secondary"
                className="bg-tacir-lightblue text-tacir-darkblue gap-1 pr-1"
              >
                <Users className="w-3 h-3" />
                Créateur
                <button
                  onClick={() => setCreatedByFilter("")}
                  className="hover:text-tacir-blue ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {templateFilter !== "forms" && (
              <Badge
                variant="secondary"
                className="bg-tacir-lightblue text-tacir-darkblue gap-1 pr-1"
              >
                <FileText className="w-3 h-3" />
                {templateFilter === "templates" ? "Modèles" : "Tous types"}
                <button
                  onClick={() => handleTemplateFilterChange("forms")}
                  className="hover:text-tacir-blue ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setCreatedByFilter("");
                setTemplateFilter("forms");
                setPagination({ ...pagination, pageIndex: 0 });
              }}
              className="text-xs h-7 text-tacir-darkgray hover:text-tacir-blue"
            >
              Tout effacer
            </Button>
          </div>
        )}

        {/* Mobile Filters Dropdown - Compact Version */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
            showMobileFilters
              ? "max-h-40 opacity-100 mt-3"
              : "max-h-0 opacity-0"
          )}
        >
          <div className="pt-3 border-t border-tacir-lightgray">
            {/* Compact Filters Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Type Filter */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-tacir-darkblue">
                  Type
                </span>
                <DataTableTemplateFilter
                  value={templateFilter}
                  onChange={handleTemplateFilterChange}
                  className="w-full"
                />
              </div>

              {/* Created By Filter */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-tacir-darkblue">
                  Créé par
                </span>
                <DataTableCreatedByFilter
                  value={createdByFilter}
                  onChange={(val) => {
                    setCreatedByFilter(val);
                    setPagination({ ...pagination, pageIndex: 0 });
                  }}
                  data={data}
                  className="w-full"
                />
              </div>
            </div>

            {/* Clear Filters Button - Only show if filters are active */}
            {(searchTerm || createdByFilter || templateFilter !== "forms") && (
              <div className="mt-3 pt-3 border-t border-tacir-lightgray">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setCreatedByFilter("");
                    setTemplateFilter("forms");
                    setPagination({ ...pagination, pageIndex: 0 });
                  }}
                  className="w-full gap-2 text-xs h-8"
                >
                  <X className="w-3 h-3" />
                  Effacer tous les filtres
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Enhanced Table/Grid View */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-md border border-tacir-lightgray overflow-hidden">
        {loading ? (
          <div className="space-y-4 p-4 sm:p-6">
            {viewMode === "table" ? (
              [...Array(pagination.pageSize)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="border-tacir-lightgray">
                    <CardContent className="p-4 sm:p-5">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : viewMode === "table" ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-tacir-darkblue">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-semibold text-white uppercase tracking-wider"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-tacir-lightgray">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-tacir-lightgray/30 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 xl:px-6 py-4 text-xs xl:text-sm whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View - Grid Style */}
            <div className="lg:hidden grid grid-cols-1 gap-4 p-4">
              {table.getRowModel().rows.map((row) => {
                const form = row.original;
                return (
                  <Card
                    key={row.id}
                    className="hover:shadow-lg transition-all duration-300 border-tacir-lightgray overflow-hidden"
                  >
                    <div className="h-1 bg-tacir-blue"></div>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {/* Header with checkbox and status */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="pt-1">
                              {flexRender(
                                row.getVisibleCells()[0].column.columnDef.cell,
                                row.getVisibleCells()[0].getContext()
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-tacir-darkblue text-base line-clamp-2 mb-2">
                                {form.title?.fr || "Sans titre"}
                              </h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                {getStatusBadge(form)}
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-tacir-lightgray/50 text-tacir-darkgray border-tacir-lightgray"
                                >
                                  {getFieldCount(form)} champs
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Arabic Title */}
                        {form.title?.ar && (
                          <div
                            className="text-sm text-tacir-darkgray text-right line-clamp-2"
                            dir="rtl"
                          >
                            {form.title.ar}
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="space-y-2 text-sm text-tacir-darkgray">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 flex-shrink-0 text-tacir-blue" />
                              <span className="truncate">
                                {new Date(form.createdAt).toLocaleDateString(
                                  "fr-FR",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                          {form.createdBy?.name && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 flex-shrink-0 text-tacir-blue" />
                              <span className="truncate">
                                {form.createdBy.name}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-tacir-lightgray">
                          <GridViewActions form={form} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          /* Enhanced Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
            {table.getRowModel().rows.map((row) => {
              const form = row.original;
              return (
                <Card
                  key={row.id}
                  className="hover:shadow-lg transition-all duration-300 border-tacir-lightgray cursor-pointer overflow-hidden"
                >
                  <div className="h-1 bg-tacir-blue"></div>
                  <CardContent className="p-4 sm:p-5">
                    <div className="space-y-4">
                      {/* Header with title and status */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-tacir-darkblue text-base sm:text-lg hover:text-tacir-blue transition-colors line-clamp-2 mb-2">
                            {form.title?.fr || "Sans titre"}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            {getStatusBadge(form)}
                            <Badge
                              variant="outline"
                              className="text-xs bg-tacir-lightgray/50 text-tacir-darkgray border-tacir-lightgray"
                            >
                              {getFieldCount(form)} champs
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {form.description?.fr && (
                        <p className="text-sm text-tacir-darkgray line-clamp-3">
                          {form.description.fr}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="space-y-2 text-xs sm:text-sm text-tacir-darkgray">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {new Date(form.createdAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                        {form.createdBy?.name && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {form.createdBy.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-tacir-lightgray">
                        <GridViewActions form={form} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* No Results Message */}
        {table.getRowModel().rows.length === 0 && !loading && (
          <div className="text-center py-12 sm:py-16 px-4">
            <FileText className="w-16 h-16 sm:w-20 sm:h-20 text-tacir-lightgray mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-tacir-darkgray mb-2">
              Aucun formulaire trouvé
            </h3>
            <p className="text-sm text-tacir-darkgray mb-4 sm:mb-6">
              {searchTerm || createdByFilter || templateFilter !== "forms"
                ? "Essayez de modifier vos critères de recherche"
                : "Commencez par créer votre premier formulaire"}
            </p>
            {!searchTerm && !createdByFilter && templateFilter === "forms" && (
              <Button
                asChild
                className="bg-tacir-green hover:bg-tacir-green/90 text-white"
              >
                <Link href="/incubation-coordinator/candidatures/ajouter-candidature">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un formulaire
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="px-4 sm:px-6 py-4 border-t border-tacir-lightgray bg-tacir-lightgray/10">
          <DataTablePagination table={table} totalItems={totalItems} />
        </div>
      </div>

      {/* Dialogs */}
      <DeleteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={formToDelete}
        onDelete={handleDelete}
      />

      <CandidatureFormDetailsPreview
        form={previewForm}
        open={!!previewForm}
        onOpenChange={() => setPreviewForm(null)}
      />

      <TemplateManager
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        templates={templates}
        onSaveAsTemplate={handleSaveAsTemplate}
        onApplyTemplate={handleApplyTemplate}
        currentForm={selectedFormForTemplate}
        loading={templateLoading}
      />

      <SaveAsTemplateDialog
        open={saveAsTemplateDialogOpen}
        onOpenChange={setSaveAsTemplateDialogOpen}
        form={selectedFormForTemplate}
        onSave={handleSaveAsTemplate}
        loading={templateLoading}
      />
    </div>
  );
};

export default CandidatureFormsTable;
