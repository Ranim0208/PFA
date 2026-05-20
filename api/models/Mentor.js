import mongoose from "mongoose";

// Define file schema for better structure
const FileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
); // Disable _id for subdocuments

const MentorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    creathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Creathon",
    },
    status: {
      type: String,
      enum: ["invited", "confirmed", "declined"],
      default: "invited",
    },
    accountStatus: {
      type: String,
      enum: ["pending", "validated", "rejected"],
      default: "pending",
    },
    personalInfo: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      address: {
        street: String,
        city: String,
        country: String,
        postalCode: String,
      },
      specialization: { type: String },
      bio: { type: String, maxlength: 500 },
      rib: { type: String },
      cv: FileSchema, // Use the defined schema
      idDocument: FileSchema, // Use the defined schema
      socialLinks: {
        linkedIn: String,
        twitter: String,
        github: String,
      },
      expertiseAreas: [{ type: String }],
      yearsOfExperience: { type: Number },
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: Date,
    validatedAt: Date,
    invitationToken: String,
    tokenExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    // Enable strict mode to catch schema violations
    strict: true,
    // Ensure virtual fields are included when converting to JSON
    versionKey: false,
  }
);

// Add virtual for checking if invitation is expired
MentorSchema.virtual("isExpired").get(function () {
  return this.tokenExpires && new Date() > new Date(this.tokenExpires);
});

// Add a method to safely update file information
MentorSchema.methods.updateFileInfo = function (fieldName, fileData) {
  if (!this.personalInfo) {
    this.personalInfo = {};
  }

  this.personalInfo[fieldName] = fileData;
  this.markModified(`personalInfo.${fieldName}`);
  return this;
};

export default mongoose.model("Mentor", MentorSchema);
