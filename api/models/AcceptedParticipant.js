import mongoose from "mongoose";

const eventDateSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  description: {
    fr: {
      type: String,
      required: true
    },
    ar: {
      type: String,
      required: true
    }
  }
}, { _id: true });

const AcceptedParticipantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CandidatureSubmission",
      required: true,
    },
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
      required: true,
    },
    answers: [
      {
        field: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TemplateField",
          required: true,
        },
        value: mongoose.Schema.Types.Mixed,
      },
    ],
    files: [
      {
        field: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TemplateField",
          required: true,
        },
        urls: [String],
      },
    ],
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    validatedAt: {
      type: Date,
      default: Date.now,
    },
    eventDates: {
      type: [eventDateSchema],  
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "declined","acceptedAfterCreathon"],
      default: "pending",
    },
  },
  { timestamps: true }
);

AcceptedParticipantSchema.statics.findByUserId = async function(userId) {
  return this.findOne({ user: userId })
    .populate('region', 'name _id') 
    .populate('form', 'title _id');
};

export default mongoose.model("AcceptedParticipant", AcceptedParticipantSchema);