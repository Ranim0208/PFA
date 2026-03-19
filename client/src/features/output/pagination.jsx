"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Pagination = ({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 ">
      <div className="text-sm text-tacir-darkblue font-medium">
        Showing{" "}
        <span className="text-tacir-blue">
          {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
        </span>
        - 
        <span className="text-tacir-blue">
          {Math.min(currentPage * itemsPerPage, totalItems)}
        </span>{" "}
        of <span className="text-tacir-blue">{totalItems}</span> outputs
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="border-tacir-lightblue hover:bg-tacir-lightblue/20 hover:text-tacir-blue text-tacir-darkblue"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className={`${
                    currentPage === pageNum
                      ? "bg-tacir-blue hover:bg-tacir-blue/90 text-white"
                      : "border-tacir-lightblue hover:bg-tacir-lightblue/20 text-tacir-darkblue"
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="px-2 text-tacir-darkgray">...</span>
            )}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                className="border-tacir-lightblue hover:bg-tacir-lightblue/20 text-tacir-darkblue"
              >
                {totalPages}
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="border-tacir-lightblue hover:bg-tacir-lightblue/20 hover:text-tacir-blue text-tacir-darkblue"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => {
            onItemsPerPageChange(Number(value));
            onPageChange(1);
          }}
        >
          <SelectTrigger className="w-[120px] border-tacir-lightblue hover:border-tacir-blue focus:ring-tacir-blue">
            <SelectValue placeholder="Per page" />
          </SelectTrigger>
          <SelectContent className="border-tacir-lightblue">
            <SelectItem
              value="1"
              className="hover:bg-tacir-lightblue/20 focus:bg-tacir-lightblue/20"
            >
              1 per page
            </SelectItem>
            <SelectItem
              value="5"
              className="hover:bg-tacir-lightblue/20 focus:bg-tacir-lightblue/20"
            >
              5 per page
            </SelectItem>
            <SelectItem
              value="10"
              className="hover:bg-tacir-lightblue/20 focus:bg-tacir-lightblue/20"
            >
              10 per page
            </SelectItem>
            <SelectItem
              value="20"
              className="hover:bg-tacir-lightblue/20 focus:bg-tacir-lightblue/20"
            >
              20 per page
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
