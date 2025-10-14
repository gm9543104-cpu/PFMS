import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './services/db.js';

import csvRouter from './routes/csv.js';
import gmailRouter from './routes/gmail.js';
import chatRouter from './routes/chat.js';
import categorizeRouter from './routes/categorize.js';
import goalsRouter from './routes/goals.js';
import dashboardRouter from './routes/dashboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: (reqOrigin, cb) => {
  const allowed = (process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000']).map(s => s.trim());
  if (!reqOrigin || allowed.includes(reqOrigin)) return cb(null, true);
  return cb(null, false);
}, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// API routes
app.use('/api', csvRouter);
app.use('/api', gmailRouter);
app.use('/api', chatRouter);
app.use('/api', categorizeRouter);
app.use('/api', goalsRouter);
app.use('/api', dashboardRouter);

// Start server
(async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`[PFMS] Backend running on http://localhost:${PORT}`));
})();
