import Joi from "joi";

// Option Schema Validation with French error messages
const optionSchema = Joi.object({
  value: Joi.string().required().messages({
    "any.required": "La valeur de l'option est requise.",
  }),
  label: Joi.object({
    fr: Joi.string().required().messages({
      "any.required": "Le label en français est requis.",
    }),
    ar: Joi.string().required().messages({
      "any.required": "Le label en arabe est requis.",
    }),
  }).required(),
});

// TemplateField Schema Validation with French error messages
const templateFieldSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Le nom du champ est requis.",
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
      "any.only":
        "Le type de champ doit être un des suivants: text, email, textarea, number, phone, select, radio, checkbox, date, file, section, divider.",
    }),
  label: Joi.object({
    fr: Joi.string().required().messages({
      "any.required": "Le label en français est requis.",
    }),
    ar: Joi.string().required().messages({
      "any.required": "Le label en arabe est requis.",
    }),
  }).required(),
  required: Joi.boolean().default(false),
  options: Joi.array().items(optionSchema).optional().messages({
    "array.base": "Les options doivent être un tableau.",
  }),
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
    abortEarly: false, // Return all errors, not just the first one
  });
  if (error) {
    throw new Error(error.details.map((err) => err.message).join(", "));
  }
  return value; // Return validated data if needed
};
