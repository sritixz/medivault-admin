import mongoose from 'mongoose';

const ocrJobSchema = new mongoose.Schema(
  {
    jobCode: { type: String, required: true, unique: true },
    userName: { type: String, required: true },
    fileName: { type: String, required: true },
    detectedCategory: { type: String, default: 'Unknown' },
    confidence: { type: Number, default: 0 },
    stage: {
      type: String,
      enum: ['Pending', 'Extracting Lines', 'Completed', 'Password Locked', 'Failed'],
      default: 'Pending',
    },
    durationSec: { type: Number, default: 0 },
    errorReason: { type: String, default: '' },
  },
  { timestamps: true }
);

export const OCRJob = mongoose.model('OCRJob', ocrJobSchema);
