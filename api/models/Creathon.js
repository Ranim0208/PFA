import mongoose from "mongoose";

const CreathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre du créathon est requis"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La description du créathon est requise"],
    },
    image: {
      type: String,
      required: [true, "L'image du créathon est requise"],
      validate: {
        validator: function (v) {
          return /^(http|https):\/\/[^ "]+$/.test(v);
        },
        message: "L'URL de l'image doit être valide",
      },
    },
    component: {
      type: String,
      enum: ["crea", "inov"],
      required: [true, "La composante est requise"],
    },
    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
      required: [true, "La région est requise"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      address: {
        type: String,
        required: [true, "L'adresse est requise"],
      },
      city: {
        type: String,
        required: [true, "La ville est requise"],
      },
      venue: {
        type: String,
        required: [true, "Le lieu est requis"],
      },
    },
    dates: {
      startDate: {
        type: Date,
        required: [true, "La date de début est requise"],
      },
      endDate: {
        type: Date,
        required: [true, "La date de fin est requise"],
      },
      registrationDeadline: {
        type: Date,
        required: [true, "La date limite d'inscription est requise"],
      },
    },
    duration: {
      type: Number,
      required: [true, "La durée en jours est requise"],
      min: [1, "La durée doit être d'au moins 1 jour"],
    },
    capacity: {
      maxParticipants: {
        type: Number,
        required: [true, "Le nombre maximum de participants est requis"],
        min: [1, "Au moins 1 participant requis"],
      },
      maxTeams: {
        type: Number,
        required: [true, "Le nombre maximum d'équipes est requis"],
        min: [1, "Au moins 1 équipe requise"],
      },
    },
    jury: {
      numberOfJuries: {
        type: Number,
        required: [true, "Le nombre de jurys est requis"],
        min: [1, "Au moins 1 jury requis"],
      },
      members: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          firstName: String,
          lastName: String,
          email: String,
          phone: String, // only for mentors
          specialization: String, // only for mentors
          status: {
            type: String,
            enum: ["pending", "confirmed", "declined"],
            default: "pending",
          },
          accountStatus: {
            type: String,
            enum: ["pending", "validated", "rejected"],
            default: "pending",
          },
          invitedAt: {
            type: Date,
            default: Date.now,
          },
          respondedAt: Date,
          validatedAt: Date,
        },
      ],
    },
   mentors: {
  numberOfMentors: Number,
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      specialization: String,
      status: { type: String, enum: ["pending", "confirmed", "declined"], default: "pending" },
      accountStatus: { type: String, enum: ["pending", "validated", "rejected"], default: "pending" },
      invitedAt: { type: Date, default: Date.now },
      respondedAt: Date,
      validatedAt: Date,
      accessStatus: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive",
      },
    },
  ],
}
,
    coordinators: {
      componentCoordinator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Le coordinateur de composante est requis"],
      },
      generalCoordinator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Le coordinateur général est requis"],
      },
    },
    status: {
      type: String,
      enum: [
        "draft",
        "pending_validation",
        "validated",
        "published",
        "ongoing",
        "completed",
        "cancelled",
      ],
      default: "draft",
    },
    validations: {
      componentValidation: {
        validatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        validatedAt: Date,
        comments: String,
      },
      generalValidation: {
        validatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        validatedAt: Date,
        comments: String,
      },
    },
    budget: {
      totalBudget: {
        type: Number,
        default: 0,
      },
      allocatedBudget: {
        type: Number,
        default: 0,
      },
      expenses: [
        {
          category: String,
          amount: Number,
          description: String,
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    resources: {
      materials: {
        type: [String],
        default: [],
      },
      equipment: {
        type: [String],
        default: [],
      },
      facilities: {
        type: [String],
        default: [],
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Creathon", CreathonSchema);
