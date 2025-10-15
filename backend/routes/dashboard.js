import express from 'express';
import dayjs from 'dayjs';
import { Transaction } from '../models/transactionModel.js';
import { Goal } from '../models/goalModel.js';
import { User } from '../models/userModel.js';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  const userId = req.query.userId || 'demo-user';
  const txns = await Transaction.find({ userId, softDeleted: false }).lean();
  const goals = await Goal.find({ userId }).lean();
  const user = await User.findOne({ userId }).lean();

  const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const byCategory = {};
  for (const t of txns) {
    if (t.type === 'expense') byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  }

  // Trend last 7 days
  const last7Days = {};
  for (let i = 6; i >= 0; i--) {
    const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
    last7Days[d] = 0;
  }
  for (const t of txns) {
    if (t.type === 'expense' && last7Days[t.date] !== undefined) last7Days[t.date] += t.amount;
  }

  res.json({
    ok: true,
    income,
    expenses,
    balance: income - expenses,
    gmailCount: txns.filter(t => t.source === 'Gmail').length,
    totalTransactions: txns.length,
    points: user?.totalPoints || 0,
    tier: user?.tier || 'Bronze',
    byCategory,
    trend: last7Days,
    goals,
    transactions: txns
  });
});

export default router;
