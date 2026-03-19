import { Schema, model } from "mongoose";

const AdminSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});
export const Admin = model("Admin", AdminSchema);
