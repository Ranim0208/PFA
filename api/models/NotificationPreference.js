import mongoose from "mongoose";

const notificationPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fcmTokens: [
      {
        // un user peut avoir plusieurs appareils
        token: String,
        device: { type: String, enum: ["mobile", "web"] },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    preferences: {
      reminders: {
        type: [
          {
            value: { type: Number, required: true },
            unit: { type: String, enum: ["days", "hours"], required: true },
          },
        ],
        default: [{ value: 1, unit: "days" }],
      },
      weekBefore: { type: Boolean, default: true },
      threeDaysBefore: { type: Boolean, default: true },
      dayBefore: { type: Boolean, default: true },
    },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model(
  "NotificationPreference",
  notificationPreferenceSchema,
);
