"use client";

import { Filter, FileText, Star, Layers, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DataTableTemplateFilter({ value, onChange, className = "" }) {
  const options = [
    {
      value: "forms",
      label: "Formulaires seulement",
      icon: FileText,
      description: "Voir uniquement les formulaires",
    },
    {
      value: "templates",
      label: "Modèles seulement",
      icon: Star,
      description: "Voir uniquement les modèles",
    },
    {
      value: "all",
      label: "Tous les types",
      icon: Layers,
      description: "Formulaires et modèles",
    },
  ];

  const selected = options.find((option) => option.value === value);
  const SelectedIcon = selected?.icon || Filter;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`justify-start text-left font-normal ${className} h-10 border-tacir-lightgray/50 hover:bg-tacir-lightgray/30 hover:border-tacir-blue transition-all`}
        >
          <SelectedIcon className="mr-2 h-4 w-4 text-tacir-blue flex-shrink-0" />
          <span className="truncate">{selected?.label}</span>
          {value !== "forms" && (
            <X
              className="ml-auto h-4 w-4 text-tacir-pink flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onChange("forms");
              }}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-tacir-blue" />
          Filtrer par type
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={value === option.value}
              onCheckedChange={() => onChange(option.value)}
              className="cursor-pointer"
            >
              <div className="flex items-start gap-2">
                <Icon className="h-4 w-4 text-tacir-blue mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-tacir-darkblue">
                    {option.label}
                  </span>
                  <span className="text-xs text-tacir-darkgray">
                    {option.description}
                  </span>
                </div>
              </div>
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
