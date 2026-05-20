"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import { toast } from "react-toastify";
import {
  User,
  CheckCircle,
  UserX,
  Calendar,
  FileText,
} from "lucide-react";
import { formatDate } from "@/utils/date";
import {
  getTrainingAttendance,
  saveAttendanceForDay,
  fetchCohortParticipants,
  createTrainingSession,
} from "@/services/trainings/sessionService";
import { generateDailyAttendanceReport } from "@/services/trainings/pdfGenerator";

const addDaysToDate = (dateString, days) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date;
};

const FormationAttendanceModal = ({ training, isOpen, onClose }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);
  const [days, setDays] = useState([]);
  const [activeDay, setActiveDay] = useState(1);
  const [sessionsInitialized, setSessionsInitialized] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState("all"); // New state for cohort filter
  const [cohorts, setCohorts] = useState([]); // New state for available cohorts

  // Calculate days based on training type and duration
  const calculateDays = () => {
    if (!training) return [];
    
    if (training.type === "bootcamp") {
      if (!training.duration && training.startDate && training.endDate) {
        const start = new Date(training.startDate);
        const end = new Date(training.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return Array.from({ length: diffDays }, (_, i) => i + 1);
      }
      return Array.from({ length: training.duration || 1 }, (_, i) => i + 1);
    }
    return [1];
  };

  // Get date for a specific day
  const getDayDate = (day) => {
    if (!training || !training.startDate) return "";
    const date = new Date(training.startDate);
    date.setDate(date.getDate() + (day - 1));
    return date;
  };

  // Helper function for short date format
  const formatShortDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      month: "short",
      day: "numeric"
    });
  };

  useEffect(() => {
    if (isOpen && training) {
      setDays(calculateDays());
      loadAttendanceData();
    }
  }, [isOpen, training]);

  useEffect(() => {
    if (isOpen && training && participants.length > 0 && !sessionsInitialized) {
      initializeSessions();
    }
  }, [isOpen, training, participants, sessionsInitialized]);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      // Fetch participants from all cohorts
      const allParticipants = [];
      const uniqueCohorts = new Set(); // To collect unique cohort names
      
      if (training.cohorts && training.cohorts.length > 0) {
        for (const cohort of training.cohorts) {
          try {
            const response = await fetchCohortParticipants(training._id, cohort);
            if (response.success && response.data) {
              const participantsWithCohort = response.data.map(participant => ({
                ...participant,
                cohort: cohort,
                user: {
                  firstName: participant.user?.firstName || "Unknown",
                  lastName: participant.user?.lastName || "Participant",
                  email: participant.user?.email || "No email",
                  phone: participant.user?.phone || "",
                }
              }));
              
              allParticipants.push(...participantsWithCohort);
              uniqueCohorts.add(cohort); // Add cohort to set
            }
          } catch (error) {
            console.error(`Error loading participants for cohort ${cohort}:`, error);
            toast.error(`Erreur lors du chargement des participants pour la cohorte ${cohort}`);
          }
        }
      }
      
      // Set available cohorts for filtering
      setCohorts(["all", ...Array.from(uniqueCohorts)]);
      
      // Remove duplicates by participant ID
      const uniqueParticipants = allParticipants.reduce((acc, current) => {
        if (!acc.some(participant => participant._id === current._id)) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      setParticipants(uniqueParticipants);
      
      // Fetch attendance
      const attendanceResponse = await getTrainingAttendance(training._id);
      setAttendance(attendanceResponse.attendance || {});
    } catch (error) {
      console.error("Error loading attendance data:", error);
      toast.error("Erreur lors du chargement des données de présence");
    } finally {
      setLoading(false);
    }
  };

  const initializeSessions = async () => {
    try {
      setLoading(true);
      let createdCount = 0;
      const newAttendance = { ...attendance };

      for (const day of days) {
        const sessionDate = getDayDate(day);
        
        for (const participant of participants) {
          const sessionKey = `${participant._id}-${day}`;
          
          if (!newAttendance[sessionKey]) {
            const sessionData = {
              trainingId: training._id,
              trainingTitle: training.title,
              participantId: participant._id,
              date: sessionDate,
              participantName: `${participant.user.firstName} ${participant.user.lastName}`,
              startTime: "00h",
              endTime: "24h",
              day: day,
              cohort: participant.cohort
            };
            
            await createTrainingSession(sessionData);
            newAttendance[sessionKey] = "absent";
            createdCount++;
          }
        }
      }
      
      setAttendance(newAttendance);
      
      if (createdCount > 0) {
        toast.success(`${createdCount} sessions créées avec succès`);
      } else {
        toast.info("Toutes les sessions existent déjà");
      }
      
      setSessionsInitialized(true);
    } catch (error) {
      console.error("Error initializing sessions:", error);
      toast.error("Erreur lors de l'initialisation des sessions");
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (participantId) => {
    const sessionKey = `${participantId}-${activeDay}`;
    setAttendance(prev => ({
      ...prev,
      [sessionKey]: prev[sessionKey] === "present" ? "absent" : "present"
    }));
  };

  const saveAttendance = async () => {
    if (!training) return;
    
    setSaving(true);
    try {
      // Filter attendance for the active day
      const dayAttendance = {};
      
      for (const [key, status] of Object.entries(attendance)) {
        if (key.endsWith(`-${activeDay}`)) {
          const participantId = key.split('-')[0];
          dayAttendance[participantId] = status;
        }
      }
      
      await saveAttendanceForDay(training._id, activeDay, dayAttendance);
      toast.success("Présence enregistrée avec succès !");
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Erreur lors de l'enregistrement de la présence");
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = async () => {
    // Build sessions data for the active day only
    const sessionsForPDF = [];
    
    for (const participant of filteredParticipants) {
      const sessionKey = `${participant._id}-${activeDay}`;
      const status = attendance[sessionKey] || 'absent';
      
      sessionsForPDF.push({
        date: getDayDate(activeDay),
        startTime: training.time ? training.time.split(' - ')[0] : "00h",
        endTime: training.time ? training.time.split(' - ')[1] : "24h",
        cohort: participant.cohort,
        participantName: `${participant.user.firstName} ${participant.user.lastName}`,
        attendance: status,
        signature: null, // Not available in modal
        day: activeDay
      });
    }

    try {
      await generateDailyAttendanceReport(
        training, 
        sessionsForPDF,
        training.type, 
        activeDay,
        getDayDate(activeDay)
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erreur lors de la génération du rapport");
    }
  };

  const getAttendanceStatus = (participantId) => {
    const sessionKey = `${participantId}-${activeDay}`;
    return attendance[sessionKey] || "absent";
  };

  // Filter participants by selected cohort
  const filteredParticipants = selectedCohort === "all" 
    ? participants 
    : participants.filter(p => p.cohort === selectedCohort);

  if (!training) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-6 rounded-xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Calendar className="w-5 h-5 text-tacir-blue" />
            Gestion de présence:{" "}
            <span className="text-tacir-blue">{training.title}</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader size="md" />
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Day Selector */}
            <div className="flex flex-wrap gap-2">
              {days.map(day => (
                <Button
                  key={day}
                  variant={activeDay === day ? "default" : "outline"}
                  onClick={() => setActiveDay(day)}
                  className={`px-4 py-2 rounded-md ${
                    activeDay === day 
                      ? "bg-tacir-blue text-white" 
                      : "border border-gray-300"
                  }`}
                >
                  {training.type === "bootcamp" ? `Jour ${day}` : "Session"}
                  <span className="ml-2 text-xs opacity-80">
                    ({formatShortDate(getDayDate(day))})
                  </span>
                </Button>
              ))}
            </div>

            {/* Current Day Info */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-800">
                    {training.type === "bootcamp" 
                      ? `Jour ${activeDay} sur ${days.length}` 
                      : "Session unique"}
                  </h3>
                  <p className="text-blue-600">
                    {formatDate(getDayDate(activeDay))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700">
                    {filteredParticipants.filter(p => 
                      getAttendanceStatus(p._id) === "present"
                    ).length} présent(s) sur {filteredParticipants.length}
                  </p>
                  <p className="text-xs text-blue-600">
                    {training.time || "Horaires non spécifiés"}
                  </p>
                </div>
              </div>
            </div>

            {/* Cohort Filter */}
            <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
              <div className="text-sm font-medium text-gray-700">
                Filtrer par cohorte:
              </div>
              <div className="flex flex-wrap gap-2">
                {cohorts.map(cohort => (
                  <Button
                    key={cohort}
                    variant={selectedCohort === cohort ? "default" : "outline"}
                    onClick={() => setSelectedCohort(cohort)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      selectedCohort === cohort 
                        ? "bg-tacir-blue text-white" 
                        : "border border-gray-300"
                    }`}
                  >
                    {cohort === "all" ? "Toutes les cohortes" : cohort}
                  </Button>
                ))}
              </div>
            </div>

            {/* Attendance Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
              <div className="bg-gray-50 px-4 py-3 flex items-center text-sm text-gray-500 font-medium sticky top-0">
                <div className="w-1/2">Participant</div>
                <div className="w-1/4">Cohorte</div>
                <div className="w-1/4">Statut</div>
                <div className="w-1/4">Actions</div>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredParticipants.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500">
                    Aucun participant trouvé {selectedCohort !== "all" ? `dans la cohorte ${selectedCohort}` : ""}
                  </div>
                ) : (
                  filteredParticipants.map(participant => (
                    <div
                      key={participant._id}
                      className="px-4 py-3 flex items-center text-sm"
                    >
                      <div className="w-1/2 flex items-center gap-3">
                        <div className="bg-gray-200 border border-gray-300 rounded-full w-8 h-8" />
                        <div>
                          <p className="font-medium">
                            {participant.user?.firstName} {participant.user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {participant.user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="w-1/4">
                        <span className="text-sm text-gray-700">
                          {participant.cohort}
                        </span>
                      </div>

                      <div className="w-1/4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            getAttendanceStatus(participant._id) === "present"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {getAttendanceStatus(participant._id) === "present"
                            ? "Présent"
                            : "Absent"}
                        </span>
                      </div>

                      <div className="w-1/4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleAttendance(participant._id)}
                          className="flex items-center gap-1"
                        >
                          {getAttendanceStatus(participant._id) === "present" ? (
                            <UserX className="w-4 h-4 text-red-600" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          Changer
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button
                onClick={generatePDF}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Générer rapport
              </Button>
              
              <Button
                onClick={saveAttendance}
                disabled={saving}
                className="bg-tacir-blue hover:bg-tacir-darkblue text-white px-6 py-2 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader size="sm" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer la présence"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-4 py-2"
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormationAttendanceModal;