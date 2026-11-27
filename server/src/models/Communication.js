import mongoose from 'mongoose';

const communicationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['advisory', 'offer'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    audience: { type: String, default: 'All Family Profiles' },
    expiresAt: { type: String, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Expired'],
      default: 'Published',
    },
    // Offer-specific fields (only used when type === 'offer')
    partnerName: { type: String, default: '' },
    promoCode: { type: String, default: '' },
    redemptions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Communication = mongoose.model('Communication', communicationSchema);
