"use client";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, ChevronDown, ChevronUp, Search, X } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { typeConfig } from "@/features/trainings/components/style.config";

export default function TrainingTrackingFilters({
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  cohorts,
  resetFilters, // Add this prop
}) {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Debounce search input
  const debounceSearch = useCallback(
    (value) => {
      setFilters((prev) => ({ ...prev, search: value }));
    },
    [setFilters]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    debounceSearch(value);
  };

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    // Reset to page 1 when filters change
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, [filters.search, filters.type, filters.cohorts]);

  const handleReset = () => {
    setSearchValue("");
    resetFilters(); // Use the reset function passed from parent
  };

  const hasActiveFilters =
    filters.search || filters.type !== "all" || filters.cohorts !== "all";

  return (
    <div className="space-y-3 my-2">
      {/* Search and Filter Toggle */}
      <div className="flex bg-white rounded-lg shadow-sm p-2 flex-col sm:flex-row gap-2 border border-gray-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher des formations..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-9 h-10 border-gray-200 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="h-10 flex items-center gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-tacir-blue"
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
        <Card className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Training Type Filter */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de Formation
              </label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, type: value, page: 1 }))
                }
              >
                <SelectTrigger className="h-10  w-full border-gray-300 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gray-300" />
                      Tous les types
                    </div>
                  </SelectItem>
                  {Object.entries(typeConfig).map(([type, config]) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <config.icon
                          className={`w-4 h-4 ${config.textColor}`}
                        />
                        {config.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cohorts Filter */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cohortes
              </label>
              <Select
                value={filters.cohorts || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, cohorts: value, page: 1 }))
                }
              >
                <SelectTrigger className="h-10  w-full border-gray-300 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue">
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

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleReset}
                className="h-10 w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-tacir-blue"
                disabled={!hasActiveFilters}
              >
                Réinitialiser
              </Button>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h4 className="text-xs font-medium text-gray-500 mb-2">
                FILTRES ACTIFS
              </h4>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
                    Recherche: "{filters.search}"
                    <button
                      onClick={() => {
                        setSearchValue("");
                        setFilters((prev) => ({
                          ...prev,
                          search: "",
                          page: 1,
                        }));
                      }}
                      className="ml-1.5 hover:bg-blue-100 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.type && filters.type !== "all" && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-100">
                    Type: {typeConfig[filters.type]?.title}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          type: "all",
                          page: 1,
                        }))
                      }
                      className="ml-1.5 hover:bg-green-100 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.cohorts && filters.cohorts !== "all" && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-100">
                    Cohorte: {filters.cohorts}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          cohorts: "all",
                          page: 1,
                        }))
                      }
                      className="ml-1.5 hover:bg-purple-100 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
