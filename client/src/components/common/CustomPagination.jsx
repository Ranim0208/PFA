// components/common/CustomPagination.jsx
"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Pagination({
  page,
  limit,
  total,
  entityName = "items",
  onPageChange,
  onLimitChange,
}) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 w-full">
      {/* Page Info - Mobile first */}
      <div className="text-xs sm:text-sm text-tacir-darkgray text-center sm:text-left order-2 sm:order-1">
        Page {page} sur {totalPages} — {total} {entityName}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-normal">
        {/* Rows per page - Compact on mobile */}
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium hidden sm:block">Lignes</p>
          <Select
            value={`${limit}`}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger className="h-7 sm:h-8 w-[60px] sm:w-[70px] text-xs">
              <SelectValue placeholder={limit} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 hidden sm:flex"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
          >
            <span className="sr-only">Première page</span>
            <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <span className="sr-only">Page précédente</span>
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>

          {/* Current Page - Hidden on mobile, shown on tablet+ */}
          <div className="text-xs sm:text-sm font-medium min-w-[60px] text-center hidden sm:block">
            {page}/{totalPages}
          </div>

          <Button
            variant="outline"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            <span className="sr-only">Page suivante</span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 hidden sm:flex"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
          >
            <span className="sr-only">Dernière page</span>
            <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
