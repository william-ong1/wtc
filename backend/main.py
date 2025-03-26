from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import google.generativeai as genai
import pillow_heif
import os
from dotenv import load_dotenv
import json
import boto3
import hashlib
import base64
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import requests

# Load environment variables
load_dotenv()

# # Configure Gemini API
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
model = genai.GenerativeModel('gemini-2.0-flash')

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
cars_table = dynamodb.Table(os.getenv('DYNAMODB_TABLE_NAME'))
likes_table = dynamodb.Table(os.getenv('DYNAMODB_LIKES_TABLE_NAME'))

# S3 setup
s3_client = boto3.client(
    's3',
    region_name=aws_region,
    aws_access_key_id=aws_access_key,
    aws_secret_access_key=aws_secret_key
)
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')

app = FastAPI()

# Enable CORS - TODO: change before deploy
app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:3000", "http://192.168.0.24:3000", "http://192.168.0.69:3000"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Define models
class CarInfo(BaseModel):
    make: str
    model: str
    year: str
    link: Optional[str] = None

class CarData(BaseModel):
    userId: str
    carInfo: CarInfo
    imageUrl: str
    username: str
    savedAt: Optional[str] = None
    isPrivate: Optional[bool] = False
    description: Optional[str] = None


# Generate image hash for S3 filenames
def generate_image_hash(image_data):
    """Generate a hash of image data for unique filenames"""
    return hashlib.md5(image_data).hexdigest()


# Define preprocessing transformations
def preprocess_image(image: UploadFile) -> tuple:
    """Process image and return PIL image and original bytes"""
    # Read image bytes
    image_data = image.file.read()
    image_bytes = io.BytesIO(image_data)

    try:
        # Try to open normally
        pil_image = Image.open(image_bytes)
    except Image.UnidentifiedImageError:
        # If it's a HEIC file, use pillow-heif to convert
        heif_image = pillow_heif.open_heif(image_bytes)
        pil_image = Image.frombytes(
            heif_image.mode, 
            heif_image.size, 
            heif_image.data
        )
        # Convert HEIC to JPEG for storage
        buffer = io.BytesIO()
        pil_image.save(buffer, format="JPEG")
        image_data = buffer.getvalue()

    pil_image = pil_image.convert('RGB')
    return pil_image, image_data


# Function to upload image to S3
async def upload_to_s3(image_data, user_id, image_hash):
    """Upload image to S3 and return URL"""
    try:
        # Create a unique key for the S3 object
        s3_key = f"cars/{user_id}/{image_hash}.jpg"
        
        # Upload to S3 with public read access
        s3_client.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=s3_key,
            Body=image_data,
            ContentType='image/jpeg',
            ACL='public-read'  # Make object publicly accessible
        )
        
        # Generate URL
        s3_url = f"https://{S3_BUCKET_NAME}.s3.{aws_region}.amazonaws.com/{s3_key}"
        return s3_url
    except Exception as e:
        print(f"S3 upload error: {str(e)}")
        raise e


@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    # Process the image
    image, _ = preprocess_image(file)
    
    # Prepare prompt for Gemini
    prompt = """Please analyze this car image and provide the following details in a structured format:
	- Make (Manufacturer)
	- Model
	- Exact Year (if possible; if the exact year cannot be determined, provide the year range)
    - Rarity (from 1-100)
    - Link (Wikipedia link for the car)

    If there is no car, return all details as "n/a".

	Please ensure the response is formatted as a JSON object with the following keys: make, model, year, rarity, link"""

    # Generate response using Gemini
    response = model.generate_content([prompt, image])

    try:
        # Parse the response text as JSON
        response_text = response.text.strip()
        # Remove any markdown code block markers if present
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        parsed_response = json.loads(response_text)
        
        # Return the parsed details as a dictionary
        return {
            "make": parsed_response.get("make"),
            "model": parsed_response.get("model"),
            "year": parsed_response.get("year"),
            "rarity": parsed_response.get("rarity"),
            "link": parsed_response.get("link")
        }
        
    except json.JSONDecodeError as e:
        # Handle JSON parsing errors
        return {"error": "Failed to parse response as JSON", "response_text": response.text}
    except Exception as e:
        # Handle other exceptions
        return {"error": str(e)}


