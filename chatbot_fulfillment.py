"""
Chatbot Fulfillment Lambda - PFMS Hackathon MVP
Handles Amazon Lex chatbot queries
"""

import json
from datetime import datetime, timedelta
import boto3

dynamodb = boto3.resource('dynamodb')
transactions_table = dynamodb.Table('Transactions')
subscriptions_table = dynamodb.Table('Subscriptions')
rewards_table = dynamodb.Table('Rewards')

def lambda_handler(event, context):
    """Amazon Lex fulfillment handler"""
    
    intent_name = event['currentIntent']['name']
    slots = event['currentIntent']['slots']
    user_id = event['userId']
    
    if intent_name == 'SpendingQuery':
        return handle_spending_query(user_id, slots)
    elif intent_name == 'SubscriptionQuery':
        return handle_subscription_query(user_id, slots)
    elif intent_name == 'InvestmentQuery':
        return handle_investment_query(user_id, slots)
    elif intent_name == 'RewardQuery':
        return handle_reward_query(user_id, slots)
    else:
        return close(event, 'Fulfilled', 'I can help you with spending, subscriptions, investments, and rewards!')


def handle_spending_query(user_id, slots):
    """Handle spending-related queries"""
    time_period = slots.get('TimePeriod', 'today')
    category = slots.get('Category')
    
    # Get transactions
    response = transactions_table.query(
        KeyConditionExpression='userId = :uid',
        ExpressionAttributeValues={':uid': user_id}
    )
    transactions = response.get('Items', [])
    
    # Filter by time period
    filtered_txns = filter_by_time_period(transactions, time_period)
    
    # Filter by category if specified
    if category:
        filtered_txns = [t for t in filtered_txns if t.get('category', '').lower() == category.lower()]
    
    # Calculate total
    total = sum([t['amount'] for t in filtered_txns if t['type'] == 'expense'])
    
    # Build response
    if category:
        message = f"You spent ₹{total:.2f} on {category} {time_period}."
    else:
        message = f"You spent ₹{total:.2f} {time_period}."
    
    # Add breakdown
    if len(filtered_txns) > 0:
        top_merchants = {}
        for t in filtered_txns:
            merchant = t['merchant']
            top_merchants[merchant] = top_merchants.get(merchant, 0) + t['amount']
        
        top_3 = sorted(top_merchants.items(), key=lambda x: x[1], reverse=True)[:3]
        breakdown = ', '.join([f"{m}: ₹{a:.0f}" for m, a in top_3])
        message += f" Top expenses: {breakdown}."
    
    return close_with_message(message)


def handle_subscription_query(user_id, slots):
    """Handle subscription-related queries"""
    query_type = slots.get('QueryType', 'list')
    
    # Get subscriptions
    response = subscriptions_table.query(
        KeyConditionExpression='userId = :uid',
        ExpressionAttributeValues={':uid': user_id}
    )
    subscriptions = response.get('Items', [])
    
    if query_type == 'cancel' or 'cancel' in str(slots).lower():
        # Find unused subscriptions
        unused = [s for s in subscriptions if s.get('isUnused', False)]
        
        if unused:
            total_savings = sum([s['amount'] for s in unused])
            services = ', '.join([s['service'] for s in unused])
            message = f"You can cancel these unused subscriptions: {services}. "
            message += f"This will save you ₹{total_savings:.0f} per month! "
            message += "Would you like me to help you cancel them and earn reward points?"
        else:
            message = "Great news! You don't have any unused subscriptions. All your subscriptions seem active."
    
    else:
        # List all subscriptions
        if subscriptions:
            total_cost = sum([s['amount'] for s in subscriptions])
            services = ', '.join([f"{s['service']} (₹{s['amount']})" for s in subscriptions])
            message = f"You have {len(subscriptions)} active subscriptions: {services}. "
            message += f"Total monthly cost: ₹{total_cost:.0f}."
        else:
            message = "You don't have any recurring subscriptions tracked yet."
    
    return close_with_message(message)


