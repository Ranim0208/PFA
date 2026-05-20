// models/Region.js
import mongoose from "mongoose";

const RegionSchema = new mongoose.Schema(
  {
    name: {
      fr: { type: String, required: true },
      ar: { type: String, required: true },
    },
    cities: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Region || mongoose.model("Region", RegionSchema);
