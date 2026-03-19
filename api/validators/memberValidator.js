import Joi from "joi";

export const memberCreateValidator = Joi.object({
  firstName: Joi.string().required().messages({
    "string.empty": "Le prénom est requis",
    "any.required": "Le prénom est requis",
  }),
  lastName: Joi.string().required().messages({
    "string.empty": "Le nom de famille est requis",
    "any.required": "Le nom de famille est requis",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Adresse email invalide",
    "any.required": "Email est requis",
  }),
  role: Joi.string()
    .valid(
      "admin",
      "mentor",
      "projectHolder",
      "IncubationCoordinator",
      "ComponentCoordinator",
      "Beneficiary",
      "RegionalCoordinator",
      "member"
    )
    .required()
    .messages({
      "any.only": "Rôle invalide",
      "any.required": "Le rôle est requis",
    }),
  region: Joi.when("role", {
    is: "RegionalCoordinator",
    then: Joi.string().required().messages({
      "string.empty":
        "La région est obligatoire pour les coordinateurs régionaux",
    }),
    otherwise: Joi.forbidden(),
  }),
  component: Joi.when("role", {
    is: "ComponentCoordinator",
    then: Joi.string().required().messages({
      "string.empty":
        "Le type de composante est obligatoire pour les coordinateurs de composante",
    }),
    otherwise: Joi.forbidden(),
  }),
});
