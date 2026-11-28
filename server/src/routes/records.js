import express from 'express';
import { MedicalRecord, RECORD_CATEGORIES } from '../models/MedicalRecord.js';
import { recordAudit } from '../utils/audit.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, q } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ title: regex }, { memberName: regex }, { provider: regex }, { recordCode: regex }];
    }
    const records = await MedicalRecord.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ records, categories: RECORD_CATEGORIES });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/break-glass', async (req, res) => {
  try {
    const { reason, totpCode } = req.body || {};
    if (!reason || !totpCode) {
      return res.status(400).json({ error: 'Justification reason and 2FA code are required.' });
    }
    const record = await MedicalRecord.findById(req.params.id).lean();
    if (!record) return res.status(404).json({ error: 'Record not found.' });

    await recordAudit(req, {
      action: 'BREAK_GLASS_DECRYPT',
      targetEntity: `${record.recordCode} (${record.title})`,
      result: 'AUTHORIZED',
      details: reason,
    });

    res.json({ record, authorizedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
