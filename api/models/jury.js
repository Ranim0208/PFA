import mongoose from "mongoose";

const JurySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Creathon",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "declined"],
      default: "pending",
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Jury", JurySchema);
