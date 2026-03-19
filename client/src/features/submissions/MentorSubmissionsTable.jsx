"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableViewOptions } from "@/components/common/table/DataTableViewOptions";
import { DataTablePagination } from "@/components/common/table/DataTablePagination";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCurrentUser from "@/hooks/useCurrentUser";
import { getMentorSubmissionColumns } from "@/features/submissions/getMentorSubmissionColumns ";
import { getCreathonSubmissionsForMentor } from "@/services/forms/submissionService";
import MentorSubmissionPreview from "@/features/submissions/MentorSubmissionPreview";

const MentorSubmissionsTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const { user } = useCurrentUser();
  const [previewSubmission, setPreviewSubmission] = useState(null);

  const getRowClass = (status) => {
    const statusClasses = {
      pending: "bg-yellow-50/50",
      reviewed: "bg-blue-50/50",
      accepted: "bg-green-50/50",
      rejected: "bg-red-50/50",
    };
    return statusClasses[status] || "";
  };

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCreathonSubmissionsForMentor({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        sortField: sorting[0]?.id || "createdAt",
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      });
      console.log("data", response);
      setData(response.data || []);
    } catch (error) {
      toast.error("Error fetching submissions");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [pagination, sorting]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const columns = useMemo(
    () => getMentorSubmissionColumns(setPreviewSubmission),
    []
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
    manualPagination: true,
    pageCount: Math.ceil((data.total || 0) / pagination.pageSize),
  });

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Mentor Submissions
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Manage and review team submissions
          </p>
        </div>

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3 w-full xs:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 xs:flex-none xs:w-48 sm:w-56 md:w-64">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
            <Input
              placeholder="Search submissions..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 pr-4 h-9 sm:h-10 text-xs sm:text-sm w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 sm:gap-2 h-9 sm:h-10 flex-1 xs:flex-none"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Export</span>
            </Button>
            <DataTableViewOptions table={table} />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-gray-50/80">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-gray-200"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap"
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
                // Loading Skeletons
                Array.from({ length: pagination.pageSize }).map((_, index) => (
                  <TableRow key={index} className="border-b border-gray-100">
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex} className="px-3 sm:px-4 py-3">
                        <Skeleton className="h-4 sm:h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                // Data Rows
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${getRowClass(
                      row.original.status
                    )}`}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm whitespace-nowrap"
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
                // Empty State
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 sm:h-40 text-center px-4"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          No submissions found
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 max-w-sm">
                          {globalFilter
                            ? "Try adjusting your search criteria"
                            : "No submissions available for review at the moment"}
                        </p>
                      </div>
                      {globalFilter && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setGlobalFilter("")}
                          className="text-xs"
                        >
                          Clear search
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

      {/* Pagination */}
      <div className="flex flex-col xs:flex-row items-center justify-between gap-3 px-1">
        <div className="text-xs sm:text-sm text-gray-600">
          Showing {table.getRowModel().rows.length} of {data.total || 0}{" "}
          submissions
        </div>
        <DataTablePagination table={table} className="w-full xs:w-auto" />
      </div>

      {/* Preview Modal */}
      {previewSubmission && (
        <MentorSubmissionPreview
          submission={previewSubmission}
          onClose={() => setPreviewSubmission(null)}
          currentUserId={user?.id}
          onEvaluationAdded={fetchSubmissions}
        />
      )}
    </div>
  );
};

export default MentorSubmissionsTable;
