import { Schema, model } from "mongoose";

const ProjectHolderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});
export const ProjectHolder = model("ProjectHolder", ProjectHolderSchema);
