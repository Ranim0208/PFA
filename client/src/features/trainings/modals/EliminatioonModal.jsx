import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { X } from "lucide-react";
import { formatDate } from "@/utils/date";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EliminationModal = ({
  showEliminationModal,
  setShowEliminationModal,
  selectedRegionName,
  attendanceLoading,
  participantsData,
  eliminationThreshold,
  handleEliminate,
  regions,
  selectedRegionId,
  regionsLoading,
  handleRegionChange,
}) => {
  if (!showEliminationModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-7xl bg-white border-tacir-lightgray max-h-[85vh] overflow-y-auto p-8">
        <CardHeader className="flex justify-between items-center p-8 border-b border-tacir-lightgray">
          <div>
            <CardTitle className="text-tacir-darkblue text-xl">
              Gestion de l'élimination - Cohorte: {selectedRegionName || "N/A"}
            </CardTitle>
            <CardDescription className="text-tacir-darkgray text-base mt-1">
              Diagramme de présence: Participants (Y) vs Jours (X). Éliminer si absent ≥ {eliminationThreshold} jours sur le total.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            onClick={() => setShowEliminationModal(false)}
            className="text-tacir-darkgray hover:text-tacir-blue p-2"
          >
            <X className="w-6 h-6" />
          </Button>
        </CardHeader>
        <CardContent className="p-8">
          {/* Region Dropdown */}
          <div className="mb-6">
            <Select
              value={selectedRegionId}
              onValueChange={handleRegionChange}
              disabled={regionsLoading || regions.length === 0}
            >
              <SelectTrigger className="w-full border border-black/10 border-tacir-lightgray bg-white p-2 rounded-md shadow-sm">
                <SelectValue
                  placeholder={
                    regionsLoading
                      ? "Chargement..."
                      : regions.length === 0
                      ? "Aucune région"
                      : `Région: ${selectedRegionName}`
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region._id} value={region._id} className="p-2 hover:bg-gray-100">
                    {region.name?.fr || region.name?.ar || "N/A"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {attendanceLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tacir-blue"></div>
            </div>
          ) : participantsData.participants.length === 0 ? (
            <div className="text-center text-tacir-darkgray text-lg p-8 bg-gray-50 rounded-lg">
              Aucune donnée de présence disponible pour cette région.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-tacir-darkblue bg-gray-50 p-4 text-lg font-semibold border-b border-tacir-lightgray">
                      Participant (Axe Y)
                    </TableHead>
                    {participantsData.trainings.flatMap((training) =>
                      training.type === "bootcamp"
                        ? Array.from({ length: training.duration || 1 }, (_, i) => i + 1).map((day) => (
                            <TableHead
                              key={`${training._id}-day-${day}`}
                              className="text-white bg-pink-500 shadow-md rounded-t-md p-4 mx-4 text-center border-b border-tacir-lightgray"
                            >
                              {training.title} - Jour {day}
                              <div className="text-sm text-white/80 mt-1">
                                {formatDate(training.startDate)} - {formatDate(training.endDate)}
                              </div>
                            </TableHead>
                          ))
                        : training.type === "formation"
                        ? (
                            <TableHead
                              key={training._id}
                              className="text-white bg-blue-500 shadow-md rounded-t-md p-4 mx-4 text-center border-b border-tacir-lightgray"
                            >
                              {training.title}
                              <div className="text-sm text-white/80 mt-1">
                                {formatDate(training.startDate)} - {formatDate(training.endDate)}
                              </div>
                            </TableHead>
                          )
                        : training.type === "mentoring"
                        ? (
                            <TableHead
                              key={training._id}
                              className="text-white bg-purple-500 shadow-md rounded-t-md p-4 mx-4 text-center border-b border-tacir-lightgray"
                            >
                              {training.title}
                              <div className="text-sm text-white/80 mt-1">
                                {formatDate(training.startDate)} - {formatDate(training.endDate)}
                              </div>
                            </TableHead>
                          )
                        : (
                            <TableHead key={training._id} className="text-tacir-darkblue bg-gray-50 p-4 mx-4 text-center border-b border-tacir-lightgray">
                              {training.title}
                              <div className="text-sm text-tacir-darkgray mt-1">
                                {formatDate(training.startDate)} - {formatDate(training.endDate)}
                              </div>
                            </TableHead>
                          )
                    )}
                    <TableHead className="text-tacir-darkblue bg-gray-100 p-4 text-lg font-semibold border-b border-tacir-lightgray">
                      Absences
                    </TableHead>
                    <TableHead className="text-tacir-darkblue bg-gray-100 p-4 text-lg font-semibold border-b border-tacir-lightgray">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participantsData.participants.map((part) => {
                    console.log("[EliminationModal] Rendering participant:", JSON.stringify(part, null, 2));
                    const participantAttendance = participantsData.attendance.find(
                      (a) => a.participantId.toString() === part.id.toString()
                    );
                    let totalAbsences = 0;
                    let totalSessions = 0;

                    return (
                      <TableRow key={part.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium text-tacir-darkblue p-4 border-b border-tacir-lightgray">
                          {part.name || "Unknown"}
                        </TableCell>
                        {participantsData.trainings.flatMap((training) => {
                          const attendanceForTraining = participantAttendance?.attendance.find(
                            (a) => a.trainingId.toString() === training._id.toString()
                          );
                          if (training.type === "bootcamp") {
                            totalSessions += training.duration || 1;
                            return Array.from({ length: training.duration || 1 }, (_, i) => i + 1).map((day) => {
                              const dayAttendance = attendanceForTraining?.days.find(d => d.day === day);
                              const status = dayAttendance ? dayAttendance.status : "absent";
                              if (status === "absent") totalAbsences++;
                              return (
                                <TableCell key={`${training._id}-day-${day}`} className="p-3 text-center border-b border-tacir-lightgray">
                                  <div
                                    className={`p-2 rounded font-medium ${
                                      status === "present"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </div>
                                </TableCell>
                              );
                            });
                          } else {
                            totalSessions += 1;
                            const status = attendanceForTraining?.status || "absent";
                            if (status === "absent") totalAbsences++;
                            return (
                              <TableCell key={training._id} className="p-3 text-center border-b border-tacir-lightgray">
                                <div
                                  className={`p-2 rounded font-medium ${
                                    status === "present"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </div>
                              </TableCell>
                            );
                          }
                        })}
                        <TableCell className="text-tacir-darkblue p-4 border-b border-tacir-lightgray">
                          {totalAbsences} / {totalSessions}
                        </TableCell>
                        <TableCell className="p-4 border-b border-tacir-lightgray">
                          {totalAbsences >= eliminationThreshold && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="px-4 py-2"
                              onClick={() => handleEliminate(part.id)}
                            >
                              Éliminer
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {/* Legend/Annexe */}
              <div className="mt-6 text-base text-tacir-darkgray">
                <strong>Légende :</strong>
                <div className="flex flex-wrap space-x-6 mt-3">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 rounded mr-3"></div>
                    <span>Présent</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-red-100 rounded mr-3"></div>
                    <span>Absent</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-pink-500 rounded mr-3"></div>
                    <span>Bootcamp</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-blue-500 rounded mr-3"></div>
                    <span>Formation</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-purple-500 rounded mr-3"></div>
                    <span>Mentorat</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EliminationModal;