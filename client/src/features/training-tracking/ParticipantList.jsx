"use client";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, User, Download } from "lucide-react";
import { useState } from "react";
import Pagination from "@/components/common/CustomPagination";

export const ParticipantList = ({ participants = [], attendance = [] }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Calculate paginated data
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedParticipants = participants.slice(startIndex, endIndex);

  // Calculate attendance status for each participant
  const getAttendanceStatus = (participantId) => {
    const participantAttendance = attendance.filter(
      (a) => a.participantId === participantId
    );

    if (participantAttendance.length === 0)
      return { percentage: 0, present: 0, total: 0 };

    const presentCount = participantAttendance.filter(
      (a) => a.status === "present"
    ).length;

    return {
      percentage: Math.round(
        (presentCount / participantAttendance.length) * 100
      ),
      present: presentCount,
      total: participantAttendance.length,
    };
  };

  // Count outputs by status for each participant
  const getOutputCounts = (participantId) => {
    // This would need to be implemented based on your actual data structure
    return {
      completed: 0,
      rejected: 0,
      pending: 0,
    };
  };

  // Calculate summary statistics
  const calculateStats = () => {
    const totalParticipants = participants.length;
    const activeParticipants = participants.filter(
      (p) => p.status === "active"
    ).length;
    const attendanceRate =
      participants.length > 0
        ? Math.round(
            participants.reduce(
              (sum, p) => sum + getAttendanceStatus(p._id).percentage,
              0
            ) / participants.length
          )
        : 0;

    return {
      totalParticipants,
      activeParticipants,
      attendanceRate,
    };
  };

  const stats = calculateStats();

  const handleExportRecords = async () => {
    try {
      // Create CSV content
      const csvContent = [
        [
          "Participant",
          "Email",
          "Statut",
          "Taux de présence",
          "Livrables complétés",
          "Livrables rejetés",
          "Livrables en attente",
        ].join(","),
        ...participants.map((participant) => {
          const attendance = getAttendanceStatus(participant._id);
          const outputs = getOutputCounts(participant._id);

          return [
            `${participant.user?.firstName} ${participant.user?.lastName}`,
            participant.user?.email,
            participant.status || "active",
            `${attendance.percentage}%`,
            outputs.completed,
            outputs.rejected,
            outputs.pending,
          ].join(",");
        }),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `participants_${new Date().getTime()}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Erreur lors de l'export des participants:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-tacir-lightgray">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tacir-blue/10 rounded-lg">
              <User className="w-5 h-5 text-tacir-blue" />
            </div>
            <div>
              <p className="text-sm text-tacir-darkgray">Participants totaux</p>
              <p className="text-2xl font-bold text-tacir-darkblue">
                {stats.totalParticipants}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-tacir-lightgray">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tacir-green/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-tacir-green" />
            </div>
            <div>
              <p className="text-sm text-tacir-darkgray">Participants actifs</p>
              <p className="text-2xl font-bold text-tacir-green">
                {stats.activeParticipants}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-tacir-lightgray">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tacir-lightblue/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-tacir-lightblue" />
            </div>
            <div>
              <p className="text-sm text-tacir-darkgray">
                Taux de présence moyen
              </p>
              <p className="text-2xl font-bold text-tacir-lightblue">
                {stats.attendanceRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-lg border border-tacir-lightgray">
        <div className="flex justify-between items-center p-4 border-b border-tacir-lightgray">
          <div>
            <h3 className="text-lg font-semibold text-tacir-darkblue">
              Liste des participants
            </h3>
            <p className="text-sm text-tacir-darkgray">
              Suivi des participants et de leur progression
            </p>
          </div>
          <Button
            onClick={handleExportRecords}
            className="flex items-center gap-2 bg-tacir-blue text-white hover:bg-tacir-blue/90"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-tacir-darkblue bg-white">
                  Participant
                </TableHead>
                <TableHead className="text-tacir-darkblue bg-white">
                  Email
                </TableHead>
                <TableHead className="text-tacir-darkblue bg-white">
                  Statut
                </TableHead>
                <TableHead className="text-tacir-darkblue bg-white">
                  Présence
                </TableHead>
                <TableHead className="text-tacir-darkblue bg-white">
                  Livrables
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedParticipants.length > 0 ? (
                paginatedParticipants.map((participant) => {
                  const attendanceStatus = getAttendanceStatus(participant._id);
                  const outputCounts = getOutputCounts(participant._id);

                  return (
                    <TableRow key={participant._id}>
                      <TableCell className="font-medium text-tacir-darkblue">
                        {participant.user?.firstName}{" "}
                        {participant.user?.lastName}
                      </TableCell>
                      <TableCell className="text-tacir-darkblue">
                        {participant.user?.email}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-tacir-blue text-white">
                          {participant.status === "active"
                            ? "Actif"
                            : participant.status || "Actif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {attendanceStatus.total === 0 ? (
                          <span className="text-tacir-darkgray">
                            Aucune session
                          </span>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-tacir-darkblue">
                              {attendanceStatus.percentage}%
                            </span>
                            <div className="flex-1 bg-tacir-lightgray rounded-full h-2">
                              <div
                                className="bg-tacir-green h-2 rounded-full"
                                style={{
                                  width: `${attendanceStatus.percentage}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-tacir-darkgray">
                              {attendanceStatus.present}/
                              {attendanceStatus.total}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge className="gap-1 bg-tacir-green text-white">
                            <CheckCircle className="w-3 h-3" />
                            {outputCounts.completed} complétés
                          </Badge>
                          <Badge className="gap-1 bg-tacir-pink text-white">
                            <XCircle className="w-3 h-3" />
                            {outputCounts.rejected} rejetés
                          </Badge>
                          <Badge className="gap-1 bg-tacir-yellow text-white">
                            <Clock className="w-3 h-3" />
                            {outputCounts.pending} en attente
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <User className="w-8 h-8 text-tacir-lightgray" />
                      <p className="text-tacir-darkgray">
                        Aucun participant trouvé
                      </p>
                      <p className="text-sm text-tacir-darkgray">
                        Les participants apparaîtront ici une fois inscrits
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-tacir-lightgray">
          <Pagination
            page={page}
            limit={limit}
            total={participants.length}
            entityName="participants"
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </div>
      </div>
    </div>
  );
};
