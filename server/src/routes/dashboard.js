import express from 'express';
import { User } from '../models/User.js';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { OCRJob } from '../models/OCRJob.js';
import { SupportTicket } from '../models/SupportTicket.js';
import { SubscriptionTransaction } from '../models/SubscriptionTransaction.js';
import { AuditLog } from '../models/AuditLog.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const [
      users,
      totalRecords,
      ocrJobs,
      openTickets,
      transactions,
      recentAudit,
      categoryAgg,
    ] = await Promise.all([
      User.find().lean(),
      MedicalRecord.countDocuments(),
      OCRJob.find().lean(),
      SupportTicket.countDocuments({ status: { $in: ['Open', 'In Progress'] } }),
      SubscriptionTransaction.find({ status: 'Success' }).lean(),
      AuditLog.find().sort({ createdAt: -1 }).limit(6).lean(),
      MedicalRecord.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ]);

    const totalUsers = users.length;
    const totalFamilyMembers = users.reduce(
      (sum, u) => sum + (u.familyMembers ? u.familyMembers.length : 0),
      0
    );
    const totalStorageMb = users.reduce((sum, u) => sum + (u.storageUsedMb || 0), 0);
    const premiumSubscribers = users.filter((u) => u.plan === 'family_premium').length;
    const mrrInr = transactions.reduce((sum, t) => sum + (t.amountInr || 0), 0);

    const pendingOcr = ocrJobs.filter(
      (j) => j.stage === 'Pending' || j.stage === 'Extracting Lines'
    ).length;
    const failedOcr = ocrJobs.filter(
      (j) => j.stage === 'Password Locked' || j.stage === 'Failed'
    ).length;

    res.json({
      totalUsers,
      totalFamilyMembers,
      totalRecords,
      totalStorageMb,
      premiumSubscribers,
      mrrInr,
      openTickets,
      ocr: {
        total: ocrJobs.length,
        pending: pendingOcr,
        failed: failedOcr,
      },
      categories: categoryAgg,
      recentActivity: recentAudit,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
