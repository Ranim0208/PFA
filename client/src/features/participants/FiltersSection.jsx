import { Search, Filter, X } from "lucide-react";
import { typeConfig } from "../trainings/components/style.config";
export default function FiltersSection({
  searchTerm,
  setSearchTerm,
  selectedTrainingType,
  setSelectedTrainingType,
  selectedRegion,
  setSelectedRegion,
  availableTrainingTypes,
  regions,
  totalParticipants,
  totalTrainings,
}) {
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedTrainingType("all");
    setSelectedRegion("all");
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-tacir-lightgray/30">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom, email ou projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-tacir-lightblue focus:border-transparent transition-all"
          />
        </div>

        <select
          value={selectedTrainingType}
          onChange={(e) => setSelectedTrainingType(e.target.value)}
          className="block w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-tacir-lightblue focus:border-transparent transition-all"
        >
          <option value="all">Tous les types</option>
          {availableTrainingTypes.map((type) => (
            <option key={type} value={type}>
              {typeConfig[type]?.title || type}
            </option>
          ))}
        </select>

        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="block w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-tacir-lightblue focus:border-transparent transition-all"
        >
          <option value="all">Toutes les régions</option>
          {regions.map((region) => (
            <option key={region._id} value={region._id}>
              {region.name.fr || region.name.ar || region.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">
            {totalParticipants} participants dans {totalTrainings} formations
          </span>
        </div>
        {(searchTerm ||
          selectedTrainingType !== "all" ||
          selectedRegion !== "all") && (
          <button
            onClick={resetFilters}
            className="text-sm text-tacir-lightblue hover:text-tacir-darkblue flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
