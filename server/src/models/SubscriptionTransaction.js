import mongoose from 'mongoose';

const subscriptionTransactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    amountInr: { type: Number, required: true },
    memberCount: { type: Number, default: 1 },
    plan: { type: String, default: 'Family Care Premium' },
    status: {
      type: String,
      enum: ['Success', 'Failed', 'Refunded'],
      default: 'Success',
    },
    dateLabel: { type: String, required: true },
  },
  { timestamps: true }
);

export const SubscriptionTransaction = mongoose.model(
  'SubscriptionTransaction',
  subscriptionTransactionSchema
);
