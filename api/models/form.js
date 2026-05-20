import mongoose from "mongoose";

const prizeSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  description: {
    fr: { type: String, required: true },
    ar: { type: String, required: true },
  },
});

const eventDateSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  description: {
    fr: { type: String, required: true },
    ar: { type: String, required: true },
  },
});

const CandidatureFormSchema = new mongoose.Schema(
  {
    title: {
      fr: { type: String, required: true },
      ar: { type: String, required: true },
    },
    imageUrl: String,
    description: {
      fr: String,
      ar: String,
    },
    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
      required: function () {
        return !this.isTemplate;
      },
    },
    startDate: {
      type: Date,
      required: function () {
        return !this.isTemplate;
      },
    },
    endDate: {
      type: Date,
      required: function () {
        return !this.isTemplate;
      },
    },
    announcementDate: Date,
    eventDates: [eventDateSchema],
    eventLocation: {
      fr: String,
      ar: String,
    },
    prizes: [prizeSchema],
    // Reference to TemplateField model for reusable fields
    fields: [{ type: mongoose.Schema.Types.ObjectId, ref: "TemplateField" }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    published: { type: Boolean, default: false },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    validated: { type: Boolean, default: false },
    validatedAt: Date,
    publishedAt: Date,
    isTemplate: { type: Boolean, default: false },
    templateCategory: {
      type: String,
      enum: ["event", "contest", "application", "survey", "custom"],
      default: "custom",
    },
    templateTags: [{ type: String }],
    templateUsageCount: { type: Number, default: 0 },
    basedOnTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Form ||
  mongoose.model("Form", CandidatureFormSchema);
