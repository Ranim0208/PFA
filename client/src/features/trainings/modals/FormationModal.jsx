import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Clock, Users, BookOpen, UserCog } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { getIncubationCoordinators } from "@/services/users/members";
import { getRegions } from "@/services/users/regions";
import { getAllMentors } from "@/services/mentor/mentor.services";
import { createTraining, updateTraining } from "@/services/trainings/training";
import { Checkbox } from "@/components/ui/checkbox";

const FormationModal = ({
  open,
  onOpenChange,
  onSuccess,
  initialData = null,
  mode = "create", // 'create' or 'edit'
}) => {
  const [date, setDate] = useState();
  const [incubationCoordinators, setIncubationCoordinators] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    trainers: [],
    duration: "",
    cohorts: [],
    maxParticipants: "",
    time: "",
    incubationCoordinators: [],
    componentActivity: "",
    logisticsNeeds: [],
    travelNeeds: [],
    communicationNeeds: [],
    communicationNeedsOther: "",
    organizationalNeeds: "",
    requiredPartners: "",
    humanResources: "",
    materialResources: [],
    financialResources: "",
    highlightMoments: "",
    additionalComments: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [incubationCoordsRes, cohortsRes, mentorsRes] = await Promise.all(
          [getIncubationCoordinators(), getRegions(), getAllMentors()]
        );

        setIncubationCoordinators(incubationCoordsRes);
        setCohorts(cohortsRes);
        setMentors(
          mentorsRes.map((mentor) => ({
            id: mentor._id,
            label: `${mentor.personalInfo?.fullName || "Sans nom"} - ${
              mentor.personalInfo?.specialization || "Non spécifié"
            }`,
            email:
              mentor.personalInfo?.email || mentor.user?.email || "Sans email",
          }))
        );
      } catch (error) {
        toast.error("Failed to fetch required data");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize form with initial data when in edit mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        trainers: initialData.trainers?.map((t) => t._id) || [],
        duration: initialData.duration?.toString() || "",
        cohorts: initialData.cohorts || [],
        maxParticipants: initialData.maxParticipants?.toString() || "",
        time: initialData.time || "",
        incubationCoordinators:
          initialData.incubationCoordinators?.map((i) => i._id) || [],
        componentActivity: initialData.componentActivity || "",
        logisticsNeeds: initialData.logisticsNeeds || [],
        travelNeeds: initialData.travelNeeds || [],
        communicationNeeds: initialData.communicationNeeds || [],
        communicationNeedsOther: initialData.communicationNeedsOther || "",
        organizationalNeeds: initialData.organizationalNeeds || "",
        requiredPartners: initialData.requiredPartners || "",
        humanResources: initialData.humanResources || "",
        materialResources: initialData.materialResources || [],
        financialResources: initialData.financialResources || "",
        highlightMoments: initialData.highlightMoments || "",
        additionalComments: initialData.additionalComments || "",
      });

      if (initialData.startDate) {
        setDate(new Date(initialData.startDate));
      }
    }
  }, [initialData, mode]);
  console.log("training", initialData?.cohorts);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      formData.trainers.length === 0 ||
      !date ||
      !formData.time
    ) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      // Calculate end date based on duration
      const endDate = formData.duration
        ? new Date(
            new Date(date).setDate(date.getDate() + parseInt(formData.duration))
          )
        : date;

      // Prepare the data for the backend
      const trainingData = {
        title: formData.title,
        description: formData.description,
        type: "formation",
        incubationCoordinators: formData.incubationCoordinators,
        trainers: formData.trainers,
        scheduledDate: date,
        startDate: date,
        endDate: endDate,
        time: formData.time,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        cohorts: formData.cohorts,
        maxParticipants: formData.maxParticipants
          ? parseInt(formData.maxParticipants)
          : undefined,
        componentActivity: formData.componentActivity,
        logisticsNeeds: formData.logisticsNeeds,
        travelNeeds: formData.travelNeeds,
        communicationNeeds: formData.communicationNeeds,
        communicationNeedsOther: formData.communicationNeedsOther,
        organizationalNeeds: formData.organizationalNeeds,
        requiredPartners: formData.requiredPartners,
        humanResources: formData.humanResources,
        materialResources: formData.materialResources,
        financialResources: formData.financialResources,
        highlightMoments: formData.highlightMoments,
        additionalComments: formData.additionalComments,
      };

      // Call the appropriate API based on mode
      let response;
      if (mode === "edit" && initialData) {
        response = await updateTraining(initialData._id, trainingData);
        toast.success("Formation mise à jour avec succès!");
      } else {
        response = await createTraining(trainingData);
        toast.success("Formation créée avec succès!");
      }

      onSuccess(response.data);

      // Reset form if in create mode
      if (mode === "create") {
        setFormData({
          title: "",
          description: "",
          trainers: [],
          duration: "",
          cohorts: [],
          maxParticipants: "",
          time: "",
          incubationCoordinators: [],
          componentActivity: "",
          logisticsNeeds: [],
          travelNeeds: [],
          communicationNeeds: [],
          communicationNeedsOther: "",
          organizationalNeeds: "",
          requiredPartners: "",
          humanResources: "",
          materialResources: [],
          financialResources: "",
          highlightMoments: "",
          additionalComments: "",
        });
        setDate(undefined);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error creating/updating training:", error);
      toast.error(
        error.message ||
          `Échec de ${
            mode === "edit" ? "la mise à jour" : "la création"
          } de la formation`
      );
    }
  };

  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => {
      const currentValues = prev[field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl !max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-tacir-darkblue">
            <div className="w-8 h-8 bg-gradient-to-r from-tacir-pink to-tacir-blue rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span>
              {mode === "edit"
                ? "Modifier la formation"
                : "Créer une nouvelle formation"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-tacir-darkblue mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Informations de base
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-tacir-darkblue font-medium"
                >
                  Titre de la formation *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ex: Développement Web Frontend"
                  className="border-tacir-lightgray focus:border-tacir-lightblue"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-tacir-darkblue font-medium">
                  Formateurs *
                </Label>
                <Select
                  onValueChange={(value) => {
                    if (!formData.trainers.includes(value)) {
                      setFormData((prev) => ({
                        ...prev,
                        trainers: [...prev.trainers, value],
                      }));
                    }
                  }}
                >
                  <SelectTrigger className="border-tacir-lightgray focus:border-tacir-lightblue">
                    <SelectValue placeholder="Ajouter un formateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{mentor.label}</span>
                          <span className="text-xs text-gray-500">
                            {mentor.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.trainers.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.trainers.map((trainerId) => {
                      const trainer = mentors.find((m) => m.id === trainerId);
                      return trainer ? (
                        <div
                          key={trainerId}
                          className="flex items-center justify-between p-2 bg-gray-100 rounded"
                        >
                          <span>{trainer.label}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                trainers: prev.trainers.filter(
                                  (id) => id !== trainerId
                                ),
                              }))
                            }
                          >
                            ×
                          </Button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label
                htmlFor="description"
                className="text-tacir-darkblue font-medium"
              >
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Décrivez le contenu et les objectifs de la formation..."
                className="border-tacir-lightgray focus:border-tacir-lightblue min-h-[100px]"
              />
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-tacir-darkblue mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Planification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-tacir-darkblue font-medium">
                  Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-tacir-lightgray",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date
                        ? format(date, "PPP", { locale: fr })
                        : "Choisir une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="time"
                  className="text-tacir-darkblue font-medium"
                >
                  Heure *
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-tacir-darkgray" />
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="pl-10 border-tacir-lightgray focus:border-tacir-lightblue"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="duration"
                  className="text-tacir-darkblue font-medium"
                >
                  Durée (Jours)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="2"
                  className="border-tacir-lightgray focus:border-tacir-lightblue"
                />
              </div>
            </div>
          </div>

          {/* Participants Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-tacir-darkblue mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Participants
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-tacir-darkblue font-medium">
                  Cohorte(s) cible(s)
                </Label>
                <Select
                  onValueChange={(value) => {
                    if (!formData.cohorts.includes(value)) {
                      setFormData((prev) => ({
                        ...prev,
                        cohorts: [...prev.cohorts, value],
                      }));
                    }
                  }}
                >
                  <SelectTrigger className="border-tacir-lightgray focus:border-tacir-lightblue">
                    <SelectValue placeholder="Ajouter une cohorte" />
                  </SelectTrigger>
                  <SelectContent>
                    {cohorts.map((region) => (
                      <SelectItem
                        key={region._id}
                        value={`${region.name.fr} / ${region.name.ar}`}
                      >
                        {region.name.fr} / {region.name.ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.cohorts.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.cohorts.map((cohort, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-100 rounded"
                      >
                        <span>{cohort}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              cohorts: prev.cohorts.filter((c) => c !== cohort),
                            }))
                          }
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="maxParticipants"
                  className="text-tacir-darkblue font-medium"
                >
                  Nombre max de participants
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-tacir-darkgray" />
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxParticipants: e.target.value,
                      })
                    }
                    placeholder="20"
                    className="pl-10 border-tacir-lightgray focus:border-tacir-lightblue"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-tacir-darkblue font-medium">
                  Coordinateur(s) d'incubation
                </Label>
                <Select
                  onValueChange={(value) => {
                    if (!formData.incubationCoordinators.includes(value)) {
                      setFormData((prev) => ({
                        ...prev,
                        incubationCoordinators: [
                          ...prev.incubationCoordinators,
                          value,
                        ],
                      }));
                    }
                  }}
                >
                  <SelectTrigger className="border-tacir-lightgray focus:border-tacir-lightblue">
                    <SelectValue placeholder="Ajouter un coordinateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {incubationCoordinators.map((coordinator) => (
                      <SelectItem key={coordinator.id} value={coordinator.id}>
                        {coordinator.firstName} {coordinator.lastName} (
                        {coordinator.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.incubationCoordinators.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.incubationCoordinators.map((coordinatorId) => {
                      const coordinator = incubationCoordinators.find(
                        (c) => c.id === coordinatorId
                      );
                      return coordinator ? (
                        <div
                          key={coordinatorId}
                          className="flex items-center justify-between p-2 bg-gray-100 rounded"
                        >
                          <span>
                            {coordinator.firstName} {coordinator.lastName}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                incubationCoordinators:
                                  prev.incubationCoordinators.filter(
                                    (id) => id !== coordinatorId
                                  ),
                              }))
                            }
                          >
                            ×
                          </Button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Details Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-tacir-darkblue mb-4 flex items-center">
              <UserCog className="w-5 h-5 mr-2" />
              Détails de l'activité
            </h3>

            <div className="space-y-2">
              <Label className="text-tacir-darkblue font-medium">
                Activité du composant
              </Label>
              <Select
                value={formData.componentActivity}
                onValueChange={(value) =>
                  setFormData({ ...formData, componentActivity: value })
                }
              >
                <SelectTrigger className="border-tacir-lightgray focus:border-tacir-lightblue">
                  <SelectValue placeholder="Sélectionner une activité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="training">Formation</SelectItem>
                  <SelectItem value="crea">Créa</SelectItem>
                  <SelectItem value="innov">Innov</SelectItem>
                  <SelectItem value="archi">Archi</SelectItem>
                  <SelectItem value="diffusion">Diffusion</SelectItem>
                  <SelectItem value="eco">Eco</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Needs Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logistical Needs */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-tacir-darkblue mb-4">
                Besoins logistiques
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  {[
                    "catering",
                    "perdiem_meals",
                    "coffee_break",
                    "perdiem_transport",
                  ].map((need) => (
                    <div key={need} className="flex items-center space-x-2">
                      <Checkbox
                        id={`logistics-${need}`}
                        checked={formData.logisticsNeeds.includes(need)}
                        onCheckedChange={() =>
                          handleCheckboxChange("logisticsNeeds", need)
                        }
                      />
                      <Label
                        htmlFor={`logistics-${need}`}
                        className="font-normal"
                      >
                        {need === "catering" && "Restauration"}
                        {need === "perdiem_meals" && "Perdiem repas"}
                        {need === "coffee_break" && "Pause café"}
                        {need === "perdiem_transport" && "Perdiem transport"}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logisticsDetails" className="font-normal">
                    Détails logistiques
                  </Label>
                  <Textarea
                    id="logisticsDetails"
                    value={formData.logisticsDetails}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        logisticsDetails: e.target.value,
                      })
                    }
                    placeholder="Détails supplémentaires sur les besoins logistiques..."
                    className="border-tacir-lightgray focus:border-tacir-lightblue min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            {/* Travel & On-Site Needs */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-tacir-darkblue mb-4">
                Besoins de voyage et sur site
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  {[
                    "hebergement_restauration",
                    "materiel",
                    "salles_reunion",
                  ].map((need) => (
                    <div key={need} className="flex items-center space-x-2">
                      <Checkbox
                        id={`travel-${need}`}
                        checked={formData.travelNeeds.includes(need)}
                        onCheckedChange={() =>
                          handleCheckboxChange("travelNeeds", need)
                        }
                      />
                      <Label htmlFor={`travel-${need}`} className="font-normal">
                        {need === "hebergement_restauration" &&
                          "Hébergement & Restauration"}
                        {need === "materiel" && "Matériel"}
                        {need === "salles_reunion" && "Salles de réunion"}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specificNeeds" className="font-normal">
                    Besoins spécifiques
                  </Label>
                  <Textarea
                    id="specificNeeds"
                    value={formData.specificNeeds}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specificNeeds: e.target.value,
                      })
                    }
                    placeholder="Besoins spécifiques en matière de disposition ou de matériel..."
                    className="border-tacir-lightgray focus:border-tacir-lightblue min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Communication Needs */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-tacir-darkblue mb-4">
              Besoins de communication
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {[
                  "photo",
                  "video",
                  "archivage",
                  "presentation",
                  "rollup",
                  "streaming",
                  "autre",
                ].map((need) => (
                  <div key={need} className="flex items-center space-x-2">
                    <Checkbox
                      id={`communication-${need}`}
                      checked={formData.communicationNeeds.includes(need)}
                      onCheckedChange={() =>
                        handleCheckboxChange("communicationNeeds", need)
                      }
                    />
                    <Label
                      htmlFor={`communication-${need}`}
                      className="font-normal"
                    >
                      {need === "photo" && "Photo"}
                      {need === "video" && "Vidéo"}
                      {need === "archivage" && "Archivage"}
                      {need === "presentation" && "Présentation"}
                      {need === "rollup" && "Rollup"}
                      {need === "streaming" && "Streaming"}
                      {need === "autre" && "Autre"}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.communicationNeeds.includes("autre") && (
                <div className="space-y-2">
                  <Label
                    htmlFor="communicationNeedsOther"
                    className="font-normal"
                  >
                    Autres besoins de communication
                  </Label>
                  <Input
                    id="communicationNeedsOther"
                    value={formData.communicationNeedsOther}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        communicationNeedsOther: e.target.value,
                      })
                    }
                    placeholder="Précisez vos autres besoins..."
                    className="border-tacir-lightgray focus:border-tacir-lightblue"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Resources & Partners */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-tacir-darkblue mb-4">
              Ressources & Partenaires
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizationalNeeds" className="font-normal">
                  Besoins organisationnels
                </Label>
                <Textarea
                  id="organizationalNeeds"
                  value={formData.organizationalNeeds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      organizationalNeeds: e.target.value,
                    })
                  }
                  placeholder="Besoins en termes d'organisation..."
                  className="border-tacir-lightgray focus:border-tacir-lightblue min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requiredPartners" className="font-normal">
                  Partenaires requis
                </Label>
                <Textarea
                  id="requiredPartners"
                  value={formData.requiredPartners}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiredPartners: e.target.value,
                    })
                  }
                  placeholder="Partenaires nécessaires pour cette formation..."
                  className="border-tacir-lightgray focus:border-tacir-lightblue min-h-[100px]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="humanResources" className="font-normal">
                  Ressources humaines
                </Label>
                <Textarea
                  id="humanResources"
                  value={formData.humanResources}
                  onChange={(e) =>
                    setFormData({ ...formData, humanResources: e.target.value })
                  }
                  placeholder="Besoins en ressources humaines..."
                  className="border-tacir-lightgray focus:border-tacir-lightblue min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materialResources" className="font-normal">
                  Ressources matérielles
                </Label>
                <Textarea
                  id="materialResources"
                  value={formData.materialResources.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      materialResources: e.target.value
                        .split(",")
                        .map((item) => item.trim()),
                    })
                  }
                  placeholder="Liste des ressources matérielles nécessaires (séparées par des virgules)..."
                  className="border-tacir-lightgray focus:border-tacir-lightblue min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="financialResources" className="font-normal">
                  Ressources financières
                </Label>
                <Textarea
                  id="financialResources"
                  value={formData.financialResources}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      financialResources: e.target.value,
                    })
                  }
                  placeholder="Besoins en ressources financières..."
                  className="border-tacir-lightgray focus:border-tacir-lightblue min-h-[100px]"
                />
              </div>
            </div>
          </div>

          {/* Miscellaneous */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-tacir-darkblue mb-4">
              Divers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="highlightMoments" className="font-normal">
                  Moments forts
                </Label>
                <Textarea
                  id="highlightMoments"
                  value={formData.highlightMoments}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      highlightMoments: e.target.value,
                    })
                  }
                  placeholder="Moments forts à prévoir..."
                  className="border-tacir-lightgray focus:border-tacir-lightblue min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalComments" className="font-normal">
                  Commentaires supplémentaires
                </Label>
                <Textarea
                  id="additionalComments"
                  value={formData.additionalComments}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      additionalComments: e.target.value,
                    })
                  }
                  placeholder="Toute autre information pertinente..."
                  className="border-tacir-lightgray focus:border-tacir-lightblue min-h-[100px]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-tacir-darkgray text-tacir-darkgray hover:bg-tacir-darkgray hover:text-white"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-tacir-pink hover:bg-tacir-pink/90 text-white"
              disabled={loading}
            >
              {loading
                ? mode === "edit"
                  ? "Mise à jour..."
                  : "Création..."
                : mode === "edit"
                ? "Mettre à jour"
                : "Créer la formation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormationModal;
