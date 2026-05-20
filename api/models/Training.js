import { Schema, model } from "mongoose";

const trainingSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ["formation", "bootcamp", "mentoring"],
      required: true,
    },
    componentCoordinator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    incubationCoordinators: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    trainers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Mentor",
      },
    ],
    scheduledDate: { type: Date, required: false },
    startDate: { type: Date, required: true },
    endDate: {
      type: Date,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return v >= this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    rescheduledDate: { type: Date },
    time: { type: String },
    duration: { type: Number },
    location: { type: String },
    meetLink: { type: String },
    sessionType: {
      type: String,
      enum: ["online", "in-person"],
    },
    meetingLink: {
      type: String,
    },
    proposedLocation: {
      type: String,
    },

    cohorts: [{ type: String }],
    maxParticipants: { type: Number },
    programFile: { type: String },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "rescheduled"],
      default: "pending",
    },
    rejectionReason: { type: String },

    componentActivity: {
      type: String,
      enum: ["training", "crea", "innov", "archi", "diffusion", "eco"],
    },

    // --- Logistical Needs ---
    logisticsNeeds: {
      type: [String],
      enum: ["catering", "perdiem_meals", "coffee_break", "perdiem_transport"],
      default: [],
    },
    logisticsDetails: { type: String, trim: true },
    specificNeeds: { type: String, trim: true },

    // --- Travel & On-Site Needs ---
    travelNeeds: {
      type: [String],
      enum: ["hebergement_restauration", "materiel", "salles_reunion"],
      default: [],
    },

    // --- Communication Needs ---
    communicationNeeds: [
      {
        type: String,
        enum: [
          "photo",
          "video",
          "archivage",
          "presentation",
          "rollup",
          "streaming",
          "autre",
        ],
      },
    ],
    communicationNeedsOther: {
      type: String,
      trim: true,
    },

    // --- Resources & Partners ---
    organizationalNeeds: { type: String },
    requiredPartners: { type: String },
    humanResources: { type: String },
    materialResources: [{ type: String }],
    financialResources: { type: String },
    highlightMoments: { type: String },

    // --- Miscellaneous ---
    additionalComments: { type: String },
  },
  { timestamps: true }
);

export default model("Training", trainingSchema);
