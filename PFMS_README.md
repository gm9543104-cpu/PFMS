# 🏆 PFMS - Personal Finance Management System
## AI-Powered Hackathon MVP with Gamification

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Quick Start](#quick-start)
5. [File Structure](#file-structure)
6. [Implementation Guide](#implementation-guide)
7. [API Documentation](#api-documentation)
8. [Gamification System](#gamification-system)
9. [Security & Privacy](#security--privacy)
10. [Demo Data](#demo-data)

---

## 🎯 Overview

PFMS is a complete AI-powered Personal Finance Management System built for hackathons. It features:
- **Gmail Integration** via OAuth2
- **AI Transaction Categorization** using AWS Comprehend
- **Subscription Detection** with wasteful expense flagging
- **Investment Recommendations** with projected returns
- **Gamification System** with reward points, badges, and tiers
- **Conversational AI Chatbot** for natural language queries

---

## ✨ Features

### Core Features
✅ **Gmail OAuth2 Integration** - Securely fetch transaction emails  
✅ **Smart Transaction Parsing** - Extract date, amount, merchant, payment method  
✅ **AI Categorization** - Auto-categorize into Food, Bills, Entertainment, Shopping, etc.  
✅ **Subscription Detection** - Identify recurring payments  
✅ **Wasteful Expense Detection** - Flag unused subscriptions, gambling apps, repeated small expenses  
✅ **Investment Recommendations** - Suggest Gold, SIPs, Mutual Funds with risk/return analysis  
✅ **Interactive Dashboard** - Spend-by-category, trends, subscription heatmap  
✅ **AI Chatbot** - Natural language queries powered by Amazon Lex  

### Gamification Features
🏆 **Reward Points System**
- Cancel subscription → +50 points + cost bonus
- Save >10% of budget → +100 points (proportional)
- Invest savings → +20% bonus points

🎖️ **Badges & Achievements**
- 🎯 Subscription Slayer
- 💰 Smart Investor
- 🏆 10% Saver
- 🔥 7-Day Streak

🥇 **Tier System**
- Bronze: 0-500 points
- Silver: 501-1500 points
- Gold: 1501+ points

📊 **Projected Returns Widget**
- Shows 6/12-month projections for each investment
- Displays reward points earned per investment
- Compares risk vs return

---

## 🏗️ Architecture

### AWS Services Used

```
Frontend (S3 + CloudFront)
    ↓
API Gateway
    ↓
    ├── Lambda (Gmail Integration)
    ├── Lambda (AI Categorization)
    ├── Lambda (Reward System)
    └── Lambda (Chatbot Fulfillment)
    ↓
    ├── DynamoDB (Transactions, Subscriptions, Rewards)
    ├── Amazon Comprehend (AI Categorization)
    ├── Amazon Lex (Chatbot)
    └── Cognito (Authentication)
```

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript, Chart.js
- **Backend**: Python 3.11, AWS Lambda
- **Database**: DynamoDB
- **AI/ML**: Amazon Comprehend, Amazon Lex
- **Auth**: Amazon Cognito, Gmail OAuth2
- **Hosting**: S3 + CloudFront

---

## 🚀 Quick Start

### Option 1: Run Locally (Instant)

1. **Open the HTML file**
   ```bash
   # Just double-click this file:
   PFMS_Hackathon.html
   ```

2. **Login**
   - Email: `demo@pfms.com`
   - Password: `demo123`
   - OR click "Continue with Gmail"

3. **Explore Features**
   - Dashboard: View transactions and stats
   - Analytics: See spending charts
   - Subscriptions: Manage and cancel subscriptions
   - Investments: View recommendations
   - Rewards: Track points and badges
   - AI Assistant: Ask natural language questions

### Option 2: Deploy to AWS (2-Hour Hackathon)

See [Implementation Guide](#implementation-guide) below.

---

## 📁 File Structure

```
PFMS_Hackathon/
├── PFMS_Hackathon.html          # Main frontend application
├── pfms_app.js                  # JavaScript application logic
├── PFMS_Architecture.md         # AWS architecture documentation
├── gmail_integration.py         # Gmail OAuth2 & email parsing
├── ai_categorization.py         # AI categorization & subscription detection
├── reward_system.py             # Gamification & reward points logic
├── chatbot_fulfillment.py       # Amazon Lex chatbot handler
├── sample_transactions.json     # Demo data (30 transactions)
└── PFMS_README.md              # This file
```

---

## 🛠️ Implementation Guide

### 2-Hour Hackathon Timeline

#### **Hour 1: Backend Setup (60 min)**

**0-15 min: AWS Infrastructure**
```bash
# Create DynamoDB tables
aws dynamodb create-table \
  --table-name Transactions \
  --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=transactionId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH AttributeName=transactionId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

aws dynamodb create-table \
  --table-name Subscriptions \
  --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=subscriptionId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH AttributeName=subscriptionId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

aws dynamodb create-table \
  --table-name Rewards \
  --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=rewardId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH AttributeName=rewardId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

# Create Cognito User Pool
aws cognito-idp create-user-pool --pool-name PFMS-Users
```

**15-30 min: Gmail Integration**
```bash
# Deploy Lambda function
cd lambda_functions
zip -r gmail_integration.zip gmail_integration.py
aws lambda create-function \
  --function-name PFMS-GmailIntegration \
  --runtime python3.11 \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-execution-role \
  --handler gmail_integration.lambda_handler \
  --zip-file fileb://gmail_integration.zip
```

**30-45 min: AI Categorization**
```bash
# Deploy categorization Lambda
zip -r ai_categorization.zip ai_categorization.py
aws lambda create-function \
  --function-name PFMS-AICategorization \
  --runtime python3.11 \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-execution-role \
  --handler ai_categorization.lambda_handler \
  --zip-file fileb://ai_categorization.zip
```

**45-60 min: Reward System**
```bash
# Deploy reward system Lambda
zip -r reward_system.zip reward_system.py
aws lambda create-function \
  --function-name PFMS-RewardSystem \
  --runtime python3.11 \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-execution-role \
  --handler reward_system.lambda_handler \
  --zip-file fileb://reward_system.zip
```

#### **Hour 2: Frontend & Integration (60 min)**

**60-75 min: Deploy Frontend**
```bash
# Upload to S3
aws s3 mb s3://pfms-frontend
aws s3 cp PFMS_Hackathon.html s3://pfms-frontend/index.html
aws s3 cp pfms_app.js s3://pfms-frontend/pfms_app.js

# Enable static website hosting
aws s3 website s3://pfms-frontend --index-document index.html
```

**75-90 min: API Gateway Setup**
```bash
# Create REST API
aws apigateway create-rest-api --name PFMS-API

# Create resources and methods
# /transactions, /subscriptions, /rewards, /chat
```

**90-105 min: Chatbot Integration**
```bash
# Create Lex bot
aws lex-models put-bot \
  --name PFMS-Assistant \
  --locale en-US \
  --child-directed false

# Deploy fulfillment Lambda
zip -r chatbot_fulfillment.zip chatbot_fulfillment.py
aws lambda create-function \
  --function-name PFMS-ChatbotFulfillment \
  --runtime python3.11 \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-execution-role \
  --handler chatbot_fulfillment.lambda_handler \
  --zip-file fileb://chatbot_fulfillment.zip
```

**105-120 min: Testing & Demo**
```bash
# Load sample data
aws dynamodb batch-write-item --request-items file://sample_transactions.json

# Test endpoints
curl -X POST https://API_ID.execute-api.region.amazonaws.com/prod/transactions

# Prepare demo script
```

---

## 📡 API Documentation

### Endpoints

#### 1. Gmail Integration
```http
POST /auth/gmail
Content-Type: application/json

{
  "userId": "user123",
  "authCode": "gmail_auth_code"
}

Response:
{
  "statusCode": 200,
  "message": "Fetched 50 transactions",
  "transactions": [...]
}
```

#### 2. Get Transactions
```http
GET /transactions?userId=user123

Response:
{
  "transactions": [...],
  "total": 30
}
```

#### 3. Categorize Transactions
```http
POST /categorize
Content-Type: application/json

{
  "transactions": [...]
}

Response:
{
  "categorized": [...],
  "subscriptions": [...],
  "wasteful_expenses": [...],
  "potential_savings": 2315
}
```

#### 4. Get Investment Recommendations
```http
GET /investments?savings=2315

Response:
{
  "recommendations": [
    {
      "option": "Index Fund SIP",
      "risk": "Medium",
      "projected_12m": 30752,
      "points": 278
    }
  ]
}
```

#### 5. Award Reward Points
```http
POST /rewards
Content-Type: application/json

{
  "userId": "user123",
  "action": "cancel_subscription",
  "metadata": {
    "subscription_name": "Netflix",
    "monthly_cost": 599
  }
}

Response:
{
  "reward": {
    "points": 109,
    "description": "Canceled Netflix subscription"
  }
}
```

#### 6. Chatbot Query
```http
POST /chat
Content-Type: application/json

{
  "userId": "user123",
  "query": "How much did I spend yesterday?"
}

Response:
{
  "response": "Yesterday you spent ₹1,250 across 5 transactions."
}
```

---

## 🎮 Gamification System

### Points Calculation

#### Cancel Subscription
```python
points = 50 + (monthly_cost / 10)

# Example: Cancel Netflix (₹599)
points = 50 + (599 / 10) = 109 points
```

#### Meet Savings Target
```python
savings_percent = (saved / budget) * 100
points = savings_percent * 10

# Example: Save ₹3000 from ₹20000 budget (15%)
points = 15 * 10 = 150 points
```

#### Invest Savings
```python
base_points = investment_amount / 10
investment_points = base_points * 1.2  # 20% bonus

# Example: Invest ₹3000
base_points = 3000 / 10 = 300
investment_points = 300 * 1.2 = 360 points
```

### Tier Progression

| Tier | Points Required | Benefits |
|------|----------------|----------|
| Bronze | 0-500 | Basic features |
| Silver | 501-1500 | Priority support, exclusive tips |
| Gold | 1501+ | Premium features, personalized advice |

### Badges

| Badge | Criteria | Points Bonus |
|-------|----------|--------------|
| 🎯 Subscription Slayer | Cancel first subscription | +100 |
| 💰 Smart Investor | Make first investment | +150 |
| 🏆 10% Saver | Save 10% of budget | +100 |
| 🔥 7-Day Streak | Track expenses for 7 days | +25 |

---

## 🔐 Security & Privacy

### Gmail OAuth2
- **Minimal Scopes**: Only `gmail.readonly`
- **Token Storage**: Encrypted in DynamoDB
- **Auto-Expiry**: Tokens expire after 1 hour
- **Refresh Tokens**: Securely stored and rotated

### Data Encryption
- **At Rest**: DynamoDB encryption enabled
- **In Transit**: TLS 1.3 for all API calls
- **PII Protection**: Hash sensitive merchant data

### Consent & Transparency
```javascript
// Consent UI before Gmail access
const consentMessage = `
PFMS will access your Gmail to:
✓ Read transaction emails only
✓ Parse payment information
✓ Auto-categorize expenses

We will NOT:
✗ Read personal emails
✗ Send emails on your behalf
✗ Share data with third parties
`;
```

### Data Retention
- **Emails**: Deleted immediately after parsing
- **Transactions**: Retained for 2 years
- **User Data**: Deleted on account closure

---

## 🧪 Demo Data

### Sample Transactions (30 items)
- **Income**: 1 salary deposit (₹50,000)
- **Subscriptions**: 6 recurring (Netflix, Spotify, Gym, Hotstar, Amazon Prime, Jio Fiber)
- **Food**: 9 transactions (Swiggy, Zomato, Starbucks, McDonald's, etc.)
- **Shopping**: 5 transactions (Amazon, Flipkart, Myntra, etc.)
- **Transport**: 5 transactions (Uber, Ola, Rapido)
- **Bills**: 4 transactions (Electricity, Airtel, Jio Fiber)

### Wasteful Expenses Detected
1. **Gym Membership** (₹1,500/month) - No usage
2. **Hotstar** (₹299/month) - No streaming activity
3. **Coffee/Snacks** (₹1,720 total) - 9 small purchases

### Potential Monthly Savings: ₹2,315

### Investment Recommendations
1. **Index Fund SIP** - ₹30,752 in 12 months (+10.7%), 278 points
2. **Digital Gold** - ₹29,363 in 12 months (+5.7%), 231 points
3. **High-Yield Savings** - ₹28,891 in 12 months (+4%), 193 points

---

## 💬 Example Chatbot Dialogs

### Dialog 1: Investment Recommendation
```
User: "If I save ₹1200, where should I invest it?"

Bot: "If you save ₹1200 per month, I recommend investing in Index Fund SIP. 
In 12 months, your ₹14,400 could grow to ₹15,943 (~10.7% return). 
Plus, you'll earn 173 reward points! Would you like to see other investment options?"

User: "Yes, show me other options"

Bot: "Here are your options:
1. Index Fund SIP (Medium Risk): ₹15,943 in 12 months, 173 points
2. Digital Gold (Low Risk): ₹15,221 in 12 months, 144 points  
3. High-Yield Savings (No Risk): ₹14,976 in 12 months, 120 points

Which one interests you?"

User: "I'll go with Index Fund"

Bot: "Excellent choice! 🎉 I've noted your investment plan. Once you start your SIP, 
you'll earn 173 reward points and move closer to Gold tier!"
```

### Dialog 2: Subscription Cancellation
```
User: "Which subscriptions can I cancel?"

Bot: "You can cancel these unused subscriptions: Hotstar, Gym Membership. 
This will save you ₹1,799 per month! Would you like me to help you cancel them 
and earn reward points?"

User: "Yes, cancel Hotstar"

Bot: "Great decision! 🎯 By canceling Hotstar (₹299/month), you'll:
- Save ₹3,588 per year
- Earn 80 reward points (50 base + 30 cost bonus)
- Unlock the 'Subscription Slayer' badge!

This is your first subscription cancellation, so you get a bonus 100 points!
Total reward: 180 points! 🏆"
```

---

## 🎯 MVP vs Full Features

### MUST HAVE (Implemented)
✅ Gmail OAuth & transaction parsing  
✅ AI categorization (rule-based + Comprehend)  
✅ Subscription detection  
✅ Wasteful expense flagging  
✅ Investment recommendations  
✅ Reward points system  
✅ Dashboard with charts  
✅ AI chatbot  

### NICE TO HAVE (Mock/Future)
🔲 Live investment pricing (use static data)  
🔲 Real-time Gmail sync (batch process)  
🔲 Advanced ML model (use rules + Comprehend)  
🔲 Leaderboard (show static example)  
🔲 Push notifications  
🔲 Mobile app  

---

## 📊 Success Metrics

### Demo Metrics
- **30 transactions** processed
- **6 subscriptions** detected
- **3 wasteful expenses** flagged
- **₹2,315** potential monthly savings
- **3 investment options** recommended
- **200 reward points** earned
- **2 badges** unlocked

---

## 🏆 Hackathon Presentation Tips

### 1-Minute Pitch
"PFMS is an AI-powered personal finance app that connects to your Gmail, automatically categorizes transactions, detects wasteful subscriptions, and recommends profitable investments. With gamification, users earn reward points for smart financial decisions. We've processed 30 transactions, detected ₹2,315 in monthly savings, and awarded 200 points!"

### Demo Flow (5 minutes)
1. **Login** (30 sec) - Show Gmail OAuth
2. **Dashboard** (1 min) - Highlight 30 transactions, charts
3. **Subscriptions** (1 min) - Show wasteful expenses, cancel one
4. **Investments** (1 min) - Display recommendations with projections
5. **Rewards** (1 min) - Show points earned, badges, tier
6. **Chatbot** (30 sec) - Ask "Where should I invest my savings?"

### Key Differentiators
✨ **Gmail Integration** - Real transaction data  
✨ **AI Categorization** - Smart expense tracking  
✨ **Gamification** - Motivates financial discipline  
✨ **Investment Recommendations** - Actionable insights  
✨ **Conversational AI** - Natural language queries  

---

## 📞 Support & Resources

### Documentation
- AWS Lambda: https://docs.aws.amazon.com/lambda/
- Amazon Lex: https://docs.aws.amazon.com/lex/
- Gmail API: https://developers.google.com/gmail/api

### Sample Code
All Python Lambda functions are included in this package.

### Questions?
Check the code comments for detailed explanations.

---

## 🎉 Congratulations!

You now have a complete AI-powered Personal Finance Management System with gamification ready for your hackathon demo!

**Good luck! 🚀**
