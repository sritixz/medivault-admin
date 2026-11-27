import jwt from 'jsonwebtoken';
import { AdminUser } from '../models/AdminUser.js';

const JWT_SECRET = process.env.JWT_SECRET || 'medivault_super_admin_dev_secret_change_in_prod';

export function signSuperAdminToken(admin) {
  return jwt.sign(
    {
      sub: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
  );
}

export async function requireSuperAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden. Super Admin role required.' });
    }

    const admin = await AdminUser.findById(decoded.sub).select('-passwordHash');
    if (!admin || !admin.isActive || admin.role !== 'SUPER_ADMIN') {
      return res.status(401).json({ error: 'Invalid or inactive Super Admin session.' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}
