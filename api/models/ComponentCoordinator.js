// models/ComponentCoordinator.js
import mongoose from "mongoose";

const ComponentCoordinatorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    component: {
      type: String,
      required: true,
      enum: ["crea", "inov"],
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "ComponentCoordinator",
  ComponentCoordinatorSchema
);
