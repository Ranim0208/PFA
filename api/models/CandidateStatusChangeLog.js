// models/CandidateStatusChangeLog.js
import mongoose from "mongoose";

const CandidateStatusChangeLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      "CANDIDATE_WITHDRAWAL",
      "STATUS_CHANGE",
      "EVALUATION_UPDATE",
      "REPLACEMENT_SELECTION",
    ],
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  targetSubmission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CandidatureSubmission",
    required: true,
  },
  previousStatus: String,
  newStatus: String,
  userArchived: Boolean,
  details: {
    reason: String,
    coordinatorNote: String,
    evaluationScore: String, // Optional for evaluation changes
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.CandidateStatusChangeLog ||
  mongoose.model("CandidateStatusChangeLog", CandidateStatusChangeLogSchema);
