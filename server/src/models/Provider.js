import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Diagnostic Centre', 'General Clinic', 'Dental Clinic', '24/7 Emergency', 'Pharmacy', 'Hospital'],
      required: true,
    },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    hours: { type: String, default: 'Open 9 AM - 8 PM' },
    verified: { type: Boolean, default: false },
    reportedUpdate: {
      hasReport: { type: Boolean, default: false },
      message: { type: String, default: '' },
      suggestedPhone: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export const Provider = mongoose.model('Provider', providerSchema);
