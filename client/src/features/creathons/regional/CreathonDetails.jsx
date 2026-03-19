"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  DollarSign,
  Box,
  User,
  Mail,
  Settings2,
  FileText,
  Trophy,
  BookOpen,
  Sparkles,
  Cpu,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sendCreathonInvitations } from "@/services/creathons/creathons";
import { fetchCurrentUser } from "@/services/users/user";
import Image from "next/image";

const formatDate = (dateStr) => {
  if (!dateStr) return "Non spécifié";
  try {
    const date = new Date(dateStr);
    if (isNaN(date)) return "Date invalide";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch (error) {
    return "Date invalide";
  }
};

const InvitationButton = ({
  type,
  members,
  creathonId,
  canSendInvitations,
}) => {
  const [isSending, setIsSending] = useState(false);

  const handleSendInvitations = async () => {
    try {
      setIsSending(true);
      const response = await sendCreathonInvitations(creathonId, type);

      if (response.error) {
        throw new Error(response.message || "Failed to send invitations");
      }

      toast.success(response.message || `Invitations envoyées aux ${type}`);
    } catch (error) {
      console.error("Invitation error:", error);
      toast.error(
        error.message || `Erreur lors de l'envoi des invitations aux ${type}`,
        { autoClose: 5000 }
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!canSendInvitations) {
    return null;
  }

  return (
    <div className="mt-3 sm:mt-4 flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3 md:gap-4 w-full">
      <span className="text-xs sm:text-sm text-tacir-darkgray text-center xs:text-left">
        {members?.length || 0} {type === "mentors" ? "mentors" : "jurés"} à
        inviter
      </span>
      <Button
        onClick={handleSendInvitations}
        disabled={isSending || !members?.length}
        className="flex items-center gap-1 sm:gap-2 bg-tacir-blue hover:bg-tacir-blue/90 w-full xs:w-auto justify-center text-xs sm:text-sm h-8 sm:h-9 md:h-10"
        size="sm"
      >
        <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
        {isSending
          ? "Envoi..."
          : `Envoyer aux ${type === "mentors" ? "mentors" : "jurés"}`}
      </Button>
    </div>
  );
};

const MobileMemberCard = ({ member, type }) => {
  return (
    <Card className="border border-tacir-lightgray/30 bg-white w-full">
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="p-1.5 sm:p-2 bg-tacir-lightblue/20 rounded-full flex-shrink-0">
              <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-tacir-lightblue" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-tacir-darkblue text-xs sm:text-sm truncate">
                {member?.firstName || "N/A"} {member?.lastName || ""}
              </p>
              <p className="text-tacir-darkgray text-xs truncate">
                {member?.email || "Email non disponible"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 gap-1 sm:gap-2 text-xs">
          {member?.phone && (
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-tacir-darkgray flex-shrink-0">Tél:</span>
              <span className="text-tacir-darkblue truncate">
                {member.phone}
              </span>
            </div>
          )}
          {member?.specialization && (
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-tacir-darkgray flex-shrink-0">Spé:</span>
              <span className="text-tacir-darkblue truncate">
                {member.specialization}
              </span>
            </div>
          )}
          {/* <div className="xs:col-span-2">
            <Badge
              className={
                member?.status === "confirmed"
                  ? "bg-tacir-green text-white text-xs"
                  : "bg-tacir-yellow text-white text-xs"
              }
            >
              {member?.status || "en attente"}
            </Badge>
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
};

export const CreathonDetails = ({ creathon, onBack }) => {
  const [activeTeamTab, setActiveTeamTab] = useState("mentors");
  const [mentors, setMentors] = useState([]);
  const [juryMembers, setJuryMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userData = await fetchCurrentUser();
        setCurrentUser(userData.user);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        toast.error(
          "Erreur lors de la récupération des informations utilisateur"
        );
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    // Safely set mentors and jury members with fallbacks
    setMentors(creathon?.mentors?.members || []);
    setJuryMembers(creathon?.jury?.members || []);
  }, [creathon]);

  const isGeneralCoordinator = currentUser?.roles?.includes(
    "IncubationCoordinator"
  );
  const isCreathonValidated =
    creathon?.validations?.componentValidation?.validatedAt &&
    creathon?.validations?.generalValidation?.validatedAt;
  const canSendInvitations = isGeneralCoordinator && isCreathonValidated;
  const shouldShowMemberLists = isCreathonValidated;

  const getComponentIcon = (component) => {
    switch (component) {
      case "crea":
        return <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />;
      case "innov":
        return <Cpu className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />;
      default:
        return <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />;
    }
  };

  const getComponentColor = (component) => {
    switch (component) {
      case "crea":
        return "bg-tacir-pink/10 text-tacir-pink border-tacir-pink";
      case "innov":
        return "bg-tacir-lightblue/10 text-tacir-lightblue border-tacir-lightblue";
      default:
        return "bg-tacir-blue/10 text-tacir-blue border-tacir-blue";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 sm:h-64">
        <div className="text-tacir-darkgray text-sm">Chargement...</div>
      </div>
    );
  }

  // Safe data access with fallbacks
  const safeCreathon = creathon || {};
  const safeLocation = safeCreathon.location || {};
  const safeDates = safeCreathon.dates || {};
  const safeCapacity = safeCreathon.capacity || {};
  const safeBudget = safeCreathon.budget || {};
  const safeResources = safeCreathon.resources || {};
  const safeValidations = safeCreathon.validations || {};

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 min-h-screen p-2 sm:p-4 md:p-6">
      {/* Header Card */}
      <Card className="border-0 shadow-sm sm:shadow-md bg-white w-full">
        <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
          {safeCreathon.image && (
            <div className="relative h-32 sm:h-40 md:h-48 lg:h-56 w-full rounded-lg overflow-hidden mb-2 sm:mb-3 md:mb-4">
              <Image
                src={safeCreathon.image}
                alt={safeCreathon.title || "Créathon"}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 70vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-tacir-darkblue break-words leading-tight">
                {safeCreathon.title || "Titre non spécifié"}
              </CardTitle>
              <p className="text-tacir-darkgray mt-1 sm:mt-2 text-xs sm:text-sm md:text-base break-words line-clamp-2 sm:line-clamp-3">
                {safeCreathon.description || "Description non disponible"}
              </p>
            </div>
            <Badge
              className={`${getComponentColor(
                safeCreathon.component
              )} text-xs sm:text-sm flex-shrink-0 self-start mt-2 sm:mt-0`}
            >
              {getComponentIcon(safeCreathon.component)}
              <span className="ml-1 font-medium truncate">
                {(safeCreathon.component || "general")?.toUpperCase()}
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <div className="flex flex-col xs:flex-row xs:flex-wrap items-start xs:items-center gap-1.5 sm:gap-2 md:gap-3 text-xs sm:text-sm text-tacir-darkgray">
            <div className="flex items-center gap-1.5 sm:gap-2 w-full xs:w-auto">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-tacir-blue flex-shrink-0" />
              <span className="break-words truncate">
                {safeLocation.venue || "Lieu non spécifié"},{" "}
                {safeLocation.city || ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 w-full xs:w-auto">
              <CheckCircle
                className={`h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 flex-shrink-0 ${
                  isCreathonValidated ? "text-tacir-green" : "text-tacir-yellow"
                }`}
              />
              <span className="text-xs break-words">
                {safeValidations.componentValidation?.validatedAt
                  ? "Validé composante"
                  : "Non validé composante"}
                {" / "}
                {safeValidations.generalValidation?.validatedAt
                  ? "Publié"
                  : "Non publié"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dates & Capacity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 w-full">
        {/* Dates Card */}
        <Card className="border-0 shadow-sm bg-white w-full">
          <CardHeader className="p-3 sm:p-4 md:p-6 pb-1 sm:pb-2">
            <CardTitle className="flex items-center gap-2 text-tacir-darkblue text-sm sm:text-base md:text-lg">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-tacir-blue flex-shrink-0" />
              <span>Calendrier</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0 space-y-1.5 sm:space-y-2 text-tacir-darkgray text-xs sm:text-sm">
            <div className="flex justify-between items-center p-2 sm:p-3 bg-tacir-lightgray/30 rounded-lg gap-2">
              <span className="font-medium flex-shrink-0">Début</span>
              <span className="text-right break-words">
                {formatDate(safeDates.startDate)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-tacir-lightgray/30 rounded-lg gap-2">
              <span className="font-medium flex-shrink-0">Fin</span>
              <span className="text-right break-words">
                {formatDate(safeDates.endDate)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-tacir-lightgray/30 rounded-lg gap-2">
              <span className="font-medium flex-shrink-0">
                Clôture inscriptions
              </span>
              <span className="text-right break-words">
                {formatDate(safeDates.registrationDeadline)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-tacir-lightgray/30 rounded-lg gap-2">
              <span className="font-medium flex-shrink-0">Durée</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-tacir-orange" />
                {safeCreathon.duration || "0"} jours
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Capacity Card */}
        <Card className="border-0 shadow-sm bg-white w-full">
          <CardHeader className="p-3 sm:p-4 md:p-6 pb-1 sm:pb-2">
            <CardTitle className="flex items-center gap-2 text-tacir-darkblue text-sm sm:text-base md:text-lg">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-tacir-blue flex-shrink-0" />
              <span>Capacité</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div className="text-center p-2 sm:p-3 md:p-4 bg-tacir-blue/10 rounded-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mx-auto text-tacir-blue mb-1 sm:mb-2" />
                <p className="text-base sm:text-lg md:text-xl font-bold text-tacir-darkblue">
                  {safeCapacity.maxParticipants || 0}
                </p>
                <p className="text-xs sm:text-sm text-tacir-darkgray mt-1">
                  Participants max
                </p>
              </div>
              <div className="text-center p-2 sm:p-3 md:p-4 bg-tacir-green/10 rounded-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mx-auto text-tacir-green mb-1 sm:mb-2" />
                <p className="text-base sm:text-lg md:text-xl font-bold text-tacir-darkblue">
                  {safeCapacity.maxTeams || 0}
                </p>
                <p className="text-xs sm:text-sm text-tacir-darkgray mt-1">
                  Équipes max
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Management Section */}
      {shouldShowMemberLists ? (
        <Card className="border-0 shadow-sm sm:shadow-md bg-white w-full">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-tacir-darkblue text-sm sm:text-base md:text-lg lg:text-xl">
              Équipe
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <Tabs
              value={activeTeamTab}
              onValueChange={setActiveTeamTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-2 sm:mb-3 md:mb-4 lg:mb-6 p-1 w-full">
                <TabsTrigger
                  value="mentors"
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2 h-auto"
                >
                  <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  <span className="truncate">Mentors ({mentors.length})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="jury"
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2 h-auto"
                >
                  <Trophy className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  <span className="truncate">Jury ({juryMembers.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mentors" className="w-full">
                <div className="space-y-3 sm:space-y-4 w-full">
                  {mentors.length > 0 ? (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden lg:block rounded-lg border border-tacir-lightgray overflow-hidden w-full">
                        <Table>
                          <TableHeader className="bg-tacir-lightgray/30">
                            <TableRow>
                              <TableHead className="text-tacir-darkblue font-semibold text-sm">
                                Nom
                              </TableHead>
                              <TableHead className="text-tacir-darkblue font-semibold text-sm">
                                Email
                              </TableHead>
                              <TableHead className="text-tacir-darkblue font-semibold text-sm">
                                Téléphone
                              </TableHead>
                              <TableHead className="text-tacir-darkblue font-semibold text-sm">
                                Spécialisation
                              </TableHead>
                              {/* <TableHead className="text-tacir-darkblue font-semibold text-sm">
                                Statut
                              </TableHead> */}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mentors.map((mentor, index) => (
                              <TableRow
                                key={mentor._id || index}
                                className="hover:bg-tacir-lightgray/20"
                              >
                                <TableCell className="font-medium text-sm">
                                  {mentor.firstName} {mentor.lastName}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {mentor.email}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {mentor.phone || "N/A"}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {mentor.specialization || "N/A"}
                                </TableCell>
                                {/* <TableCell>
                                  <Badge
                                    className={
                                      mentor.status === "confirmed"
                                        ? "bg-tacir-green text-white text-xs"
                                        : "bg-tacir-yellow text-white text-xs"
                                    }
                                  >
                                    {mentor.status || "en attente"}
                                  </Badge>
                                </TableCell> */}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="lg:hidden space-y-2 sm:space-y-3 w-full">
                        {mentors.map((mentor, index) => (
                          <MobileMemberCard
                            key={mentor._id || index}
                            member={mentor}
                            type="mentor"
                          />
                        ))}
                      </div>

                      <InvitationButton
                        type="mentors"
                        members={mentors}
                        creathonId={safeCreathon._id}
                        canSendInvitations={canSendInvitations}
                      />
                    </>
                  ) : (
                    <div className="text-center py-4 sm:py-6 md:py-8 lg:py-10 text-tacir-darkgray w-full">
                      <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 mx-auto mb-2 sm:mb-3 md:mb-4 text-tacir-lightblue/40" />
                      <p className="text-xs sm:text-sm md:text-base">
                        Aucun mentor ajouté
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="jury" className="w-full">
                <div className="space-y-3 sm:space-y-4 w-full">
                  {juryMembers.length > 0 ? (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden lg:block rounded-lg border border-tacir-lightgray overflow-hidden w-full">
                        <Table>
                          <TableHeader className="bg-tacir-lightgray/30">
                            <TableRow>
                              <TableHead className="text-tacir-darkblue font-semibold text-sm">
                                Nom
                              </TableHead>
                              <TableHead className="text-tacir-darkblue font-semibold text-sm">
                                Email
                              </TableHead>
                              {/* <TableHead className="text-tacir-darkblue font-semibold text-sm">
                                Statut
                              </TableHead> */}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {juryMembers.map((jury, index) => (
                              <TableRow
                                key={jury.id || index}
                                className="hover:bg-tacir-lightgray/20"
                              >
                                <TableCell className="font-medium text-sm">
                                  {jury.firstName} {jury.lastName}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {jury.email}
                                </TableCell>
                                {/* <TableCell>
                                  <Badge
                                    className={
                                      jury.status === "confirmed"
                                        ? "bg-tacir-green text-white text-xs"
                                        : "bg-tacir-yellow text-white text-xs"
                                    }
                                  >
                                    {jury.status || "en attente"}
                                  </Badge>
                                </TableCell> */}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="lg:hidden space-y-2 sm:space-y-3 w-full">
                        {juryMembers.map((jury, index) => (
                          <MobileMemberCard
                            key={jury.id || index}
                            member={jury}
                            type="jury"
                          />
                        ))}
                      </div>

                      <InvitationButton
                        type="jury"
                        members={juryMembers}
                        creathonId={safeCreathon._id}
                        canSendInvitations={canSendInvitations}
                      />
                    </>
                  ) : (
                    <div className="text-center py-4 sm:py-6 md:py-8 lg:py-10 text-tacir-darkgray w-full">
                      <Trophy className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 mx-auto mb-2 sm:mb-3 md:mb-4 text-tacir-pink/40" />
                      <p className="text-xs sm:text-sm md:text-base">
                        Aucun juré ajouté
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm sm:shadow-md bg-white w-full">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="text-center py-4 sm:py-6 md:py-8 lg:py-10 text-tacir-darkgray">
              <Settings2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 mx-auto mb-2 sm:mb-3 md:mb-4 text-tacir-darkgray/40" />
              <p className="text-sm sm:text-base md:text-lg font-medium mb-1 sm:mb-2">
                Équipe en attente de validation
              </p>
              <p className="text-xs sm:text-sm px-2 sm:px-4 max-w-2xl mx-auto break-words">
                Les listes des mentors et jurés seront disponibles après
                validation complète du créathon.
              </p>
              <div className="flex flex-col xs:flex-row justify-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm">
                <span className="flex items-center gap-1.5 justify-center">
                  Validation composante:{" "}
                  <Badge
                    className={
                      safeValidations.componentValidation?.validatedAt
                        ? "bg-tacir-green text-white text-xs"
                        : "bg-tacir-yellow text-white text-xs"
                    }
                  >
                    {safeValidations.componentValidation?.validatedAt
                      ? "✓"
                      : "✗"}
                  </Badge>
                </span>
                <span className="flex items-center gap-1.5 justify-center">
                  Validation générale:{" "}
                  <Badge
                    className={
                      safeValidations.generalValidation?.validatedAt
                        ? "bg-tacir-green text-white text-xs"
                        : "bg-tacir-yellow text-white text-xs"
                    }
                  >
                    {safeValidations.generalValidation?.validatedAt ? "✓" : "✗"}
                  </Badge>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget & Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 w-full">
        {/* Budget Card */}
        <Card className="border-0 shadow-sm bg-white w-full">
          <CardHeader className="p-3 sm:p-4 md:p-6 pb-1 sm:pb-2">
            <CardTitle className="flex items-center gap-2 text-tacir-darkblue text-sm sm:text-base md:text-lg">
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-tacir-green flex-shrink-0" />
              <span>Budget</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div className="text-center p-2 sm:p-3 md:p-4 bg-tacir-green/10 rounded-lg">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mx-auto text-tacir-green mb-1 sm:mb-2" />
                <p className="text-base sm:text-lg md:text-xl font-bold text-tacir-darkblue break-words">
                  {safeBudget.totalBudget?.toLocaleString("fr-FR") || 0}
                </p>
                <p className="text-xs sm:text-sm text-tacir-darkgray mt-1">
                  Total (DT)
                </p>
              </div>
              <div className="text-center p-2 sm:p-3 md:p-4 bg-tacir-blue/10 rounded-lg">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mx-auto text-tacir-blue mb-1 sm:mb-2" />
                <p className="text-base sm:text-lg md:text-xl font-bold text-tacir-darkblue break-words">
                  {safeBudget.allocatedBudget?.toLocaleString("fr-FR") || 0}
                </p>
                <p className="text-xs sm:text-sm text-tacir-darkgray mt-1">
                  Alloué (DT)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
