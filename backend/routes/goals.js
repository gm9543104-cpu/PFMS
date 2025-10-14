import express from 'express';
import { Goal } from '../models/goalModel.js';

const router = express.Router();

router.get('/goals', async (req, res) => {
  const userId = req.query.userId || 'demo-user';
  const goals = await Goal.find({ userId }).lean();
  res.json({ ok: true, goals });
});

router.post('/goals', async (req, res) => {
  const { userId = 'demo-user', name, type, target, deadline } = req.body;
  if (!name || !type || !target) return res.status(400).json({ error: 'name, type, target required' });
  const goal = await Goal.create({ userId, name, type, target, deadline });
  res.json({ ok: true, goal });
});

router.put('/goals/:id', async (req, res) => {
  const userId = req.body.userId || 'demo-user';
  const { id } = req.params;
  const updated = await Goal.findOneAndUpdate({ _id: id, userId }, { $set: req.body }, { new: true });
  res.json({ ok: true, goal: updated });
});

router.delete('/goals/:id', async (req, res) => {
  const userId = req.body.userId || 'demo-user';
  const { id } = req.params;
  await Goal.deleteOne({ _id: id, userId });
  res.json({ ok: true });
});

export default router;
