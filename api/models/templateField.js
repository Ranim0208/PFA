import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: {
    fr: { type: String, required: true },
    ar: { type: String, required: true },
  },
});

const templateFieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Ensure template names are unique
    },
    type: {
      type: String,
      required: true,
      enum: [
        "text",
        "email",
        "textarea",
        "number",
        "phone",
        "select",
        "radio",
        "checkbox",
        "date",
        "file",
        "section",
        "divider",
      ],
    },
    label: {
      fr: { type: String, required: true },
      ar: { type: String, required: true },
    },
    required: { type: Boolean, default: false },
    options: [optionSchema],
    placeholder: {
      fr: String,
      ar: String,
    },
    defaultValue: String,
    validation: String,
    layout: String,
    isTemplate: {
      type: Boolean,
      default: false,
      index: true,
    },
    // New fields for better template management
    isSystemTemplate: { type: Boolean, default: false }, // For system-wide templates
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastUsedAt: Date,
    usageCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
templateFieldSchema.index({ isTemplate: 1, type: 1 });

const TemplateField =
  mongoose.models.TemplateField ||
  mongoose.model("TemplateField", templateFieldSchema);

export default TemplateField;
