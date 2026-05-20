import Joi from "joi";

// Define the schema for the form with French error messages
const prizeSchema = Joi.object({
  amount: Joi.number().required().messages({
    "any.required": "Le montant est requis.",
  }),
  description: Joi.object({
    fr: Joi.string().min(1).required().messages({
      "any.required": "La description en français est requise.",
      "string.empty": "La description en français ne peut pas être vide.",
    }),
    ar: Joi.string().min(1).required().messages({
      "any.required": "La description en arabe est requise.",
      "string.empty": "La description en arabe ne peut pas être vide.",
    }),
  }).required(),
}).unknown(true); // Add this to strip unknown fields

const eventDateSchema = Joi.object({
  date: Joi.date().required().messages({
    "any.required": "La date de l'événement est requise.",
  }),
  description: Joi.object({
    fr: Joi.string().min(1).required().messages({
      "any.required": "La description en français est requise.",
      "string.empty": "La description en français ne peut pas être vide.",
    }),
    ar: Joi.string().min(1).required().messages({
      "any.required": "La description en arabe est requise.",
      "string.empty": "La description en arabe ne peut pas être vide.",
    }),
  }).required(),
});

const candidatureFormSchema = Joi.object({
  title: Joi.object({
    fr: Joi.string().min(1).required().messages({
      "any.required": "Le titre en français est requis.",
      "string.empty": "Le titre en français ne peut pas être vide.",
    }),
    ar: Joi.string().min(1).required().messages({
      "any.required": "Le titre en arabe est requis.",
      "string.empty": "Le titre en arabe ne peut pas être vide.",
    }),
  }).required(),
  region: Joi.object({
    fr: Joi.string().min(1).required().messages({
      "any.required": "Le nom de la région en français est requis.",
      "string.empty": "Le nom de la région en français ne peut pas être vide.",
    }),
    ar: Joi.string().min(1).required().messages({
      "any.required": "اسم المنطقة بالعربية مطلوب",
      "string.empty": "اسم المنطقة بالعربية لا يمكن أن يكون فارغًا",
    }),
  })
    .required()
    .messages({
      "object.base":
        "La région doit être un objet avec les noms en français et arabe",
      "any.required": "La région est requise",
    }),

  imageUrl: Joi.string().uri().optional().messages({
    "string.uri": "L'URL de l'image doit être valide.",
  }),
  description: Joi.object({
    fr: Joi.string().min(1).required().messages({
      "any.required": "La description en français est requise.",
      "string.empty": "La description en français ne peut pas être vide.",
    }),
    ar: Joi.string().min(1).required().messages({
      "any.required": "La description en arabe est requise.",
      "string.empty": "La description en arabe ne peut pas être vide.",
    }),
  }).required(),
  startDate: Joi.date().required().messages({
    "any.required": "La date de début est requise.",
  }),
  endDate: Joi.date().required().messages({
    "any.required": "La date de fin est requise.",
  }),
  announcementDate: Joi.date().optional(),
  eventDates: Joi.array().items(eventDateSchema).optional(),
  eventLocation: Joi.object({
    fr: Joi.string().min(1).required().messages({
      "any.required": "Le lieu en français est requis.",
      "string.empty": "Le lieu en français ne peut pas être vide.",
    }),
    ar: Joi.string().min(1).required().messages({
      "any.required": "Le lieu en arabe est requis.",
      "string.empty": "Le lieu en arabe ne peut pas être vide.",
    }),
  }).required(),
  prizes: Joi.array().items(prizeSchema).optional(),
  fields: Joi.array().items(Joi.string()).optional(),
  createdBy: Joi.string().required().messages({
    "any.required": "L'utilisateur créateur est requis.",
  }),
  validatedBy: Joi.string().optional(),
  published: Joi.boolean().default(false),
  publishedAt: Joi.date().optional(),
  isTemplate: Joi.boolean().default(false),
});

export const validateCandidatureForm = (formData) => {
  const { error, value } = candidatureFormSchema.validate(formData, {
    abortEarly: false,
    allowUnknown: true,
  });
  if (error) {
    throw new Error(error.details.map((err) => err.message).join(", "));
  }
  return value;
};

// Similarly update the template field schema if needed
const optionSchema = Joi.object({
  value: Joi.string().required().messages({
    "any.required": "La valeur de l'option est requise.",
  }),
  label: Joi.object({
    fr: Joi.string().min(1).required().messages({
      "any.required": "Le label en français est requis.",
      "string.empty": "Le label en français ne peut pas être vide.",
    }),
    ar: Joi.string().min(1).required().messages({
      "any.required": "Le label en arabe est requis.",
      "string.empty": "Le label en arabe ne peut pas être vide.",
    }),
  }).required(),
});

const templateFieldSchema = Joi.object({
  name: Joi.string().min(1).required().messages({
    "any.required": "Le nom du champ est requis.",
    "string.empty": "Le nom du champ ne peut pas être vide.",
  }),
  type: Joi.string()
    .valid(
      "text",
      "email",
      "textarea",
      "number",
      "phone",
      "select",
      "radio",
      "checkbox",
      "date",
      "file",
      "section",
      "divider"
    )
    .required()
    .messages({
      "any.required": "Le type de champ est requis.",
      "any.only": "Type de champ invalide.",
    }),
  label: Joi.object({
    fr: Joi.string().min(1).required().messages({
      "any.required": "Le label en français est requis.",
      "string.empty": "Le label en français ne peut pas être vide.",
    }),
    ar: Joi.string().min(1).required().messages({
      "any.required": "Le label en arabe est requis.",
      "string.empty": "Le label en arabe ne peut pas être vide.",
    }),
  }).required(),
  required: Joi.boolean().default(false),
  options: Joi.array().items(optionSchema).optional(),
  placeholder: Joi.object({
    fr: Joi.string().allow("").optional(), // Add allow('')
    ar: Joi.string().allow("").optional(), // Add allow('')
  })
    .optional()
    .strip(),
  defaultValue: Joi.string().optional(),
  validation: Joi.string().optional(),
  layout: Joi.string().optional(),
  isTemplate: Joi.boolean().default(false),
}).options({ stripUnknown: true });

export const validateTemplateField = (templateFieldData) => {
  const { error, value } = templateFieldSchema.validate(templateFieldData, {
    abortEarly: false,
  });
  if (error) {
    throw new Error(error.details.map((err) => err.message).join(", "));
  }
  return value;
};
