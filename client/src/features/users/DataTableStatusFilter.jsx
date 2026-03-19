"use client";
import React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const roleOptions = [
  { value: "", label: "Tous les rôles" },
  { value: "admin", label: "Administrateur" },
  { value: "mentor", label: "Mentor" },
  { value: "projectHolder", label: "Porteur de projet" },
  { value: "IncubationCoordinator", label: "Coordinateur d'incubation" }, // Matches backend
  { value: "ComponentCoordinator", label: "Coordinateur de composante" }, // Matches backend
  { value: "RegionalCoordinator", label: "Coordinateur régional" }, // Matches backend
  { value: "jury", label: "Jury" }, // Added from backend
];

export function DataTableStatusFilter({ value, onChange }) {
  const selectedLabel = roleOptions.find((o) => o.value === value)?.label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 lg:flex">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">
            Rôle {value && `(${selectedLabel})`}
          </span>
          <span className="sm:hidden">
            {value ? selectedLabel?.substring(0, 10) + "..." : "Rôle"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px] sm:w-[250px]">
        <DropdownMenuLabel className="text-xs sm:text-sm">
          Filtrer par rôle
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {roleOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={value === option.value}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange(option.value);
                } else {
                  onChange("");
                }
              }}
              className="text-xs sm:text-sm"
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
