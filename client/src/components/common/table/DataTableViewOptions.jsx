"use client";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function DataTableViewOptions({ table }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-10 border-tacir-darkgray/30 text-tacir-darkgray hover:text-tacir-blue hover:border-tacir-blue hover:bg-tacir-lightblue/10 transition-all"
        >
          <Settings2 className="h-4 w-4" />
          <span className="hidden lg:inline ml-2">Colonnes</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[200px] border-tacir-lightgray shadow-lg"
      >
        <DropdownMenuLabel className="text-sm font-semibold text-tacir-darkblue flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-tacir-blue" />
          Colonnes visibles
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-tacir-lightgray" />
        <div className="max-h-[300px] overflow-y-auto">
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== "undefined" && column.getCanHide()
            )
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="text-sm text-tacir-darkgray hover:text-tacir-darkblue hover:bg-tacir-lightgray cursor-pointer transition-colors"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  <span className="capitalize">
                    {column.id === "title.fr" && "Titre FR"}
                    {column.id === "title.ar" && "Titre AR"}
                    {column.id === "createdAt" && "Date de création"}
                    {column.id === "fields" && "Champs"}
                    {column.id === "status" && "Statut"}
                    {column.id === "select" && "Sélection"}
                    {column.id === "actions" && "Actions"}
                    {![
                      "title.fr",
                      "title.ar",
                      "createdAt",
                      "fields",
                      "status",
                      "select",
                      "actions",
                    ].includes(column.id) && column.id}
                  </span>
                </DropdownMenuCheckboxItem>
              );
            })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
