import axios from 'axios';
import { z } from 'zod';

const CategorizedTransaction = z.object({
  vendor: z.string(),
  category: z.enum([
    'Food',
    'Travel',
    'Subscriptions',
    'Investments',
    'Bills',
    'Entertainment',
    'Income',
    'Shopping',
    'Transport',
    'Misc'
  ]).or(z.string()),
  amount: z.number(),
  date: z.string(),
  type: z.enum(['income', 'expense']).optional(),
  paymentMethod: z.string().optional(),
  source: z.string().optional(),
  isRecurring: z.boolean().optional(),
  isUnused: z.boolean().optional(),
  rawText: z.string().optional()
});

const CategorizationResponse = z.array(CategorizedTransaction);

const SYSTEM_PROMPT = `You are a financial intelligence engine. Categorize transactions by human intent (Food, Travel, Subscriptions, Investments, Bills, Entertainment, Income, Shopping, Transport, Misc). Detect vendor, date, amount, category, and purpose from messy text. Respond as JSON array of transactions.`;

export async function categorizeTransactionsWithAI(rawTexts) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY');

  const userContent = rawTexts.map(t => `- ${t}`).join('\n');

  const payload = {
    model: 'openai/gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2
  };

  const resp = await axios.post('https://openrouter.ai/api/v1/chat/completions', payload, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.OPENROUTER_REFERRER || 'http://localhost:8000',
      'X-Title': 'PFMS Backend'
    }
  });

  const text = resp?.data?.choices?.[0]?.message?.content || '[]';
  let parsed;
  try {
    parsed = JSON.parse(text);
    // If model returns object with key like transactions, unwrap
    if (parsed && !Array.isArray(parsed)) {
      const arr = parsed.transactions || parsed.items || parsed.data;
      parsed = Array.isArray(arr) ? arr : [];
    }
  } catch (e) {
    // Fallback simple extractor: try to find JSON array
    const match = text.match(/\[[\s\S]*\]/);
    parsed = match ? JSON.parse(match[0]) : [];
  }

  const result = CategorizationResponse.safeParse(parsed);
  if (!result.success) {
    throw new Error('AI categorization validation failed');
  }
  return result.data;
}
