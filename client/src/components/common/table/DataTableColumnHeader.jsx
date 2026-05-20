// components/common/table/DataTableColumnHeader.jsx
"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

export function DataTableColumnHeader({ column, title, className }) {
  if (!column) {
    return <div className={cn("font-medium", className)}>{title}</div>;
  }

  const canSort = column.getCanSort?.() ?? false;
  const canHide = column.getCanHide?.() ?? false;

  if (!canSort && !canHide) {
    return <div className={cn("font-medium", className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent hover:bg-gray-100"
          >
            <span className="font-medium">{title}</span>
            {canSort && (
              <>
                {column.getIsSorted() === "desc" ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                )}
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          {canSort && (
            <>
              <DropdownMenuItem
                onClick={() => column.toggleSorting(false)}
                className="cursor-pointer"
              >
                <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Croissant
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => column.toggleSorting(true)}
                className="cursor-pointer"
              >
                <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Décroissant
              </DropdownMenuItem>
            </>
          )}
          {canHide && (
            <>
              {canSort && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => column.toggleVisibility(false)}
                className="cursor-pointer"
              >
                <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Masquer
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
