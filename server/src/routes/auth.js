import express from 'express';
import { AdminUser } from '../models/AdminUser.js';
import { requireSuperAdmin, signSuperAdminToken } from '../middleware/auth.js';
import { recordAudit } from '../utils/audit.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const admin = await AdminUser.findOne({ email: email.toLowerCase().trim() });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (admin.role !== 'SUPER_ADMIN' || !admin.isActive) {
      return res.status(403).json({ error: 'Super Admin access is required.' });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = signSuperAdminToken(admin);
    req.admin = admin;
    await recordAudit(req, {
      action: 'SUPER_ADMIN_LOGIN',
      targetEntity: admin.email,
      result: 'AUTHORIZED',
    });

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

router.get('/me', requireSuperAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

export default router;
