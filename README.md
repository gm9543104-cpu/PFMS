# PFMS Intelligent System

This repo contains a static frontend prototype (`PFMS_Hackathon.html` + `pfms_app.js`) and a production-ready backend (`/backend`) with AI-powered categorization, Gmail sync, dashboard analytics, and a RAG-based chatbot.

## Setup

Frontend runs as a static file. Backend runs at http://localhost:8000.

### Backend
1. cd backend
2. cp .env.example .env
3. Fill `OPENROUTER_API_KEY`, and optional Google OAuth keys.
4. Ensure MongoDB is running (local or Atlas). Update `MONGODB_URI` if needed.
5. npm install
6. npm run dev

### Frontend
Open `PFMS_Hackathon.html` in a browser. The script will call backend endpoints automatically to populate data. If backend is down, it falls back to bundled sample data.

## Key Endpoints
- POST /api/upload-csv (multipart: file)
- GET /api/gmail-auth-url
- GET /api/gmail-sync?userId=demo-user
- POST /api/chat { userId, query }
- GET /api/dashboard?userId=demo-user

## Environment
- `.env.example` provided under `/backend` (includes `OPENROUTER_API_KEY`)

## Sample AI categorization response
```json
[
  { "vendor": "Zomato", "category": "Food", "amount": 540, "date": "2025-10-12" },
  { "vendor": "Uber", "category": "Travel", "amount": 230, "date": "2025-10-13" }
]
```
