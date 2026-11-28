import express from 'express';
import { User } from '../models/User.js';
import { recordAudit } from '../utils/audit.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q, plan, status } = req.query;
    const filter = {};
    if (plan && plan !== 'all') filter.plan = plan;
    if (status && status !== 'all') filter.status = status;
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }, { userCode: regex }];
    }
    const users = await User.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status, reason = '' } = req.body;
    if (!['active', 'suspended', 'pending_deletion'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status, suspensionReason: reason },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });

    await recordAudit(req, {
      action: `USER_STATUS_${status.toUpperCase()}`,
      targetEntity: `${user.userCode} (${user.name})`,
      details: reason,
    });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/sessions/:sessionId', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.sessions = user.sessions.filter((s) => s.sessionId !== req.params.sessionId);
    await user.save();

    await recordAudit(req, {
      action: 'SESSION_TERMINATED',
      targetEntity: `${user.userCode} / ${req.params.sessionId}`,
    });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/export', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ error: 'User not found.' });

    await recordAudit(req, {
      action: 'DPDP_DATA_EXPORT',
      targetEntity: `${user.userCode} (${user.email})`,
    });

    res.json({
      message: `Encrypted archive export queued for ${user.email}`,
      exportedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
