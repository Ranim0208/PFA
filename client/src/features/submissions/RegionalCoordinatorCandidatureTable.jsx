"use client";

import { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  getAcceptedRegionForms,
  confirmAttendance,
} from "@/services/forms/submissionService";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableViewOptions } from "@/components/common/table/DataTableViewOptions";
import { DataTablePagination } from "@/components/common/table/DataTablePagination";
import { Input } from "@/components/ui/input";
import { getRegionalSubmissionColumns } from "@/features/submissions/regional-submission-column";
import { toast } from "react-toastify";
import {
  Download,
  Users,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpDown,
  AlertCircle,
  FileText,
} from "lucide-react";
import { handleExportAll } from "@/features/submissions/export-excel";
import SubmissionPreview from "@/features/submissions/SubmissionPreview";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useCurrentUser from "@/hooks/useCurrentUser";
import { statusOptions } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import { StatsCard } from "@/features/submissions/statsCard";

const RegionalCoordinatorCandidatureTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasFetchedData, setHasFetchedData] = useState(false);

  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [regionId, setRegionId] = useState(null);
  const { user } = useCurrentUser();
  const [previewSubmission, setPreviewSubmission] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    declined: 0,
  });

  const getRowClass = (status) => statusOptions[status]?.rowClass || "";

  useEffect(() => {
  if (user?.region?.id) {
    setRegionId(user.region.id);
  } else {
    setHasFetchedData(true);
    setLoading(false);
  }
}, [user]);

  const { pageIndex, pageSize } = pagination;
  const sortField = sorting[0]?.id || "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  useEffect(() => {
    if (!regionId) {
      setData([]);
      setHasFetchedData(true);
      setLoading(false);
      setStats({
        total: 0,
        pending: 0,
        confirmed: 0,
        declined: 0,
      });
      return;
    }

    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const { data: openForms = [] } = await getAcceptedRegionForms(
          regionId,
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
          return {
            ...sub,
            ...answerMap,
            formTitle: sub?.form?.title?.fr,
            attendanceStatus: sub.attendanceStatus || "pending",
          };
        });

        setData(allSubmissions.filter((s) => s?._id));
        setHasFetchedData(true);

        // Calculate statistics
        const statusCounts = allSubmissions.reduce(
          (acc, submission) => {
            acc.total++;
            acc[submission.attendanceStatus] =
              (acc[submission.attendanceStatus] || 0) + 1;
            return acc;
          },
          {
            total: 0,
            pending: 0,
            confirmed: 0,
            declined: 0,
          }
        );

        setStats(statusCounts);
      } catch (err) {
        toast.error("Erreur lors du chargement des soumissions.");
        setData([]);
        setHasFetchedData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [regionId, pageIndex, pageSize, sortField, sortOrder]);

  const handlePreview = (submission) => setPreviewSubmission(submission);
  const refreshSubmissions = () => setPagination({ ...pagination });

  const handleAttendanceUpdate = async (submissionId, newStatus) => {
    try {
      const response = await confirmAttendance(submissionId, newStatus);

      if (response.success) {
        // Update the specific submission in state
        setData((prevData) =>
          prevData.map((sub) =>
            sub._id === submissionId
              ? {
                  ...sub,
                  attendanceStatus: response.submission.attendanceStatus,
                }
              : sub
          )
        );

        // Update stats
        setStats((prev) => {
          const oldStatus = data.find(
            (sub) => sub._id === submissionId
          )?.attendanceStatus;
          return {
            ...prev,
            [newStatus]: (prev[newStatus] || 0) + 1,
            [oldStatus]: prev[oldStatus] - 1,
          };
        });

        refreshSubmissions();
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to update attendance");
    }
  };

  const staticColumns = useMemo(
    () => getRegionalSubmissionColumns(handlePreview, handleAttendanceUpdate),
    [handlePreview, handleAttendanceUpdate]
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
        size: 220,
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
        let maxWidth = 150;
        if (col.accessorKey === "attendanceStatus") maxWidth = 140;
        if (col.accessorKey === "submittedAt") maxWidth = 130;
        if (col.accessorKey === "formTitle") maxWidth = 200;

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
    meta: {
      updateData: (updater) => {
        setData((prev) =>
          typeof updater === "function" ? updater(prev) : updater
        );
      },
      onAttendanceUpdate: handleAttendanceUpdate,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
  });

  // Show loader only during initial loading when we have a region but haven't fetched data yet
  if (loading && regionId && !hasFetchedData) {
    return <Loader />;
  }

  return (
    <div className="space-y-4 p-6 bg-tacir-lightgray min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-md p-4 border border-tacir-lightgray/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-tacir-darkblue rounded-xl shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-tacir-darkblue">
                Confirmation de Présence
              </h1>
              <p className="text-tacir-darkgray">
                Gérez les confirmations de présence des candidats sélectionnés
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => handleExportAll(data)}
              className="gap-2 border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white"
              disabled={data.length === 0}
            >
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>
      </div>

      {/* No Region State */}
      {!regionId && (
        <div className="bg-white rounded-2xl shadow-md border border-tacir-lightgray/30 p-8 text-center">
          <AlertCircle className="w-16 h-16 text-tacir-yellow mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-tacir-darkgray mb-2">
            Information de région manquante
          </h3>
          <p className="text-tacir-darkgray mb-4">
            Votre profil ne contient pas d'information de région. Veuillez
            contacter l'administrateur pour configurer votre région.
          </p>
        </div>
      )}

      {/* Content when region is available */}
      {regionId && (
        <>
          {/* Search and Filters Section */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tacir-darkgray h-4 w-4" />
              <Input
                placeholder="Rechercher..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 !min-w-lg w-full border-tacir-lightgray focus:border-tacir-blue"
                disabled={!hasFetchedData || loading}
              />
            </div>

            <DataTableViewOptions table={table} />
          </div>

          {/* Stats Cards - Only show when we have data */}
          {hasFetchedData && stats.total > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatsCard
                title="Total"
                value={stats.total}
                icon={Users}
                color="tacir-blue"
                percentage={100}
              />
              <StatsCard
                title="En attente"
                value={stats.pending}
                icon={Clock}
                color="tacir-yellow"
                percentage={
                  stats.total > 0
                    ? Math.round((stats.pending / stats.total) * 100)
                    : 0
                }
              />
              <StatsCard
                title="Confirmées"
                value={stats.confirmed}
                icon={CheckCircle}
                color="tacir-green"
                percentage={
                  stats.total > 0
                    ? Math.round((stats.confirmed / stats.total) * 100)
                    : 0
                }
              />
              <StatsCard
                title="Déclinées"
                value={stats.declined}
                icon={XCircle}
                color="tacir-pink"
                percentage={
                  stats.total > 0
                    ? Math.round((stats.declined / stats.total) * 100)
                    : 0
                }
              />
            </div>
          )}

          {/* Table Section */}
          <div className="bg-white rounded-2xl shadow-md border border-tacir-lightgray/30 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                <Table>
                  <TableHeader className="bg-tacir-darkblue">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow
                        key={headerGroup.id}
                        className="border-tacir-blue hover:bg-tacir-blue/90 transition-colors"
                      >
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="px-4 py-2 text-left text-xs bg-tacir-darkblue font-semibold text-white uppercase tracking-wider"
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
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="p-4">
                          <div className="space-y-2">
                            {[...Array(pagination.pageSize)].map((_, i) => (
                              <Skeleton
                                key={i}
                                className="h-12 w-full rounded-lg bg-tacir-lightgray"
                              />
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className={`${getRowClass(
                            row.original.attendanceStatus
                          )} hover:bg-tacir-lightgray/30 transition-colors border-tacir-lightgray/20 group`}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className="px-4 py-3 text-sm group-hover:bg-white/50"
                              style={{
                                width: cell.column.getSize(),
                                maxWidth: cell.column.columnDef.maxSize,
                              }}
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
                          colSpan={columns.length}
                          className="h-32 text-center"
                        >
                          <div className="flex flex-col items-center justify-center text-tacir-darkgray">
                            <FileText className="h-8 w-8 mb-2 opacity-50" />
                            <p className="font-medium">
                              {globalFilter
                                ? "Aucune soumission correspondante"
                                : "Aucune soumission disponible"}
                            </p>
                            <p className="text-sm mt-1">
                              {globalFilter
                                ? "Essayez de modifier vos critères de recherche"
                                : "Aucune candidature acceptée n'est disponible pour confirmation de présence"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination - Only show when we have data */}
            {hasFetchedData && table.getRowModel().rows.length > 0 && (
              <div className="px-4 py-3 border-t border-tacir-lightgray/30 bg-tacir-lightgray/20">
                <DataTablePagination table={table} />
              </div>
            )}
          </div>
        </>
      )}

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

export default RegionalCoordinatorCandidatureTable;
