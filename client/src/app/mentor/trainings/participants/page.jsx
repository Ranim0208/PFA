"use client";
import React, { useState, useEffect, useCallback } from "react";
import { typeConfig } from "@/features/trainings/components/style.config";
import {
  calculateTrainingStats,
  displayText,
  getPhoneNumber,
  getBirthDate,
  getProjectTitle,
} from "@/features/participants/participantDataUtils";
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Users,
  Download,
} from "lucide-react";
import { getParticipantsForMentor } from "@/services/trainings/trainingTracking";
import { getMentorTrainings } from "@/services/trainings/training";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, X } from "lucide-react";
// Components
import DashboardHeader from "@/features/participants/DashboardHeader";
import StatsOverview from "@/features/participants/StatsOverview";
import ParticipantDetailModal from "@/features/participants/ParticipantDetailModal";
import LoadingState from "@/features/participants/LoadingState";
import EmptyState from "@/features/participants/EmptyState";
import Pagination from "@/components/common/CustomPagination";

const ParticipantsDashboard = () => {
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [trainings, setTrainings] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    byType: {},
    byStatus: { active: 0, upcoming: 0, completed: 0 },
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const fetchTrainings = async () => {
    try {
      const response = await getMentorTrainings();
      setTrainings(response.data || []);
      if (response.data?.length > 0) {
        setSelectedTraining(response.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching trainings:", error);
    }
  };

  const fetchParticipants = useCallback(async () => {
    if (!selectedTraining) return;

    setLoading(true);
    try {
      const params = {
        trainingId: selectedTraining,
        search: debouncedSearchTerm,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await getParticipantsForMentor(params);
      const allParticipants =
        response.data?.flatMap((group) => group.participants) || [];

      setParticipants(allParticipants);
      setStats(calculateTrainingStats(allParticipants));
      setPagination(
        response.pagination || {
          total: allParticipants.length,
          page: params.page,
          limit: params.limit,
          totalPages: Math.ceil(allParticipants.length / params.limit),
        }
      );
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setLoading(false);
    }
  }, [
    selectedTraining,
    debouncedSearchTerm,
    sortConfig,
    pagination.page,
    pagination.limit,
  ]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleExportData = () => {
    const csvData = participants.map((participant) => ({
      Name: `${participant.user?.firstName || ""} ${
        participant.user?.lastName || ""
      }`,
      Email: participant.user?.email || "",
      Phone: getPhoneNumber(participant),
      Region: displayText(participant.region?.name),
      ProjectTitle: getProjectTitle(participant),
      BirthDate: getBirthDate(participant),
      JoinedDate: new Date(participant.createdAt).toLocaleDateString(),
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        headers
          .map(
            (header) =>
              `"${(row[header] || "").toString().replace(/"/g, '""')}"`
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `participants_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // Enhanced Loading Component
  const EnhancedLoadingState = () => (
    <div className="space-y-4">
      {/* Stats Loading Skeletons */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 border border-gray-200"
          >
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Loading Skeletons */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-gray-200 last:border-b-0">
            <div className="animate-pulse space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Enhanced Empty State Component
  const EnhancedEmptyState = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 md:p-12 text-center border border-gray-200">
      <div className="max-w-md mx-auto">
        <div className="p-4 bg-tacir-lightblue/10 rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
          <Users className="w-8 h-8 sm:w-10 sm:h-10 text-tacir-lightblue" />
        </div>
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-tacir-darkblue mb-2 sm:mb-3">
          {debouncedSearchTerm
            ? "Aucun participant trouvé"
            : "Aucun participant"}
        </h3>
        <p className="text-tacir-darkgray text-sm sm:text-base mb-4 sm:mb-6">
          {debouncedSearchTerm
            ? "Aucun participant ne correspond à votre recherche. Essayez d'autres termes."
            : selectedTraining
            ? "Cette formation n'a pas encore de participants inscrits."
            : "Sélectionnez une formation pour voir ses participants."}
        </p>
        {debouncedSearchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-tacir-lightblue text-white rounded-lg hover:bg-tacir-blue transition-colors text-sm sm:text-base"
          >
            <X className="w-4 h-4" />
            Effacer la recherche
          </button>
        )}
      </div>
    </div>
  );

  const TrainingFilter = () => (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Training Select */}
        <div className="lg:col-span-5">
          <label className="block text-sm font-medium text-tacir-darkblue mb-2">
            Formation
          </label>
          <Select
            value={selectedTraining}
            onValueChange={(value) => {
              setSelectedTraining(value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            <SelectTrigger className="w-full h-11 sm:h-12 text-sm border border-gray-300 rounded-lg hover:border-tacir-lightblue focus:ring-2 focus:ring-tacir-lightblue focus:border-tacir-lightblue transition-colors">
              <SelectValue placeholder="Sélectionnez une formation" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              {trainings.map((training) => {
                const type = typeConfig[training.type];
                const Icon = type?.icon || GraduationCap;
                return (
                  <SelectItem
                    key={training._id}
                    value={training._id}
                    className="focus:bg-tacir-lightblue/10 data-[state=checked]:bg-tacir-lightblue/10"
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`h-4 w-4 ${type?.textColor} flex-shrink-0`}
                      />
                      <span className="truncate flex-1 text-sm">
                        {training.title}
                      </span>
                      <span
                        className={`ml-2 text-xs px-2 py-0.5 rounded-full ${type?.lightBg} ${type?.textColor} whitespace-nowrap`}
                      >
                        {type?.title || training.type}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Search Input with Debouncing */}
        <div className="lg:col-span-7">
          <label className="block text-sm font-medium text-tacir-darkblue mb-2">
            Rechercher
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 sm:h-12 pl-10 pr-10 text-sm border border-gray-300 rounded-lg hover:border-tacir-lightblue focus:ring-2 focus:ring-tacir-lightblue focus:border-tacir-lightblue transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-tacir-pink transition-colors" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const TableHeader = ({ label, sortKey }) => (
    <th
      scope="col"
      className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-tacir-darkblue uppercase tracking-wider cursor-pointer hover:bg-tacir-lightblue/10 transition-colors"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortConfig.key === sortKey && (
          <span className="text-tacir-lightblue">
            {sortConfig.direction === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </th>
  );

  const ParticipantRow = ({ participant }) => (
    <tr className="hover:bg-tacir-lightblue/5 transition-colors border-b border-gray-200 last:border-b-0">
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-tacir-lightblue/10 flex items-center justify-center">
            <span className="text-tacir-lightblue font-medium text-sm">
              {participant.user?.firstName?.charAt(0)}
              {participant.user?.lastName?.charAt(0)}
            </span>
          </div>
          <div className="ml-3 sm:ml-4">
            <div className="text-sm font-medium text-tacir-darkblue">
              {participant.user?.firstName} {participant.user?.lastName}
            </div>
            <div className="text-xs text-tacir-darkgray">
              {getBirthDate(participant)}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-tacir-darkblue flex items-center gap-1">
          <Mail className="h-3 w-3 text-tacir-lightblue flex-shrink-0" />
          {participant.user?.email}
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-tacir-darkblue flex items-center gap-1">
          <Phone className="h-3 w-3 text-tacir-lightblue flex-shrink-0" />
          {getPhoneNumber(participant)}
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-tacir-lightblue/10 text-tacir-darkblue">
          {displayText(participant.region?.name)}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-tacir-darkgray">
        {new Date(participant.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="text-sm text-tacir-darkblue line-clamp-1">
          {getProjectTitle(participant)}
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => setSelectedParticipant(participant)}
          className="text-tacir-lightblue hover:text-tacir-blue hover:underline transition-colors"
        >
          Détails
        </button>
      </td>
    </tr>
  );

  // Mobile Card Component
  const ParticipantCard = ({ participant }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
      {/* Header with Avatar and Name */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-tacir-lightblue/10 flex items-center justify-center">
            <span className="text-tacir-lightblue font-medium text-sm">
              {participant.user?.firstName?.charAt(0)}
              {participant.user?.lastName?.charAt(0)}
            </span>
          </div>
          <div>
            <div className="text-sm font-semibold text-tacir-darkblue">
              {participant.user?.firstName} {participant.user?.lastName}
            </div>
            <div className="text-xs text-tacir-darkgray mt-0.5">
              {getBirthDate(participant)}
            </div>
          </div>
        </div>
        <button
          onClick={() => setSelectedParticipant(participant)}
          className="text-xs text-tacir-lightblue hover:text-tacir-blue font-medium px-3 py-1.5 border border-tacir-lightblue rounded-md hover:bg-tacir-lightblue/5 transition-colors"
        >
          Détails
        </button>
      </div>

      {/* Contact Information */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-tacir-darkgray">
          <Mail className="h-3.5 w-3.5 text-tacir-lightblue flex-shrink-0" />
          <span className="truncate">{participant.user?.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-tacir-darkgray">
          <Phone className="h-3.5 w-3.5 text-tacir-lightblue flex-shrink-0" />
          <span>{getPhoneNumber(participant)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-tacir-darkgray">
          <MapPin className="h-3.5 w-3.5 text-tacir-lightblue flex-shrink-0" />
          <span className="px-2 py-0.5 rounded-full bg-tacir-lightblue/10 text-tacir-darkblue font-medium">
            {displayText(participant.region?.name)}
          </span>
        </div>
      </div>

      {/* Project & Date */}
      <div className="pt-3 border-t border-gray-100 space-y-2">
        <div className="flex items-start gap-2 text-xs">
          <FileText className="h-3.5 w-3.5 text-tacir-lightblue flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-tacir-darkgray">Projet: </span>
            <span className="text-tacir-darkblue font-medium line-clamp-2">
              {getProjectTitle(participant)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-tacir-darkgray">
          <Calendar className="h-3.5 w-3.5 text-tacir-lightblue flex-shrink-0" />
          <span>
            Inscrit le {new Date(participant.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-tacir-darkblue">
                Gestion des Participants
              </h1>
              <p className="text-tacir-darkgray text-sm sm:text-base mt-1">
                {selectedTraining
                  ? `Formation: ${
                      trainings.find((t) => t._id === selectedTraining)
                        ?.title || ""
                    }`
                  : "Sélectionnez une formation pour voir ses participants"}
              </p>
            </div>
            <button
              onClick={handleExportData}
              disabled={participants.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-tacir-lightblue text-white rounded-lg hover:bg-tacir-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          </div>
        </div>

        <TrainingFilter />

        {loading ? (
          <EnhancedLoadingState />
        ) : participants.length === 0 ? (
          <EnhancedEmptyState />
        ) : (
          <>
            <StatsOverview stats={stats} />

            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <TableHeader label="Nom" sortKey="firstName" />
                      <TableHeader label="Email" sortKey="email" />
                      <TableHeader label="Téléphone" sortKey="phone" />
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-tacir-darkblue uppercase tracking-wider">
                        Région
                      </th>
                      <TableHeader
                        label="Date d'inscription"
                        sortKey="createdAt"
                      />
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-tacir-darkblue uppercase tracking-wider">
                        Projet
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-tacir-darkblue uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participants.map((participant) => (
                      <ParticipantRow
                        key={participant._id}
                        participant={participant}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View - Hidden on desktop */}
            <div className="lg:hidden space-y-3">
              {participants.map((participant) => (
                <ParticipantCard
                  key={participant._id}
                  participant={participant}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                <Pagination
                  page={pagination.page}
                  limit={pagination.limit}
                  total={pagination.total}
                  entityName="participants"
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              </div>
            )}
          </>
        )}

        {selectedParticipant && (
          <ParticipantDetailModal
            participant={selectedParticipant}
            onClose={() => setSelectedParticipant(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ParticipantsDashboard;
