"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  FileText,
  Users,
  Calendar,
  UserMinus,
  Download,
  BarChart2,
  BookOpen,
  UserCheck,
  X,
  ChevronRight,
  Search,
  Filter,
  Plus,
  Eye,
  MoreHorizontal,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/utils/date";
import { TrainingStats } from "@/features/training-tracking/TrainingStats";
import { getTrainingTrackingData } from "@/services/trainings/trainingTracking";
import { getApprovedTrainings } from "@/services/trainings/trainingTracking";
import TrainingTrackingFilters from "@/features/trainings/components/TrainingTrackingFilters";
import { apiClient } from "@/hooks/apiClient";
import { apiBaseUrl } from "@/utils/constants";
import EliminationModal from "@/features/trainings/modals/EliminatioonModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

// Mobile Card Components
const MobileSessionRow = ({ session }) => (
  <Card className="p-3 sm:p-4 mb-2 sm:mb-3 border-tacir-lightgray">
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <span className="font-medium text-tacir-darkblue text-xs sm:text-sm">Date</span>
        <span className="text-tacir-darkblue text-right text-xs sm:text-sm">{formatDate(session.date)}</span>
      </div>
      <div className="flex justify-between items-start">
        <span className="font-medium text-tacir-darkblue text-xs sm:text-sm">Participant</span>
        <span className="text-tacir-darkblue text-right text-xs sm:text-sm truncate max-w-[180px]">{session.participantName}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium text-tacir-darkblue text-xs sm:text-sm">Statut</span>
        <Badge
          className={
            session.attendance === "present"
              ? "bg-tacir-green text-white text-xs"
              : "bg-tacir-pink text-white text-xs"
          }
        >
          {session.attendance === "present" ? "Présent" : "Absent"}
        </Badge>
      </div>
    </div>
  </Card>
);

