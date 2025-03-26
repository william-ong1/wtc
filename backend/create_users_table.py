import boto3
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# AWS Configuration
aws_region = os.getenv('AWS_REGION')
aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')

# Initialize DynamoDB client
dynamodb = boto3.resource(
    'dynamodb', 
    region_name=aws_region,
    aws_access_key_id=aws_access_key,
    aws_secret_access_key=aws_secret_key
)

# Create users table
table_name = os.getenv('DYNAMODB_USERS_TABLE_NAME')

try:
    table = dynamodb.create_table(
        TableName=table_name,
        KeySchema=[
            {
                'AttributeName': 'userId',
                'KeyType': 'HASH'  # Partition key
            }
        ],
        AttributeDefinitions=[
            {
                'AttributeName': 'userId',
                'AttributeType': 'S'
            }
        ],
        ProvisionedThroughput={
            'ReadCapacityUnits': 5,
            'WriteCapacityUnits': 5
        }
    )
    
    # Wait for the table to be created
    table.meta.client.get_waiter('table_exists').wait(TableName=table_name)
    print(f"Table {table_name} created successfully!")
    
except Exception as e:
    print(f"Error creating table: {str(e)}") 