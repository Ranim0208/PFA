import { Schema, model } from "mongoose";

const BeneficiarySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});
export const Beneficiary = model("Beneficiary", BeneficiarySchema);