@app.post("/save-car/")
async def save_car(car_data: CarData):
    try:
        # Add timestamp if not provided
        if not car_data.savedAt:
            car_data.savedAt = datetime.now().isoformat()
            
        # Check if the image URL is already an S3 URL from our bucket
        is_s3_url = S3_BUCKET_NAME in car_data.imageUrl if car_data.imageUrl else False
        
        # Process the image unless it's already in S3
        if not is_s3_url:
            # Extract user ID for later use
            user_id = car_data.userId
            
            if car_data.imageUrl.startswith('data:image'):
                # Parse data URL
                image_format, image_str = car_data.imageUrl.split(';base64,')
                image_data = base64.b64decode(image_str)
            elif car_data.imageUrl.startswith('blob:'):
                # Blob URLs can't be processed server-side
                raise HTTPException(
                    status_code=400, 
                    detail="Blob URLs cannot be processed. The frontend should convert blob URLs to data URLs."
                )
            elif car_data.imageUrl.startswith(('http://', 'https://')):
                # For external URLs, fetch the image
                try:
                    response = requests.get(car_data.imageUrl, timeout=10)
                    if response.status_code != 200:
                        raise HTTPException(status_code=400, detail="Failed to fetch image from URL")
                    image_data = response.content
                except requests.RequestException as e:
                    raise HTTPException(status_code=400, detail=f"Error fetching image: {str(e)}")
            else:
                # Invalid image source
                raise HTTPException(
                    status_code=400, 
                    detail="Invalid image source. Please provide a data URL or a valid image URL."
                )
            
            # Generate hash for unique filename
            image_hash = generate_image_hash(image_data)
            
            # Upload to S3
            s3_url = await upload_to_s3(image_data, user_id, image_hash)
            car_data.imageUrl = s3_url
        else:
            # If it's already an S3 URL, extract the hash from the URL for consistency
            image_hash = car_data.imageUrl.split('/')[-1].split('.')[0]
        
        # Save to DynamoDB
        item = {
            'username': car_data.username,
            'userId': car_data.userId,
            'savedAt': car_data.savedAt,  # Use as sort key
            'make': car_data.carInfo.make,
            'model': car_data.carInfo.model,
            'year': car_data.carInfo.year,
            'link': car_data.carInfo.link,
            'imageUrl': car_data.imageUrl,
            'imageHash': image_hash,  # Store hash for unique identification
            'isPrivate': car_data.isPrivate  # Store privacy setting
        }
        
        # Add description if provided
        if car_data.description:
            item['description'] = car_data.description
        
        cars_table.put_item(Item=item)
        
        return {"success": True, "message": "Car data saved successfully"}
    except HTTPException as e:
        # Re-raise HTTP exceptions
        print(f"HTTP error: {e.detail}")
        raise
    except Exception as e:
        print("error", str(e))
        return {"success": False, "error": str(e)}


@app.get("/get-user-cars/{user_id}")
async def get_user_cars(user_id: str):
    """Get all cars saved by a specific user"""
    try:
        # Query DynamoDB for user's saved cars
        response = cars_table.query(
            KeyConditionExpression='userId = :uid',
            ExpressionAttributeValues={
                ':uid': user_id
            },
            ScanIndexForward=False  # Sort by savedAt in descending order (newest first)
        )
        
        # Format the response
        cars = []
        for item in response.get('Items', []):
            car_data = {
                'userId': item.get('userId'),
                'savedAt': item.get('savedAt'),
                'carInfo': {
                    'make': item.get('make'),
                    'model': item.get('model'),
                    'year': item.get('year'),
                    'link': item.get('link'),
                },
                'imageUrl': item.get('imageUrl'),
                'isPrivate': item.get('isPrivate', False)
            }
            
            # Add description if it exists
            if 'description' in item:
                car_data['description'] = item.get('description')
                
            cars.append(car_data)
        
        return {"success": True, "cars": cars}
    except Exception as e:
        print(f"Error retrieving user cars: {str(e)}")
        return {"success": False, "error": str(e)}


@app.get("/get-all-cars")
async def get_all_cars():
    """Get all public cars with user information for the explore page"""
    try:
        # Scan DynamoDB for all car entries
        response = cars_table.scan()
        
        # Format the response
        cars = []
        for item in response.get('Items', []):
            # Skip private cars
            if item.get('isPrivate', False):
                continue
                
            car_data = {
                'userId': item.get('userId'),
                'savedAt': item.get('savedAt'),
                'carInfo': {
                    'make': item.get('make'),
                    'model': item.get('model'),
                    'year': item.get('year'),
                    'link': item.get('link'),
                },
                'imageUrl': item.get('imageUrl'),
                'likes': item.get('likes', 0),
                'likedBy': item.get('likedBy', []),  # Include the list of users who liked the post
                'username': item.get('username', 'Anonymous'),
                'profilePicture': item.get('profilePicture', '')
            }
            
            # Add description if it exists
            if 'description' in item:
                car_data['description'] = item.get('description')
                
            cars.append(car_data)
        
        # Sort by savedAt in descending order (newest first)
        cars.sort(key=lambda x: x['savedAt'], reverse=True)
        
        return {"success": True, "cars": cars}
    except Exception as e:
        print(f"Error retrieving all cars: {str(e)}")
        return {"success": False, "error": str(e)}


