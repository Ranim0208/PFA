import mongoose from "mongoose";
const sessionSchema = new mongoose.Schema({
  trainingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Training',
    required: true
  },
  trainingTitle: {
    type: String,
    required: true
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participantName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  cohort: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled','confirmed'],
    default: 'scheduled'
  },
  presenceConfirmedAt: {
    type: Date,
    default: null
  },
   day: {
    type: Number,
    required: false,
    min: 1
  },
  signature: {
    type: String, // Base64 encoded image
    default: null
  },
  attendance: {
    type: String,
    enum: ['present', 'absent'],
    default: 'absent'
  },
  
  meetLink: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Session', sessionSchema);
