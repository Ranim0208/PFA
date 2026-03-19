import { Schema, model } from "mongoose";
import { hash, compare } from "bcryptjs";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      default: ["member"],
      enum: [
        "admin",
        "mentor",
        "projectHolder",
        "IncubationCoordinator",
        "ComponentCoordinator",
        "Beneficiary",
        "RegionalCoordinator",
        "member",
        "jury",
      ],
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash the password before saving to the database
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hash(this.password, 10);
  }
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (password) {
  return compare(password, this.password);
};

export default model("User", userSchema);
