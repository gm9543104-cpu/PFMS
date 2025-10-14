"""
Gmail Integration & OAuth2 - PFMS Hackathon MVP
Fetches transaction emails and parses them
"""

import os
import json
import re
from datetime import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import pickle

# Gmail API scopes
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

class GmailTransactionFetcher:
    def __init__(self):
        self.service = None
        
    def authenticate(self):
        """OAuth2 authentication for Gmail"""
        creds = None
        
        # Load saved credentials
        if os.path.exists('token.pickle'):
            with open('token.pickle', 'rb') as token:
                creds = pickle.load(token)
        
        # Refresh or get new credentials
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Save credentials
            with open('token.pickle', 'wb') as token:
                pickle.dump(creds, token)
        
        self.service = build('gmail', 'v1', credentials=creds)
        return True
    
    def fetch_transaction_emails(self, max_results=50):
        """Fetch transaction-related emails"""
        query = 'subject:(transaction OR payment OR debited OR credited OR receipt OR invoice)'
        
        results = self.service.users().messages().list(
            userId='me',
            q=query,
            maxResults=max_results
        ).execute()
        
        messages = results.get('messages', [])
        transactions = []
        
        for msg in messages:
            transaction = self.parse_email(msg['id'])
            if transaction:
                transactions.append(transaction)
        
        return transactions
    
    def parse_email(self, msg_id):
        """Parse email to extract transaction details"""
        msg = self.service.users().messages().get(
            userId='me',
            id=msg_id,
            format='full'
        ).execute()
        
        # Get email body
        payload = msg['payload']
        headers = payload.get('headers', [])
        
        subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '')
        date_str = next((h['value'] for h in headers if h['name'] == 'Date'), '')
        sender = next((h['value'] for h in headers if h['name'] == 'From'), '')
        
        # Get body text
        body = self.get_email_body(payload)
        
        # Extract transaction details
        transaction = self.extract_transaction_data(subject, body, date_str, sender)
        
        return transaction
    
    def get_email_body(self, payload):
        """Extract email body text"""
        if 'parts' in payload:
            parts = payload['parts']
            data = parts[0]['body'].get('data', '')
        else:
            data = payload['body'].get('data', '')
        
        if data:
            import base64
            text = base64.urlsafe_b64decode(data).decode('utf-8')
            return text
        return ''
    
    def extract_transaction_data(self, subject, body, date_str, sender):
        """Extract amount, merchant, payment method from email"""
        
        # Extract amount (₹ or Rs or INR)
        amount_patterns = [
            r'₹\s*([0-9,]+\.?[0-9]*)',
            r'Rs\.?\s*([0-9,]+\.?[0-9]*)',
            r'INR\s*([0-9,]+\.?[0-9]*)',
            r'amount.*?([0-9,]+\.?[0-9]*)'
        ]
        
        amount = None
        for pattern in amount_patterns:
            match = re.search(pattern, body + ' ' + subject, re.IGNORECASE)
            if match:
                amount = float(match.group(1).replace(',', ''))
                break
        
        if not amount:
            return None
        
        # Extract merchant
        merchant = self.extract_merchant(subject, body, sender)
        
        # Extract payment method
        payment_method = self.extract_payment_method(body)
        
        # Parse date
        from email.utils import parsedate_to_datetime
        try:
            date = parsedate_to_datetime(date_str).strftime('%Y-%m-%d')
        except:
            date = datetime.now().strftime('%Y-%m-%d')
        
        # Detect transaction type
        txn_type = 'expense'
        if any(word in (subject + body).lower() for word in ['credited', 'received', 'salary', 'refund']):
            txn_type = 'income'
        
        return {
            'date': date,
            'amount': amount,
            'merchant': merchant,
            'paymentMethod': payment_method,
            'type': txn_type,
            'source': 'Gmail',
            'rawSubject': subject
        }
    
    def extract_merchant(self, subject, body, sender):
        """Extract merchant name"""
        # Common merchant patterns
        merchants = [
            'swiggy', 'zomato', 'amazon', 'flipkart', 'netflix', 'spotify',
            'uber', 'ola', 'paytm', 'phonepe', 'gpay', 'myntra', 'ajio',
            'bigbasket', 'dunzo', 'bookmyshow', 'makemytrip', 'airtel',
            'jio', 'starbucks', 'mcdonald', 'domino', 'kfc'
        ]
        
        text = (subject + ' ' + body + ' ' + sender).lower()
        
        for merchant in merchants:
            if merchant in text:
                return merchant.capitalize()
        
        # Extract from subject
        if 'at' in subject.lower():
            parts = subject.lower().split('at')
            if len(parts) > 1:
                return parts[1].strip().split()[0].capitalize()
        
        # Extract from sender
        if '@' in sender:
            domain = sender.split('@')[1].split('.')[0]
            return domain.capitalize()
        
        return 'Unknown Merchant'
    
    def extract_payment_method(self, body):
        """Extract payment method"""
        text = body.lower()
        
        if 'credit card' in text or 'cc' in text:
            return 'Credit Card'
        elif 'debit card' in text or 'dc' in text:
            return 'Debit Card'
        elif 'upi' in text or 'gpay' in text or 'phonepe' in text or 'paytm' in text:
            return 'UPI'
        elif 'net banking' in text or 'netbanking' in text:
            return 'Net Banking'
        elif 'wallet' in text:
            return 'Wallet'
        else:
            return 'Unknown'


# Lambda handler for AWS
def lambda_handler(event, context):
    """AWS Lambda function to fetch Gmail transactions"""
    
    user_id = event.get('userId')
    
    # Initialize Gmail fetcher
    fetcher = GmailTransactionFetcher()
    
    try:
        # Authenticate
        fetcher.authenticate()
        
        # Fetch transactions
        transactions = fetcher.fetch_transaction_emails(max_results=50)
        
        # Store in DynamoDB
        import boto3
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('Transactions')
        
        for txn in transactions:
            txn['userId'] = user_id
            txn['transactionId'] = f"txn_{datetime.now().timestamp()}"
            table.put_item(Item=txn)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Fetched {len(transactions)} transactions',
                'transactions': transactions
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


if __name__ == '__main__':
    # Test locally
    fetcher = GmailTransactionFetcher()
    fetcher.authenticate()
    transactions = fetcher.fetch_transaction_emails(max_results=10)
    
    print(f"Found {len(transactions)} transactions:")
    for txn in transactions:
        print(f"  {txn['date']} - {txn['merchant']} - ₹{txn['amount']}")
