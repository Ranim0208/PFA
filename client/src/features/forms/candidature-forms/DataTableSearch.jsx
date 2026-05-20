"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function DataTableSearch({
  value,
  onChange,
  placeholder = "Rechercher...",
  className = "",
}) {
  return (
    <div className={`relative w-full ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-tacir-blue z-10" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10 h-10 bg-white border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-2 focus:ring-tacir-blue/20 transition-all duration-200"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tacir-pink hover:text-tacir-pink/80 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
