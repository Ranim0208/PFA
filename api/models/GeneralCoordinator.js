import { Schema, model } from "mongoose";

const GeneralCoordinatorSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});
export const GeneralCoordinator = model(
  "GeneralCoordinator",
  GeneralCoordinatorSchema
);
