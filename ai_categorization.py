"""
AI Categorization & Subscription Detection - PFMS Hackathon MVP
Uses rule-based + AWS Comprehend for transaction categorization
"""

import json
import re
from datetime import datetime, timedelta
import boto3

class TransactionCategorizer:
    def __init__(self):
        self.comprehend = boto3.client('comprehend')
        
        # Category keywords
        self.category_rules = {
            'Food': ['swiggy', 'zomato', 'restaurant', 'cafe', 'starbucks', 'mcdonald', 
                     'domino', 'kfc', 'pizza', 'burger', 'food', 'dining', 'subway'],
            'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'shopping',
                        'mall', 'store', 'retail', 'bigbasket', 'grocery'],
            'Transport': ['uber', 'ola', 'rapido', 'metro', 'petrol', 'fuel', 'parking',
                         'toll', 'cab', 'taxi', 'bus', 'train'],
            'Bills': ['electricity', 'water', 'gas', 'bill', 'recharge', 'airtel', 'jio',
                     'vodafone', 'broadband', 'internet', 'mobile'],
            'Entertainment': ['netflix', 'amazon prime', 'hotstar', 'spotify', 'youtube',
                            'bookmyshow', 'movie', 'cinema', 'concert', 'game'],
            'Subscriptions': ['subscription', 'membership', 'premium', 'pro', 'plus'],
            'Investments': ['mutual fund', 'sip', 'stock', 'gold', 'fd', 'investment',
                           'zerodha', 'groww', 'upstox'],
            'Healthcare': ['hospital', 'pharmacy', 'medicine', 'doctor', 'clinic', 'health'],
            'Education': ['course', 'udemy', 'coursera', 'book', 'tuition', 'school']
        }
        
        # Subscription services
        self.subscription_services = {
            'netflix': {'amount': 599, 'frequency': 'monthly'},
            'amazon prime': {'amount': 1499, 'frequency': 'yearly'},
            'hotstar': {'amount': 299, 'frequency': 'monthly'},
            'spotify': {'amount': 119, 'frequency': 'monthly'},
            'youtube premium': {'amount': 129, 'frequency': 'monthly'},
            'gym': {'amount': 1500, 'frequency': 'monthly'},
            'newspaper': {'amount': 300, 'frequency': 'monthly'}
        }
    
    def categorize_transaction(self, transaction):
        """Categorize transaction using rules + AI"""
        merchant = transaction.get('merchant', '').lower()
        description = transaction.get('rawSubject', '').lower()
        
        # Rule-based categorization
        for category, keywords in self.category_rules.items():
            if any(keyword in merchant or keyword in description for keyword in keywords):
                transaction['category'] = category
                return transaction
        
        # Use AWS Comprehend for unknown categories
        try:
            text = f"{merchant} {description}"
            response = self.comprehend.detect_entities(
                Text=text,
                LanguageCode='en'
            )
            
            # Simple entity-based categorization
            entities = [e['Type'] for e in response['Entities']]
            if 'ORGANIZATION' in entities:
                transaction['category'] = 'Shopping'
            else:
                transaction['category'] = 'Others'
        except:
            transaction['category'] = 'Others'
        
        return transaction
    
    def detect_subscription(self, transactions):
        """Detect recurring subscriptions from transaction history"""
        subscriptions = []
        
        # Group by merchant
        merchant_txns = {}
        for txn in transactions:
            merchant = txn['merchant'].lower()
            if merchant not in merchant_txns:
                merchant_txns[merchant] = []
            merchant_txns[merchant].append(txn)
        
        # Detect recurring patterns
        for merchant, txns in merchant_txns.items():
            if len(txns) >= 2:
                # Sort by date
                txns_sorted = sorted(txns, key=lambda x: x['date'])
                
                # Check if amounts are similar
                amounts = [t['amount'] for t in txns_sorted]
                avg_amount = sum(amounts) / len(amounts)
                
                # Check if dates are regular
                dates = [datetime.strptime(t['date'], '%Y-%m-%d') for t in txns_sorted]
                intervals = [(dates[i+1] - dates[i]).days for i in range(len(dates)-1)]
                
                # Monthly subscription (25-35 days interval)
                if all(25 <= interval <= 35 for interval in intervals):
                    subscription = {
                        'service': txns_sorted[0]['merchant'],
                        'amount': avg_amount,
                        'frequency': 'monthly',
                        'lastCharged': txns_sorted[-1]['date'],
                        'status': 'active',
                        'transactionCount': len(txns)
                    }
                    subscriptions.append(subscription)
        
        return subscriptions
    
    def detect_wasteful_expenses(self, transactions, subscriptions):
        """Flag unnecessary/wasteful expenses"""
        wasteful = []
        
        # Check for unused subscriptions (no usage pattern)
        for sub in subscriptions:
            service = sub['service'].lower()
            
            # Gym membership with no other fitness expenses
            if 'gym' in service:
                fitness_txns = [t for t in transactions 
                               if any(w in t['merchant'].lower() 
                                     for w in ['gym', 'fitness', 'yoga', 'sports'])]
                if len(fitness_txns) <= 2:  # Only subscription charges
                    wasteful.append({
                        'type': 'unused_subscription',
                        'service': sub['service'],
                        'amount': sub['amount'],
                        'reason': 'Gym membership with no usage',
                        'monthlySavings': sub['amount']
                    })
            
            # Streaming services with multiple subscriptions
            streaming = ['netflix', 'hotstar', 'amazon prime', 'youtube']
            user_streaming = [s for s in subscriptions 
                            if any(st in s['service'].lower() for st in streaming)]
            if len(user_streaming) > 2:
                wasteful.append({
                    'type': 'duplicate_subscription',
                    'service': ', '.join([s['service'] for s in user_streaming]),
                    'amount': sum([s['amount'] for s in user_streaming]),
                    'reason': f'Multiple streaming subscriptions ({len(user_streaming)})',
                    'monthlySavings': min([s['amount'] for s in user_streaming])
                })
        
        # Small repeated expenses (coffee, snacks)
        small_expenses = [t for t in transactions 
                         if t['amount'] < 200 and t['category'] == 'Food']
        if len(small_expenses) > 20:  # More than 20 small food expenses
            total = sum([t['amount'] for t in small_expenses])
            wasteful.append({
                'type': 'small_repeated_expenses',
                'service': 'Small food purchases',
                'amount': total,
                'reason': f'{len(small_expenses)} small food expenses',
                'monthlySavings': total * 0.3  # Suggest 30% reduction
            })
        
        # Gambling/betting apps
        gambling_keywords = ['dream11', 'mpl', 'paytm first games', 'bet', 'casino']
        gambling_txns = [t for t in transactions 
                        if any(g in t['merchant'].lower() for g in gambling_keywords)]
        if gambling_txns:
            total = sum([t['amount'] for t in gambling_txns])
            wasteful.append({
                'type': 'gambling',
                'service': 'Gaming/Betting apps',
                'amount': total,
                'reason': f'{len(gambling_txns)} gambling transactions',
                'monthlySavings': total
            })
        
        return wasteful


