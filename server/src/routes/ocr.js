import express from 'express';
import { OCRJob } from '../models/OCRJob.js';
import { recordAudit } from '../utils/audit.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const jobs = await OCRJob.find().sort({ createdAt: -1 }).lean();
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/simulate', async (req, res) => {
  try {
    const count = await OCRJob.countDocuments();
    const job = await OCRJob.create({
      jobCode: `OCR-${8825 + count}`,
      userName: 'Vikram Sharma',
      fileName: `Lab_Report_${Date.now().toString().slice(-4)}.pdf`,
      detectedCategory: 'Lab reports',
      confidence: 99.1,
      stage: 'Completed',
      durationSec: 1.3,
    });
    res.status(201).json({ job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/retry', async (req, res) => {
  try {
    const job = await OCRJob.findByIdAndUpdate(
      req.params.id,
      {
        stage: 'Completed',
        confidence: 97.4,
        durationSec: 1.6,
        errorReason: '',
      },
      { new: true }
    );
    if (!job) return res.status(404).json({ error: 'OCR job not found.' });

    await recordAudit(req, {
      action: 'OCR_JOB_RETRIED',
      targetEntity: job.jobCode,
    });

    res.json({ job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
