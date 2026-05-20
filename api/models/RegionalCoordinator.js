// models/RegionalCoordinator.js
import { Schema, model } from "mongoose";

const regionalCoordinatorSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    region: {
      type: Schema.Types.ObjectId,
      ref: "Region",
      required: true,
    },
  },
  { timestamps: true }
);

export default model("RegionalCoordinator", regionalCoordinatorSchema);
