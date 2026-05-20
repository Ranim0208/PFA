"use client";
import { useState, useEffect, useMemo } from "react";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "../../../components/ui/button";
import {
  getAllForms,
  validateForms,
} from "../../../services/forms/formServices";
import { Skeleton } from "../../../components/ui/skeleton";
import { DataTablePagination } from "../../../components/common/table/DataTablePagination";
import { DataTableViewOptions } from "../../../components/common/table/DataTableViewOptions";
import { DataTableCreatedByFilter } from "../candidature-forms/DataTableCreatedByFilter";
import { getCandidatureColumns } from "./columns";
import CandidatureFormDetailsPreview from "../candidature-forms/FormDetails-preview";
import { toast } from "react-toastify";
import {
  Users,
  FileText,
  Upload,
  RefreshCw,
  CheckCircle,
  Clock,
  BarChart3,
  Search,
  Filter,
  X,
} from "lucide-react";
import { DataTableSearch } from "../candidature-forms/DataTableSearch";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";
import { cn } from "@/lib/utils";

const CandidatureFormsTable = () => {
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [createdByFilter, setCreatedByFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [availableRegions, setAvailableRegions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewForm, setPreviewForm] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateField, setDateField] = useState("createdAt");

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [stats, setStats] = useState({
    total: 0,
    validated: 0,
    pending: 0,
  });

  const handlePreview = (form) => setPreviewForm(form);

  const columnsConfig = getCandidatureColumns({ onPreview: handlePreview });

  const refreshData = async () => {
    setRefreshing(true);
    await fetchForms();
    setRefreshing(false);
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
    state: { sorting, pagination, rowSelection },
  });

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await getAllForms({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        sortField: sorting[0]?.id || "createdAt",
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
        createdBy: createdByFilter || undefined,
        search: searchTerm || undefined,
        isTemplate: false,
        regionId: regionFilter || undefined,
        status: statusFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        dateField: dateField || undefined,
      });

      setData(response.data);
      setTotalItems(response.pagination.total);

      const validated = response.data.filter((form) => form.validated).length;
      const pending = response.data.filter((form) => !form.validated).length;

      setStats({
        total: response.pagination.total,
        validated,
        pending,
      });
    } catch (error) {
      console.error("Error fetching forms:", error);
      toast.error("Erreur lors du chargement des formulaires.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unique = new Map();
    data.forEach((form) => {
      const r = form?.region;
      if (r?._id && !unique.has(r._id)) {
        unique.set(r._id, r);
      }
    });
    setAvailableRegions(Array.from(unique.values()));
  }, [data]);

  useEffect(() => {
    fetchForms();
  }, [
    pagination,
    sorting,
    createdByFilter,
    searchTerm,
    regionFilter,
    statusFilter,
    dateFrom,
    dateTo,
    dateField,
  ]);

  const isValidateButtonDisabled = useMemo(() => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) return true;
    const allSelectedAreValidated = selectedRows.every(
      (row) => row.original.validated === true
    );
    return allSelectedAreValidated;
  }, [rowSelection, data]);

  const handleValidateForm = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const ids = selectedRows.flatMap((row) => row.original._id);

    if (ids.length === 0) {
      return toast.warn(
        "Veuillez sélectionner au moins un formulaire à valider."
      );
    }

    try {
      const response = await validateForms(ids);
      const { message, modifiedCount, success } = response;

      if (!success && modifiedCount === 0) {
        toast.info(message || "Aucun formulaire n'a été validé.");
      } else {
        toast.success(message || "Formulaires validés avec succès !");
      }

      setRowSelection(() => ({}));
      await fetchForms();
    } catch (error) {
      toast.error(
        error.message ||
          "Une erreur est survenue lors de la validation des formulaires."
      );
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const clearDateFilters = () => {
    setDateFrom("");
    setDateTo("");
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const getStatusBadge = (form) => {
    const isValidated = form.validated;
    const isPublished = form.published;

    if (isValidated && isPublished) {
      return (
        <Badge className="bg-tacir-green text-white text-xs font-medium border-0">
          <CheckCircle className="h-3 w-3 mr-1" />
          Validé & Publié
        </Badge>
      );
    }

    if (isValidated && !isPublished) {
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
        En attente
      </Badge>
    );
  };

  const GridViewActions = ({ form }) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlePreview(form)}
        className="flex-1 text-tacir-blue hover:bg-tacir-lightblue/10 hover:text-tacir-darkblue"
      >
        Voir
      </Button>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 bg-tacir-lightgray min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-tacir-lightgray p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tacir-darkblue rounded-lg flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-tacir-darkblue">
                  Validation des formulaires
                </h1>
                <Badge className="bg-tacir-blue text-white">
                  {stats.total}
                </Badge>
              </div>
              <p className="text-tacir-darkgray text-sm mt-1">
                Validez les formulaires de candidature soumis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <Button
              onClick={refreshData}
              variant="outline"
              size="icon"
              className="border-tacir-blue text-tacir-blue hover:bg-tacir-lightblue/10 flex-shrink-0"
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>

            <Button
              variant="destructive"
              onClick={handleValidateForm}
              disabled={isValidateButtonDisabled}
              className="bg-tacir-green hover:bg-tacir-green/90 text-white px-4 py-2.5 text-sm font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="h-4 w-4 mr-2" />
              Valider
              {Object.keys(rowSelection).length > 0 && (
                <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded text-xs font-bold">
                  {Object.keys(rowSelection).length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Stats mobile */}
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
            <div className="flex items-center gap-2 bg-tacir-green/20 rounded-lg px-3 py-2 min-w-0 flex-1">
              <CheckCircle className="h-4 w-4 text-tacir-green flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-tacir-green font-medium truncate">
                  Validés
                </div>
                <div className="text-lg font-bold text-tacir-green truncate">
                  {stats.validated}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-tacir-yellow/20 rounded-lg px-3 py-2 min-w-0 flex-1">
              <Clock className="h-4 w-4 text-tacir-yellow flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-tacir-yellow font-medium truncate">
                  En attente
                </div>
                <div className="text-lg font-bold text-tacir-yellow truncate">
                  {stats.pending}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats desktop */}
        <div className="hidden lg:flex items-center gap-6 mt-4 pt-4 border-t border-tacir-lightgray">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-tacir-blue" />
            <span className="text-sm font-medium text-tacir-darkblue">
              {stats.total} formulaires au total
            </span>
          </div>
          <div className="w-px h-4 bg-tacir-darkgray/30" />
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-tacir-green" />
            <span className="text-sm text-tacir-darkgray">
              <span className="font-medium text-tacir-green">
                {stats.validated}
              </span>{" "}
              validés
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-tacir-yellow" />
            <span className="text-sm text-tacir-darkgray">
              <span className="font-medium text-tacir-yellow">
                {stats.pending}
              </span>{" "}
              en attente
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Filters Section */}
     {/* Enhanced Filters Section */}
<div className="space-y-3">
  {/* First Row - Main Filters (White Background) */}
  <div className="bg-white rounded-xl shadow-sm border border-tacir-lightgray p-4">
    {/* Desktop & Tablet Layout */}
    <div className="hidden md:grid md:grid-cols-6 lg:grid-cols-12 gap-3 items-center">
      {/* Search - Takes 2 columns on tablet, 4 on desktop */}
      <div className="md:col-span-2 lg:col-span-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tacir-darkgray h-4 w-4 z-10" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 h-10 border border-tacir-darkgray/30 rounded-lg text-sm text-tacir-darkblue placeholder-tacir-darkgray focus:outline-none focus:ring-2 focus:ring-tacir-blue/20 focus:border-tacir-blue"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tacir-darkgray hover:text-tacir-blue z-10"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Region Filter */}
      <div className="md:col-span-1 lg:col-span-2">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-tacir-darkgray z-10 pointer-events-none" />
          <select
            value={regionFilter}
            onChange={(e) => {
              setRegionFilter(e.target.value);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
            className="w-full pl-10 pr-3 h-10 border border-tacir-darkgray/30 rounded-lg text-sm text-tacir-darkblue bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-tacir-blue/20 focus:border-tacir-blue cursor-pointer"
          >
            <option value="">Régions</option>
            {availableRegions.map((r) => (
              <option key={r._id} value={r._id}>
                {r?.name?.fr || "—"}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="h-4 w-4 text-tacir-darkgray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Type/Status Filter */}
      <div className="md:col-span-1 lg:col-span-2">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
            className="w-full pl-3 pr-8 h-10 border border-tacir-darkgray/30 rounded-lg text-sm text-tacir-darkblue bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-tacir-blue/20 focus:border-tacir-blue cursor-pointer"
          >
            <option value="">Type</option>
            <option value="upcoming">À venir</option>
            <option value="ongoing">En cours</option>
            <option value="ended">Terminés</option>
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="h-4 w-4 text-tacir-darkgray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Created By Filter */}
      <div className="md:col-span-1 lg:col-span-2">
        <DataTableCreatedByFilter
          value={createdByFilter}
          onChange={(val) => {
            setCreatedByFilter(val);
            setPagination({ ...pagination, pageIndex: 0 });
          }}
          data={data}
          className="h-10"
        />
      </div>

      {/* Column Visibility */}
      <div className="md:col-span-1 lg:col-span-1 flex justify-end">
        <DataTableViewOptions table={table} />
      </div>
    </div>

    {/* Mobile Layout */}
    <div className="md:hidden space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tacir-darkgray h-4 w-4 z-10" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 h-10 border border-tacir-darkgray/30 rounded-lg text-sm text-tacir-darkblue placeholder-tacir-darkgray focus:outline-none focus:ring-2 focus:ring-tacir-blue/20 focus:border-tacir-blue"
        />
        {searchTerm && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tacir-darkgray hover:text-tacir-blue z-10"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-2 gap-2">
        {/* Region */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-tacir-darkgray z-10 pointer-events-none" />
          <select
            value={regionFilter}
            onChange={(e) => {
              setRegionFilter(e.target.value);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
            className="w-full pl-9 pr-8 h-10 border border-tacir-darkgray/30 rounded-lg text-xs text-tacir-darkblue bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-tacir-blue/20 focus:border-tacir-blue"
          >
            <option value="">Régions</option>
            {availableRegions.map((r) => (
              <option key={r._id} value={r._id}>
                {r?.name?.fr || "—"}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="h-3 w-3 text-tacir-darkgray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Type */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
            className="w-full pl-3 pr-8 h-10 border border-tacir-darkgray/30 rounded-lg text-xs text-tacir-darkblue bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-tacir-blue/20 focus:border-tacir-blue"
          >
            <option value="">Type</option>
            <option value="upcoming">À venir</option>
            <option value="ongoing">En cours</option>
            <option value="ended">Terminés</option>
          </select>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="h-3 w-3 text-tacir-darkgray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Created By + Column Visibility */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <DataTableCreatedByFilter
            value={createdByFilter}
            onChange={(val) => {
              setCreatedByFilter(val);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
            data={data}
            className="h-10 text-xs"
          />
        </div>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  </div>

  {/* Second Row - Date Filters (White Background) */}
  <div className="bg-white rounded-xl shadow-sm border border-tacir-lightgray p-4">
    {/* Desktop & Tablet Layout */}
    <div className="hidden md:flex items-center gap-3">
      {/* Date Field Label */}
      <div className="flex items-center gap-2 text-sm font-medium text-tacir-darkblue whitespace-nowrap">
        <Clock className="h-4 w-4 text-tacir-blue" />
        <span>Période :</span>
      </div>

      {/* Date Field Selector */}
      <div className="relative w-40">
        <select
          value={dateField}
          onChange={(e) => {
            setDateField(e.target.value);
            setPagination({ ...pagination, pageIndex: 0 });
          }}
          className="w-full px-3 pr-8 h-10 border border-tacir-darkgray/30 rounded-lg text-sm text-tacir-darkblue bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-tacir-blue/20 focus:border-tacir-blue cursor-pointer"
        >
          <option value="createdAt">Date création</option>
          <option value="startDate">Date début</option>
          <option value="endDate">Date fin</option>
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="h-4 w-4 text-tacir-darkgray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Date Range Container */}
      <div className="flex items-center gap-2 flex-1">
        <div className="flex items-center gap-2 bg-tacir-lightgray/30 rounded-lg px-3 py-2 flex-1 max-w-md">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
            className="flex-1 h-6 px-2 border-0 bg-transparent text-xs text-tacir-darkblue focus:outline-none focus:ring-1 focus:ring-tacir-blue/20 rounded"
            placeholder="Date début"
          />
          <span className="text-tacir-darkgray text-sm">→</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
            className="flex-1 h-6 px-2 border-0 bg-transparent text-xs text-tacir-darkblue focus:outline-none focus:ring-1 focus:ring-tacir-blue/20 rounded"
            placeholder="Date fin"
          />
        </div>

        {/* Reset Dates Button */}
        {(dateFrom || dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearDateFilters}
            className="h-10 px-3 text-sm text-tacir-darkgray hover:text-tacir-blue hover:bg-tacir-blue/10 whitespace-nowrap"
            title="Réinitialiser les dates"
          >
            <X className="h-4 w-4 mr-1" />
            Effacer
          </Button>
        )}
      </div>
    </div>

    {/* Mobile Layout */}
    <div className="md:hidden space-y-3">
      {/* Date Field Selector */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-tacir-blue flex-shrink-0" />
        <div className="relative flex-1">
          <select
            value={dateField}
            onChange={(e) => {
              setDateField(e.target.value);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
            className="w-full px-3 pr-8 h-10 border border-tacir-darkgray/30 rounded-lg text-sm text-tacir-darkblue bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-tacir-blue/20 focus:border-tacir-blue"
          >
            <option value="createdAt">Date de création</option>
            <option value="startDate">Date de début</option>
            <option value="endDate">Date de fin</option>
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="h-4 w-4 text-tacir-darkgray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-tacir-darkblue">Période</label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
            className="flex-1 h-10 px-3 border border-tacir-darkgray/30 rounded-lg text-xs text-tacir-darkblue bg-white focus:outline-none focus:ring-2 focus:ring-tacir-blue/20 focus:border-tacir-blue"
            placeholder="Du"
          />
          <span className="text-tacir-darkgray text-xs">→</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
            className="flex-1 h-10 px-3 border border-tacir-darkgray/30 rounded-lg text-xs text-tacir-darkblue bg-white focus:outline-none focus:ring-2 focus:ring-tacir-blue/20 focus:border-tacir-blue"
            placeholder="Au"
          />
        </div>
      </div>

      {/* Reset Button */}
      {(dateFrom || dateTo) && (
        <Button
          variant="outline"
          onClick={clearDateFilters}
          className="w-full h-10 text-sm border-tacir-darkgray/30 text-tacir-darkgray hover:text-tacir-blue hover:border-tacir-blue"
        >
          <X className="h-4 w-4 mr-2" />
          Réinitialiser les dates
        </Button>
      )}
    </div>
  </div>

  {/* Active Filters Badges */}
  {(searchTerm ||
    createdByFilter ||
    regionFilter ||
    statusFilter ||
    dateFrom ||
    dateTo) && (
    <div className="bg-white rounded-lg shadow-sm border border-tacir-lightgray p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-tacir-darkgray">Filtres actifs:</span>
        {searchTerm && (
          <Badge
            variant="secondary"
            className="bg-tacir-lightblue/20 text-tacir-darkblue gap-1 pr-1 text-xs"
          >
            <Search className="w-3 h-3" />
            "{searchTerm.substring(0, 15)}
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
            className="bg-tacir-lightblue/20 text-tacir-darkblue gap-1 pr-1 text-xs"
          >
            Créateur
            <button
              onClick={() => {
                setCreatedByFilter("");
                setPagination({ ...pagination, pageIndex: 0 });
              }}
              className="hover:text-tacir-blue ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}
        {regionFilter && (
          <Badge
            variant="secondary"
            className="bg-tacir-lightblue/20 text-tacir-darkblue gap-1 pr-1 text-xs"
          >
            Région
            <button
              onClick={() => {
                setRegionFilter("");
                setPagination({ ...pagination, pageIndex: 0 });
              }}
              className="hover:text-tacir-blue ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}
        {statusFilter && (
          <Badge
            variant="secondary"
            className="bg-tacir-lightblue/20 text-tacir-darkblue gap-1 pr-1 text-xs"
          >
            Type: {statusFilter === "upcoming" ? "À venir" : statusFilter === "ongoing" ? "En cours" : "Terminés"}
            <button
              onClick={() => {
                setStatusFilter("");
                setPagination({ ...pagination, pageIndex: 0 });
              }}
              className="hover:text-tacir-blue ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}
        {(dateFrom || dateTo) && (
          <Badge
            variant="secondary"
            className="bg-tacir-lightblue/20 text-tacir-darkblue gap-1 pr-1 text-xs"
          >
            <Clock className="w-3 h-3" />
            Période
            <button
              onClick={clearDateFilters}
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
            setRegionFilter("");
            setStatusFilter("");
            clearDateFilters();
            setPagination({ ...pagination, pageIndex: 0 });
          }}
          className="text-xs h-6 px-2 text-tacir-darkgray hover:text-tacir-blue"
        >
          <X className="w-3 h-3 mr-1" />
          Tout effacer
        </Button>
      </div>
    </div>
  )}
</div>

      {/* Table */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-tacir-lightgray overflow-hidden">
        {loading ? (
          <div className="space-y-4 p-4 sm:p-6">
            {[...Array(pagination.pageSize)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-tacir-darkblue">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-semibold text-white uppercase tracking-wider border-b border-tacir-blue"
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
                      className="hover:bg-tacir-lightgray/50 transition-colors"
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

            {/* Mobile cards */}
            <div className="lg:hidden grid grid-cols-1 gap-4 p-4">
              {table.getRowModel().rows.map((row) => {
                const form = row.original;
                return (
                  <Card
                    key={row.id}
                    className="hover:shadow-md transition-all duration-300 border-tacir-lightgray overflow-hidden"
                  >
                    <div className="h-1 bg-tacir-blue"></div>
                    <CardContent className="p-4">
                      <div className="space-y-4">
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
                                  className="text-xs bg-tacir-lightgray text-tacir-darkgray border-tacir-lightgray"
                                >
                                  {form.fields?.length || 0} champs
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-tacir-darkgray">
                          Région: {form?.region?.name?.fr || "—"}
                        </div>

                        <div className="space-y-2 text-sm text-tacir-darkgray">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="truncate">
                                Créé le{" "}
                                {new Date(form.createdAt).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

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
        )}

        <div className="px-4 sm:px-6 py-4 border-t border-tacir-lightgray bg-tacir-lightgray/50">
          <DataTablePagination table={table} totalItems={totalItems} />
        </div>
      </div>

      <CandidatureFormDetailsPreview
        form={previewForm}
        open={!!previewForm}
        onOpenChange={() => setPreviewForm(null)}
      />
    </div>
  );
};

export default CandidatureFormsTable;
