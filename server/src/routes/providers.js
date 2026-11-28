import express from 'express';
import { Provider } from '../models/Provider.js';
import { recordAudit } from '../utils/audit.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const providers = await Provider.find().sort({ createdAt: -1 }).lean();
    res.json({ providers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const provider = await Provider.create(req.body);
    await recordAudit(req, {
      action: 'PROVIDER_ADDED',
      targetEntity: provider.name,
    });
    res.status(201).json({ provider });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id/verify', async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ error: 'Provider not found.' });
    provider.verified = !provider.verified;
    await provider.save();

    await recordAudit(req, {
      action: 'PROVIDER_VERIFICATION_TOGGLED',
      targetEntity: `${provider.name} -> ${provider.verified}`,
    });

    res.json({ provider });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/resolve-report', async (req, res) => {
  try {
    const { accept } = req.body;
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ error: 'Provider not found.' });

    if (accept && provider.reportedUpdate?.suggestedPhone) {
      provider.phone = provider.reportedUpdate.suggestedPhone;
    }
    provider.reportedUpdate = { hasReport: false, message: '', suggestedPhone: '' };
    await provider.save();

    await recordAudit(req, {
      action: accept ? 'PROVIDER_REPORT_ACCEPTED' : 'PROVIDER_REPORT_DISMISSED',
      targetEntity: provider.name,
    });

    res.json({ provider });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
