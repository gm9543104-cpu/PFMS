import express from 'express';
import { Transaction } from '../models/transactionModel.js';
import { CategoryOverride } from '../models/categoryOverrideModel.js';

const router = express.Router();

router.post('/categorize', async (req, res) => {
  try {
    const { userId = 'demo-user', updates } = req.body;
    if (!Array.isArray(updates)) return res.status(400).json({ error: 'updates array required' });

    const ops = updates.map(u => ({ updateOne: { filter: { _id: u.id, userId }, update: { $set: { category: u.category } } } }));
    if (ops.length > 0) await Transaction.bulkWrite(ops);

    // Persist vendor->category corrections to continuously learn
    const overrideOps = updates
      .filter(u => u.vendor && u.category)
      .map(u => ({ updateOne: { filter: { userId, vendor: u.vendor }, update: { $set: { category: u.category } }, upsert: true } }));
    if (overrideOps.length > 0) await CategoryOverride.bulkWrite(overrideOps);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Categorization update failed' });
  }
});

export default router;
