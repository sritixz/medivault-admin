import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    operator: { type: String, required: true },
    role: { type: String, default: 'SUPER_ADMIN' },
    action: { type: String, required: true },
    targetEntity: { type: String, required: true },
    ipAddress: { type: String, default: '127.0.0.1' },
    result: { type: String, default: 'AUTHORIZED' },
    details: { type: String, default: '' },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
