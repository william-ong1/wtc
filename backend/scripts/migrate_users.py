import boto3
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure AWS services
aws_region = os.getenv('AWS_REGION')
aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')

# DynamoDB setup
dynamodb = boto3.resource(
    'dynamodb', 
    region_name=aws_region,
    aws_access_key_id=aws_access_key,
    aws_secret_access_key=aws_secret_key
)
users_table = dynamodb.Table(os.getenv('DYNAMODB_USERS_TABLE_NAME'))

# Cognito setup
cognito_client = boto3.client(
    'cognito-idp',
    region_name=aws_region,
    aws_access_key_id=aws_access_key,
    aws_secret_access_key=aws_secret_key
)

def migrate_users():
    """Fetch all users from Cognito and add them to the users table"""
    try:
        # Get all users from Cognito
        paginator = cognito_client.get_paginator('list_users')
        user_pool_id = os.getenv('COGNITO_USER_POOL_ID')
        
        print(f"Starting user migration from Cognito user pool: {user_pool_id}")
        
        for page in paginator.paginate(UserPoolId=user_pool_id):
            users = page['Users']
            
            for user in users:
                # Get user ID and username
                user_id = user['Username']
                username = None
                
                # Find preferred_username in attributes
                for attr in user['Attributes']:
                    if attr['Name'] == 'preferred_username':
                        username = attr['Value']
                        break
                
                if username:
                    try:
                        # Add user to DynamoDB
                        users_table.put_item(
                            Item={
                                'userId': user_id,
                                'username': username,
                            }
                        )
                        print(f"Added user: {username} (ID: {user_id})")
                    except Exception as e:
                        print(f"Error adding user {username} to DynamoDB: {str(e)}")
                else:
                    print(f"Warning: No username found for user {user_id}")
        
        print("User migration completed successfully")
        
    except Exception as e:
        print(f"Error during user migration: {str(e)}")

if __name__ == "__main__":
    migrate_users() 