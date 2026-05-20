// DataTableCreatedByFilter.jsx
"use client";

import { useMemo } from "react";
import { Filter, Users, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

export function DataTableCreatedByFilter({
  value,
  onChange,
  data = [],
  className = "",
}) {
  const uniqueCreators = useMemo(() => {
    const seen = new Map();

    data.forEach((form) => {
      const creator = form.createdBy;
      if (creator && !seen.has(creator._id)) {
        seen.set(creator._id, creator);
      }
    });

    return Array.from(seen.values());
  }, [data]);

  const selectedCreator = uniqueCreators.find((c) => c._id === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`justify-start text-left font-normal ${className} h-10 border-tacir-lightgray/50 hover:bg-tacir-lightgray/30 hover:border-tacir-blue transition-all`}
        >
          <Filter className="mr-2 h-4 w-4 text-tacir-blue flex-shrink-0" />
          <span className="truncate">
            {selectedCreator
              ? `${selectedCreator.firstName || ""} ${
                  selectedCreator.lastName || ""
                }`.trim() || selectedCreator.email
              : "Tous les créateurs"}
          </span>
          {value && (
            <X
              className="ml-auto h-4 w-4 text-tacir-pink flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[280px] max-h-[300px] overflow-y-auto"
      >
        <DropdownMenuLabel className="flex items-center gap-2">
          <Users className="h-4 w-4 text-tacir-blue" />
          Filtrer par créateur
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={!value}
          onCheckedChange={() => onChange("")}
          className="cursor-pointer"
        >
          <span className="font-medium">Tous les créateurs</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {uniqueCreators.map((creator) => (
          <DropdownMenuCheckboxItem
            key={creator._id}
            checked={value === creator._id}
            onCheckedChange={(checked) => onChange(checked ? creator._id : "")}
            className="cursor-pointer"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-tacir-darkblue">
                {creator.firstName || ""} {creator.lastName || ""}
              </span>
              <span className="text-xs text-tacir-darkgray">
                {creator.email}
              </span>
            </div>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
