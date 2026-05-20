"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  X,
  UserPlus,
  Archive,
  ArchiveRestore,
  RefreshCw,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { DataTablePagination } from "../../components/common/table/DataTablePagination";
import { DataTableViewOptions } from "../../components/common/table/DataTableViewOptions";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  fetchMembers,
  archiveMembers,
  unarchiveMembers,
} from "../../services/users/members";
import { userColumns } from "./columns";
import AddMemberForm from "../../components/forms/AddMemberForm";
import { InlineLoader } from "../../components/ui/Loader";
import { DataTableStatusFilter } from "./DataTableStatusFilter";
import { cn } from "../../lib/utils";
import { toast } from "react-toastify";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

export function UsersTable() {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const loadAllMembers = async () => {
    setLoading(true);
    try {
      const result = await fetchMembers({
        pageIndex: 0,
        pageSize: 1000,
        includeArchived: activeTab === "archived",
        filters: {
          isActive: true,
          ...(roleFilter && { role: roleFilter }),
        },
      });

      setAllData(result.data || []);
      setTotalItems(result.data?.length || 0);
    } catch (error) {
      console.error("Failed to load members:", error);
      toast.error("Erreur lors du chargement des membres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllMembers();
  }, [activeTab]);

  // In your UsersTable component, replace the filteredData useMemo with this:

  const filteredData = useMemo(() => {
    if (!allData.length) return [];

    let filtered = [...allData];

    if (roleFilter) {
      filtered = filtered.filter((member) => {
        // Handle both array of roles and single role
        const memberRoles = Array.isArray(member.roles)
          ? member.roles
          : [member.roles];
        return memberRoles.includes(roleFilter);
      });
    }

    if (searchFilter) {
      const searchTerm = searchFilter.toLowerCase().trim();
      filtered = filtered.filter((member) => {
        const firstName = (member.firstName || "").toLowerCase();
        const lastName = (member.lastName || "").toLowerCase();
        const email = (member.email || "").toLowerCase();
        const fullName = `${firstName} ${lastName}`;

        return (
          firstName.includes(searchTerm) ||
          lastName.includes(searchTerm) ||
          email.includes(searchTerm) ||
          fullName.includes(searchTerm)
        );
      });
    }

    return filtered;
  }, [allData, roleFilter, searchFilter]);
  const paginatedData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, pagination.pageIndex, pagination.pageSize]);

  const table = useReactTable({
    data: paginatedData,
    columns: userColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    meta: {
      onArchive: async (userId) => {
        try {
          const response = await archiveMembers([userId]);
          toast.success(response.message || "Membre archivé avec succès");
          loadAllMembers();
        } catch (error) {
          toast.error(error.message || "Erreur lors de l'archivage");
        }
      },
      onUnarchive: async (userId) => {
        try {
          const response = await unarchiveMembers([userId]);
          toast.success(response.message || "Membre désarchivé avec succès");
          loadAllMembers();
        } catch (error) {
          toast.error(error.message || "Erreur lors du désarchivage");
        }
      },
    },
    manualPagination: false,
    pageCount: Math.ceil(filteredData.length / pagination.pageSize),
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableSorting: true,
    enableHiding: true,
  });

  const handleSuccess = () => {
    setIsOpen(false);
    loadAllMembers();
  };

  const handleArchiveSelected = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const ids = selectedRows.map((row) => row.original._id);

    if (ids.length === 0) {
      return toast.error(
        "Veuillez sélectionner au moins un membre à archiver."
      );
    }

    try {
      const response = await archiveMembers(ids);
      const { message, modifiedCount } = response;

      if (modifiedCount === 0) {
        toast.warning(message || "Aucun membre n'a été archivé.");
      } else {
        toast.success(message || "Membres archivés avec succès !");
      }

      setRowSelection({});
      loadAllMembers();
    } catch (error) {
      toast.error(
        error.message || "Une erreur est survenue lors de l'archivage."
      );
    }
  };

  const handleUnarchiveSelected = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const ids = selectedRows.map((row) => row.original._id);

    if (ids.length === 0) {
      return toast.error(
        "Veuillez sélectionner au moins un membre à désarchiver."
      );
    }

    try {
      const response = await unarchiveMembers(ids);
      const { message, modifiedCount } = response;

      if (modifiedCount === 0) {
        toast.warning(message || "Aucun membre n'a été désarchivé.");
      } else {
        toast.success(message || "Membres désarchivés avec succès !");
      }

      setRowSelection({});
      loadAllMembers();
    } catch (error) {
      toast.error(
        error.message || "Une erreur est survenue lors du désarchivage."
      );
    }
  };

  const handleSearchChange = (e) => {
    setSearchFilter(e.target.value);
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const clearAllFilters = () => {
    setSearchFilter("");
    setRoleFilter("");
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const hasActiveFilters = searchFilter || roleFilter;
  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="min-h-screen bg-tacir-lightgray p-3 sm:p-4 md:p-6">
      {/* Header Section - Version corrigée */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6 border border-tacir-lightgray/30">
        <div className="flex flex-col gap-4">
          {/* Title Section */}
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
              <div className="p-2 md:p-3 bg-tacir-blue rounded-lg shadow-sm flex-shrink-0">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-tacir-darkblue truncate">
                  Gestion des Membres
                </h1>
                <p className="text-tacir-darkgray text-xs sm:text-sm mt-1">
                  Gérez les membres de votre équipe
                </p>
              </div>
            </div>

            {/* Desktop Action Buttons - Version originale */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadAllMembers}
                className="gap-2 border-tacir-darkgray/30"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </Button>

              {activeTab === "active" ? (
                <Button
                  variant="destructive"
                  onClick={handleArchiveSelected}
                  disabled={selectedCount === 0}
                  className="gap-2 bg-tacir-pink hover:bg-tacir-pink/90"
                  size="sm"
                >
                  <Archive className="w-4 h-4" />
                  Archiver {selectedCount > 0 && `(${selectedCount})`}
                </Button>
              ) : (
                <Button
                  onClick={handleUnarchiveSelected}
                  disabled={selectedCount === 0}
                  className="gap-2 bg-tacir-green hover:bg-tacir-green/90"
                  size="sm"
                >
                  <ArchiveRestore className="w-4 h-4" />
                  Désarchiver {selectedCount > 0 && `(${selectedCount})`}
                </Button>
              )}

              <Button
                onClick={() => setIsOpen(true)}
                className="bg-tacir-blue hover:bg-tacir-blue/90 gap-2"
                size="sm"
              >
                <UserPlus className="w-4 h-4" />
                Ajouter un membre
              </Button>
            </div>
          </div>

          {/* Tabs for Active/Archived Members */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Membres Actifs
              </TabsTrigger>
              <TabsTrigger value="archived" className="flex items-center gap-2">
                <EyeOff className="w-4 h-4" />
                Membres Archivés
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Mobile Action Buttons - Version corrigée */}
          <div className="flex lg:hidden gap-2 w-full">
            <Button
              variant="outline"
              onClick={loadAllMembers}
              className="gap-1 text-xs h-9 flex-shrink-0 border-tacir-darkgray/30"
              size="sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>

            {activeTab === "active" ? (
              <Button
                variant="destructive"
                onClick={handleArchiveSelected}
                disabled={selectedCount === 0}
                className="gap-1 text-xs h-9 bg-tacir-pink hover:bg-tacir-pink/90 flex-1 min-w-0"
                size="sm"
              >
                <Archive className="w-3.5 h-3.5" />
                <span className="truncate">
                  Archiver {selectedCount > 0 && `(${selectedCount})`}
                </span>
              </Button>
            ) : (
              <Button
                onClick={handleUnarchiveSelected}
                disabled={selectedCount === 0}
                className="gap-1 text-xs h-9 bg-tacir-green hover:bg-tacir-green/90 flex-1 min-w-0"
                size="sm"
              >
                <ArchiveRestore className="w-3.5 h-3.5" />
                <span className="truncate">
                  Désarchiver {selectedCount > 0 && `(${selectedCount})`}
                </span>
              </Button>
            )}

            <Button
              onClick={() => setIsOpen(true)}
              className="bg-tacir-blue hover:bg-tacir-blue/90 gap-1 text-xs h-9 flex-1 min-w-0"
              size="sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="truncate">Ajouter</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog - UN SEUL à la racine */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-lg md:text-xl">
              Ajouter un nouveau membre
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-4">
            <AddMemberForm onSuccess={handleSuccess} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Le reste du code reste inchangé */}
      {/* Filters and Search Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 md:mb-6 border border-tacir-lightgray/30">
        {/* Desktop: Search and Filters in one row */}
        <div className="hidden lg:flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tacir-darkgray w-4 h-4" />
              <Input
                placeholder="Rechercher par nom, prénom, email..."
                value={searchFilter}
                onChange={handleSearchChange}
                className="pl-10 pr-10 h-10 border-tacir-darkgray/30 focus:border-tacir-blue transition-colors"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tacir-darkgray hover:text-tacir-darkblue transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <DataTableViewOptions table={table} />
              <DataTableStatusFilter
                value={roleFilter}
                onChange={(value) => {
                  setRoleFilter(value);
                  setPagination({ ...pagination, pageIndex: 0 });
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-tacir-green rounded-full"></div>
              <span className="font-medium text-tacir-darkblue">
                {filteredData.length} membre
                {filteredData.length !== 1 ? "s" : ""}
                {hasActiveFilters && " trouvé(s)"}
              </span>
            </div>
            <div className="w-px h-4 bg-tacir-darkgray/30"></div>
            <span className="text-tacir-darkgray">
              Total: <span className="font-semibold">{allData.length}</span>
            </span>
          </div>
        </div>

        {/* Mobile: Search and Filter Toggle */}
        <div className="lg:hidden space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tacir-darkgray w-4 h-4" />
            <Input
              placeholder="Rechercher par nom, prénom, email..."
              value={searchFilter}
              onChange={handleSearchChange}
              className="pl-10 pr-10 h-10 border-tacir-darkgray/30 focus:border-tacir-blue transition-colors"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tacir-darkgray hover:text-tacir-darkblue transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Stats and Filter Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-tacir-green rounded-full"></div>
              <span className="font-medium text-tacir-darkblue">
                {filteredData.length} membre
                {filteredData.length !== 1 ? "s" : ""}
              </span>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="gap-2 h-9 border-tacir-darkgray/30"
            >
              <Filter className="w-4 h-4" />
              Filtres
              {hasActiveFilters && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-tacir-blue text-white text-xs">
                  {(searchFilter ? 1 : 0) + (roleFilter ? 1 : 0)}
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
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-tacir-lightgray">
            {searchFilter && (
              <Badge
                variant="secondary"
                className="bg-tacir-lightblue text-tacir-darkblue gap-2"
              >
                Recherche: "{searchFilter.substring(0, 20)}
                {searchFilter.length > 20 ? "..." : ""}"
                <button
                  onClick={() => setSearchFilter("")}
                  className="hover:text-tacir-darkblue"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {roleFilter && (
              <Badge
                variant="secondary"
                className="bg-tacir-lightblue text-tacir-darkblue gap-2"
              >
                Rôle: {roleFilter}
                <button
                  onClick={() => setRoleFilter("")}
                  className="hover:text-tacir-darkblue"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs h-7 text-tacir-darkgray hover:text-tacir-darkblue"
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
              ? "max-h-80 opacity-100 mt-3"
              : "max-h-0 opacity-0"
          )}
        >
          <div className="pt-3 border-t border-tacir-lightgray">
            {/* Filters Grid */}
            <div className="grid grid-cols-1 gap-4">
              {/* Column Visibility */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-tacir-darkblue">
                  Colonnes visibles
                </span>
                <DataTableViewOptions table={table} />
              </div>

              {/* Role Filter */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-tacir-darkblue">
                  Filtrer par rôle
                </span>
                <DataTableStatusFilter
                  value={roleFilter}
                  onChange={(value) => {
                    setRoleFilter(value);
                    setPagination({ ...pagination, pageIndex: 0 });
                  }}
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="mt-4 pt-3 border-t border-tacir-lightgray">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="w-full gap-2"
                >
                  <X className="w-4 h-4" />
                  Effacer tous les filtres
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-tacir-lightgray/30 bg-white mb-4 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-tacir-darkblue hover:bg-tacir-darkblue"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      className="text-white bg-tacir-darkblue px-3 py-3 text-xs md:text-sm font-semibold"
                      key={header.id}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={userColumns.length}
                    className="text-center px-3 py-8"
                  >
                    <InlineLoader text="Chargement des membres..." />
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-tacir-lightgray/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-3 py-3 text-xs md:text-sm"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={userColumns.length}
                    className="h-48 text-center px-3 py-8"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-tacir-lightgray flex items-center justify-center">
                        <Users className="w-8 h-8 text-tacir-darkgray" />
                      </div>
                      <div>
                        <p className="font-semibold text-tacir-darkblue text-base">
                          {hasActiveFilters
                            ? "Aucun membre trouvé"
                            : activeTab === "active"
                            ? "Aucun membre actif"
                            : "Aucun membre archivé"}
                        </p>
                        <p className="text-sm text-tacir-darkgray mt-1 max-w-md mx-auto">
                          {hasActiveFilters
                            ? "Aucun membre ne correspond à vos critères de recherche."
                            : activeTab === "active"
                            ? "Commencez par ajouter votre premier membre."
                            : "Aucun membre n'est actuellement archivé."}
                        </p>
                      </div>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearAllFilters}
                          className="mt-2 gap-2 border-tacir-darkgray/30"
                        >
                          <X className="w-4 h-4" />
                          Effacer tous les filtres
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination - Always visible */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-tacir-lightgray/30">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
