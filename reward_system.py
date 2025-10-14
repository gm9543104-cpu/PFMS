"""
Gamification & Reward Points System - PFMS Hackathon MVP
Tracks user actions and awards points
"""

import json
from datetime import datetime
import boto3

class RewardSystem:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
        self.rewards_table = self.dynamodb.Table('Rewards')
        self.users_table = self.dynamodb.Table('Users')
        
        # Point values for different actions
        self.point_rules = {
            'cancel_subscription': 50,
            'meet_savings_target': 100,  # Base, multiplied by % saved
            'invest_savings': 1.2,  # 20% bonus multiplier
            'first_subscription_cancel': 100,  # Bonus
            'first_investment': 150,  # Bonus
            'weekly_streak': 25,
            'monthly_goal_achieved': 200
        }
        
        # Tier thresholds
        self.tiers = {
            'Bronze': 0,
            'Silver': 500,
            'Gold': 1500,
            'Platinum': 3000
        }
        
        # Badges
        self.badges = {
            'first_cancel': '🎯 Subscription Slayer',
            'first_investment': '💰 Smart Investor',
            'savings_10': '🏆 10% Saver',
            'savings_20': '🔥 20% Saver',
            'streak_7': '⚡ 7-Day Streak',
            'streak_30': '🌟 30-Day Streak'
        }
    
    def award_points(self, user_id, action, metadata=None):
        """Award points for user action"""
        points = 0
        description = ''
        
        if action == 'cancel_subscription':
            subscription_name = metadata.get('subscription_name', 'subscription')
            monthly_cost = metadata.get('monthly_cost', 0)
            
            # Base points + cost factor
            points = self.point_rules['cancel_subscription'] + int(monthly_cost / 10)
            description = f"Canceled {subscription_name} subscription"
            
            # Check if first cancellation
            user_rewards = self.get_user_rewards(user_id)
            if not any(r['action'] == 'cancel_subscription' for r in user_rewards):
                points += self.point_rules['first_subscription_cancel']
                description += " (First cancellation bonus!)"
        
        elif action == 'meet_savings_target':
            saved_amount = metadata.get('saved_amount', 0)
            budget = metadata.get('budget', 1)
            savings_percent = (saved_amount / budget) * 100
            
            # Points proportional to % saved
            points = int(savings_percent * 10)
            description = f"Saved {savings_percent:.1f}% of monthly budget (₹{saved_amount})"
        
        elif action == 'invest_savings':
            investment_amount = metadata.get('investment_amount', 0)
            investment_type = metadata.get('investment_type', 'investment')
            
            # Base points from savings + 20% bonus
            base_points = int(investment_amount / 10)
            points = int(base_points * self.point_rules['invest_savings'])
            description = f"Invested ₹{investment_amount} in {investment_type}"
            
            # Check if first investment
            user_rewards = self.get_user_rewards(user_id)
            if not any(r['action'] == 'invest_savings' for r in user_rewards):
                points += self.point_rules['first_investment']
                description += " (First investment bonus!)"
        
        elif action == 'weekly_streak':
            points = self.point_rules['weekly_streak']
            description = "Maintained 7-day tracking streak"
        
        elif action == 'monthly_goal_achieved':
            goal_name = metadata.get('goal_name', 'goal')
            points = self.point_rules['monthly_goal_achieved']
            description = f"Achieved monthly goal: {goal_name}"
        
        # Store reward
        reward = {
            'rewardId': f"rwd_{user_id}_{int(datetime.now().timestamp())}",
            'userId': user_id,
            'action': action,
            'points': points,
            'description': description,
            'metadata': metadata or {},
            'timestamp': datetime.now().isoformat()
        }
        
        self.rewards_table.put_item(Item=reward)
        
        # Update user total points
        self.update_user_points(user_id, points)
        
        return reward
    
    def update_user_points(self, user_id, points_to_add):
        """Update user's total points and tier"""
        response = self.users_table.get_item(Key={'userId': user_id})
        user = response.get('Item', {})
        
        current_points = user.get('totalPoints', 0)
        new_total = current_points + points_to_add
        
        # Determine tier
        tier = 'Bronze'
        for tier_name, threshold in sorted(self.tiers.items(), key=lambda x: x[1], reverse=True):
            if new_total >= threshold:
                tier = tier_name
                break
        
        # Update user
        self.users_table.update_item(
            Key={'userId': user_id},
            UpdateExpression='SET totalPoints = :points, tier = :tier',
            ExpressionAttributeValues={
                ':points': new_total,
                ':tier': tier
            }
        )
        
        return {'totalPoints': new_total, 'tier': tier}
    
    def get_user_rewards(self, user_id):
        """Get all rewards for a user"""
        response = self.rewards_table.query(
            KeyConditionExpression='userId = :uid',
            ExpressionAttributeValues={':uid': user_id}
        )
        return response.get('Items', [])
    
    def get_user_stats(self, user_id):
        """Get user's gamification stats"""
        response = self.users_table.get_item(Key={'userId': user_id})
        user = response.get('Item', {})
        
        rewards = self.get_user_rewards(user_id)
        
        # Calculate badges earned
        badges_earned = []
        
        # Check for first cancellation
        if any(r['action'] == 'cancel_subscription' for r in rewards):
            badges_earned.append(self.badges['first_cancel'])
        
        # Check for first investment
        if any(r['action'] == 'invest_savings' for r in rewards):
            badges_earned.append(self.badges['first_investment'])
        
        # Check for savings achievements
        savings_rewards = [r for r in rewards if r['action'] == 'meet_savings_target']
        if savings_rewards:
            max_savings = max([r.get('metadata', {}).get('saved_amount', 0) for r in savings_rewards])
            if max_savings >= 10:
                badges_earned.append(self.badges['savings_10'])
            if max_savings >= 20:
                badges_earned.append(self.badges['savings_20'])
        
        return {
            'userId': user_id,
            'totalPoints': user.get('totalPoints', 0),
            'tier': user.get('tier', 'Bronze'),
            'badges': badges_earned,
            'totalRewards': len(rewards),
            'recentRewards': sorted(rewards, key=lambda x: x['timestamp'], reverse=True)[:5]
        }
    
    def calculate_investment_points(self, monthly_savings, investment_option):
        """Calculate projected points for investment"""
        # Base points from savings
        base_points = int(monthly_savings / 10)
        
        # Investment bonus (20%)
        investment_points = int(base_points * self.point_rules['invest_savings'])
        
        return {
            'monthly_savings': monthly_savings,
            'base_points': base_points,
            'investment_bonus': investment_points - base_points,
            'total_points': investment_points,
            'points_6_months': investment_points * 6,
            'points_12_months': investment_points * 12
        }
    
    def get_leaderboard(self, limit=10):
        """Get top users by points (for leaderboard)"""
        response = self.users_table.scan()
        users = response.get('Items', [])
        
        # Sort by points
        leaderboard = sorted(users, key=lambda x: x.get('totalPoints', 0), reverse=True)[:limit]
        
        return [
            {
                'rank': i + 1,
                'userId': user['userId'],
                'email': user.get('email', 'Anonymous'),
                'points': user.get('totalPoints', 0),
                'tier': user.get('tier', 'Bronze')
            }
            for i, user in enumerate(leaderboard)
        ]


