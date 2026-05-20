// models/TrainingOutput.js
import mongoose from "mongoose";

const TrainingOutputSchema = new mongoose.Schema(
  {
    training: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Training",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    targetParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AcceptedParticipant",
      },
    ], // If empty, it's for all participants
    instructions: {
      type: String,
    },
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
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
export default mongoose.model("TrainingOutput", TrainingOutputSchema);
