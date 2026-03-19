// validators/evaluationValidator.js
import Joi from "joi";
import { EVALUATION_TEXTS } from "../constants/evaluationOptions.js";

export const preselectionEvaluationSchema = Joi.object({
  evaluationText: Joi.string()
    .valid(...EVALUATION_TEXTS)
    .required(),
  comment: Joi.string().max(500).allow("", null),
});
