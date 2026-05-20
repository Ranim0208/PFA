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
import { CheckCircle, XCircle, Download, Users } from "lucide-react";
import { formatDate } from "@/utils/date";
import { useState } from "react";
import Pagination from "@/components/common/CustomPagination";

export const AttendanceTracker = ({
  attendance = [],
  sessions = [],
  participants = [],
}) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Calculate paginated data
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedAttendance = attendance.slice(startIndex, endIndex);

  // Calculate summary statistics
  const calculateStats = () => {
    const totalRecords = attendance.length;
    const presentCount = attendance.filter(
      (record) => record.status === "present"
    ).length;
    const absentCount = totalRecords - presentCount;
    const attendanceRate =
      totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

    return {
      totalRecords,
      presentCount,
      absentCount,
      attendanceRate,
    };
  };

  const stats = calculateStats();

  const handleExportRecords = async () => {
    try {
      // Create CSV content
      const csvContent = [
        // Headers
        [
          "Participant",
          "Session",
          "Date",
          "Heure",
          "Statut",
          "Confirmé le",
        ].join(","),
        // Data rows
        ...attendance.map((record) =>
          [
            record.participantName || "Inconnu",
            record.sessionTopic || "Session inconnue",
            formatDate(record.sessionDate),
            record.sessionDate
              ? new Date(record.sessionDate).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            record.status === "present" ? "Présent" : "Absent",
            record.confirmedAt ? formatDate(record.confirmedAt) : "",
          ].join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `attendance_records_${new Date().getTime()}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error exporting attendance records:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-tacir-lightgray">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tacir-blue/10 rounded-lg">
              <Users className="w-5 h-5 text-tacir-blue" />
            </div>
            <div>
              <p className="text-sm text-tacir-darkgray">
                Nombre total d'enregistrements
              </p>
              <p className="text-2xl font-bold text-tacir-darkblue">
                {stats.totalRecords}
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
              <p className="text-sm text-tacir-darkgray">Présents</p>
              <p className="text-2xl font-bold text-tacir-green">
                {stats.presentCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-tacir-lightgray">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tacir-pink/10 rounded-lg">
              <XCircle className="w-5 h-5 text-tacir-pink" />
            </div>
            <div>
              <p className="text-sm text-tacir-darkgray">Absents</p>
              <p className="text-2xl font-bold text-tacir-pink">
                {stats.absentCount}
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
              <p className="text-sm text-tacir-darkgray">Taux de présence</p>
              <p className="text-2xl font-bold text-tacir-lightblue">
                {stats.attendanceRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-tacir-lightgray ">
        <div className="flex justify-between items-center p-4 border-b  border-tacir-lightgray">
          <div>
            <h3 className="text-lg font-semibold text-tacir-darkblue">
              Registres de présence
            </h3>
            <p className="text-sm text-tacir-darkgray">
              Historique complet des présences aux sessions
            </p>
          </div>
          <Button
            variant="outline"
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
                  Session
                </TableHead>
                <TableHead className="text-tacir-darkblue bg-white">
                  Date
                </TableHead>
                <TableHead className="text-tacir-darkblue bg-white">
                  Heure
                </TableHead>
                <TableHead className="text-tacir-darkblue bg-white">
                  Statut
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAttendance.length > 0 ? (
                paginatedAttendance.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell className="font-medium text-tacir-darkblue">
                      {record.participantName || "Participant inconnu"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-tacir-darkblue">
                          {record.sessionTopic || "Session inconnue"}
                        </div>
                        {record.sessionDate && (
                          <div className="text-sm text-tacir-darkgray">
                            {formatDate(record.sessionDate)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-tacir-darkblue">
                      {record.sessionDate
                        ? formatDate(record.sessionDate)
                        : "Date inconnue"}
                    </TableCell>
                    <TableCell className="text-tacir-darkblue">
                      {record.sessionDate
                        ? new Date(record.sessionDate).toLocaleTimeString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {record.status === "present" ? (
                        <Badge className="gap-1 bg-tacir-green text-white">
                          <CheckCircle className="w-3 h-3" /> Présent
                        </Badge>
                      ) : (
                        <Badge className="gap-1 bg-tacir-pink text-white">
                          <XCircle className="w-3 h-3" /> Absent
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-8 h-8 text-tacir-lightgray" />
                      <p className="text-tacir-darkgray">
                        Aucun registre de présence trouvé
                      </p>
                      <p className="text-sm text-tacir-darkgray">
                        Les données de présence apparaîtront ici une fois les
                        sessions démarrées
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
            total={attendance.length}
            entityName="registres"
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1); // Reset to first page when limit changes
            }}
          />
        </div>
      </div>
    </div>
  );
};
