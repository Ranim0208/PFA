"use client";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, ChevronDown, ChevronUp, Search } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { typeConfig } from "@/features/trainings/components/style.config";

export default function TrainingFiltersProjectHolder({
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  cohorts = [], // Set default value to empty array
  trainingTypes = [], // Set default value to empty array
}) {
  const [searchValue, setSearchValue] = useState(filters.search || "");

  // Debounce search input
  const debounceSearch = useCallback(
    (() => {
      let timeoutId;
      return (value) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setFilters((prev) => ({ ...prev, search: value }));
        }, 500); // 500ms delay
      };
    })(),
    [setFilters]
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    debounceSearch(value);
  };

  // Sync search value with filters when filters change externally
  useEffect(() => {
    if (filters.search !== searchValue) {
      setSearchValue(filters.search || "");
    }
  }, [filters.search]);

  return (
    <>
      {/* Search Bar - Always visible */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tacir-darkgray w-4 h-4" />
          <Input
            placeholder="Rechercher des formations..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-10 border-tacir-lightgray focus:border-tacir-blue focus:ring-tacir-blue"
          />
        </div>

        {/* Filter Toggle Button */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 border-tacir-darkgray text-tacir-darkgray hover:bg-tacir-lightgray hover:border-tacir-blue"
        >
          <Filter className="w-4 h-4" />
          Filtres
          {showFilters ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-6 mb-6 bg-white border border-tacir-lightgray shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Training Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-tacir-darkblue">
                Type de Formation
              </label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value })
                }
              >
                <SelectTrigger className="border-tacir-lightgray focus:border-tacir-blue focus:ring-tacir-blue">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-tacir-darkgray"></div>
                      Tous les types
                    </div>
                  </SelectItem>
                  {trainingTypes
                    .filter(type => type.value !== "all")
                    .map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {typeConfig[type.value]?.icon ? (
                            <></>
                           
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-tacir-darkgray"></div>
                          )}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cohorts Filter - Conditionally rendered */}
            {cohorts.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-tacir-darkblue">
                  Cohortes
                </label>
                <Select
                  value={filters.cohorts || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, cohorts: value })
                  }
                >
                  <SelectTrigger className="border-tacir-lightgray focus:border-tacir-blue focus:ring-tacir-blue">
                    <SelectValue placeholder="Toutes les cohortes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les cohortes</SelectItem>
                    {cohorts.map((cohort) => (
                      <SelectItem key={cohort.value} value={cohort.value}>
                        {cohort.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Clear Filters Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-transparent">
                Actions
              </label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchValue("");
                  setFilters({
                    search: "",
                    status: "all",
                    cohorts: "all",
                    type: "all",
                  });
                }}
                className="w-full border-tacir-lightgray text-tacir-darkgray hover:bg-tacir-lightgray hover:border-tacir-blue"
              >
                Réinitialiser
              </Button>
            </div>
          </div>

          {/* Active Filters Summary */}
          <div className="mt-4 pt-4 border-t border-tacir-lightgray">
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-tacir-blue text-white text-xs rounded-full">
                  Recherche: "{filters.search}"
                  <button
                    onClick={() => {
                      setSearchValue("");
                      setFilters((prev) => ({ ...prev, search: "" }));
                    }}
                    className="hover:bg-blue-700 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.type && filters.type !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-tacir-green text-white text-xs rounded-full">
                  Type: {
                    trainingTypes.find(t => t.value === filters.type)?.label || 
                    typeConfig[filters.type]?.title || 
                    filters.type
                  }
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, type: "all" }))
                    }
                    className="hover:bg-green-700 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.cohorts && filters.cohorts !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-tacir-pink text-white text-xs rounded-full">
                  Cohorte: {filters.cohorts}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, cohorts: "all" }))
                    }
                    className="hover:bg-pink-700 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        </Card>
      )}
    </>
  );
}