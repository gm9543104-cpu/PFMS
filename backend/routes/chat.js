import express from 'express';
import { ragChat } from '../services/ragChat.js';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { userId = 'demo-user', query } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });

    const result = await ragChat({ userId, query });
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Chat failed' });
  }
});

export default router;
