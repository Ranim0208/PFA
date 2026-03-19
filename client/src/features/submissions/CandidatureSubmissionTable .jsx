"use client";

import { useState, useEffect, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  getFormsRegions,
  getOpenRegionForms,
  updateSubmissionStatus,
  validatePreselectionSubmissions,
  addOrUpdatePreselectionEvaluation,
  withdrawCandidate,
  getReplacementCandidates,
  selectReplacementCandidate,
} from "@/services/forms/submissionService";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableViewOptions } from "@/components/common/table/DataTableViewOptions";
import { DataTablePagination } from "@/components/common/table/DataTablePagination";
import { Input } from "@/components/ui/input";
import { getSubmissionColumns } from "./submission-columns";
import { toast } from "react-toastify";
import {
  Download,
  Users,
  Filter,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  ArrowUpDown,
  FileText,
  RefreshCw,
  BarChart3,
  X,
  AlertCircle,
} from "lucide-react";
import SubmissionPreview from "./SubmissionPreview";
import useCurrentUser from "@/hooks/useCurrentUser";
import { statusOptions } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "@/components/ui/Loader";
import WithdrawalManager from "./WithdrawalManager";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { handleExportWithDynamicColumns } from "@/utils/submissions-export";
const CandidatureSubmissionTable = () => {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [loadingRegions, setLoadingRegions] = useState(true);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasFetchedData, setHasFetchedData] = useState(false);

  const [sorting, setSorting] = useState([{ id: "createdAt", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const { user } = useCurrentUser();
  const [previewSubmission, setPreviewSubmission] = useState(null);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [replacementDialogOpen, setReplacementDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [replacementCandidates, setReplacementCandidates] = useState([]);
  const [selectedReplacement, setSelectedReplacement] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    accepted: 0,
    acceptedAfterCreathon: 0,
    rejected: 0,
  });

  const getRowClass = (status) => statusOptions[status]?.rowClass || "";

  useEffect(() => {
    let isMounted = true;

    const fetchRegions = async () => {
      try {
        const response = await getFormsRegions();
        const fetchedRegions = response?.data || [];
        if (isMounted) {
          setRegions(fetchedRegions);
          setLoadingRegions(false);
        }
      } catch (error) {
        console.error("Error fetching regions:", error);
        if (isMounted) {
          setLoadingRegions(false);
          toast.error("Erreur de chargement des régions");
        }
      }
    };

    fetchRegions();

    return () => {
      isMounted = false;
    };
  }, []);

  const { pageIndex, pageSize } = pagination;
  const sortField = sorting[0]?.id || "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const refreshData = async () => {
    setRefreshing(true);
    await fetchSubmissions();
    setRefreshing(false);
  };

  const fetchSubmissions = async () => {
    // If no region is selected, set empty state and return
    if (!selectedRegion) {
      setData([]);
      setHasFetchedData(true);
      setLoading(false);
      setStats({
        total: 0,
        submitted: 0,
        accepted: 0,
        acceptedAfterCreathon: 0,
        rejected: 0,
      });
      return;
    }

    setLoading(true);
    try {
      const { data: openForms = [] } = await getOpenRegionForms(
        selectedRegion,
        {
          page: pageIndex + 1,
          pageSize,
          sortField,
          sortOrder,
        }
      );

      const allSubmissions = openForms.map((sub) => {
        const answerMap = {};
        sub?.answers?.forEach((ans) => {
          const label = ans.field?.label?.fr;
          if (label) answerMap[label] = ans.value;
        });
        return { ...sub, ...answerMap, formTitle: sub?.form?.title?.fr };
      });

      setData(allSubmissions.filter((s) => s?._id));
      setHasFetchedData(true);

      // Calculate statistics - only for relevant statuses
      const statusCounts = allSubmissions.reduce(
        (acc, submission) => {
          acc.total++;

          // Only count the statuses we care about
          if (
            [
              "submitted",
              "accepted",
              "acceptedAfterCreathon",
              "rejected",
            ].includes(submission.status)
          ) {
            acc[submission.status] = (acc[submission.status] || 0) + 1;
          }

          return acc;
        },
        {
          total: 0,
          submitted: 0,
          accepted: 0,
          acceptedAfterCreathon: 0,
          rejected: 0,
        }
      );

      setStats(statusCounts);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      toast.error("Erreur lors du chargement des soumissions.");
      setData([]);
      setHasFetchedData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [
    selectedRegion,
    pageIndex,
    pageSize,
    sortField,
    sortOrder,
    refreshCounter,
  ]);

  const handlePreview = (submission) => setPreviewSubmission(submission);

  const refreshSubmissions = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  const handleWithdrawal = async (submission) => {
    setSelectedWithdrawal(submission);
    setWithdrawalDialogOpen(true);
  };

  const confirmWithdrawal = async (note = "") => {
    setIsProcessing(true);
    try {
      const response = await withdrawCandidate(selectedWithdrawal._id, note);
      toast.success(response.message);

      setData((prevData) =>
        prevData.map((item) =>
          item._id === selectedWithdrawal._id
            ? {
                ...item,
                status: "rejected",
                attendanceStatus: "declined",
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        rejected: prev.rejected + 1,
        [selectedWithdrawal.status]: prev[selectedWithdrawal.status] - 1,
      }));

      const { data } = await getReplacementCandidates(
        response.submission.submission.form
      );

      setReplacementCandidates(data);
      setWithdrawalDialogOpen(false);
      setReplacementDialogOpen(true);
    } catch (error) {
      toast.error(error.message || "Erreur lors du désistement");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectReplacement = async () => {
    if (!selectedReplacement) return;

    setIsProcessing(true);
    try {
      const response = await selectReplacementCandidate(selectedReplacement);
      toast.success(response.message);

      setData((prevData) =>
        prevData.map((item) =>
          item._id === selectedReplacement
            ? {
                ...item,
                status: "accepted",
                isReplacement: true,
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );

      // Update stats
      const replacedSubmission = data.find(
        (item) => item._id === selectedReplacement
      );
      if (replacedSubmission) {
        setStats((prev) => ({
          ...prev,
          accepted: prev.accepted + 1,
          [replacedSubmission.status]: prev[replacedSubmission.status] - 1,
        }));
      }

      setReplacementDialogOpen(false);
    } catch (error) {
      toast.error(error.message || "Erreur lors de la sélection du remplaçant");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusUpdate = async (submissionId, newStatus) => {
    try {
      const oldStatus = data.find((item) => item._id === submissionId)?.status;

      const response = await updateSubmissionStatus(submissionId, newStatus);
      toast.success(response.message || "Statut mis à jour avec succès");

      setData((prevData) =>
        prevData.map((item) =>
          item._id === submissionId ? { ...item, status: newStatus } : item
        )
      );

      // Update stats only if both old and new status are in our tracked statuses
      if (
        ["submitted", "accepted", "acceptedAfterCreathon", "rejected"].includes(
          oldStatus
        ) ||
        ["submitted", "accepted", "acceptedAfterCreathon", "rejected"].includes(
          newStatus
        )
      ) {
        setStats((prev) => ({
          ...prev,
          [newStatus]: (prev[newStatus] || 0) + 1,
          [oldStatus]: prev[oldStatus] - 1,
        }));
      }
    } catch (error) {
      toast.error(error.message || "Échec de la mise à jour du statut");
    }
  };

  const handleEvaluationChange = async (submissionId, evaluationText) => {
    try {
      // Show loading state if needed
      setIsProcessing(true);
      // Make API call
      await addOrUpdatePreselectionEvaluation(submissionId, evaluationText);
      toast.success("Évaluation enregistrée");
      // Final refresh to ensure complete sync
      refreshSubmissions();
    } catch (error) {
      // Revert on error
      toast.error("Erreur lors de l'enregistrement");
      console.error("Evaluation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidatePreselection = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (!selectedRows.length) return;

    // Check if any selected submission belongs to an open form
    const now = new Date();
    const openSubmissions = selectedRows.filter((row) => {
      const submission = row.original;
      // Assuming you have endDate in the submission or form data
      // You might need to adjust this based on your data structure
      return (
        submission.form?.endDate && new Date(submission.form.endDate) > now
      );
    });

    if (openSubmissions.length > 0) {
      toast.error(
        "La validation n'est pas permise. Certaines candidatures sélectionnées sont encore ouvertes. Veuillez attendre la fermeture des candidatures.",
        { autoClose: 5000 }
      );
      return;
    }

    try {
      const response = await validatePreselectionSubmissions(
        selectedRows.map((row) => row.original._id)
      );

      // Success message from backend or default
      const successMessage =
        response?.message || "Soumissions validées avec succès.";
      toast.success(successMessage);

      table.resetRowSelection();
      refreshSubmissions();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        error.response?.data?.error ||
        "Échec de la validation des soumissions.";

      toast.error(errorMessage, { autoClose: 5000 });
    }
  };

  const staticColumns = useMemo(
    () =>
      getSubmissionColumns(
        handlePreview,
        handleStatusUpdate,
        handleEvaluationChange,
        handleWithdrawal
      ),
    [
      handlePreview,
      handleStatusUpdate,
      handleEvaluationChange,
      handleWithdrawal,
    ]
  );

  const uniqueLabels = useMemo(() => {
    const labels = new Set();
    data.forEach((sub) =>
      sub.answers?.forEach((ans) => {
        const label = ans.field?.label?.fr;
        if (label) labels.add(label);
      })
    );
    return Array.from(labels);
  }, [data]);

  // Add maxWidth to each column definition
  const dynamicColumns = useMemo(
    () =>
      uniqueLabels.map((label) => ({
        accessorKey: label,
        header: label,
        cell: ({ row }) => {
          const value = row.original[label] || "-";
          return (
            <div className="truncate max-w-[200px]" title={value}>
              {value}
            </div>
          );
        },
        size: 220, // Set column size for better resizing
        minSize: 100,
        maxSize: 300,
      })),
    [uniqueLabels]
  );

  const coreStaticColumns = useMemo(
    () => staticColumns.filter((col) => col.id !== "actions"),
    [staticColumns]
  );
  const actionsColumn = useMemo(
    () => staticColumns.find((col) => col.id === "actions"),
    [staticColumns]
  );

  // Add maxWidth to static columns
  const enhancedStaticColumns = useMemo(
    () =>
      coreStaticColumns.map((col) => {
        // Set appropriate max widths for each column type
        let maxWidth = 150;
        if (col.accessorKey === "status") maxWidth = 140;
        if (col.accessorKey === "submittedAt") maxWidth = 130;
        if (col.accessorKey === "preselectionEvaluations") maxWidth = 230;
        if (col.accessorKey === "attendanceStatus") maxWidth = 150;

        return {
          ...col,
          cell: (props) => {
            const cellValue = col.cell?.(props);
            return (
              <div className="truncate" style={{ maxWidth: `${maxWidth}px` }}>
                {cellValue}
              </div>
            );
          },
          size: maxWidth,
          minSize: 80,
          maxSize: maxWidth + 50,
        };
      }),
    [coreStaticColumns]
  );

  // Add maxWidth to actions column
  const enhancedActionsColumn = useMemo(
    () => ({
      ...actionsColumn,
      cell: (props) => {
        const cellValue = actionsColumn.cell?.(props);
        return <div className="truncate max-w-[180px]">{cellValue}</div>;
      },
      size: 180,
      minSize: 120,
      maxSize: 200,
    }),
    [actionsColumn]
  );

  const columns = useMemo(
    () =>
      [
        ...enhancedStaticColumns,
        ...dynamicColumns,
        enhancedActionsColumn,
      ].filter(Boolean),
    [enhancedStaticColumns, dynamicColumns, enhancedActionsColumn]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination, globalFilter },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
  });
  const hasOpenForms = useMemo(() => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) return false;

    const now = new Date();
    return selectedRows.some((row) => {
      const endDate = row.original.form?.endDate;
      return endDate && new Date(endDate) > now;
    });
  }, [table.getSelectedRowModel().rows]);

  // Show loader only during initial regions loading
  if (loadingRegions) {
    return <Loader />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 bg-tacir-lightgray min-h-screen">
      {/* Enhanced Header with Actions */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-tacir-lightgray p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title Section */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tacir-darkblue rounded-lg flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-tacir-darkblue">
                  Gestion des Soumissions
                </h1>
                {hasFetchedData && !loading && stats.total > 0 && (
                  <Badge className="bg-tacir-blue text-white">
                    {stats.total}
                  </Badge>
                )}
              </div>
              <p className="text-tacir-darkgray text-sm mt-1">
                Consultez et gérez toutes les soumissions de candidature
              </p>
            </div>
          </div>

          {/* Actions Section - Aligned to right */}
          <div className="flex items-center gap-3 justify-end">
            <div className="flex items-center gap-2">
              <Button
                onClick={refreshData}
                variant="outline"
                size="icon"
                className="border-tacir-blue text-tacir-blue hover:bg-tacir-lightblue/10 flex-shrink-0"
                disabled={refreshing || !selectedRegion}
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>

              {/* Excel Export with Dynamic Columns */}
              <Button
                variant="outline"
                onClick={() => handleExportWithDynamicColumns(data)}
                className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white px-4 py-2.5 text-sm font-medium transition-all flex items-center gap-2"
                disabled={data.length === 0}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exporter Excel</span>
              </Button>
            </div>
            <Button
              onClick={handleValidatePreselection}
              disabled={
                table.getSelectedRowModel().rows.length === 0 || hasOpenForms
              }
              className="bg-tacir-green hover:bg-tacir-green/90 text-white px-4 py-2.5 text-sm font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                hasOpenForms
                  ? "La validation n'est pas permise tant que les candidatures sont ouvertes"
                  : table.getSelectedRowModel().rows.length === 0
                  ? "Sélectionnez des soumissions à valider"
                  : "Valider la présélection"
              }
            >
              <div className="flex items-center gap-2">
                {hasOpenForms && <AlertCircle className="h-4 w-4" />}
                <span>Valider la présélection</span>
                {table.getSelectedRowModel().rows.length > 0 && (
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-bold">
                    {table.getSelectedRowModel().rows.length}
                  </span>
                )}
              </div>
            </Button>
          </div>
        </div>

        {/* Stats Section - Only show when we have data */}
        {hasFetchedData && !loading && stats.total > 0 && (
          <>
            {/* Mobile Stats */}
            <div className="mt-4 lg:hidden">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex items-center gap-2 bg-tacir-lightblue/20 rounded-lg px-3 py-2 min-w-0 flex-1">
                  <BarChart3 className="h-4 w-4 text-tacir-blue flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-tacir-darkblue font-medium truncate">
                      Total
                    </div>
                    <div className="text-lg font-bold text-tacir-darkblue truncate">
                      {stats.total}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-tacir-yellow/20 rounded-lg px-3 py-2 min-w-0 flex-1">
                  <Clock className="h-4 w-4 text-tacir-yellow flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-tacir-yellow font-medium truncate">
                      En revue
                    </div>
                    <div className="text-lg font-bold text-tacir-yellow truncate">
                      {stats.submitted}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-tacir-green/20 rounded-lg px-3 py-2 min-w-0 flex-1">
                  <CheckCircle className="h-4 w-4 text-tacir-green flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-tacir-green font-medium truncate">
                      Acceptées
                    </div>
                    <div className="text-lg font-bold text-tacir-green truncate">
                      {stats.accepted}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Stats */}
            <div className="hidden lg:flex items-center gap-6 mt-4 pt-4 border-t border-tacir-lightgray">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-tacir-blue" />
                <span className="text-sm font-medium text-tacir-darkblue">
                  {stats.total} soumissions au total
                </span>
              </div>
              <div className="w-px h-4 bg-tacir-darkgray/30"></div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-tacir-yellow" />
                <span className="text-sm text-tacir-darkgray">
                  <span className="font-medium text-tacir-yellow">
                    {stats.submitted}
                  </span>{" "}
                  en revue
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-tacir-green" />
                <span className="text-sm text-tacir-darkgray">
                  <span className="font-medium text-tacir-green">
                    {stats.accepted}
                  </span>{" "}
                  acceptées
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-tacir-blue" />
                <span className="text-sm text-tacir-darkgray">
                  <span className="font-medium text-tacir-blue">
                    {stats.acceptedAfterCreathon}
                  </span>{" "}
                  après créathon
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-tacir-pink" />
                <span className="text-sm text-tacir-darkgray">
                  <span className="font-medium text-tacir-pink">
                    {stats.rejected}
                  </span>{" "}
                  rejetées
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Enhanced Compact Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-tacir-lightgray p-4 md:p-5">
        {/* Desktop: All in one row */}
        <div className="hidden lg:flex items-center justify-between gap-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 flex-1">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tacir-darkgray h-4 w-4" />
                <Input
                  placeholder="Rechercher..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 w-full"
                  disabled={!selectedRegion}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <Select
                value={selectedRegion}
                onValueChange={(value) => setSelectedRegion(value)}
              >
                <SelectTrigger className="w-[250px] border-tacir-darkgray/30">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-tacir-blue" />
                    <SelectValue placeholder="Sélectionnez une région" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region._id} value={region._id}>
                      {region.name.fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DataTableViewOptions table={table} />
            </div>
          </div>
        </div>

        {/* Mobile: Compact Layout */}
        <div className="lg:hidden space-y-3">
          <div className="flex items-center gap-2">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tacir-darkgray h-4 w-4" />
                <Input
                  placeholder="Rechercher..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 w-full"
                  disabled={!selectedRegion}
                />
              </div>
            </div>

            {/* Filter Button */}
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="h-10 w-10 p-0 border-tacir-darkgray/30 text-tacir-darkgray hover:text-tacir-blue hover:border-tacir-blue"
              disabled={!selectedRegion}
            >
              <Filter className="w-4 h-4" />
              {(globalFilter || selectedRegion) && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-tacir-blue rounded-full"></span>
              )}
            </Button>
          </div>
        </div>

        {/* Active Filters Badges */}
        {(globalFilter || selectedRegion) && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-tacir-lightgray">
            {globalFilter && (
              <Badge
                variant="secondary"
                className="bg-tacir-lightblue/20 text-tacir-darkblue gap-1 pr-1"
              >
                <Search className="w-3 h-3" />"{globalFilter.substring(0, 15)}
                {globalFilter.length > 15 ? "..." : ""}"
                <button
                  onClick={() => setGlobalFilter("")}
                  className="hover:text-tacir-blue ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {selectedRegion && (
              <Badge
                variant="secondary"
                className="bg-tacir-lightblue/20 text-tacir-darkblue gap-1 pr-1"
              >
                <Filter className="w-3 h-3" />
                Région
                <button
                  onClick={() => setSelectedRegion("")}
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
                setGlobalFilter("");
                setSelectedRegion("");
              }}
              className="text-xs h-7 text-tacir-darkgray hover:text-tacir-blue"
            >
              Tout effacer
            </Button>
          </div>
        )}

        {/* Mobile Filters Dropdown */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
            showMobileFilters
              ? "max-h-40 opacity-100 mt-3"
              : "max-h-0 opacity-0"
          )}
        >
          <div className="pt-3 border-t border-tacir-lightgray">
            <div className="space-y-3">
              <Select
                value={selectedRegion}
                onValueChange={(value) => setSelectedRegion(value)}
              >
                <SelectTrigger className="w-full border-tacir-darkgray/30">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-tacir-blue" />
                    <SelectValue placeholder="Sélectionnez une région" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region._id} value={region._id}>
                      {region.name.fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DataTableViewOptions table={table} />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Table View */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-tacir-lightgray overflow-hidden">
        {loading ? (
          <div className="space-y-4 p-4 sm:p-6">
            {[...Array(pagination.pageSize)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            {/* Show content when data fetching is complete OR when no region is selected */}
            {(hasFetchedData || !selectedRegion) && (
              <>
                {/* No Region Selected State */}
                {!selectedRegion && (
                  <div className="text-center py-12 sm:py-16 px-4">
                    <AlertCircle className="w-16 h-16 sm:w-20 sm:h-20 text-tacir-yellow mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-tacir-darkgray mb-2">
                      Aucune région sélectionnée
                    </h3>
                    <p className="text-sm text-tacir-darkgray mb-4 sm:mb-6 max-w-md mx-auto">
                      Veuillez sélectionner une région dans le filtre ci-dessus
                      pour afficher les soumissions de candidature.
                    </p>
                    {regions.length > 0 && (
                      <Select
                        value={selectedRegion}
                        onValueChange={(value) => setSelectedRegion(value)}
                      >
                        <SelectTrigger className="w-[250px] mx-auto border-tacir-blue">
                          <SelectValue placeholder="Choisir une région" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region._id} value={region._id}>
                              {region.name.fr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {/* Desktop Table View - Only show when region is selected and we have data */}
                {selectedRegion && table.getRowModel().rows.length > 0 && (
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-tacir-darkblue">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <th
                                key={header.id}
                                className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-semibold text-white uppercase tracking-wider border-b border-tacir-blue"
                                style={{
                                  width: header.getSize(),
                                  maxWidth: header.column.columnDef.maxSize,
                                }}
                              >
                                <div className="flex items-center truncate">
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                                  {header.column.getCanSort() && (
                                    <ArrowUpDown className="ml-1 h-3 w-3 opacity-70" />
                                  )}
                                </div>
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody className="divide-y divide-tacir-lightgray">
                        {table.getRowModel().rows.map((row) => (
                          <tr
                            key={row.id}
                            className={`${getRowClass(
                              row.original.status
                            )} hover:bg-tacir-lightgray/50 transition-colors`}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <td
                                key={cell.id}
                                className="px-4 xl:px-6 py-4 text-xs xl:text-sm whitespace-nowrap"
                                style={{
                                  width: cell.column.getSize(),
                                  maxWidth: cell.column.columnDef.maxSize,
                                }}
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
                )}

                {/* Mobile Card View - Only show when region is selected and we have data */}
                {selectedRegion && table.getRowModel().rows.length > 0 && (
                  <div className="lg:hidden grid grid-cols-1 gap-4 p-4">
                    {table.getRowModel().rows.map((row) => {
                      const submission = row.original;
                      return (
                        <Card
                          key={row.id}
                          className="hover:shadow-md transition-all duration-300 border-tacir-lightgray overflow-hidden"
                        >
                          <div className="h-1 bg-tacir-blue"></div>
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              {/* Header with checkbox and status */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <div className="pt-1">
                                    {flexRender(
                                      row.getVisibleCells()[0].column.columnDef
                                        .cell,
                                      row.getVisibleCells()[0].getContext()
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-tacir-darkblue text-base line-clamp-2 mb-2">
                                      {submission.formTitle || "Sans titre"}
                                    </h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {flexRender(
                                        row.getVisibleCells()[1].column
                                          .columnDef.cell,
                                        row.getVisibleCells()[1].getContext()
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Submission Date */}
                              <div className="space-y-2 text-sm text-tacir-darkgray">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate">
                                      Soumis le{" "}
                                      {new Date(
                                        submission.submittedAt
                                      ).toLocaleDateString("fr-FR")}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="pt-3 border-t border-tacir-lightgray">
                                <div className="flex items-center gap-1 justify-end">
                                  {flexRender(
                                    row.getVisibleCells()[
                                      row.getVisibleCells().length - 1
                                    ].column.columnDef.cell,
                                    row
                                      .getVisibleCells()
                                      [
                                        row.getVisibleCells().length - 1
                                      ].getContext()
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* No Results Message - Only show when region is selected but no data */}
                {selectedRegion && table.getRowModel().rows.length === 0 && (
                  <div className="text-center py-12 sm:py-16 px-4">
                    <FileText className="w-16 h-16 sm:w-20 sm:h-20 text-tacir-lightgray mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-tacir-darkgray mb-2">
                      {globalFilter
                        ? "Aucune soumission correspondante"
                        : "Aucune soumission disponible"}
                    </h3>
                    <p className="text-sm text-tacir-darkgray mb-4 sm:mb-6 max-w-md mx-auto">
                      {globalFilter
                        ? "Aucune soumission ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou votre recherche."
                        : "Il n'y a actuellement aucune soumission de candidature pour cette région. Les soumissions apparaîtront ici lorsqu'elles seront soumises."}
                    </p>
                    {globalFilter && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setGlobalFilter("");
                        }}
                        className="border-tacir-blue text-tacir-blue hover:bg-tacir-lightblue/10"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Effacer la recherche
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Pagination - Only show when we have data and region is selected */}
        {selectedRegion &&
          hasFetchedData &&
          table.getRowModel().rows.length > 0 && (
            <div className="px-4 sm:px-6 py-4 border-t border-tacir-lightgray bg-tacir-lightgray/50">
              <DataTablePagination table={table} />
            </div>
          )}
      </div>

      {/* Dialogs */}
      <WithdrawalManager
        withdrawalDialogOpen={withdrawalDialogOpen}
        setWithdrawalDialogOpen={setWithdrawalDialogOpen}
        replacementDialogOpen={replacementDialogOpen}
        setReplacementDialogOpen={setReplacementDialogOpen}
        selectedWithdrawal={selectedWithdrawal}
        replacementCandidates={replacementCandidates}
        selectedReplacement={selectedReplacement}
        setSelectedReplacement={setSelectedReplacement}
        isProcessing={isProcessing}
        onConfirmWithdrawal={confirmWithdrawal}
        onSelectReplacement={handleSelectReplacement}
      />

      {/* Preview Modal */}
      {user && previewSubmission && (
        <SubmissionPreview
          submission={previewSubmission}
          onClose={() => setPreviewSubmission(null)}
          currentUserId={user.id}
        />
      )}
    </div>
  );
};

export default CandidatureSubmissionTable;
