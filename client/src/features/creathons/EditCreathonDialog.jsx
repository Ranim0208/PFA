// Enhanced EditCreathonDialog component
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Plus,
  Trash2,
  Users,
  Award,
  Search,
  Mail,
  Phone,
  BookOpen,
  CheckCircle,
  X,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { updateCreathonTeam } from "@/services/creathons/creathons";
import { archiveMembers, unarchiveMembers } from "@/services/users/members";
import { getUsersByRole } from "@/services/users/members";

export const EditCreathonDialog = ({ creathon, open, onOpenChange }) => {
  const [teamData, setTeamData] = useState({
    mentors: creathon?.mentors?.members || [],
    juryMembers: creathon?.jury?.members || [],
  });

  const [newMentor, setNewMentor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
  });

  const [newJury, setNewJury] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [sending, setSending] = useState(false);
  const [availableMentors, setAvailableMentors] = useState([]);
  const [availableJury, setAvailableJury] = useState([]);
  const [searchMentorQuery, setSearchMentorQuery] = useState("");
  const [searchJuryQuery, setSearchJuryQuery] = useState("");
  const [selectedMentors, setSelectedMentors] = useState([]);
  const [selectedJury, setSelectedJury] = useState([]);
  const [activeTab, setActiveTab] = useState("mentors");
  const [addMethod, setAddMethod] = useState({
    mentors: "manual",
    jury: "manual",
  });

  useEffect(() => {
    if (open && creathon) {
      setTeamData({
        mentors: creathon?.mentors?.members || [],
        juryMembers: creathon?.jury?.members || [],
      });

      // Load available users when dialog opens
      loadAvailableUsers();
    }
  }, [open, creathon]);

  const loadAvailableUsers = async () => {
    try {
      // Fetch available mentors and jury members
      const mentorsData = await getUsersByRole("mentor");
      const juryData = await getUsersByRole("jury");

      setAvailableMentors(mentorsData);
      setAvailableJury(juryData);
    } catch (error) {
      console.error("Error loading available users:", error);
      toast.error("Erreur lors du chargement des utilisateurs disponibles");
    }
  };

  const addMentor = () => {
    if (newMentor.firstName && newMentor.lastName && newMentor.email) {
      const newMentorWithId = {
        ...newMentor,
        id: Date.now(),
        status: "pending",
        accessStatus: "active",
      };

      setTeamData((prev) => ({
        ...prev,
        mentors: [...prev.mentors, newMentorWithId],
      }));

      setNewMentor({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        specialization: "",
      });
    }
  };

  const addJury = () => {
    if (newJury.firstName && newJury.lastName && newJury.email) {
      const newJuryWithId = {
        ...newJury,
        id: Date.now(),
        status: "pending",
      };

      setTeamData((prev) => ({
        ...prev,
        juryMembers: [...prev.juryMembers, newJuryWithId],
      }));

      setNewJury({ firstName: "", lastName: "", email: "", phone: "" });
    }
  };

  const addSelectedMentors = () => {
    const mentorsToAdd = selectedMentors.map((mentorId) => {
      const mentor = availableMentors.find((m) => m._id === mentorId);
      return {
        user: mentor._id,
        firstName: mentor.firstName,
        lastName: mentor.lastName,
        email: mentor.email,
        phone: mentor.phone || "",
        specialization: mentor.specialization || "",
        status: "confirmed",
        accessStatus: "active",
      };
    });

    setTeamData((prev) => ({
      ...prev,
      mentors: [...prev.mentors, ...mentorsToAdd],
    }));

    setSelectedMentors([]);
    setSearchMentorQuery("");
  };

  const addSelectedJury = () => {
    const juryToAdd = selectedJury.map((juryId) => {
      const jury = availableJury.find((j) => j._id === juryId);
      return {
        user: jury._id,
        firstName: jury.firstName,
        lastName: jury.lastName,
        email: jury.email,
        phone: jury.phone || "",
        status: "confirmed",
      };
    });

    setTeamData((prev) => ({
      ...prev,
      juryMembers: [...prev.juryMembers, ...juryToAdd],
    }));

    setSelectedJury([]);
    setSearchJuryQuery("");
  };

  const toggleMentorSelection = (mentorId) => {
    setSelectedMentors((prev) =>
      prev.includes(mentorId)
        ? prev.filter((id) => id !== mentorId)
        : [...prev, mentorId]
    );
  };

  const toggleJurySelection = (juryId) => {
    setSelectedJury((prev) =>
      prev.includes(juryId)
        ? prev.filter((id) => id !== juryId)
        : [...prev, juryId]
    );
  };

  const toggleLocalMentorAccess = (index, isActive) => {
    setTeamData((prev) => {
      const updatedMentors = [...prev.mentors];
      updatedMentors[index].accessStatus = isActive ? "active" : "inactive";
      return { ...prev, mentors: updatedMentors };
    });
  };

  // Fonctions de suppression corrigées
  const removeMentor = (memberId) => {
    setTeamData((prev) => ({
      ...prev,
      mentors: prev.mentors.filter((mentor) => {
        // Vérifier tous les identifiants possibles
        return !(
          (mentor.id && mentor.id === memberId) ||
          (mentor._id && mentor._id === memberId) ||
          (mentor.user &&
            ((typeof mentor.user === "object" &&
              mentor.user._id === memberId) ||
              (typeof mentor.user === "string" && mentor.user === memberId)))
        );
      }),
    }));
  };

  const removeJury = (memberId) => {
    setTeamData((prev) => ({
      ...prev,
      juryMembers: prev.juryMembers.filter((jury) => {
        // Vérifier tous les identifiants possibles
        return !(
          (jury.id && jury.id === memberId) ||
          (jury._id && jury._id === memberId) ||
          (jury.user &&
            ((typeof jury.user === "object" && jury.user._id === memberId) ||
              (typeof jury.user === "string" && jury.user === memberId)))
        );
      }),
    }));
  };

  // Fonction utilitaire
  const getMemberId = (member) => {
    return member._id || member.user?._id || member.user || member.id;
  };
  const handleSave = async () => {
    try {
      setSending(true);

      const teamUpdate = {
        mentors: {
          members: teamData.mentors.map((member) => ({
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            phone: member.phone,
            specialization: member.specialization,
            status: member.status,
            accessStatus: member.accessStatus || "inactive",
            user: member.user,
          })),
        },
        jury: {
          members: teamData.juryMembers.map((member) => ({
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            phone: member.phone,
            status: member.status,
          })),
        },
      };

      // IDs of mentors to archive (inactive with user)
      const inactiveMentorUserIds = teamData.mentors
        .filter((mentor) => mentor.accessStatus === "inactive" && mentor.user)
        .map((mentor) => mentor.user._id);

      // IDs of mentors to unarchive (active with user)
      const activeMentorUserIds = teamData.mentors
        .filter((mentor) => mentor.accessStatus === "active" && mentor.user)
        .map((mentor) => mentor.user._id);

      // Call archive API if there are inactive mentors
      if (inactiveMentorUserIds.length > 0) {
        await archiveMembers(inactiveMentorUserIds);
      }

      // Call unarchive API if there are active mentors
      if (activeMentorUserIds.length > 0) {
        await unarchiveMembers(activeMentorUserIds);
      }

      await updateCreathonTeam(creathon._id, teamUpdate);

      toast.success("Équipe mise à jour avec succès");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating team:", error);
      toast.error("Erreur lors de la mise à jour de l'équipe");
    } finally {
      setSending(false);
    }
  };

  const filteredAvailableMentors = availableMentors.filter(
    (mentor) =>
      `${mentor.firstName} ${mentor.lastName}`
        .toLowerCase()
        .includes(searchMentorQuery.toLowerCase()) ||
      mentor.email.toLowerCase().includes(searchMentorQuery.toLowerCase())
  );

  const filteredAvailableJury = availableJury.filter(
    (jury) =>
      `${jury.firstName} ${jury.lastName}`
        .toLowerCase()
        .includes(searchJuryQuery.toLowerCase()) ||
      jury.email.toLowerCase().includes(searchJuryQuery.toLowerCase())
  );

  // Mobile Member Card Component
  const MobileMemberCard = ({
    member,
    type,
    index,
    onToggleAccess,
    onRemove,
  }) => {
    return (
      <div className="border border-tacir-lightgray rounded-lg p-3 bg-white">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-tacir-darkblue text-sm break-words">
              {member.firstName} {member.lastName}
            </h4>
            {member.user && (
              <Badge className="bg-tacir-green/10 text-tacir-green border-tacir-green/20 text-xs mt-1">
                Compte existant
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(getMemberId(member))}
            className="text-tacir-pink hover:text-tacir-pink/80 hover:bg-tacir-pink/10 h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3 text-tacir-blue" />
            <span className="text-tacir-darkgray break-words">
              {member.email}
            </span>
          </div>

          {member.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-tacir-blue" />
              <span className="text-tacir-darkgray">{member.phone}</span>
            </div>
          )}

          {member.specialization && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-3 w-3 text-tacir-blue" />
              <span className="text-tacir-darkgray break-words">
                {member.specialization}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-tacir-lightgray/50">
            <Badge
              className={
                member.status === "confirmed"
                  ? "bg-tacir-green/20 text-tacir-green border-tacir-green/30 text-xs"
                  : "bg-tacir-yellow/20 text-tacir-yellow border-tacir-yellow/30 text-xs"
              }
            >
              {member.status === "confirmed" ? "Confirmé" : "En attente"}
            </Badge>

            {type === "mentor" && (
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    member.accessStatus === "active"
                      ? "bg-tacir-green/20 text-tacir-green border-tacir-green/30 text-xs"
                      : "bg-tacir-pink/20 text-tacir-pink border-tacir-pink/30 text-xs"
                  }
                >
                  {member.accessStatus === "active" ? "Actif" : "Inactif"}
                </Badge>
                <Switch
                  checked={member.accessStatus === "active"}
                  onCheckedChange={(checked) => onToggleAccess(index, checked)}
                  className="data-[state=checked]:bg-tacir-green h-4 w-7"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMentorAddSection = () => {
    if (addMethod.mentors === "manual") {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              placeholder="Prénom"
              value={newMentor.firstName}
              onChange={(e) =>
                setNewMentor({ ...newMentor, firstName: e.target.value })
              }
              className="focus:ring-tacir-blue text-sm"
            />
            <Input
              placeholder="Nom"
              value={newMentor.lastName}
              onChange={(e) =>
                setNewMentor({ ...newMentor, lastName: e.target.value })
              }
              className="focus:ring-tacir-blue text-sm"
            />
            <Input
              placeholder="Email"
              type="email"
              value={newMentor.email}
              onChange={(e) =>
                setNewMentor({ ...newMentor, email: e.target.value })
              }
              className="focus:ring-tacir-blue text-sm"
            />
            <Input
              placeholder="Téléphone"
              value={newMentor.phone}
              onChange={(e) =>
                setNewMentor({ ...newMentor, phone: e.target.value })
              }
              className="focus:ring-tacir-blue text-sm"
            />
            <Input
              placeholder="Spécialisation"
              value={newMentor.specialization}
              onChange={(e) =>
                setNewMentor({
                  ...newMentor,
                  specialization: e.target.value,
                })
              }
              className="sm:col-span-2 focus:ring-tacir-blue text-sm"
            />
          </div>
          <Button
            onClick={addMentor}
            className="gap-2 bg-tacir-blue hover:bg-tacir-blue/90 w-full sm:w-auto"
            disabled={
              !newMentor.firstName || !newMentor.lastName || !newMentor.email
            }
            size="sm"
          >
            <Plus className="h-3 w-3" />
            Ajouter Mentor
          </Button>
        </div>
      );
    } else {
      return (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-tacir-darkgray" />
            <Input
              placeholder="Rechercher un mentor..."
              value={searchMentorQuery}
              onChange={(e) => setSearchMentorQuery(e.target.value)}
              className="pl-9 sm:pl-10 focus:ring-tacir-blue text-sm h-9"
            />
          </div>

          <div className="max-h-40 sm:max-h-60 overflow-y-auto border rounded-lg">
            {filteredAvailableMentors.length > 0 ? (
              filteredAvailableMentors.map((mentor) => (
                <div
                  key={mentor._id}
                  className={`p-2 sm:p-3 border-b cursor-pointer flex items-center justify-between text-sm ${
                    selectedMentors.includes(mentor._id)
                      ? "bg-tacir-blue/10"
                      : "hover:bg-tacir-lightgray/30"
                  }`}
                  onClick={() => toggleMentorSelection(mentor._id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium break-words">
                      {mentor.firstName} {mentor.lastName}
                    </div>
                    <div className="text-tacir-darkgray text-xs break-words">
                      {mentor.email}
                    </div>
                    {mentor.specialization && (
                      <div className="text-tacir-darkblue text-xs">
                        {mentor.specialization}
                      </div>
                    )}
                  </div>
                  {selectedMentors.includes(mentor._id) && (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-tacir-blue flex items-center justify-center flex-shrink-0 ml-2">
                      <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-tacir-darkgray text-sm">
                Aucun mentor trouvé
              </div>
            )}
          </div>

          {selectedMentors.length > 0 && (
            <Button
              onClick={addSelectedMentors}
              className="gap-2 bg-tacir-blue hover:bg-tacir-blue/90 w-full sm:w-auto"
              size="sm"
            >
              <Plus className="h-3 w-3" />
              Ajouter {selectedMentors.length} mentor(s)
            </Button>
          )}
        </div>
      );
    }
  };

  const renderJuryAddSection = () => {
    if (addMethod.jury === "manual") {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              placeholder="Prénom"
              value={newJury.firstName}
              onChange={(e) =>
                setNewJury({ ...newJury, firstName: e.target.value })
              }
              className="focus:ring-tacir-blue text-sm"
            />
            <Input
              placeholder="Nom"
              value={newJury.lastName}
              onChange={(e) =>
                setNewJury({ ...newJury, lastName: e.target.value })
              }
              className="focus:ring-tacir-blue text-sm"
            />
            <Input
              placeholder="Email"
              type="email"
              value={newJury.email}
              onChange={(e) =>
                setNewJury({ ...newJury, email: e.target.value })
              }
              className="focus:ring-tacir-blue text-sm"
            />
            <Input
              placeholder="Téléphone"
              value={newJury.phone}
              onChange={(e) =>
                setNewJury({ ...newJury, phone: e.target.value })
              }
              className="focus:ring-tacir-blue text-sm"
            />
          </div>
          <Button
            onClick={addJury}
            className="gap-2 bg-tacir-blue hover:bg-tacir-blue/90 w-full sm:w-auto"
            disabled={!newJury.firstName || !newJury.lastName || !newJury.email}
            size="sm"
          >
            <Plus className="h-3 w-3" />
            Ajouter Juré
          </Button>
        </div>
      );
    } else {
      return (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-tacir-darkgray" />
            <Input
              placeholder="Rechercher un juré..."
              value={searchJuryQuery}
              onChange={(e) => setSearchJuryQuery(e.target.value)}
              className="pl-9 sm:pl-10 focus:ring-tacir-blue text-sm h-9"
            />
          </div>

          <div className="max-h-40 sm:max-h-60 overflow-y-auto border rounded-lg">
            {filteredAvailableJury.length > 0 ? (
              filteredAvailableJury.map((jury) => (
                <div
                  key={jury._id}
                  className={`p-2 sm:p-3 border-b cursor-pointer flex items-center justify-between text-sm ${
                    selectedJury.includes(jury._id)
                      ? "bg-tacir-blue/10"
                      : "hover:bg-tacir-lightgray/30"
                  }`}
                  onClick={() => toggleJurySelection(jury._id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium break-words">
                      {jury.firstName} {jury.lastName}
                    </div>
                    <div className="text-tacir-darkgray text-xs break-words">
                      {jury.email}
                    </div>
                  </div>
                  {selectedJury.includes(jury._id) && (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-tacir-blue flex items-center justify-center flex-shrink-0 ml-2">
                      <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-tacir-darkgray text-sm">
                Aucun juré trouvé
              </div>
            )}
          </div>

          {selectedJury.length > 0 && (
            <Button
              onClick={addSelectedJury}
              className="gap-2 bg-tacir-blue hover:bg-tacir-blue/90 w-full sm:w-auto"
              size="sm"
            >
              <Plus className="h-3 w-3" />
              Ajouter {selectedJury.length} juré(s)
            </Button>
          )}
        </div>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-full sm:!max-w-6xl !w-full h-full sm:h-[90vh] sm:max-h-[90vh] overflow-y-auto rounded-none sm:rounded-lg m-0 sm:m-4">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="flex items-center gap-2 text-tacir-blue">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            <DialogTitle className="text-tacir-darkblue text-lg sm:text-xl">
              Gestion d'équipe du Créathon
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <Tabs
            defaultValue="mentors"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="bg-tacir-lightgray p-1 w-full grid grid-cols-2">
              <TabsTrigger
                value="mentors"
                className="data-[state=active]:bg-white data-[state=active]:text-tacir-blue data-[state=active]:shadow-sm rounded-md text-xs sm:text-sm py-2 h-auto"
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Mentors ({teamData.mentors.length})
              </TabsTrigger>
              <TabsTrigger
                value="jury"
                className="data-[state=active]:bg-white data-[state=active]:text-tacir-blue data-[state=active]:shadow-sm rounded-md text-xs sm:text-sm py-2 h-auto"
              >
                <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Jury ({teamData.juryMembers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mentors" className="space-y-4 mt-4">
              <div className="bg-tacir-lightgray/30 p-3 sm:p-4 rounded-lg">
                <h3 className="font-medium text-tacir-darkblue text-sm sm:text-base mb-3">
                  Ajouter un nouveau mentor
                </h3>

                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <Button
                    variant={
                      addMethod.mentors === "manual" ? "default" : "outline"
                    }
                    onClick={() =>
                      setAddMethod({ ...addMethod, mentors: "manual" })
                    }
                    className={`text-xs sm:text-sm ${
                      addMethod.mentors === "manual"
                        ? "bg-tacir-blue hover:bg-tacir-blue/90"
                        : "border-tacir-darkgray text-tacir-darkgray hover:bg-tacir-lightgray"
                    }`}
                    size="sm"
                  >
                    Saisie manuelle
                  </Button>
                  <Button
                    variant={
                      addMethod.mentors === "select" ? "default" : "outline"
                    }
                    onClick={() =>
                      setAddMethod({ ...addMethod, mentors: "select" })
                    }
                    className={`text-xs sm:text-sm ${
                      addMethod.mentors === "select"
                        ? "bg-tacir-blue hover:bg-tacir-blue/90"
                        : "border-tacir-darkgray text-tacir-darkgray hover:bg-tacir-lightgray"
                    }`}
                    size="sm"
                  >
                    Sélectionner depuis la liste
                  </Button>
                </div>

                {renderMentorAddSection()}
              </div>

              {teamData.mentors.length > 0 ? (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block border rounded-lg overflow-hidden">
                    <div className="bg-tacir-lightblue/10 p-3 border-b">
                      <h3 className="font-medium text-tacir-darkblue text-sm">
                        Liste des mentors ({teamData.mentors.length})
                      </h3>
                    </div>
                    <Table>
                      <TableHeader className="bg-tacir-lightgray/50">
                        <TableRow>
                          <TableHead className="text-tacir-darkblue font-medium text-sm">
                            Nom
                          </TableHead>
                          <TableHead className="text-tacir-darkblue font-medium text-sm">
                            Email
                          </TableHead>
                          <TableHead className="text-tacir-darkblue font-medium text-sm">
                            Téléphone
                          </TableHead>
                          <TableHead className="text-tacir-darkblue font-medium text-sm">
                            Spécialisation
                          </TableHead>
                          <TableHead className="text-tacir-darkblue font-medium text-sm">
                            Statut du compte
                          </TableHead>
                          <TableHead className="text-tacir-darkblue font-medium text-sm">
                            Accès aux soumissions
                          </TableHead>
                          <TableHead className="text-tacir-darkblue font-medium text-sm">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamData.mentors.map((mentor, index) => (
                          <TableRow
                            key={index}
                            className="hover:bg-tacir-lightgray/20"
                          >
                            <TableCell className="font-medium text-sm">
                              {mentor.firstName} {mentor.lastName}
                              {mentor.user && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 bg-tacir-green/10 text-tacir-green border-tacir-green/20 text-xs"
                                >
                                  Compte existant
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {mentor.email}
                            </TableCell>
                            <TableCell className="text-sm">
                              {mentor.phone}
                            </TableCell>
                            <TableCell className="text-sm">
                              {mentor.specialization}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  mentor.status === "confirmed"
                                    ? "bg-tacir-green/20 text-tacir-green border-tacir-green/30 text-xs"
                                    : "bg-tacir-yellow/20 text-tacir-yellow border-tacir-yellow/30 text-xs"
                                }
                              >
                                {mentor.status === "confirmed"
                                  ? "Confirmé"
                                  : "En attente"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={
                                    mentor.accessStatus === "active"
                                      ? "bg-tacir-green/20 text-tacir-green border-tacir-green/30 text-xs"
                                      : "bg-tacir-pink/20 text-tacir-pink border-tacir-pink/30 text-xs"
                                  }
                                >
                                  {mentor.accessStatus === "active"
                                    ? "Actif"
                                    : "Inactif"}
                                </Badge>

                                <Switch
                                  checked={mentor.accessStatus === "active"}
                                  onCheckedChange={(checked) =>
                                    toggleLocalMentorAccess(index, checked)
                                  }
                                  className="data-[state=checked]:bg-tacir-green"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeMentor(getMemberId(mentor))
                                }
                                className="text-tacir-pink hover:text-tacir-pink/80 hover:bg-tacir-pink/10 h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-3">
                    <div className="bg-tacir-lightblue/10 p-3 rounded-lg">
                      <h3 className="font-medium text-tacir-darkblue text-sm">
                        Liste des mentors ({teamData.mentors.length})
                      </h3>
                    </div>
                    {teamData.mentors.map((mentor, index) => (
                      <MobileMemberCard
                        key={index}
                        member={mentor}
                        type="mentor"
                        index={index}
                        onToggleAccess={toggleLocalMentorAccess}
                        onRemove={removeMentor}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-tacir-darkgray bg-tacir-lightgray/30 rounded-lg">
                  <User className="h-8 w-8 mx-auto text-tacir-darkgray/50 mb-2" />
                  <p className="text-sm">Aucun mentor ajouté pour le moment</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="jury" className="space-y-4 mt-4">
              <div className="bg-tacir-lightgray/30 p-3 sm:p-4 rounded-lg">
                <h3 className="font-medium text-tacir-darkblue text-sm sm:text-base mb-3">
                  Ajouter un nouveau juré
                </h3>

                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <Button
                    variant={
                      addMethod.jury === "manual" ? "default" : "outline"
                    }
                    onClick={() =>
                      setAddMethod({ ...addMethod, jury: "manual" })
                    }
                    className={`text-xs sm:text-sm ${
                      addMethod.jury === "manual"
                        ? "bg-tacir-blue hover:bg-tacir-blue/90"
                        : "border-tacir-darkgray text-tacir-darkgray hover:bg-tacir-lightgray"
                    }`}
                    size="sm"
                  >
                    Saisie manuelle
                  </Button>
                  <Button
                    variant={
                      addMethod.jury === "select" ? "default" : "outline"
                    }
                    onClick={() =>
                      setAddMethod({ ...addMethod, jury: "select" })
                    }
                    className={`text-xs sm:text-sm ${
                      addMethod.jury === "select"
                        ? "bg-tacir-blue hover:bg-tacir-blue/90"
                        : "border-tacir-darkgray text-tacir-darkgray hover:bg-tacir-lightgray"
                    }`}
                    size="sm"
                  >
                    Sélectionner depuis la liste
                  </Button>
                </div>

                {renderJuryAddSection()}
              </div>

              {teamData.juryMembers.length > 0 ? (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block border rounded-lg overflow-hidden">
                    <div className="bg-tacir-lightblue/10 p-3 border-b">
                      <h3 className="font-medium text-tacir-darkblue text-sm">
                        Liste des jurés ({teamData.juryMembers.length})
                      </h3>
                    </div>
                    <Table>
                      <TableHeader className="bg-tacir-lightgray/50">
                        <TableRow>
                          <TableHead className="text-tacir-darkblue font-medium text-sm">
                            Nom
                          </TableHead>
                          <TableHead className="text-tacir-darkblue font-medium text-sm">
                            Email
                          </TableHead>
                          <TableHead className="text-tacir-darkblue font-medium text-sm">
                            Téléphone
                          </TableHead>
                          <TableHead className="text-tacir-darkblue font-medium text-sm">
                            Statut
                          </TableHead>
                          <TableHead className="text-tacir-darkblue font-medium text-sm">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamData.juryMembers.map((jury, index) => (
                          <TableRow
                            key={index}
                            className="hover:bg-tacir-lightgray/20"
                          >
                            <TableCell className="font-medium text-sm">
                              {jury.firstName} {jury.lastName}
                              {jury.user && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 bg-tacir-green/10 text-tacir-green border-tacir-green/20 text-xs"
                                >
                                  Compte existant
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {jury.email}
                            </TableCell>
                            <TableCell className="text-sm">
                              {jury.phone}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  jury.status === "confirmed"
                                    ? "bg-tacir-green/20 text-tacir-green border-tacir-green/30 text-xs"
                                    : "bg-tacir-yellow/20 text-tacir-yellow border-tacir-yellow/30 text-xs"
                                }
                              >
                                {jury.status === "confirmed"
                                  ? "Confirmé"
                                  : "En attente"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeJury(getMemberId(jury))}
                                className="text-tacir-pink hover:text-tacir-pink/80 hover:bg-tacir-pink/10 h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-3">
                    <div className="bg-tacir-lightblue/10 p-3 rounded-lg">
                      <h3 className="font-medium text-tacir-darkblue text-sm">
                        Liste des jurés ({teamData.juryMembers.length})
                      </h3>
                    </div>
                    {teamData.juryMembers.map((jury, index) => (
                      <MobileMemberCard
                        key={index}
                        member={jury}
                        type="jury"
                        index={index}
                        onRemove={removeJury}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-tacir-darkgray bg-tacir-lightgray/30 rounded-lg">
                  <Award className="h-8 w-8 mx-auto text-tacir-darkgray/50 mb-2" />
                  <p className="text-sm">Aucun juré ajouté pour le moment</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-tacir-lightgray">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sending}
              className="border-tacir-darkgray text-tacir-darkgray hover:bg-tacir-lightgray order-2 sm:order-1"
              size="sm"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={sending}
              className="bg-tacir-green hover:bg-tacir-green/90 order-1 sm:order-2 mb-2 sm:mb-0"
              size="sm"
            >
              {sending ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