@app.post("/like-car/{car_owner_id}/{saved_at}/{liker_id}")
async def like_car(car_owner_id: str, saved_at: str, liker_id: str):
    """Like a car post, ensuring one like per user per post"""
    try:
        # First get the car details
        car_response = cars_table.get_item(
            Key={
                'userId': car_owner_id,
                'savedAt': saved_at
            }
        )
        
        if 'Item' not in car_response:
            return {"success": False, "error": "Car not found"}
            
        car = car_response['Item']
        liked_by = car.get('likedBy', [])  # Get existing likes list or empty list if none

        # Check if user has already liked this post
        if liker_id in liked_by:
            return {"success": False, "error": "User has already liked this post"}

        # Add user to likedBy list and increment likes count
        liked_by.append(liker_id)
        response = cars_table.update_item(
            Key={
                'userId': car_owner_id,
                'savedAt': saved_at
            },
            UpdateExpression="SET likedBy = :liked_by, likes = if_not_exists(likes, :zero) + :inc",
            ExpressionAttributeValues={
                ':liked_by': liked_by,
                ':zero': 0,
                ':inc': 1
            },
            ReturnValues="UPDATED_NEW"
        )
        
        # Get the updated likes count
        updated_likes = response.get('Attributes', {}).get('likes', 0)
        
        return {"success": True, "likes": updated_likes}
    except Exception as e:
        print(f"Error liking car: {str(e)}")
        return {"success": False, "error": str(e)}


@app.delete("/delete-car/{user_id}/{saved_at}")
async def delete_car(user_id: str, saved_at: str):
    """Delete a specific car entry for a user"""
    try:
        # Delete the item from DynamoDB
        response = cars_table.delete_item(
            Key={
                'userId': user_id,
                'savedAt': saved_at
            },
            ReturnValues="ALL_OLD"  # Return the deleted item
        )
        
        # Check if the item was deleted successfully
        deleted_item = response.get('Attributes')
        if not deleted_item:
            return {"success": False, "error": "Car not found"}
        
        # Get the image URL from the deleted item to delete from S3 as well
        image_url = deleted_item.get('imageUrl')
        if image_url and S3_BUCKET_NAME in image_url:
            try:
                # Extract the S3 key from the URL
                s3_key = image_url.split(f"{S3_BUCKET_NAME}.s3.{aws_region}.amazonaws.com/")[1]
                
                # Delete the image from S3
                s3_client.delete_object(
                    Bucket=S3_BUCKET_NAME,
                    Key=s3_key
                )
            except Exception as s3_error:
                print(f"Warning: Could not delete S3 image: {str(s3_error)}")
                # Continue with the process even if S3 deletion fails
        
        return {"success": True, "message": "Car deleted successfully"}
    except Exception as e:
        print(f"Error deleting car: {str(e)}")
        return {"success": False, "error": str(e)}


@app.get("/get-user-likes/{user_id}")
async def get_user_likes(user_id: str):
    """Get all posts that a user has liked"""
    try:
        # Query the likes table for all likes by this user
        response = likes_table.query(
            KeyConditionExpression='userId = :uid',
            ExpressionAttributeValues={
                ':uid': user_id
            }
        )
        
        # Extract the carIds from the likes
        liked_posts = [item['carId'] for item in response.get('Items', [])]
        
        return {"success": True, "likedPosts": liked_posts}
    except Exception as e:
        print(f"Error getting user likes: {str(e)}")
        return {"success": False, "error": str(e)}


@app.post("/unlike-car/{car_owner_id}/{saved_at}/{liker_id}")
async def unlike_car(car_owner_id: str, saved_at: str, liker_id: str):
    """Unlike a car post"""
    try:
        # First get the car details
        car_response = cars_table.get_item(
            Key={
                'userId': car_owner_id,
                'savedAt': saved_at
            }
        )
        
        if 'Item' not in car_response:
            return {"success": False, "error": "Car not found"}
            
        car = car_response['Item']
        liked_by = car.get('likedBy', [])  # Get existing likes list or empty list if none

        # Check if user has liked this post
        if liker_id not in liked_by:
            return {"success": False, "error": "User has not liked this post"}

        # Remove user from likedBy list and decrement likes count
        liked_by.remove(liker_id)
        response = cars_table.update_item(
            Key={
                'userId': car_owner_id,
                'savedAt': saved_at
            },
            UpdateExpression="SET likedBy = :liked_by, likes = if_not_exists(likes, :zero) - :dec",
            ExpressionAttributeValues={
                ':liked_by': liked_by,
                ':zero': 0,
                ':dec': 1
            },
            ReturnValues="UPDATED_NEW"
        )
        
        # Get the updated likes count
        updated_likes = response.get('Attributes', {}).get('likes', 0)
        
        return {"success": True, "likes": updated_likes}
    except Exception as e:
        print(f"Error unliking car: {str(e)}")
        return {"success": False, "error": str(e)}