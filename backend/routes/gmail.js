import express from 'express';
import { google } from 'googleapis';
import { categorizeTransactionsWithAI } from '../services/aiCategorizer.js';
import { Transaction } from '../models/transactionModel.js';
import { User } from '../models/userModel.js';

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8000/api/gmail/callback'
);

router.get('/gmail-auth-url', async (req, res) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.readonly']
    });
    res.json({ url });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create auth URL' });
  }
});

router.get('/gmail/callback', async (req, res) => {
  try {
    const { code, userId = 'demo-user' } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    await User.updateOne({ userId }, { $set: { google: tokens } }, { upsert: true });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to exchange code' });
  }
});

router.get('/gmail-sync', async (req, res) => {
  try {
    const userId = req.query.userId || 'demo-user';
    const user = await User.findOne({ userId });
    if (!user?.google?.access_token) return res.status(400).json({ error: 'Gmail not connected' });

    oauth2Client.setCredentials(user.google);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Search for typical transaction emails (basic query for demo)
    const list = await gmail.users.messages.list({ userId: 'me', q: 'subject:(receipt OR payment OR invoice) newer_than:30d' });
    const messages = list.data.messages || [];

    const rawTexts = [];
    for (const m of messages.slice(0, 20)) {
      const msg = await gmail.users.messages.get({ userId: 'me', id: m.id, format: 'full' });
      const snippet = msg.data.snippet || '';
      rawTexts.push(snippet);
    }

    if (rawTexts.length === 0) return res.json({ ok: true, inserted: 0, transactions: [] });

    const aiTxns = await categorizeTransactionsWithAI(rawTexts);

    const docs = aiTxns.map(t => ({
      userId,
      vendor: t.vendor,
      category: t.category,
      amount: t.amount,
      date: t.date,
      type: t.type || 'expense',
      source: 'Gmail',
      paymentMethod: t.paymentMethod || 'Unknown',
      isRecurring: !!t.isRecurring,
      isUnused: !!t.isUnused,
      rawText: t.rawText
    }));

    const saved = await Transaction.insertMany(docs);
    res.json({ ok: true, inserted: saved.length, transactions: saved });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gmail sync failed' });
  }
});

export default router;
