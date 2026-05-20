import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    eventType: {
      type: String,
      enum: ["creathon", "formation", "bootcamp", "mentoring", "mentorat"],
    },
    eventId: { type: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("Notification", notificationSchema);
