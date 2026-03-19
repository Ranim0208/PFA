// models/ParticipantOutput.js
import mongoose from "mongoose";

const ParticipantOutputSchema = new mongoose.Schema(
  {
    output: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingOutput",
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcceptedParticipant",
      required: true,
    },
    submitted: {
      type: Boolean,
      default: false,
    },
    submissionDate: Date,
    attachments: [
      {
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
        },
      },
    ],
    // Removed the comment field - all comments now go in the comments array
    approved: {
      type: Boolean,
      default: false,
    },
    feedback: String, // Mentor's feedback
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    evaluatedAt: Date,
    comments: [
      // Thread of comments between participant and mentor
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["mentor", "participant"],
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

ParticipantOutputSchema.virtual("completionRate").get(function () {
  const total = this.stats.totalSubmissions;
  const approved = this.stats.approvedSubmissions;
  return total > 0 ? Math.round((approved / total) * 100) : 0;
});

// Virtual to check if overdue
ParticipantOutputSchema.virtual("isOverdue").get(function () {
  return new Date() > new Date(this.dueDate) && this.status === "published";
});

// Index for better query performance
ParticipantOutputSchema.index({ training: 1, dueDate: 1 });
ParticipantOutputSchema.index({ dueDate: 1, status: 1 });

// Pre-save middleware to validate evaluation criteria weights
ParticipantOutputSchema.pre("save", function (next) {
  if (this.evaluationCriteria && this.evaluationCriteria.length > 0) {
    const totalWeight = this.evaluationCriteria.reduce(
      (sum, criteria) => sum + criteria.weight,
      0
    );
    if (totalWeight !== 100) {
      return next(new Error("Evaluation criteria weights must sum to 10"));
    }
  }
  next();
});
ParticipantOutputSchema.pre("save", function (next) {
  if (this.isModified("approved")) {
    if (this.approved && !this.feedback) {
      this.feedback = "Approved without additional feedback";
    }
  }
  next();
});

// Static method to update stats
ParticipantOutputSchema.statics.updateStats = async function (outputId) {
  const ParticipantOutput = mongoose.model("ParticipantOutput");

  const stats = await ParticipantOutput.aggregate([
    { $match: { output: new mongoose.Types.ObjectId(outputId) } },
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        approvedSubmissions: {
          $sum: { $cond: [{ $eq: ["$approved", true] }, 1, 0] },
        },
        pendingSubmissions: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$submitted", true] },
                  { $eq: ["$approved", false] },
                ],
              },
              1,
              0,
            ],
          },
        },
        rejectedSubmissions: {
          $sum: { $cond: [{ $eq: ["$approved", false] }, 1, 0] },
        },
      },
    },
  ]);

  const updatedStats =
    stats.length > 0
      ? stats[0]
      : {
          totalSubmissions: 0,
          approvedSubmissions: 0,
          pendingSubmissions: 0,
          rejectedSubmissions: 0,
        };

  await this.findByIdAndUpdate(outputId, { stats: updatedStats });
};

export default mongoose.model("ParticipantOutput", ParticipantOutputSchema);
