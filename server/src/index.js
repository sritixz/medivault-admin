import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { requireSuperAdmin } from './middleware/auth.js';

import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import usersRoutes from './routes/users.js';
import recordsRoutes from './routes/records.js';
import ocrRoutes from './routes/ocr.js';
import providersRoutes from './routes/providers.js';
import communicationsRoutes from './routes/communications.js';
import supportRoutes from './routes/support.js';
import billingRoutes from './routes/billing.js';
import auditRoutes from './routes/audit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDir = path.resolve(__dirname, '..', '..', 'client');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ? [process.env.CLIENT_ORIGIN, 'http://localhost:5000'] : '*',
  })
);
app.use(express.json({ limit: '2mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'medivault-admin-server', roleScope: 'SUPER_ADMIN' });
});

// Public Super Admin Auth
app.use('/api/auth', authRoutes);

// Protected Super Admin API Routes
app.use('/api/dashboard', requireSuperAdmin, dashboardRoutes);
app.use('/api/users', requireSuperAdmin, usersRoutes);
app.use('/api/records', requireSuperAdmin, recordsRoutes);
app.use('/api/ocr', requireSuperAdmin, ocrRoutes);
app.use('/api/providers', requireSuperAdmin, providersRoutes);
app.use('/api/communications', requireSuperAdmin, communicationsRoutes);
app.use('/api/tickets', requireSuperAdmin, supportRoutes);
app.use('/api/billing', requireSuperAdmin, billingRoutes);
app.use('/api/audit', requireSuperAdmin, auditRoutes);

// Serve the frontend from client/
app.use(express.static(clientDir));
app.get('/', (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled API error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`MediVault Super Admin Server running on http://localhost:${PORT}`);
  });
});