# Lambda handler for reward actions
def lambda_handler(event, context):
    """AWS Lambda for reward system"""
    
    action_type = event.get('action')
    user_id = event.get('userId')
    metadata = event.get('metadata', {})
    
    reward_system = RewardSystem()
    
    if action_type == 'award_points':
        # Award points for action
        reward = reward_system.award_points(
            user_id=user_id,
            action=metadata.get('action_name'),
            metadata=metadata
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'reward': reward,
                'message': f"Earned {reward['points']} points!"
            })
        }
    
    elif action_type == 'get_stats':
        # Get user stats
        stats = reward_system.get_user_stats(user_id)
        
        return {
            'statusCode': 200,
            'body': json.dumps(stats)
        }
    
    elif action_type == 'calculate_investment_points':
        # Calculate projected points
        monthly_savings = metadata.get('monthly_savings', 0)
        investment_option = metadata.get('investment_option', '')
        
        points_projection = reward_system.calculate_investment_points(
            monthly_savings, investment_option
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps(points_projection)
        }
    
    elif action_type == 'leaderboard':
        # Get leaderboard
        leaderboard = reward_system.get_leaderboard(limit=10)
        
        return {
            'statusCode': 200,
            'body': json.dumps({'leaderboard': leaderboard})
        }
    
    else:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Invalid action type'})
        }


# Example usage
if __name__ == '__main__':
    # Simulate reward scenarios
    reward_system = RewardSystem()
    
    user_id = 'user123'
    
    # Scenario 1: Cancel Netflix subscription
    print("Scenario 1: Cancel Netflix")
    reward1 = reward_system.award_points(
        user_id=user_id,
        action='cancel_subscription',
        metadata={'subscription_name': 'Netflix', 'monthly_cost': 599}
    )
    print(f"  Earned: {reward1['points']} points - {reward1['description']}")
    
    # Scenario 2: Meet savings target
    print("\nScenario 2: Save 15% of budget")
    reward2 = reward_system.award_points(
        user_id=user_id,
        action='meet_savings_target',
        metadata={'saved_amount': 3000, 'budget': 20000}
    )
    print(f"  Earned: {reward2['points']} points - {reward2['description']}")
    
    # Scenario 3: Invest savings
    print("\nScenario 3: Invest in Index Fund")
    reward3 = reward_system.award_points(
        user_id=user_id,
        action='invest_savings',
        metadata={'investment_amount': 3000, 'investment_type': 'Index Fund SIP'}
    )
    print(f"  Earned: {reward3['points']} points - {reward3['description']}")
    
    # Get user stats
    print("\nUser Stats:")
    stats = reward_system.get_user_stats(user_id)
    print(f"  Total Points: {stats['totalPoints']}")
    print(f"  Tier: {stats['tier']}")
    print(f"  Badges: {', '.join(stats['badges'])}")
