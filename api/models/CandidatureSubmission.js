import mongoose from "mongoose";
import { EVALUATION_TEXTS } from "../constants/evaluationOptions.js";
const CandidatureSubmissionSchema = new mongoose.Schema(
  {
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    answers: [
      {
        field: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TemplateField",
          required: true,
        },
        value: mongoose.Schema.Types.Mixed,
      },
    ],
    files: [
      {
        field: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TemplateField",
          required: true,
        },
        urls: [String],
      },
    ],
    status: {
      type: String,
      enum: ["draft", "submitted", "under_review", "accepted", "rejected","acceptedAfterCreathon"],
      default: "submitted",
    },
    feedbacks: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    preselectionEvaluations: [
      {
        coordinatorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        evaluation: {
          type: String,
          enum: EVALUATION_TEXTS,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // NEW: Mentor evaluations
    mentorEvaluations: [
      {
        mentorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        evaluation: {
          type: String,
          enum: EVALUATION_TEXTS,
          required: true,
        },
        comment: {
          type: String,
          default: "",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // NEW: Mentor feedbacks (separate from coordinator feedbacks)
    mentorFeedbacks: [
      {
        mentorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attendanceStatus: {
      type: String,
      enum: ["pending", "present", "absent", "declined"],
      default: "pending",
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    validatedAt: Date,
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // the regional coordinator
    },
    confirmedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "CandidatureSubmission",
  CandidatureSubmissionSchema
);
