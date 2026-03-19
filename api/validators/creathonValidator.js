import Joi from "joi";

// Helper: MongoDB ObjectId format
const objectId = Joi.string().pattern(/^[a-f\d]{24}$/i, "valid ObjectId");

const creathonCreathionValidator = Joi.object({
  title: Joi.string().required().messages({
    "string.empty": "Le titre est requis",
  }),
  description: Joi.string().required().messages({
    "string.empty": "La description est requise",
  }),
  image: Joi.string().uri().required().messages({
    "string.uri": "L'image doit être une URL valide",
    "string.empty": "L'image est requise",
  }),
  component: Joi.string().valid("crea", "inov").required().messages({
    "string.empty": "La composante est requise",
    "any.only": "La composante doit être 'crea' ou 'inov'",
  }),
  region: objectId.required().messages({
    "string.empty": "La région est requise",
    "string.pattern.name": "La région doit être un ObjectId valide",
  }),
  location: Joi.object({
    address: Joi.string().required().messages({
      "string.empty": "L'adresse est requise",
    }),
    city: Joi.string().required().messages({
      "string.empty": "La ville est requise",
    }),
    venue: Joi.string().required().messages({
      "string.empty": "Le lieu est requis",
    }),
  }).required(),
  dates: Joi.object({
    startDate: Joi.date().required().messages({
      "date.base": "La date de début est requise",
    }),
    endDate: Joi.date().required().messages({
      "date.base": "La date de fin est requise",
    }),
    registrationDeadline: Joi.date().required().messages({
      "date.base": "La date limite d'inscription est requise",
    }),
  }).required(),
  duration: Joi.number().integer().min(1).required(),
  capacity: Joi.object({
    maxParticipants: Joi.number().min(1).required(),
    maxTeams: Joi.number().min(1).required(),
  }).required(),
  jury: Joi.object({
    numberOfJuries: Joi.number().min(1).required(),
  }).required(),
  mentors: Joi.object({
    numberOfMentors: Joi.number().min(1).required(),
  }).required(),
  coordinators: Joi.object({
    componentCoordinator: objectId.required().messages({
      "string.empty": "Le coordinateur de composante est requis",
      "string.pattern.name":
        "Le coordinateur de composante doit être un ObjectId valide",
    }),
    generalCoordinator: objectId.required().messages({
      "string.empty": "Le coordinateur général est requis",
      "string.pattern.name":
        "Le coordinateur général doit être un ObjectId valide",
    }),
  }).required(),
  status: Joi.string()
    .valid(
      "draft",
      "pending_validation",
      "validated",
      "published",
      "ongoing",
      "completed",
      "cancelled"
    )
    .default("draft"),
  selectedProjects: Joi.array().items(objectId).optional(),
  budget: Joi.object({
    totalBudget: Joi.number().min(0).default(0),
    allocatedBudget: Joi.number().min(0).default(0),
    expenses: Joi.array()
      .items(
        Joi.object({
          category: Joi.string().required(),
          amount: Joi.number().min(0).required(),
          description: Joi.string().optional(),
          date: Joi.date().optional(),
        })
      )
      .default([]),
  }).optional(),
  resources: Joi.object({
    materials: Joi.array().items(Joi.string()).default([]),
    equipment: Joi.array().items(Joi.string()).default([]),
    facilities: Joi.array().items(Joi.string()).default([]),
  }).optional(),
});

export default creathonCreathionValidator;
