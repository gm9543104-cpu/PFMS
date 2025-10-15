# PFMS Backend (Node.js + Express + MongoDB)

Backend for PFMS with AI categorization (OpenRouter), Gmail sync, RAG chatbot, and dashboard analytics.

## Quickstart

1. Copy env
```bash
cp .env.example .env
```

2. Start MongoDB (local)
```bash
# ensure MongoDB is running locally on 27017
```

3. Install deps and run
```bash
npm install
npm run dev
```

Server runs at http://localhost:8000

## Endpoints

- POST /api/upload-csv (multipart/form-data: file, userId?)
- GET  /api/gmail-auth-url
- GET  /api/gmail-sync?userId=...
- POST /api/chat { userId, query }
- GET  /api/dashboard?userId=...
- GET  /api/goals?userId=...
- POST /api/goals { userId, name, type, target, deadline }
- PUT  /api/goals/:id { userId, ...fields }
- DELETE /api/goals/:id { userId }

## AI via OpenRouter
- Set OPENROUTER_API_KEY in .env
- Model: openai/gpt-4o-mini

## Gmail OAuth
- Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
- Visit GET /api/gmail-auth-url to connect

