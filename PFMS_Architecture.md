# PFMS Hackathon - AWS Architecture & Implementation Plan

## 🏗️ AWS Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│  React App (S3 + CloudFront) - Dashboard, Chatbot, Rewards      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (REST)                          │
│  /auth, /transactions, /subscriptions, /rewards, /chat          │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   COGNITO    │  │   LAMBDA     │  │   LEX BOT    │
│   (Auth)     │  │  Functions   │  │  (Chatbot)   │
└──────────────┘  └──────┬───────┘  └──────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  DynamoDB    │  │  SageMaker/  │  │   Gmail API  │
│  (Txns,      │  │  Comprehend  │  │   (OAuth2)   │
│   Rewards)   │  │  (AI Model)  │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

## 📊 Core Services

1. **Amazon Cognito** - User authentication & OAuth2 for Gmail
2. **API Gateway** - RESTful API endpoints
3. **AWS Lambda** - Serverless functions (Python 3.11)
4. **DynamoDB** - NoSQL database for transactions, subscriptions, rewards
5. **Amazon Comprehend** - AI categorization (or SageMaker for custom model)
6. **Amazon Lex** - Conversational chatbot
7. **S3 + CloudFront** - Host React frontend
8. **QuickSight** (optional) - Advanced analytics

## ⏱️ 2-Hour Hackathon Implementation Plan

### Hour 1: Backend Setup (60 min)

**0-15 min: AWS Setup**
- Create DynamoDB tables (transactions, subscriptions, users, rewards)
- Set up Cognito user pool
- Create IAM roles for Lambda

**15-30 min: Gmail Integration**
- Implement OAuth2 flow for Gmail
- Create Lambda function to fetch & parse emails
- Store transactions in DynamoDB

**30-45 min: AI Categorization & Subscription Detection**
- Implement rule-based categorization
- Add subscription detection logic
- Flag wasteful expenses

**45-60 min: Reward Points System**
- Implement points calculation logic
- Create reward tracking in DynamoDB
- Add investment recommendation engine

### Hour 2: Frontend & Integration (60 min)

**60-75 min: React Dashboard**
- Build dashboard with Chart.js
- Display transactions, categories, trends
- Show subscription heatmap

**75-90 min: Gamification UI**
- Reward points display
- Badges/milestones
- Investment projections widget

**90-105 min: Chatbot Integration**
- Integrate Lex chatbot UI
- Connect to Lambda fulfillment
- Test natural language queries

**105-120 min: Testing & Demo**
- Load sample data (30 transactions)
- Test reward flows
- Prepare demo script

## 🎯 MVP Features Priority

### MUST HAVE (Implement)
✅ Gmail OAuth & transaction parsing
✅ AI categorization (rule-based)
✅ Subscription detection
✅ Reward points system
✅ Basic dashboard
✅ Simple chatbot

### NICE TO HAVE (Mock/Simulate)
🔲 Live investment pricing (use static data)
🔲 Real-time Gmail sync (batch process)
🔲 Advanced ML model (use rules + Comprehend)
🔲 Leaderboard (show static example)

## 💾 DynamoDB Data Models

### Table 1: Users
```json
{
  "userId": "user123",
  "email": "user@example.com",
  "gmailConnected": true,
  "totalPoints": 450,
  "tier": "Silver",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### Table 2: Transactions
```json
{
  "transactionId": "txn_001",
  "userId": "user123",
  "date": "2024-01-10",
  "amount": 599,
  "merchant": "Netflix",
  "category": "Entertainment",
  "paymentMethod": "Credit Card",
  "isRecurring": true,
  "isWasteful": false,
  "source": "Gmail"
}
```

### Table 3: Subscriptions
```json
{
  "subscriptionId": "sub_001",
  "userId": "user123",
  "service": "Netflix",
  "amount": 599,
  "frequency": "monthly",
  "lastCharged": "2024-01-10",
  "status": "active",
  "isUnused": false,
  "cancelSavings": 7188
}
```

### Table 4: Rewards
```json
{
  "rewardId": "rwd_001",
  "userId": "user123",
  "action": "cancel_subscription",
  "points": 50,
  "description": "Canceled Netflix subscription",
  "timestamp": "2024-01-15T14:30:00Z"
}
```

### Table 5: Goals
```json
{
  "goalId": "goal_001",
  "userId": "user123",
  "type": "savings",
  "target": 10000,
  "current": 3500,
  "deadline": "2024-06-30",
  "status": "in_progress"
}
```

## 🔐 Security & Privacy

1. **Gmail OAuth Scopes** - Request minimal: `gmail.readonly`
2. **Data Encryption** - Enable DynamoDB encryption at rest
3. **API Security** - Use Cognito authorizers on API Gateway
4. **Consent UI** - Clear explanation before Gmail access
5. **Data Retention** - Auto-delete emails after parsing
6. **PII Protection** - Hash sensitive merchant data

## 🎮 Gamification - Reward Points Logic

### Points Calculation

**Cancel Subscription:**
```python
points = 50 + (monthly_cost / 10)  # Base 50 + cost factor
```

**Meet Savings Target:**
```python
savings_percent = (saved / budget) * 100
points = savings_percent * 10  # 10% saved = 100 points
```

**Invest Saved Amount:**
```python
investment_points = savings_points * 1.2  # 20% bonus
```

### Tier System
- **Bronze**: 0-500 points
- **Silver**: 501-1500 points
- **Gold**: 1501+ points

### Badges
- 🎯 First Subscription Canceled
- 💰 First Investment Made
- 🏆 Saved 10% of Budget
- 🔥 7-Day Streak

## 📈 Investment Recommendations

### Projected Returns Widget
```
Saved Amount: ₹1200/month

Option 1: Gold Digital (Low Risk)
- 6 months: ₹7,440 → ₹7,740 (+4%)
- 12 months: ₹14,880 → ₹15,730 (+5.7%)
- Reward Points: +144 points

Option 2: Index Fund SIP (Medium Risk)
- 6 months: ₹7,440 → ₹7,890 (+6%)
- 12 months: ₹14,880 → ₹16,470 (+10.7%)
- Reward Points: +180 points

Option 3: High-Yield Savings (No Risk)
- 6 months: ₹7,440 → ₹7,590 (+2%)
- 12 months: ₹14,880 → ₹15,480 (+4%)
- Reward Points: +120 points
```

## 🧪 Sample Test Data (30 Transactions)

See `sample_transactions.json` for complete dataset including:
- 5 recurring subscriptions (Netflix, Spotify, Amazon Prime, Gym, Hotstar)
- 2 unused subscriptions (Hotstar, Gym)
- 10 food transactions
- 5 shopping transactions
- 3 bill payments
- 5 entertainment expenses
