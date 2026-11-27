import { AuditLog } from '../models/AuditLog.js';

export async function recordAudit(req, { action, targetEntity, result = 'AUTHORIZED', details = '' }) {
  try {
    const operator = req.admin ? `${req.admin.email} (Super Admin)` : 'system';
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    await AuditLog.create({
      operator,
      role: req.admin?.role || 'SUPER_ADMIN',
      action,
      targetEntity,
      ipAddress,
      result,
      details,
    });
  } catch (err) {
    console.error('Audit log write failed:', err.message);
  }
}
