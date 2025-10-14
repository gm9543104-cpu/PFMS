import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse';
import { categorizeTransactionsWithAI } from '../services/aiCategorizer.js';
import { Transaction } from '../models/transactionModel.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-csv', upload.single('file'), async (req, res) => {
  try {
    const userId = req.body.userId || 'demo-user';
    if (!req.file) return res.status(400).json({ error: 'CSV file is required' });

    const csvText = req.file.buffer.toString('utf-8');
    const rawLines = [];

    await new Promise((resolve, reject) => {
      parse(csvText, { columns: true, skip_empty_lines: true }, (err, records) => {
        if (err) return reject(err);
        for (const r of records) {
          const text = Object.values(r).join(' ');
          rawLines.push(text);
        }
        resolve();
      });
    });

    const categorized = await categorizeTransactionsWithAI(rawLines);

    const docs = categorized.map(t => ({
      userId,
      vendor: t.vendor,
      category: t.category,
      amount: t.amount,
      date: t.date,
      type: t.type || 'expense',
      paymentMethod: t.paymentMethod || 'Unknown',
      source: 'CSV',
      isRecurring: !!t.isRecurring,
      isUnused: !!t.isUnused,
      rawText: t.rawText
    }));

    const saved = await Transaction.insertMany(docs);
    res.json({ ok: true, inserted: saved.length, transactions: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process CSV' });
  }
});

export default router;
