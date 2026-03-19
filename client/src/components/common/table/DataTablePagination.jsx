import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

export function DataTablePagination({ table }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
      {/* Selected Rows Info */}
      <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
        {table.getFilteredSelectedRowModel().rows.length}/
        {table.getFilteredRowModel().rows.length} sélectionné(s)
      </div>

      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
        {/* Rows per page - Compact on mobile */}
        <div className="flex items-center gap-2">
          <p className="text-xs sm:text-sm font-medium hidden sm:block">
            Lignes
          </p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-7 sm:h-8 w-[60px] sm:w-[70px] text-xs">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page Info */}
        <div className="text-xs sm:text-sm font-medium min-w-[80px] text-center">
          {table.getState().pagination.pageIndex + 1}/{table.getPageCount()}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Première page</span>
            <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Page précédente</span>
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Page suivante</span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Dernière page</span>
            <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
