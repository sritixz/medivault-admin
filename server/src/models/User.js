import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema(
  {
    memberId: { type: String, required: true },
    name: { type: String, required: true },
    relation: { type: String, required: true },
    age: { type: Number, required: true },
    bloodGroup: { type: String, default: 'Unknown' },
    initials: { type: String, required: true },
    color: { type: String, default: 'teal' },
    emergencyQrActive: { type: Boolean, default: true },
    recordCount: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    device: { type: String, required: true },
    location: { type: String, default: 'Unknown' },
    lastActive: { type: String, default: 'Just now' },
    isCurrent: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    userCode: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    initials: { type: String, required: true },
    plan: {
      type: String,
      enum: ['free', 'family_premium'],
      default: 'free',
    },
    storageUsedMb: { type: Number, default: 0 },
    storageQuotaMb: { type: Number, default: 1024 },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending_deletion'],
      default: 'active',
    },
    suspensionReason: { type: String, default: '' },
    familyMembers: [familyMemberSchema],
    sessions: [sessionSchema],
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
