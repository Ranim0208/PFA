import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

refreshTokenSchema.methods.revoke = function () {
  this.isRevoked = true;
  return this.save();
};

refreshTokenSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

export default model("RefreshToken", refreshTokenSchema);