class InvestmentRecommender:
    def __init__(self):
        self.investment_options = {
            'gold_digital': {
                'name': 'Digital Gold',
                'risk': 'Low',
                'return_6m': 0.04,
                'return_12m': 0.057,
                'min_investment': 100
            },
            'index_fund': {
                'name': 'Index Fund SIP',
                'risk': 'Medium',
                'return_6m': 0.06,
                'return_12m': 0.107,
                'min_investment': 500
            },
            'high_yield_savings': {
                'name': 'High-Yield Savings',
                'risk': 'No Risk',
                'return_6m': 0.02,
                'return_12m': 0.04,
                'min_investment': 1000
            },
            'debt_fund': {
                'name': 'Debt Mutual Fund',
                'risk': 'Low',
                'return_6m': 0.035,
                'return_12m': 0.065,
                'min_investment': 1000
            }
        }
    
    def recommend_investments(self, monthly_savings):
        """Recommend investment options based on savings"""
        recommendations = []
        
        for key, option in self.investment_options.items():
            if monthly_savings >= option['min_investment']:
                # Calculate projections
                amount_6m = monthly_savings * 6
                amount_12m = monthly_savings * 12
                
                projected_6m = amount_6m * (1 + option['return_6m'])
                projected_12m = amount_12m * (1 + option['return_12m'])
                
                gain_6m = projected_6m - amount_6m
                gain_12m = projected_12m - amount_12m
                
                recommendations.append({
                    'option': option['name'],
                    'risk': option['risk'],
                    'monthly_investment': monthly_savings,
                    'projections': {
                        '6_months': {
                            'invested': amount_6m,
                            'projected': round(projected_6m, 2),
                            'gain': round(gain_6m, 2),
                            'return_percent': round(option['return_6m'] * 100, 1)
                        },
                        '12_months': {
                            'invested': amount_12m,
                            'projected': round(projected_12m, 2),
                            'gain': round(gain_12m, 2),
                            'return_percent': round(option['return_12m'] * 100, 1)
                        }
                    },
                    'reward_points': int(monthly_savings * 0.12)  # 12% of savings as points
                })
        
        return sorted(recommendations, key=lambda x: x['projections']['12_months']['gain'], reverse=True)


# Lambda handler
def lambda_handler(event, context):
    """AWS Lambda for categorization and subscription detection"""
    
    transactions = event.get('transactions', [])
    
    categorizer = TransactionCategorizer()
    
    # Categorize all transactions
    categorized = [categorizer.categorize_transaction(t) for t in transactions]
    
    # Detect subscriptions
    subscriptions = categorizer.detect_subscription(categorized)
    
    # Detect wasteful expenses
    wasteful = categorizer.detect_wasteful_expenses(categorized, subscriptions)
    
    # Calculate potential savings
    total_savings = sum([w['monthlySavings'] for w in wasteful])
    
    # Get investment recommendations
    recommender = InvestmentRecommender()
    investments = recommender.recommend_investments(total_savings)
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'transactions': categorized,
            'subscriptions': subscriptions,
            'wasteful_expenses': wasteful,
            'potential_monthly_savings': total_savings,
            'investment_recommendations': investments
        })
    }
