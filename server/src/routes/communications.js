import express from 'express';
import { Communication } from '../models/Communication.js';
import { recordAudit } from '../utils/audit.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const all = await Communication.find().sort({ createdAt: -1 }).lean();
    res.json({
      advisories: all.filter((item) => item.type === 'advisory'),
      offers: all.filter((item) => item.type === 'offer'),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Communication.create(req.body);
    await recordAudit(req, {
      action: item.type === 'advisory' ? 'PUBLISH_HEALTH_ALERT' : 'PUBLISH_PARTNER_OFFER',
      targetEntity: item.title,
    });
    res.status(201).json({ item });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
