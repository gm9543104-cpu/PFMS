import dayjs from 'dayjs';
import { Transaction } from '../models/transactionModel.js';
import { Goal } from '../models/goalModel.js';
import axios from 'axios';

const SYSTEM_PROMPT = `You are Fin, a helpful finance assistant.
Use the user's transactions and goals provided in context to answer concisely.
If the user asks to remove, add, or update data, you MUST include a single JSON object on a separate line containing an action plan with this exact shape:
{
  "action": "remove" | "add_goal" | "update_goal",
  "target": "transactions" | "goal",
  "details": {
    // for remove: one or more of vendor, category, transactionIds[], dateRange: "last_week"|"last_month"|"all"
    // for add_goal: name, type: "savings"|"budget", target: number, deadline?: "YYYY-MM-DD"
    // for update_goal: id? or name, fields: { target?, current?, status?, deadline? }
  }
}
Write your normal answer first, then the JSON on a new line. If no action is needed, omit the JSON.`;

async function callOpenRouter(messages) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY');
  const resp = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
    model: 'openai/gpt-4o-mini',
    messages,
    temperature: 0.2
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.OPENROUTER_REFERRER || 'http://localhost:8000',
      'X-Title': 'PFMS Backend'
    }
  });
  return resp?.data?.choices?.[0]?.message?.content || '';
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function scoreTransactionAgainstQuery(t, queryTokens) {
  const fields = [t.vendor, t.category, t.rawText, t.paymentMethod].join(' ');
  const txTokens = new Set(tokenize(fields));
  let score = 0;
  for (const qt of queryTokens) if (txTokens.has(qt)) score += 1;
  return score;
}

function buildContext(transactions, goals, query) {
  const last30 = transactions.filter(t => dayjs().diff(dayjs(t.date), 'day') <= 30 && !t.softDeleted);
  const byCategory = last30.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount * (t.type === 'income' ? -1 : 1);
    return acc;
  }, {});
  const topVendors = Object.entries(last30.reduce((acc, t) => {
    acc[t.vendor] = (acc[t.vendor] || 0) + t.amount;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const queryTokens = tokenize(query);
  const scored = last30
    .map(t => ({ t, s: scoreTransactionAgainstQuery(t, queryTokens) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 25)
    .map(x => x.t);
  return {
    summary: { byCategory, topVendors },
    relevantTransactions: scored,
    goals: goals.map(g => ({ name: g.name, type: g.type, target: g.target, current: g.current, status: g.status }))
  };
}

function detectCrudIntents(text) {
  const lowered = text.toLowerCase();
  if (lowered.includes('remove') || lowered.includes('delete')) return 'remove';
  if (lowered.includes('add goal') || lowered.includes('create goal')) return 'add_goal';
  if (lowered.includes('update goal') || lowered.includes('edit goal')) return 'update_goal';
  return null;
}

export async function ragChat({ userId, query }) {
  const transactions = await Transaction.find({ userId, softDeleted: false }).limit(1000).lean();
  const goals = await Goal.find({ userId }).limit(100).lean();
  const context = buildContext(transactions, goals, query);

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Context JSON:\n${JSON.stringify(context)}\n\nUser Query: ${query}` }
  ];

  const reply = await callOpenRouter(messages);

  // Try to detect structured action
  try {
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const actionObj = JSON.parse(jsonMatch[0]);
      return { reply, action: actionObj };
    }
  } catch (_) {}

  const intent = detectCrudIntents(query);
  return { reply, action: intent ? { action: intent } : null };
}
