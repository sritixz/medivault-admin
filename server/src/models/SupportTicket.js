import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema(
  {
    caseCode: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Upload Issue', 'OCR Correction', 'Login Help', 'Billing', 'App Bug'],
      default: 'Upload Issue',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    internalNotes: [
      {
        note: String,
        author: { type: String, default: 'Super Admin' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