const MobileOutputRow = ({ output }) => (
  <Card className="p-3 sm:p-4 mb-2 sm:mb-3 border-tacir-lightgray">
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <span className="font-medium text-tacir-darkblue text-xs sm:text-sm">Livrable</span>
        <span className="text-tacir-darkblue text-right text-xs sm:text-sm break-words max-w-[180px]">{output.title}</span>
      </div>
      <div className="flex justify-between items-start">
        <span className="font-medium text-tacir-darkblue text-xs sm:text-sm">Échéance</span>
        <span className="text-tacir-darkblue text-right text-xs sm:text-sm">{formatDate(output.dueDate)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium text-tacir-darkblue text-xs sm:text-sm">Statut</span>
        <Badge
          className={
            output.status === "published"
              ? "bg-tacir-green text-white text-xs"
              : output.status === "draft"
              ? "bg-tacir-yellow text-white text-xs"
              : output.status === "archived"
              ? "bg-tacir-pink text-white text-xs"
              : "bg-tacir-lightblue text-white text-xs"
          }
        >
          {output.status === "published"
            ? "Publié"
            : output.status === "draft"
            ? "Brouillon"
            : output.status === "archived"
            ? "Archivé"
            : output.status}
        </Badge>
      </div>
    </div>
  </Card>
);

// Participant Card Component for Mobile
const MobileParticipantCard = ({ participant, attendance }) => {
  const participantAttendance = attendance.filter(
    (a) => a.participantId === participant._id
  );
  const attendanceRate =
    participantAttendance.length > 0
      ? Math.round(
          (participantAttendance.filter((a) => a.status === "present").length /
            participantAttendance.length) *
            100
        )
      : 0;

  return (
    <Card className="p-3 sm:p-4 mb-3 border-tacir-lightgray hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header with Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-tacir-blue/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-tacir-blue" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-tacir-darkblue text-sm truncate">
              {participant.user?.firstName} {participant.user?.lastName}
            </h4>
            <p className="text-xs text-tacir-darkgray truncate">{participant.user?.email}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          {participant.user?.phone && (
            <div className="flex items-center gap-2 text-xs text-tacir-darkgray">
              <Phone className="w-3.5 h-3.5 text-tacir-lightblue flex-shrink-0" />
              <span className="truncate">{participant.user.phone}</span>
            </div>
          )}
          {participant.region && (
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="w-3.5 h-3.5 text-tacir-lightblue flex-shrink-0" />
              <Badge variant="outline" className="text-xs">
                {participant.region.name?.fr || participant.region.name}
              </Badge>
            </div>
          )}
        </div>

        {/* Attendance Rate */}
        <div className="pt-2 border-t border-tacir-lightgray">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-tacir-darkblue">Taux de présence</span>
            <span className="text-xs text-tacir-darkgray">{attendanceRate}%</span>
          </div>
          <Progress
            value={attendanceRate}
            className="h-2 bg-tacir-lightgray"
            indicatorClassName={
              attendanceRate >= 80
                ? "bg-tacir-green"
                : attendanceRate >= 50
                ? "bg-tacir-yellow"
                : "bg-tacir-pink"
            }
          />
          <div className="flex items-center gap-2 mt-2">
            <Badge
              className={
                attendanceRate >= 80
                  ? "bg-tacir-green text-white text-xs"
                  : attendanceRate >= 50
                  ? "bg-tacir-yellow text-white text-xs"
                  : "bg-tacir-pink text-white text-xs"
              }
            >
              {participantAttendance.filter((a) => a.status === "present").length}/
              {participantAttendance.length} présences
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Attendance Card Component for Mobile
const MobileAttendanceCard = ({ session, participant }) => {
  const isPresent = session.attendance === "present";
  
  return (
    <Card className="p-3 sm:p-4 mb-3 border-tacir-lightgray">
      <div className="space-y-2">
        {/* Session Info */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-tacir-lightblue flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-tacir-darkblue">
                {formatDate(session.date)}
              </p>
              <p className="text-xs text-tacir-darkgray">
                {session.startTime} - {session.endTime}
              </p>
            </div>
          </div>
          <Badge
            className={
              isPresent
                ? "bg-tacir-green text-white text-xs"
                : "bg-tacir-pink text-white text-xs"
            }
          >
            {isPresent ? "Présent" : "Absent"}
          </Badge>
        </div>

        {/* Participant Info */}
        <div className="pt-2 border-t border-tacir-lightgray">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-tacir-darkgray flex-shrink-0" />
            <span className="text-xs text-tacir-darkblue truncate">
              {session.participantName || participant?.user?.firstName + " " + participant?.user?.lastName}
            </span>
          </div>
        </div>

        {/* Cohort if available */}
        {session.cohort && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {session.cohort}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};

// Output Card Component for Mobile (Detailed)
const MobileOutputDetailCard = ({ output, participantOutputs }) => {
  const submissions = participantOutputs?.filter(
    (po) => po.trainingOutputId === output._id
  ) || [];
  
  const completedCount = submissions.filter((s) => s.status === "completed").length;
  const totalCount = submissions.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card className="p-3 sm:p-4 mb-3 border-tacir-lightgray hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-tacir-darkblue text-sm line-clamp-2">
              {output.title}
            </h4>
            {output.description && (
              <p className="text-xs text-tacir-darkgray mt-1 line-clamp-2">
                {output.description}
              </p>
            )}
          </div>
          <Badge
            className={
              output.status === "published"
                ? "bg-tacir-green text-white text-xs flex-shrink-0"
                : output.status === "draft"
                ? "bg-tacir-yellow text-white text-xs flex-shrink-0"
                : "bg-tacir-pink text-white text-xs flex-shrink-0"
            }
          >
            {output.status === "published"
              ? "Publié"
              : output.status === "draft"
              ? "Brouillon"
              : "Archivé"}
          </Badge>
        </div>

        {/* Due Date & Type */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1 text-tacir-darkgray">
            <Calendar className="w-3.5 h-3.5 text-tacir-lightblue" />
            <span>Échéance: {formatDate(output.dueDate)}</span>
          </div>
          {output.type && (
            <Badge variant="outline" className="text-xs">
              {output.type}
            </Badge>
          )}
        </div>

        {/* Completion Progress */}
        <div className="pt-2 border-t border-tacir-lightgray">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-tacir-darkblue">Progression</span>
            <span className="text-xs text-tacir-darkgray">{completionRate}%</span>
          </div>
          <Progress
            value={completionRate}
            className="h-2 bg-tacir-lightgray"
            indicatorClassName="bg-tacir-lightblue"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-tacir-darkgray">
              {completedCount}/{totalCount} soumissions
            </span>
            {output.isRequired && (
              <Badge variant="outline" className="text-xs border-tacir-pink text-tacir-pink">
                Obligatoire
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Participant List Component with Mobile Cards
const ParticipantList = ({ participants, attendance, isMobile }) => {
  return (
    <Card className="border-tacir-lightgray">
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-tacir-darkblue text-sm sm:text-base md:text-lg">
          Liste des participants
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {participants.length} participant{participants.length !== 1 ? "s" : ""} inscrit
          {participants.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        {isMobile ? (
          <div className="space-y-3">
            {participants.map((participant) => (
              <MobileParticipantCard
                key={participant._id}
                participant={participant}
                attendance={attendance}
              />
            ))}
            {participants.length === 0 && (
              <div className="text-center py-8 text-tacir-darkgray text-sm">
                Aucun participant inscrit
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-tacir-lightgray overflow-hidden">
            <Table>
              <TableHeader className="bg-tacir-lightgray/30">
                <TableRow>
                  <TableHead className="text-tacir-darkblue text-sm">Nom</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Email</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Téléphone</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Région</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Présence</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => {
                  const participantAttendance = attendance.filter(
                    (a) => a.participantId === participant._id
                  );
                  const attendanceRate =
                    participantAttendance.length > 0
                      ? Math.round(
                          (participantAttendance.filter((a) => a.status === "present")
                            .length /
                            participantAttendance.length) *
                            100
                        )
                      : 0;

                  return (
                    <TableRow key={participant._id} className="hover:bg-tacir-lightgray/20">
                      <TableCell className="text-tacir-darkblue text-sm">
                        {participant.user?.firstName} {participant.user?.lastName}
                      </TableCell>
                      <TableCell className="text-tacir-darkblue text-sm">
                        {participant.user?.email}
                      </TableCell>
                      <TableCell className="text-tacir-darkblue text-sm">
                        {participant.user?.phone || "N/A"}
                      </TableCell>
                      <TableCell className="text-tacir-darkblue text-sm">
                        {participant.region?.name?.fr || participant.region?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={attendanceRate}
                            className="h-2 w-20 bg-tacir-lightgray"
                            indicatorClassName={
                              attendanceRate >= 80
                                ? "bg-tacir-green"
                                : attendanceRate >= 50
                                ? "bg-tacir-yellow"
                                : "bg-tacir-pink"
                            }
                          />
                          <span className="text-xs text-tacir-darkgray whitespace-nowrap">
                            {attendanceRate}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {participants.length === 0 && (
              <div className="text-center py-8 text-tacir-darkgray text-sm">
                Aucun participant inscrit
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Attendance Tracker Component with Mobile Cards
const AttendanceTracker = ({ attendance, sessions, participants, isMobile }) => {
  return (
    <Card className="border-tacir-lightgray">
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-tacir-darkblue text-sm sm:text-base md:text-lg">
          Suivi de présence
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Gestion des présences aux sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        {isMobile ? (
          <div className="space-y-3">
            {sessions.map((session) => (
              <MobileAttendanceCard
                key={session._id}
                session={session}
                participant={participants.find(
                  (p) => p._id === session.participantId
                )}
              />
            ))}
            {sessions.length === 0 && (
              <div className="text-center py-8 text-tacir-darkgray text-sm">
                Aucune session de présence enregistrée
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-tacir-lightgray overflow-hidden">
            <Table>
              <TableHeader className="bg-tacir-lightgray/30">
                <TableRow>
                  <TableHead className="text-tacir-darkblue text-sm">Date</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Heure</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Participant</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Cohorte</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Statut</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session._id} className="hover:bg-tacir-lightgray/20">
                    <TableCell className="text-tacir-darkblue text-sm">
                      {formatDate(session.date)}
                    </TableCell>
                    <TableCell className="text-tacir-darkblue text-sm">
                      {session.startTime} - {session.endTime}
                    </TableCell>
                    <TableCell className="text-tacir-darkblue text-sm">
                      {session.participantName}
                    </TableCell>
                    <TableCell className="text-tacir-darkblue text-sm">
                      {session.cohort || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          session.attendance === "present"
                            ? "bg-tacir-green text-white text-xs"
                            : "bg-tacir-pink text-white text-xs"
                        }
                      >
                        {session.attendance === "present" ? "Présent" : "Absent"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {sessions.length === 0 && (
              <div className="text-center py-8 text-tacir-darkgray text-sm">
                Aucune session de présence enregistrée
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Output Management Component with Mobile Cards
const OutputManagement = ({ outputs, participantOutputs, trainingId, isMobile }) => {
  return (
    <Card className="border-tacir-lightgray">
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <CardTitle className="text-tacir-darkblue text-sm sm:text-base md:text-lg">
              Gestion des livrables
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {outputs.length} livrable{outputs.length !== 1 ? "s" : ""} défini
              {outputs.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <Button size="sm" className="bg-tacir-blue hover:bg-tacir-blue/90 text-white w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau livrable
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        {isMobile ? (
          <div className="space-y-3">
            {outputs.map((output) => (
              <MobileOutputDetailCard
                key={output._id}
                output={output}
                participantOutputs={participantOutputs}
              />
            ))}
            {outputs.length === 0 && (
              <div className="text-center py-8 text-tacir-darkgray text-sm">
                Aucun livrable défini pour cette formation
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-tacir-lightgray overflow-hidden">
            <Table>
              <TableHeader className="bg-tacir-lightgray/30">
                <TableRow>
                  <TableHead className="text-tacir-darkblue text-sm">Titre</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Type</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Échéance</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Statut</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Soumissions</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outputs.map((output) => {
                  const submissions = participantOutputs?.filter(
                    (po) => po.trainingOutputId === output._id
                  ) || [];
                  const completedCount = submissions.filter(
                    (s) => s.status === "completed"
                  ).length;

                  return (
                    <TableRow key={output._id} className="hover:bg-tacir-lightgray/20">
                      <TableCell className="text-tacir-darkblue text-sm font-medium">
                        {output.title}
                      </TableCell>
                      <TableCell className="text-tacir-darkblue text-sm">
                        {output.type || "N/A"}
                      </TableCell>
                      <TableCell className="text-tacir-darkblue text-sm">
                        {formatDate(output.dueDate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            output.status === "published"
                              ? "bg-tacir-green text-white text-xs"
                              : output.status === "draft"
                              ? "bg-tacir-yellow text-white text-xs"
                              : "bg-tacir-pink text-white text-xs"
                          }
                        >
                          {output.status === "published"
                            ? "Publié"
                            : output.status === "draft"
                            ? "Brouillon"
                            : "Archivé"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-tacir-darkblue text-sm">
                        {completedCount}/{submissions.length}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="h-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Modifier</DropdownMenuItem>
                              <DropdownMenuItem>Supprimer</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {outputs.length === 0 && (
              <div className="text-center py-8 text-tacir-darkgray text-sm">
                Aucun livrable défini pour cette formation
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Session Calendar Component (keeping original as it might have custom implementation)
const SessionCalendar = ({ sessions, training, isMobile }) => {
  return (
    <Card className="border-tacir-lightgray">
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-tacir-darkblue text-sm sm:text-base md:text-lg">
          Calendrier des sessions
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""} programmée
          {sessions.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        {isMobile ? (
          <div className="space-y-2 sm:space-y-3">
            {sessions.map((session) => (
              <MobileSessionRow key={session._id} session={session} />
            ))}
            {sessions.length === 0 && (
              <div className="text-center py-8 text-tacir-darkgray text-xs sm:text-sm">
                Aucune session programmée
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-tacir-lightgray overflow-hidden">
            <Table>
              <TableHeader className="bg-tacir-lightgray/30">
                <TableRow>
                  <TableHead className="text-tacir-darkblue text-sm">Date</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Heure</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Participant</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Cohorte</TableHead>
                  <TableHead className="text-tacir-darkblue text-sm">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session._id} className="hover:bg-tacir-lightgray/20">
                    <TableCell className="text-tacir-darkblue text-sm">
                      {formatDate(session.date)}
                    </TableCell>
                    <TableCell className="text-tacir-darkblue text-sm">
                      {session.startTime} - {session.endTime}
                    </TableCell>
                    <TableCell className="text-tacir-darkblue text-sm">
                      {session.participantName}
                    </TableCell>
                    <TableCell className="text-tacir-darkblue text-sm">
                      {session.cohort || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          session.attendance === "present"
                            ? "bg-tacir-green text-white text-xs"
                            : "bg-tacir-pink text-white text-xs"
                        }
                      >
                        {session.attendance === "present" ? "Présent" : "Absent"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {sessions.length === 0 && (
              <div className="text-center py-8 text-tacir-darkgray text-sm">
                Aucune session programmée
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const TrainingCoordinatorDashboard = () => {
  // State declarations
  const [trainings, setTrainings] = useState({
    upcoming: [],
    active: [],
    past: [],
  });
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingDataLoading, setTrackingDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showFilters, setShowFilters] = useState(false);
  const [showEliminationModal, setShowEliminationModal] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
    cohorts: "all",
  });
  const [participantsData, setParticipantsData] = useState({
    participants: [],
    trainings: [],
    attendance: [],
  });
  const [regions, setRegions] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedRegionName, setSelectedRegionName] = useState("");
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Fetch regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setRegionsLoading(true);
        const response = await apiClient(`${apiBaseUrl}/regions/`);

        if (Array.isArray(response)) {
          setRegions(response);
          if (response.length > 0) {
            const firstRegion = response[0];
            const regionName =
              firstRegion.name?.fr || firstRegion.name?.ar || "N/A";
            setSelectedRegionId(firstRegion._id);
            setSelectedRegionName(regionName);
          } else {
            setError("No regions available");
          }
        } else {
          setError("Failed to fetch regions: Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching regions:", error);
        setError("Error fetching regions");
      } finally {
        setRegionsLoading(false);
      }
    };

    fetchRegions();
  }, []);

  // Fetch participants and attendance data when region changes
  useEffect(() => {
    if (!selectedRegionId) return;

    const fetchParticipantsAttendance = async () => {
      try {
        setAttendanceLoading(true);
        setError(null);
        const response = await apiClient(
          `${apiBaseUrl}/trainingsTracking/${selectedRegionId}/attendancebyregion`
        );

        if (response.success) {
          setParticipantsData(response.data);
        } else {
          setError(response.message || "Failed to fetch attendance data");
          setParticipantsData({
            participants: [],
            trainings: [],
            attendance: [],
          });
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
        setError("Error fetching attendance data");
        setParticipantsData({
          participants: [],
          trainings: [],
          attendance: [],
        });
      } finally {
        setAttendanceLoading(false);
      }
    };

    fetchParticipantsAttendance();
  }, [selectedRegionId]);

  // Reset filters function
  const resetFilters = () => {
    setFilters({
      search: "",
      type: "all",
      status: "all",
      cohorts: "all",
    });
  };

  // Fetch all trainings with filters
  useEffect(() => {
    const fetchApprovedTrainings = async () => {
      try {
        setLoading(true);
        const params = {
          type: filters.type === "all" ? undefined : filters.type,
          cohorts: filters.cohorts === "all" ? undefined : filters.cohorts,
          search: filters.search || undefined,
          status: filters.status === "all" ? undefined : filters.status,
        };

        const response = await getApprovedTrainings(params);
        setTrainings(response.data || { upcoming: [], active: [], past: [] });

        const firstTraining =
          response.data?.active?.length > 0
            ? response.data.active[0]._id
            : response.data?.upcoming?.length > 0
            ? response.data.upcoming[0]._id
            : response.data?.past?.length > 0
            ? response.data.past[0]._id
            : null;

        setSelectedTraining(firstTraining);
      } catch (error) {
        console.error("Failed to fetch approved trainings:", error);
        setError("Failed to fetch trainings");
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedTrainings();
  }, [filters]);

  // Fetch tracking data when selected training changes
  useEffect(() => {
    if (!selectedTraining) {
      setTrackingData({
        training: null,
        participants: [],
        sessions: [],
        outputs: { trainingOutputs: [], participantOutputs: [] },
        attendance: [],
        stats: {
          totalParticipants: 0,
          attendanceRate: 0,
          outputsCompleted: 0,
          outputsPending: 0,
          outputsOverdue: 0,
          sessionsCompleted: 0,
          totalSessions: 0,
          sessionCompletionRate: 0,
          outputCompletionRate: 0,
        },
      });
      return;
    }

    const fetchTrainingTrackingData = async () => {
      try {
        setTrackingDataLoading(true);
        const response = await getTrainingTrackingData(selectedTraining);

        if (response.success) {
          setTrackingData(response.data);
        } else {
          setError(response.message || "Failed to fetch tracking data");
        }
      } catch (error) {
        console.error("Failed to fetch training tracking data:", error);
        setError("Error fetching training tracking data");
      } finally {
        setTrackingDataLoading(false);
      }
    };

    fetchTrainingTrackingData();
  }, [selectedTraining]);

  // Training tracking data state
  const [trackingData, setTrackingData] = useState({
    training: null,
    participants: [],
    sessions: [],
    outputs: {
      trainingOutputs: [],
      participantOutputs: [],
    },
    attendance: [],
    stats: {
      totalParticipants: 0,
      attendanceRate: 0,
      outputsCompleted: 0,
      outputsPending: 0,
      outputsOverdue: 0,
      sessionsCompleted: 0,
      totalSessions: 0,
      sessionCompletionRate: 0,
      outputCompletionRate: 0,
    },
  });

  // Get unique cohorts
  const getUniqueCohorts = useMemo(() => {
    const cohortSet = new Set();
    [...trainings.upcoming, ...trainings.active, ...trainings.past].forEach(
      (training) => {
        training.cohorts?.forEach((cohort) => cohortSet.add(cohort));
      }
    );
    return Array.from(cohortSet).map((cohort) => ({
      value: cohort,
      label: cohort,
    }));
  }, [trainings.upcoming, trainings.active, trainings.past]);

  // Filter trainings based on search query
  const filteredTrainings = useMemo(() => {
    const allTrainings = [
      ...trainings.active.map((t) => ({ ...t, status: "active" })),
      ...trainings.upcoming.map((t) => ({ ...t, status: "upcoming" })),
      ...trainings.past.map((t) => ({ ...t, status: "completed" })),
    ];

    if (!searchQuery) return allTrainings;

    return allTrainings.filter((training) =>
      training.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [trainings, searchQuery]);

  // Generate report
  const handleGenerateReport = async () => {
    if (!selectedTraining || !trackingData.training) return;
    try {
      await Promise.resolve();
      console.log("Report generation placeholder");
    } catch (error) {
      console.error("Failed to generate report:", error);
      setError("Failed to generate report");
    }
  };

  // Handle training selection
  const handleTrainingSelect = (trainingId) => {
    setSelectedTraining(trainingId);
    setActiveTab("overview");
  };

  // Handle participant elimination
  const handleEliminate = (participantId) => {
    console.log(`Eliminating participant with ID: ${participantId}`);
  };

  // Handle region selection
  const handleRegionChange = (value) => {
    const selectedRegion = regions.find((region) => region._id === value);
    if (selectedRegion) {
      const regionName =
        selectedRegion.name?.fr || selectedRegion.name?.ar || "N/A";
      setSelectedRegionId(value);
      setSelectedRegionName(regionName);
    } else {
      setSelectedRegionId(value);
      setSelectedRegionName("N/A");
    }
  };

  // Elimination threshold
  const eliminationThreshold = 3;

  if (loading && !selectedTraining) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-tacir-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-6 bg-tacir-lightgray/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-sm border border-tacir-lightgray mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-tacir-blue shadow-md flex-shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-tacir-darkblue truncate">
              Suivi des formations
            </h2>
            <p className="text-xs sm:text-sm text-tacir-darkgray line-clamp-2 sm:line-clamp-1">
              Suivre et gérer tous les programmes de formation et les données
              associées
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto justify-start sm:justify-end">
          <Button
            onClick={handleGenerateReport}
            disabled={!selectedTraining || !trackingData.training}
            className="bg-tacir-blue hover:bg-tacir-blue/90 text-white text-xs sm:text-sm px-3 py-2 h-9 flex-1 sm:flex-initial"
            size="sm"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Générer</span> Rapport
          </Button>
          <Button
            onClick={() => setShowEliminationModal(true)}
            disabled={attendanceLoading || !selectedRegionId}
            className="bg-tacir-pink hover:bg-tacir-pink/90 text-white text-xs sm:text-sm px-3 py-2 h-9 flex-1 sm:flex-initial"
            size="sm"
          >
            <UserMinus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Élimination
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-100 text-red-800 rounded-xl text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Elimination Modal */}
      <EliminationModal
        showEliminationModal={showEliminationModal}
        setShowEliminationModal={setShowEliminationModal}
        selectedRegionName={selectedRegionName}
        attendanceLoading={attendanceLoading}
        participantsData={participantsData}
        eliminationThreshold={eliminationThreshold}
        handleEliminate={handleEliminate}
        regions={regions}
        selectedRegionId={selectedRegionId}
        regionsLoading={regionsLoading}
        handleRegionChange={handleRegionChange}
      />

      {/* Filters */}
      <TrainingTrackingFilters
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        cohorts={getUniqueCohorts}
        resetFilters={resetFilters}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-3 sm:mt-4 md:mt-6">
        {/* Trainings List */}
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
          <Card className="border-tacir-lightgray">
            <CardHeader className="bg-tacir-lightgray/30 border-b border-tacir-lightgray p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center gap-2 text-tacir-darkblue text-sm sm:text-base md:text-lg">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-blue flex-shrink-0" />
                    <span className="truncate">Formations</span>
                  </CardTitle>
                  <CardDescription className="text-tacir-darkgray text-xs sm:text-sm truncate">
                    {filteredTrainings.length} programme
                    {filteredTrainings.length !== 1 ? "s" : ""} de formation
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-tacir-darkgray hover:text-tacir-darkblue p-2 h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
                >
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
              <div className="mt-2 sm:mt-3 relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-tacir-darkgray h-3 w-3 sm:h-4 sm:w-4" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 sm:pl-10 text-xs sm:text-sm h-8 sm:h-9 md:h-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0 max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-y-auto">
                {filteredTrainings.map((training) => (
                  <div
                    key={training._id}
                    className={`p-2 sm:p-3 md:p-4 border-b border-tacir-lightgray cursor-pointer transition-colors hover:bg-tacir-lightgray/30 ${
                      selectedTraining === training._id
                        ? "bg-tacir-blue/10 border-l-4 border-l-tacir-blue"
                        : ""
                    }`}
                    onClick={() => handleTrainingSelect(training._id)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-xs sm:text-sm text-tacir-darkblue line-clamp-2">
                          {training.title}
                        </h3>
                        <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                          <Badge
                            variant={training.status}
                            className="text-xs"
                            style={{
                              backgroundColor:
                                training.status === "active"
                                  ? "#56A632"
                                  : training.status === "upcoming"
                                  ? "#F29F05"
                                  : "#BF1573",
                              color: "white",
                            }}
                          >
                            {training.status === "active"
                              ? "En cours"
                              : training.status === "upcoming"
                              ? "À venir"
                              : "Terminé"}
                          </Badge>
                          <span className="text-xs text-tacir-darkgray truncate">
                            {formatDate(training.startDate)}
                          </span>
                        </div>
                        {training.cohorts && training.cohorts.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {training.cohorts
                              .slice(0, 2)
                              .map((cohort, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs border-tacir-blue text-tacir-blue"
                                >
                                  {cohort}
                                </Badge>
                              ))}
                            {training.cohorts.length > 2 && (
                              <Badge
                                variant="outline"
                                className="text-xs border-tacir-blue text-tacir-blue"
                              >
                                +{training.cohorts.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-tacir-darkgray flex-shrink-0" />
                    </div>
                  </div>
                ))}
                {filteredTrainings.length === 0 && (
                  <div className="p-4 text-center text-tacir-darkgray text-xs sm:text-sm">
                    Aucune formation trouvée correspondant à vos filtres
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Training Details */}
        {selectedTraining && trackingData.training ? (
          <div className="lg:col-span-3 space-y-3 sm:space-y-4">
            <Card className="border-tacir-lightgray">
              <CardHeader className="border-b border-tacir-lightgray p-3 sm:p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="flex-1 min-w-0 w-full md:w-auto">
                    <CardTitle className="text-tacir-darkblue text-base sm:text-lg md:text-xl line-clamp-2">
                      {trackingData.training.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
                      <Badge
                        className={`text-white text-xs ${
                          trackingData.training.type === "formation"
                            ? "bg-tacir-blue"
                            : trackingData.training.type === "bootcamp"
                            ? "bg-tacir-lightblue"
                            : trackingData.training.type === "mentoring"
                            ? "bg-tacir-orange"
                            : "bg-gray-500"
                        }`}
                      >
                        {trackingData.training.type
                          ? trackingData.training.type.charAt(0).toUpperCase() +
                            trackingData.training.type.slice(1)
                          : "Unknown"}
                      </Badge>
                      <Badge
                        style={{
                          backgroundColor:
                            trackingData.training.progress?.status === "active"
                              ? "#56A632"
                              : trackingData.training.progress?.status ===
                                "upcoming"
                              ? "#F29F05"
                              : "#BF1573",
                          color: "white",
                        }}
                        className="text-xs"
                      >
                        {trackingData.training.progress?.status === "active"
                          ? "En cours"
                          : trackingData.training.progress?.status ===
                            "upcoming"
                          ? "À venir"
                          : "Terminé"}
                      </Badge>
                      {trackingData.training.progress && (
                        <span className="text-xs text-tacir-darkgray">
                          {trackingData.training.progress.percentage}% complété
                        </span>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2 mt-1 text-tacir-darkgray text-xs sm:text-sm">
                      <span className="truncate">
                        {formatDate(trackingData.training.startDate)} -{" "}
                        {formatDate(trackingData.training.endDate)}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" className="text-xs h-8 sm:h-9 flex-1 md:flex-initial">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Voir détails</span>
                      <span className="sm:hidden">Détails</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger le rapport
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="w-4 h-4 mr-2" />
                          Exporter les données
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                {trackingDataLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tacir-blue"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    <TrainingStats
                      icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-blue" />}
                      title="Participants"
                      value={trackingData.stats.totalParticipants}
                      trend={
                        trackingData.stats.totalParticipants > 20
                          ? "up"
                          : "down"
                      }
                      isMobile={isMobile}
                    />
                    <TrainingStats
                      icon={<UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-green" />}
                      title="Présence"
                      value={`${trackingData.stats.attendanceRate}%`}
                      trend={
                        trackingData.stats.attendanceRate > 80 ? "up" : "down"
                      }
                      isMobile={isMobile}
                    />
                    <TrainingStats
                      icon={
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-lightblue" />
                      }
                      title="Livrables"
                      value={`${trackingData.outputs.trainingOutputs.length} (${trackingData.stats.outputsCompleted} terminés)`}
                      trend={
                        trackingData.stats.outputCompletionRate > 70
                          ? "up"
                          : "down"
                      }
                      isMobile={isMobile}
                    />
                    <TrainingStats
                      icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-yellow" />}
                      title="Sessions"
                      value={`${trackingData.stats.totalSessions} (${trackingData.stats.sessionsCompleted} terminées)`}
                      trend={
                        trackingData.stats.sessionCompletionRate > 75
                          ? "up"
                          : "down"
                      }
                      isMobile={isMobile}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex w-full border-2 bg-white p-1 overflow-x-auto scrollbar-hide">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-tacir-blue data-[state=active]:text-white flex items-center gap-1 sm:gap-2 text-xs p-2 min-w-[70px] sm:min-w-[80px] flex-shrink-0 justify-center"
                >
                  <BarChart2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">Aperçu</span>
                </TabsTrigger>
                <TabsTrigger
                  value="participants"
                  className="data-[state=active]:bg-tacir-blue data-[state=active]:text-white flex items-center gap-1 sm:gap-2 text-xs p-2 min-w-[70px] sm:min-w-[80px] flex-shrink-0 justify-center"
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">Participants</span>
                </TabsTrigger>
                <TabsTrigger
                  value="sessions"
                  className="data-[state=active]:bg-tacir-blue data-[state=active]:text-white flex items-center gap-1 sm:gap-2 text-xs p-2 min-w-[70px] sm:min-w-[80px] flex-shrink-0 justify-center"
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">Sessions</span>
                </TabsTrigger>
                <TabsTrigger
                  value="outputs"
                  className="data-[state=active]:bg-tacir-blue data-[state=active]:text-white flex items-center gap-1 sm:gap-2 text-xs p-2 min-w-[70px] sm:min-w-[80px] flex-shrink-0 justify-center"
                >
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">Livrables</span>
                </TabsTrigger>
                <TabsTrigger
                  value="attendance"
                  className="data-[state=active]:bg-tacir-blue data-[state=active]:text-white flex items-center gap-1 sm:gap-2 text-xs p-2 min-w-[70px] sm:min-w-[80px] flex-shrink-0 justify-center"
                >
                  <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">Présence</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                <Card className="border-tacir-lightgray">
                  <CardHeader className="p-3 sm:p-4 md:p-6">
                    <CardTitle className="text-tacir-darkblue text-sm sm:text-base md:text-lg">
                      Progression de la formation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-xs sm:text-sm font-medium text-tacir-darkblue">
                            Progression générale
                          </span>
                          <span className="text-xs sm:text-sm text-tacir-darkgray">
                            {trackingData.training.progress?.percentage || 0}%
                          </span>
                        </div>
                        <Progress
                          value={
                            trackingData.training.progress?.percentage || 0
                          }
                          className="h-2 bg-tacir-lightgray"
                          indicatorClassName="bg-tacir-blue"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-xs sm:text-sm font-medium text-tacir-darkblue">
                            Taux de présence
                          </span>
                          <span className="text-xs sm:text-sm text-tacir-darkgray">
                            {trackingData.stats.attendanceRate}%
                          </span>
                        </div>
                        <Progress
                          value={trackingData.stats.attendanceRate}
                          className="h-2 bg-tacir-lightgray"
                          indicatorClassName="bg-tacir-green"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-xs sm:text-sm font-medium text-tacir-darkblue">
                            Sessions terminées
                          </span>
                          <span className="text-xs sm:text-sm text-tacir-darkgray">
                            {trackingData.stats.sessionCompletionRate}%
                          </span>
                        </div>
                        <Progress
                          value={trackingData.stats.sessionCompletionRate}
                          className="h-2 bg-tacir-lightgray"
                          indicatorClassName="bg-tacir-yellow"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-xs sm:text-sm font-medium text-tacir-darkblue">
                            Livrables terminés
                          </span>
                          <span className="text-xs sm:text-sm text-tacir-darkgray">
                            {trackingData.stats.outputCompletionRate}%
                          </span>
                        </div>
                        <Progress
                          value={trackingData.stats.outputCompletionRate}
                          className="h-2 bg-tacir-lightgray"
                          indicatorClassName="bg-tacir-lightblue"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="border-tacir-lightgray">
                    <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 md:p-6">
                      <CardTitle className="text-tacir-darkblue text-sm sm:text-base md:text-lg">
                        Sessions récentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                      {isMobile ? (
                        <div className="space-y-2">
                          {trackingData.sessions.slice(0, 5).map((session) => (
                            <MobileSessionRow key={session._id} session={session} />
                          ))}
                          {trackingData.sessions.length === 0 && (
                            <div className="text-center py-4 text-tacir-darkgray text-xs sm:text-sm">
                              Aucune session programmée
                            </div>
                          )}
                        </div>
                      ) : (
                        <Table>
                          <TableHeader className="bg-tacir-lightgray/30">
                            <TableRow>
                              <TableHead className="text-tacir-darkblue text-xs sm:text-sm">Date</TableHead>
                              <TableHead className="text-tacir-darkblue text-xs sm:text-sm">Participant</TableHead>
                              <TableHead className="text-tacir-darkblue text-xs sm:text-sm">Statut</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {trackingData.sessions.slice(0, 5).map((session) => (
                              <TableRow key={session._id}>
                                <TableCell className="text-tacir-darkblue text-xs sm:text-sm">
                                  {formatDate(session.date)}
                                </TableCell>
                                <TableCell className="text-tacir-darkblue text-xs sm:text-sm">
                                  {session.participantName}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      session.attendance === "present"
                                        ? "bg-tacir-green text-white text-xs"
                                        : "bg-tacir-pink text-white text-xs"
                                    }
                                  >
                                    {session.attendance === "present"
                                      ? "Présent"
                                      : "Absent"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                      {trackingData.sessions.length === 0 && !isMobile && (
                        <div className="text-center py-4 text-tacir-darkgray text-sm">
                          Aucune session programmée
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-tacir-lightgray">
                    <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 md:p-6">
                      <CardTitle className="text-tacir-darkblue text-sm sm:text-base md:text-lg">
                        Livrables récents
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                      {isMobile ? (
                        <div className="space-y-2">
                          {trackingData.outputs.trainingOutputs.slice(0, 5).map((output) => (
                            <MobileOutputRow key={output._id} output={output} />
                          ))}
                          {trackingData.outputs.trainingOutputs.length === 0 && (
                            <div className="text-center py-4 text-tacir-darkgray text-xs sm:text-sm">
                              Aucun livrable défini
                            </div>
                          )}
                        </div>
                      ) : (
                        <Table>
                          <TableHeader className="bg-tacir-lightgray/30">
                            <TableRow>
                              <TableHead className="text-tacir-darkblue text-xs sm:text-sm">Livrable</TableHead>
                              <TableHead className="text-tacir-darkblue text-xs sm:text-sm">Échéance</TableHead>
                              <TableHead className="text-tacir-darkblue text-xs sm:text-sm">Statut</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {trackingData.outputs.trainingOutputs.slice(0, 5).map((output) => (
                              <TableRow key={output._id}>
                                <TableCell className="text-tacir-darkblue text-xs sm:text-sm">
                                  {output.title}
                                </TableCell>
                                <TableCell className="text-tacir-darkblue text-xs sm:text-sm">
                                  {formatDate(output.dueDate)}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      output.status === "published"
                                        ? "bg-tacir-green text-white text-xs"
                                        : output.status === "draft"
                                        ? "bg-tacir-yellow text-white text-xs"
                                        : output.status === "archived"
                                        ? "bg-tacir-pink text-white text-xs"
                                        : "bg-tacir-lightblue text-white text-xs"
                                    }
                                  >
                                    {output.status === "published"
                                      ? "Publié"
                                      : output.status === "draft"
                                      ? "Brouillon"
                                      : output.status === "archived"
                                      ? "Archivé"
                                      : output.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                      {trackingData.outputs.trainingOutputs.length === 0 && !isMobile && (
                        <div className="text-center py-4 text-tacir-darkgray text-sm">
                          Aucun livrable défini
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="participants">
                <ParticipantList
                  participants={trackingData.participants}
                  attendance={trackingData.attendance}
                  isMobile={isMobile}
                />
              </TabsContent>

              <TabsContent value="sessions">
                <SessionCalendar
                  sessions={trackingData.sessions}
                  training={trackingData.training}
                  isMobile={isMobile}
                />
              </TabsContent>

              <TabsContent value="outputs">
                <OutputManagement
                  outputs={trackingData.outputs.trainingOutputs}
                  participantOutputs={trackingData.outputs.participantOutputs}
                  trainingId={selectedTraining}
                  isMobile={isMobile}
                />
              </TabsContent>

              <TabsContent value="attendance">
                <AttendanceTracker
                  attendance={trackingData.attendance}
                  sessions={trackingData.sessions}
                  participants={trackingData.participants}
                  isMobile={isMobile}
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : selectedTraining ? (
          <div className="lg:col-span-3 flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-tacir-blue"></div>
          </div>
        ) : (
          <div className="lg:col-span-3 flex items-center justify-center h-64">
            <div className="text-center p-4">
              <BookOpen className="w-10 h-10 sm:w-12 sm:w-12 mx-auto text-tacir-lightgray" />
              <h3 className="mt-2 text-base sm:text-lg font-medium text-tacir-darkblue">
                Aucune formation sélectionnée
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-tacir-darkgray">
                Sélectionnez une formation dans la liste pour voir les détails
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingCoordinatorDashboard;