def handle_investment_query(user_id, slots):
    """Handle investment recommendation queries"""
    savings_amount = slots.get('Amount')
    
    if not savings_amount:
        # Calculate potential savings from wasteful expenses
        response = transactions_table.query(
            KeyConditionExpression='userId = :uid',
            ExpressionAttributeValues={':uid': user_id}
        )
        transactions = response.get('Items', [])
        
        # Simple calculation: suggest 10% of monthly expenses
        monthly_expenses = sum([t['amount'] for t in transactions if t['type'] == 'expense'])
        savings_amount = monthly_expenses * 0.1
    else:
        savings_amount = float(savings_amount)
    
    # Generate recommendations
    recommendations = [
        {
            'name': 'Index Fund SIP',
            'risk': 'Medium',
            'return_12m': 10.7,
            'projected': savings_amount * 12 * 1.107,
            'points': int(savings_amount * 1.44)  # 12 months * 0.12
        },
        {
            'name': 'Digital Gold',
            'risk': 'Low',
            'return_12m': 5.7,
            'projected': savings_amount * 12 * 1.057,
            'points': int(savings_amount * 1.2)
        },
        {
            'name': 'High-Yield Savings',
            'risk': 'No Risk',
            'return_12m': 4.0,
            'projected': savings_amount * 12 * 1.04,
            'points': int(savings_amount * 1.0)
        }
    ]
    
    best = recommendations[0]
    
    message = f"If you save ₹{savings_amount:.0f} per month, I recommend investing in {best['name']}. "
    message += f"In 12 months, your ₹{savings_amount * 12:.0f} could grow to ₹{best['projected']:.0f} "
    message += f"(~{best['return_12m']}% return). "
    message += f"Plus, you'll earn {best['points']} reward points! "
    message += "Would you like to see other investment options?"
    
    return close_with_message(message)


def handle_reward_query(user_id, slots):
    """Handle reward points queries"""
    
    # Get user rewards
    response = rewards_table.query(
        KeyConditionExpression='userId = :uid',
        ExpressionAttributeValues={':uid': user_id}
    )
    rewards = response.get('Items', [])
    
    total_points = sum([r['points'] for r in rewards])
    
    # Determine tier
    if total_points >= 1500:
        tier = 'Gold'
    elif total_points >= 500:
        tier = 'Silver'
    else:
        tier = 'Bronze'
    
    message = f"You have {total_points} reward points and you're in the {tier} tier! "
    
    if rewards:
        recent = sorted(rewards, key=lambda x: x['timestamp'], reverse=True)[0]
        message += f"Your last reward: {recent['description']} (+{recent['points']} points). "
    
    # Suggest next action
    if total_points < 500:
        message += "Cancel an unused subscription to earn 50+ points and reach Silver tier!"
    elif total_points < 1500:
        message += "Invest your savings to earn bonus points and reach Gold tier!"
    else:
        message += "You're at the top tier! Keep up the great financial habits!"
    
    return close_with_message(message)


def filter_by_time_period(transactions, time_period):
    """Filter transactions by time period"""
    today = datetime.now()
    
    if time_period == 'today':
        start_date = today.replace(hour=0, minute=0, second=0)
    elif time_period == 'yesterday':
        start_date = (today - timedelta(days=1)).replace(hour=0, minute=0, second=0)
        today = start_date + timedelta(days=1)
    elif time_period == 'this week' or time_period == 'week':
        start_date = today - timedelta(days=7)
    elif time_period == 'this month' or time_period == 'month':
        start_date = today.replace(day=1, hour=0, minute=0, second=0)
    elif time_period == 'last month':
        last_month = today.replace(day=1) - timedelta(days=1)
        start_date = last_month.replace(day=1, hour=0, minute=0, second=0)
        today = today.replace(day=1, hour=0, minute=0, second=0)
    else:
        start_date = today - timedelta(days=30)
    
    filtered = []
    for t in transactions:
        txn_date = datetime.strptime(t['date'], '%Y-%m-%d')
        if start_date <= txn_date <= today:
            filtered.append(t)
    
    return filtered


def close_with_message(message):
    """Return Lex response with message"""
    return {
        'dialogAction': {
            'type': 'Close',
            'fulfillmentState': 'Fulfilled',
            'message': {
                'contentType': 'PlainText',
                'content': message
            }
        }
    }


# Example chatbot dialogs
EXAMPLE_DIALOGS = """
DIALOG 1: Investment Recommendation with Points

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
you'll earn 173 reward points and move closer to Gold tier! 
You're currently at 450 points (Silver tier). This investment will take you to 623 points!"


DIALOG 2: Subscription Cancellation with Rewards

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
Total reward: 180 points! 🏆

Your new total: 630 points (Silver tier, 870 points away from Gold)"

User: "What should I do with the ₹299 I'm saving?"

Bot: "Smart thinking! With ₹299/month saved, I recommend:
1. Digital Gold - Low risk, ₹3,790 in 12 months (+₹202 gain), 36 points/month
2. High-Yield Savings - No risk, ₹3,731 in 12 months (+₹143 gain), 30 points/month

If you invest in Digital Gold, you'll earn an extra 432 points over 12 months 
(20% investment bonus). That's 612 total points from this one action!"
"""
