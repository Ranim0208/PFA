import Joi from "joi";

const FieldsValidator = (fields) => {
  const schemaShape = {};

  fields.forEach((field) => {
    // Skip validation for visual elements
    if (field.type === "section" || field.type === "divider") {
      schemaShape[field._id.toString()] = Joi.any().optional();
      return;
    }

    let rule;

    switch (field.type) {
      case "email":
        rule = Joi.string().email({ tlds: { allow: false } });
        break;

      case "number":
        const isAgeField =
          field.label?.fr?.toLowerCase().includes("age") ||
          field.label?.ar?.toLowerCase().includes("عمر");

        if (isAgeField) {
          rule = Joi.number().integer().min(16).max(120).messages({
            "number.min": "Age must be at least 16 years old",
            "number.max": "Please enter a valid age",
          });
        } else {
          rule = Joi.number();
        }
        break;

      case "phone":
        rule = Joi.string()
          .pattern(/^[0-9]{8}$/)
          .messages({
            "string.pattern.base": "Phone number must be exactly 8 digits",
          });
        break;

      case "date":
        const isBirthdateField =
          field.label?.fr?.toLowerCase().includes("naissance") ||
          field.label?.ar?.toLowerCase().includes("ميلاد");

        if (isBirthdateField) {
          // Create date without time component for accurate comparison
          const today = new Date();
          const minDate = new Date(
            today.getFullYear() - 16,
            today.getMonth(),
            today.getDate()
          );
          rule = Joi.date().max(minDate).messages({
            "date.max": "You must be at least 16 years old",
          });
        } else {
          rule = Joi.date();
        }
        break;

      case "select":
      case "radio":
        const validValues = field.options?.map((o) => o.value) || [];
        rule = Joi.string().valid(...validValues);
        break;

      case "checkbox":
        const checkboxValidValues = field.options?.map((o) => o.value) || [];
        rule = Joi.array()
          .items(Joi.string().valid(...checkboxValidValues))
          .default([]);
        break;

      case "file":
        // More flexible file validation that allows null for required fields
        rule = Joi.alternatives()
          .try(
            // File object from frontend before upload
            Joi.object({
              name: Joi.string().required(),
              size: Joi.number()
                .max(10 * 1024 * 1024)
                .required(),
              type: Joi.string().required(),
            }),
            // File info after upload
            Joi.object({
              filename: Joi.string().required(),
              originalName: Joi.string().required(),
              path: Joi.string().required(),
              url: Joi.string().uri().required(),
              size: Joi.number().required(),
              mimetype: Joi.string().required(),
              uploadedAt: Joi.date().required(),
            }),
            // Allow null for file fields (they'll be validated by required check)
            Joi.any().valid(null)
          )
          .messages({
            "alternatives.match": "Invalid file format or information",
            "number.max": "File size must be less than 10MB",
          });
        break;
      case "textarea":
        rule = Joi.string().max(1000);
        break;

      default:
        rule = Joi.string();
    }

    // Apply required validation
    if (field.required) {
      if (field.type === "checkbox") {
        rule = rule.custom((value, helpers) => {
          if (!value || value.length === 0) {
            return helpers.error("any.required");
          }
          return value;
        }, "checkbox required validation");
      } else {
        rule = rule.required();
      }
    } else {
      // For non-required fields, allow empty values
      if (field.type === "checkbox") {
        rule = rule.default([]);
      } else if (field.type === "number") {
        rule = rule.allow(null, "");
      } else if (field.type === "file") {
        rule = rule.optional();
      } else {
        rule = rule.allow("", null);
      }
    }

    schemaShape[field._id.toString()] = rule;
  });

  return Joi.object(schemaShape);
};

export default FieldsValidator;
