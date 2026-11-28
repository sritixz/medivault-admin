import express from 'express';
import { SupportTicket } from '../models/SupportTicket.js';
import { recordAudit } from '../utils/audit.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 }).lean();
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { status, internalNote } = req.body || {};
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

    if (status) ticket.status = status;
    if (internalNote && internalNote.trim()) {
      ticket.internalNotes.push({
        note: internalNote.trim(),
        author: req.admin?.name || 'Super Admin',
      });
    }
    await ticket.save();

    await recordAudit(req, {
      action: 'SUPPORT_TICKET_UPDATED',
      targetEntity: `${ticket.caseCode} -> ${ticket.status}`,
    });

    res.json({ ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
