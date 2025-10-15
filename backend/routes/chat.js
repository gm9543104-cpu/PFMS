import express from 'express';
import { ragChat } from '../services/ragChat.js';
import { Transaction } from '../models/transactionModel.js';
import { Goal } from '../models/goalModel.js';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { userId = 'demo-user', query } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });

    const result = await ragChat({ userId, query });

    // Apply simple CRUD hooks based on action
    if (result.action && result.action.action) {
      const action = result.action;
      if (action.action === 'remove' && action.target === 'transactions') {
        const { vendor, category } = action.details || {};
        const filter = { userId, softDeleted: false };
        if (vendor) filter.vendor = vendor;
        if (category) filter.category = category;
        await Transaction.updateMany(filter, { $set: { softDeleted: true } });
      }
      if (action.action === 'add_goal' && action.target === 'goal') {
        const { name, type, target, deadline } = action.details || {};
        if (name && type && target) await Goal.create({ userId, name, type, target, deadline });
      }
      if (action.action === 'update_goal' && action.target === 'goal') {
        const { id, name, fields } = action.details || {};
        const filter = { userId };
        if (id) filter._id = id; else if (name) filter.name = name;
        if (fields && Object.keys(fields).length > 0) {
          await Goal.findOneAndUpdate(filter, { $set: fields });
        }
      }
    }

    res.json({ ok: true, ...result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Chat failed' });
  }
});

export default router;
