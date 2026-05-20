import mongoose from "mongoose";

const CreathonInvitationSchema = new mongoose.Schema(
  {
    creathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Creathon",
      required: true,
    },
    invitee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["mentor", "jury"],
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending",
    },
    invitationToken: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    message: String,
    respondedAt: Date,
    response: String,
  },
  { timestamps: true }
);

export default mongoose.model("CreathonInvitation", CreathonInvitationSchema);
