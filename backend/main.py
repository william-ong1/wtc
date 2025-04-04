from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import google.generativeai as genai
import pillow_heif
import os
from dotenv import load_dotenv
import json
import boto3
import boto3.session
from boto3.dynamodb.conditions import Key, Attr
import hashlib
import base64
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import asyncio
from cachetools import TTLCache
from functools import lru_cache

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
	CORSMiddleware,
	allow_origins=[
		"http://localhost:3000",  # Local development
		"http://192.168.0.24:3000",  # Local network IP
		"http://192.168.0.69:3000",  # Local network IP
		"https://whatsthatcar.vercel.app",  # Production URL
		os.getenv('FRONTEND_URL', '')  # From environment variables if configured
	],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Connection pool for AWS services
@lru_cache(maxsize=1)
def get_boto3_session():
    """Create and cache a boto3 session to reuse connections"""
    return boto3.session.Session(
        region_name=aws_region,
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key
    )

# Get resource and client from the session pool
def get_dynamodb():
    """Get a DynamoDB resource from the connection pool"""
    session = get_boto3_session()
    return session.resource('dynamodb')

def get_s3_client():
    """Get an S3 client from the connection pool"""
    session = get_boto3_session()
    return session.client('s3')

def get_cognito_client():
    """Get a Cognito client from the connection pool"""
    session = get_boto3_session()
    return session.client('cognito-idp')

# Cache for frequently accessed data (5 minute expiry, max 100 items)
username_cache = TTLCache(maxsize=100, ttl=300)

# Cache for profile photos (10 minute expiry, max 50 items)
profile_photo_cache = TTLCache(maxsize=50, ttl=600)

# Configure AWS services
aws_region = os.getenv('AWS_REGION')
aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')

# Configure Gemini API (Gemini 2.0 Flash)
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
model = genai.GenerativeModel('gemini-2.0-flash')

# DynamoDB setup with connection pooling
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')
DYNAMODB_TABLE_NAME = os.getenv('DYNAMODB_TABLE_NAME')
DYNAMODB_USERS_TABLE_NAME = os.getenv('DYNAMODB_USERS_TABLE_NAME')

# Car info data
class CarInfo(BaseModel):
    make: str
    model: str
    year: str
    link: Optional[str] = None

# Car post data
class CarData(BaseModel):
    userId: str
    savedAt: str
    carInfo: CarInfo
    imageUrl: str
    username: str
    isPrivate: Optional[bool] = False
    description: Optional[str] = None

# User data for creating/updating user info with Cognito user id
class UserInfo(BaseModel):
    user_id: str
    username: str

# User data for updating username
class UpdateUsernameInfo(BaseModel):
    user_id: str
    new_username: str

# Contact form data
class ContactForm(BaseModel):
    name: str
    email: Optional[str] = ""
    message: str

def process_image(image: UploadFile) -> tuple:
    """
    Process an uploaded image with optimized memory usage.
    
    Args:
        image (UploadFile): The image as a file.
        
    Returns:
        A tuple containing the processed PIL image and the original image bytes.
    """

    try:
        # Read image and retrieve bytes
        image_data = image.file.read()
        image_bytes = io.BytesIO(image_data)

        try:
            pil_image = Image.open(image_bytes)
        except Image.UnidentifiedImageError:
            # Use pillow-heif to convert image if it's HEIF (common file type for Apple images)
            heif_image = pillow_heif.open_heif(image_bytes)
            pil_image = Image.frombytes(heif_image.mode, heif_image.size, heif_image.data)

            # Convert HEIC to JPEG for storage (allow displaying of HEIC images on non-Safari browsers)
            buffer = io.BytesIO()
            pil_image.save(buffer, format="JPEG", quality=75)
            image_data = buffer.getvalue()
            buffer.close()
            del buffer

        # Ensure that image is RGB
        pil_image = pil_image.convert('RGB')
        
        # Compress large images to reduce memory usage
        max_size = 800
        
        # Always resize to optimize memory usage
        original_width, original_height = pil_image.size
        if original_width > max_size or original_height > max_size:
            # Calculate new dimensions while preserving aspect ratio
            if original_width > original_height:
                new_width = max_size
                new_height = int(original_height * (max_size / original_width))
            else:
                new_height = max_size
                new_width = int(original_width * (max_size / original_height))
            
            # Resize the image with higher quality downsampling
            pil_image = pil_image.resize((new_width, new_height), Image.LANCZOS)
        
        # Always recompress the image to ensure consistent memory usage
        buffer = io.BytesIO()
        pil_image.save(buffer, format="JPEG", quality=75)
        image_data = buffer.getvalue()
        buffer.close()
        del buffer
        
        # Log compression stats for debugging
        # original_size = len(image_data)
        # compressed_size = len(image_data)
        # compression_ratio = original_size / compressed_size if compressed_size > 0 else 0
        # print(f"Image compression: {original_width}x{original_height} ({original_size/1024:.1f}KB) → " +
        #       f"{pil_image.width}x{pil_image.height} ({compressed_size/1024:.1f}KB), " +
        #       f"Ratio: {compression_ratio:.1f}x")
        
        return pil_image, image_data
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        raise e


def generate_image_hash(image_data) -> str:
    """ 
    Generate a hash of image data for unique filenames.
    
    Args:
        image_data: The data of an image in bytes.

    Returns:
        A unique hash of the image data.
    """
    
    return hashlib.md5(image_data).hexdigest()


async def upload_to_s3(image_data, user_id, image_hash) -> str:
    """
    Upload an image to S3.
    
    Args:
        image_data: The image data in bytes.
        user_id: The Cognito user id of the uploader.
        image_hash: The unique image hash for the file name.

    Returns:
        The image's S3 url that is publicly accessible.
    """

    try:
        # Get a connection from the pool
        s3_client = get_s3_client()
        
        # Create a unique key for the S3 object
        s3_key = f"{user_id}/{image_hash}.jpg"
        
        # Upload to S3 with public read access
        s3_client.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=s3_key,
            Body=image_data,
            ContentType='image/jpeg',
            ACL='public-read'
        )
        
        # Return url for the uploaded S3 object
        s3_url = f"https://{S3_BUCKET_NAME}.s3.{aws_region}.amazonaws.com/{s3_key}"
        return s3_url
    except Exception as e:
        print(f"Error uploading to S3: {str(e)}")
        raise e


@app.post("/predict/")
async def predict(image: UploadFile) -> Dict[str, Any]:
    """
    Identify the car in an image with Gemini, with optimized memory usage.

    Args:
        image (UploadFile): The image as a file.
 
    Returns:
        The car information in JSON format containing keys for the car's make, model, year, rarity, and link to additional information with the key "car" if "success" is True.
    """

    # Set timeout duration in seconds
    TIMEOUT_SECONDS = 25
    pil_image = None
    
    try:
        # Process the image with optimized memory usage
        pil_image, _ = process_image(image)
        
        # Gemini prompt - optimized to be more concise
        prompt = """
            Analyze this car image and provide these details in JSON format:
            - make: Manufacturer name
            - model: Model name/number (exclude unnecessary details)
            - year: Exact year or range if uncertain
            - rarity: Unknown, Common, Rare, Very Rare, or Extremely Rare
            - link: Wikipedia link to the car
            
            If there are multiple cars in the image, focus on the most prominent one.
            If no car visible, use "n/a" for all fields. For any missing information, use "n/a" as well.
            
            Return a single JSON object, not an array.
        """

        # Run the prediction with Gemini
        def run_prediction():
            return model.generate_content([prompt, pil_image])
        
        # Run the prediction with a timeout
        loop = asyncio.get_event_loop()
        response = await asyncio.wait_for(
            loop.run_in_executor(None, run_prediction),
            timeout=TIMEOUT_SECONDS
        )
        
        # Clean up memory
        del pil_image
        pil_image = None
        import gc
        gc.collect()

        # Parse the response text as JSON
        response_text = response.text.strip()
        # Remove any markdown code block markers if present
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        parsed_response = json.loads(response_text)
                
        # Handle the case where the model returns an array instead of a single object
        if isinstance(parsed_response, list) and len(parsed_response) > 0:
            print("Warning: Gemini returned multiple cars. Using the first one.")
            parsed_response = parsed_response[0]
        
        # Return the parsed details
        car = {
            "make": parsed_response.get("make"),
            "model": parsed_response.get("model"),
            "year": parsed_response.get("year"),
            "rarity": parsed_response.get("rarity"),
            "link": parsed_response.get("link")
        }
        
        return {"success": True, "car": car}
    except asyncio.TimeoutError:
        print(f"Prediction timed out after {TIMEOUT_SECONDS} seconds")
        return {"success": False, "error": f"Request timed out after {TIMEOUT_SECONDS} seconds. Please try again with a smaller image or try later."}
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {str(e)}")
        return {"success": False, "error": "Failed to parse response as JSON", "response_text": response.text if 'response' in locals() else "No response"}
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return {"success": False, "error": str(e)}
    finally:
        # Make sure image is cleaned up even if there's an error
        if pil_image is not None:
            del pil_image
            gc.collect()


@app.post("/save-car/")
async def save_car(car_data: CarData) -> Dict[str, Any]:
    """
    Save a car's data to the DynamoDB cars table.

    Args:
        car_data (CarData): The car data to save.
    
    Returns:
        A JSON indicating whether the save was successful with the key "success".
    """

    try:
        # Get connections from the pool
        dynamodb = get_dynamodb()
        cars_table = dynamodb.Table(DYNAMODB_TABLE_NAME)
        
        # Check if S3 already contains the image
        is_s3_url = S3_BUCKET_NAME in car_data.imageUrl if car_data.imageUrl else False
        
        # Process and upload the image to S3 if not already in
        if not is_s3_url:            
            # Process the image
            if car_data.imageUrl.startswith('data:image'):
                # Parse data URL
                _, image_str = car_data.imageUrl.split(';base64,')
                image_data = base64.b64decode(image_str)
            elif car_data.imageUrl.startswith('blob:'):
                # Blob URLs can't be processed server-side
                raise HTTPException(status_code=400, detail="Blob URLs cannot be processed. The frontend should convert blob URLs to data URLs.")
            elif car_data.imageUrl.startswith(('http://', 'https://')):
                # Fetch the image for external URLs
                try:
                    response = requests.get(car_data.imageUrl, timeout=10)
                    if response.status_code != 200:
                        raise HTTPException(status_code=400, detail="Failed to fetch image from URL")
                    image_data = response.content
                except requests.RequestException as e:
                    raise HTTPException(status_code=400, detail=f"Error fetching image: {str(e)}")
            else:
                # Invalid image source
                raise HTTPException(status_code=400, detail="Invalid image source. Please provide a data URL or a valid image URL.")
            
            # Upload image to S3
            image_hash = generate_image_hash(image_data)
            car_data.imageUrl = await upload_to_s3(image_data, car_data.userId, image_hash)
        else:
            # Extract the hash from the URL for consistency if already in S3
            image_hash = car_data.imageUrl.split('/')[-1].split('.')[0]
        
        # Save to DynamoDB with savedAt as the sort key and imageHash for unique identification
        item = {
            'username': car_data.username,
            'userId': car_data.userId,
            'savedAt': car_data.savedAt,
            'make': car_data.carInfo.make,
            'model': car_data.carInfo.model,
            'year': car_data.carInfo.year,
            'link': car_data.carInfo.link,
            'imageUrl': car_data.imageUrl,
            'imageHash': image_hash,
            'isPrivate': car_data.isPrivate
        }
        
        # Add description if provided
        if car_data.description:
            item['description'] = car_data.description
        
        cars_table.put_item(Item=item)
        
        return {"success": True, "message": "Car data saved successfully"}
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Error saving car: {str(e)}")
        return {"success": False, "error": str(e)}


@app.delete("/delete-car/{user_id}/{saved_at}")
async def delete_car(user_id: str, saved_at: str) -> Dict[str, Any]:
    """
    Delete a car post from the database.

    Args:
        user_id (str): The Cognito user id of the poster.
        saved_at (str): The timestamp of the car post.

    Returns:
        A JSON object indicating whether the deletion was successful with the key "success".
    """

    try:
        # Get connections from pool
        dynamodb = get_dynamodb()
        cars_table = dynamodb.Table(DYNAMODB_TABLE_NAME)
        s3_client = get_s3_client()
        
        # Delete the item from DynamoDB
        response = cars_table.delete_item(
            Key={
                'userId': user_id,
                'savedAt': saved_at
            },
            ReturnValues="ALL_OLD"
        )
        
        # Check if the item was deleted successfully
        deleted_item = response.get('Attributes')
        if not deleted_item:
            return {"success": False, "error": "Car not found"}
        
        # Get the image URL from the deleted item to delete from S3
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


@app.get("/get-user-cars/{user_id}")
async def get_user_cars(user_id: str) -> Dict[str, Any]:
    """
    Retrieve the cars saved by a specific user.
    
    Args:
        user_id (str): The Cognito user id of the requester.
        
    Returns:
        A JSON object containing a list of CarData for all of the user's saved cars with the key "cars" if "success" is True.
    """

    try:
        # Get a connection from the pool
        dynamodb = get_dynamodb()
        cars_table = dynamodb.Table(DYNAMODB_TABLE_NAME)
        
        # Query DynamoDB for user's saved cars (newest first) - use ProjectionExpression to only fetch the needed fields
        response = cars_table.query(
            KeyConditionExpression=Key('userId').eq(user_id),
            ScanIndexForward=False,  # Sort in descending order (newest first)
            ProjectionExpression="userId, savedAt, make, model, #yr, link, imageUrl, likes, isPrivate, description",
            ExpressionAttributeNames={
                "#yr": "year"
            }
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
                'likes': item.get('likes', 0),
                'isPrivate': item.get('isPrivate', False)
            }
            
            # Add description if it exists
            if 'description' in item:
                car_data['description'] = item.get('description')
                
            cars.append(car_data)
        
        return {"success": True, "cars": cars}
    except Exception as e:
        print(f"Error in get-user-cars: {str(e)}")
        return {"success": False, "error": str(e)}


@app.get("/get-all-cars")
async def get_all_cars() -> Dict[str, Any]:
    """
    Retrieve all public car posts along with user information.
    
    Args:
        None.
    
    Returns:
        A JSON object containing a list of CarData for all of the public car posts with the key "cars" if "success" is True.
    """

    try:
        # Get connections from the pool
        dynamodb = get_dynamodb()
        cars_table = dynamodb.Table(DYNAMODB_TABLE_NAME)
        users_table = dynamodb.Table(DYNAMODB_USERS_TABLE_NAME)
        
        # Retrieve public cars
        response = cars_table.scan(
            FilterExpression=Attr('isPrivate').eq(False) | Attr('isPrivate').not_exists(),
            ProjectionExpression="userId, savedAt, make, model, #yr, link, imageUrl, likes, likedBy, description, username, profilePicture",
            ExpressionAttributeNames={
                "#yr": "year"
            }
        )
        
        # Collect unique user IDs to batch query usernames and profile photos
        user_ids = {item.get('userId') for item in response.get('Items', [])}
        
        # Fetch all usernames and profile photos with cache
        usernames = {}
        profile_photos = {}
        
        for user_id in user_ids:
            # Check username cache first
            if user_id in username_cache:
                usernames[user_id] = username_cache[user_id]
            else:
                try:
                    user_response = users_table.get_item(
                        Key={'userId': user_id},
                        ProjectionExpression="username, profilePhoto"
                    )
                    if 'Item' in user_response:
                        # Get username
                        username = user_response['Item'].get('username', 'Anonymous')
                        usernames[user_id] = username
                        username_cache[user_id] = username
                        
                        # Get profile photo
                        photo_url = user_response['Item'].get('profilePhoto', '')
                        profile_photos[user_id] = photo_url
                        profile_photo_cache[user_id] = photo_url
                    else:
                        usernames[user_id] = 'Anonymous'
                        profile_photos[user_id] = ''
                except Exception:
                    usernames[user_id] = 'Anonymous'
                    profile_photos[user_id] = ''
            
            # Check profile photo cache if not already fetched
            if user_id not in profile_photos:
                if user_id in profile_photo_cache:
                    profile_photos[user_id] = profile_photo_cache[user_id]
                else:
                    # This would only happen if we had username in cache but not profile photo
                    try:
                        user_response = users_table.get_item(
                            Key={'userId': user_id},
                            ProjectionExpression="profilePhoto"
                        )
                        if 'Item' in user_response:
                            photo_url = user_response['Item'].get('profilePhoto', '')
                            profile_photos[user_id] = photo_url
                            profile_photo_cache[user_id] = photo_url
                        else:
                            profile_photos[user_id] = ''
                            profile_photo_cache[user_id] = ''
                    except Exception:
                        profile_photos[user_id] = ''
        
        # Format the response
        cars = []
        for item in response.get('Items', []):
            user_id = item.get('userId')
            
            # Get username from our pre-fetched data
            current_username = usernames.get(user_id, item.get('username', 'Anonymous'))
            current_profile_photo = profile_photos.get(user_id, item.get('profilePicture', ''))
                
            car_data = {
                'userId': user_id,
                'savedAt': item.get('savedAt'),
                'carInfo': {
                    'make': item.get('make'),
                    'model': item.get('model'),
                    'year': item.get('year'),
                    'link': item.get('link'),
                },
                'imageUrl': item.get('imageUrl'),
                'likes': item.get('likes', 0),
                'likedBy': item.get('likedBy', []),
                'username': current_username,
                'profilePicture': current_profile_photo
            }
            
            # Add description if it exists
            if 'description' in item:
                car_data['description'] = item.get('description')
                
            cars.append(car_data)
        
        # Sort by savedAt in descending order (newest first)
        cars.sort(key=lambda x: x['savedAt'], reverse=True)
        
        return {"success": True, "cars": cars}
    except Exception as e:
        print(f"Error in get-all-cars: {str(e)}")
        return {"success": False, "error": str(e)}


@app.post("/like-car/{poster_id}/{saved_at}/{liker_id}")
async def like_car(poster_id: str, saved_at: str, liker_id: str) -> Dict[str, Any]:
    """
    Add a like to a post (maximum one like per user per post).

    Args:
        poster_id (str): The Cognito user id of the poster.
        saved_at (str): The timestamp of the car post.
        liker_id (str): The Cognito user id of the liker.

    Returns:
        A JSON object indicating whether the like was successful with the key "success" and the updated likes count with the key "likes" if "success" is True.
    """

    try:
        # Get connection from pool
        dynamodb = get_dynamodb()
        cars_table = dynamodb.Table(DYNAMODB_TABLE_NAME)
        
        # First get the car details
        car_response = cars_table.get_item(
            Key={
                'userId': poster_id,
                'savedAt': saved_at
            },
            ProjectionExpression="likedBy, likes"
        )
        
        # Car does not exist
        if 'Item' not in car_response:
            return {"success": False, "error": "Car not found"}
            
        # Get existing likes list or empty list if none
        car = car_response['Item']
        liked_by = car.get('likedBy', [])

        # Check if user has already liked the post
        if liker_id in liked_by:
            return {"success": False, "error": "User has already liked this post"}

        # Add user to likedBy list and increment likes count
        liked_by.append(liker_id)
        response = cars_table.update_item(
            Key={
                'userId': poster_id,
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
        
        # Get and return the updated likes count
        updated_likes = response.get('Attributes', {}).get('likes', 0)
        
        return {"success": True, "likes": updated_likes}
    except Exception as e:
        print(f"Error liking car: {str(e)}")
        return {"success": False, "error": str(e)}


@app.post("/unlike-car/{poster_id}/{saved_at}/{liker_id}")
async def unlike_car(poster_id: str, saved_at: str, liker_id: str) -> Dict[str, Any]:
    """
    Remove a like from a post.
    
    Args:
        poster_id (str): The Cognito user id of the poster.
        saved_at (str): The timestamp of the car post.
        liker_id (str): The Cognito user id of the liker.
        
    Returns:
        A JSON object indicating whether the unlike was successful with the key "success" and the updated likes count with the key "likes" if "success" is True.
    """
    
    try:
        # Get connection from pool
        dynamodb = get_dynamodb()
        cars_table = dynamodb.Table(DYNAMODB_TABLE_NAME)
        
        # First get the car details
        car_response = cars_table.get_item(
            Key={
                'userId': poster_id,
                'savedAt': saved_at
            },
            ProjectionExpression="likedBy, likes"
        )
        
        # Car does not exist
        if 'Item' not in car_response:
            return {"success": False, "error": "Car not found"}
            
        # Get existing likes list or empty list if none
        car = car_response['Item']
        liked_by = car.get('likedBy', [])

        # Check if user has liked this post
        if liker_id not in liked_by:
            return {"success": False, "error": "User has not liked this post"}

        # Remove user from likedBy list and decrement likes count
        liked_by.remove(liker_id)
        response = cars_table.update_item(
            Key={
                'userId': poster_id,
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
        
        # Get and return the updated likes count
        updated_likes = response.get('Attributes', {}).get('likes', 0)
        
        return {"success": True, "likes": updated_likes}
    except Exception as e:
        print(f"Error unliking car: {str(e)}")
        return {"success": False, "error": str(e)}


@app.post("/create-user")
async def create_user(user_data: UserInfo) -> Dict[str, Any]:
    """
    Create a new user entry in the users table (Cognito user id and username).
    
    Args:
        user_data (UserInfo): The user data to save.

    Returns:
        A JSON object indicating whether the user creation was successful with the key "success".
    """

    try:
        # Get connection from pool
        dynamodb = get_dynamodb()
        users_table = dynamodb.Table(DYNAMODB_USERS_TABLE_NAME)
        
        # Add the user to the users table
        users_table.put_item(
            Item={
                'userId': user_data.user_id,
                'username': user_data.username,
            }
        )
        
        # Update username cache
        username_cache[user_data.user_id] = user_data.username
        
        return {"success": True}
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        return {"success": False, "error": str(e)}


@app.post("/update-username")
async def update_username(new_user_data: UpdateUsernameInfo) -> Dict[str, Any]:
    """
    Update a user's username in the users table.
    
    Args:
        new_user_data (UpdateUsernameInfo): The user data containing the updated username.
        
    Returns:
        A JSON object indicating whether the update was successful with the key "success".
    """

    try:
        # Get connection from pool
        dynamodb = get_dynamodb()
        users_table = dynamodb.Table(DYNAMODB_USERS_TABLE_NAME)
        
        # Check if username already exists
        response = users_table.scan(
            FilterExpression=Attr("username").eq(new_user_data.new_username),
            ProjectionExpression="userId"
        )
        
        # If username exists and belongs to a different user, reject the update
        if response.get('Items'):
            for item in response.get('Items', []):
                if item.get('userId') != new_user_data.user_id:
                    return {"success": False, "error": "Username already taken"}
        
        # Update the user's username in the users table
        users_table.update_item(
            Key={'userId': new_user_data.user_id},
            UpdateExpression='SET username = :username',
            ExpressionAttributeValues={
                ':username': new_user_data.new_username,
            }
        )
        
        # Update username in cache
        username_cache[new_user_data.user_id] = new_user_data.new_username
        return {"success": True}
    except Exception as e:
        print(f"Error updating username: {str(e)}")
        return {"success": False, "error": str(e)}


@app.post("/get-current-usernames")
async def get_current_usernames(user_ids: list[str]) -> Dict[str, Any]:
    """
    Get the current usernames for a list of Cognito user ids from the users table.

    Args:
        user_ids (list[str]): A list of Cognito user ids.

    Returns:
        A JSON object containing the current usernames for the provided user ids (dict with user id key) with the key "usernames" if "success" is True.
    """

    try:
        # Get connection from pool
        dynamodb = get_dynamodb()
        users_table = dynamodb.Table(DYNAMODB_USERS_TABLE_NAME)
        
        # Get current username for each Cognito user id from users table
        usernames = {}
        for user_id in user_ids:
            # Check cache first
            if user_id in username_cache:
                usernames[user_id] = username_cache[user_id]
            else:
                try:
                    response = users_table.get_item(
                        Key={'userId': user_id},
                        ProjectionExpression="username"
                    )
                    
                    if 'Item' in response:
                        username = response['Item'].get('username', 'Anonymous')
                        usernames[user_id] = username
                        # Cache for future requests
                        username_cache[user_id] = username
                    else:
                        usernames[user_id] = 'Anonymous'
                except Exception:
                    usernames[user_id] = 'Anonymous'
        
        return {"success": True, "usernames": usernames}
    except Exception as e:
        print(f"Error getting usernames: {str(e)}")
        return {"success": False, "error": str(e)}
    

@app.post("/upload-profile-photo/{user_id}")
async def upload_profile_photo(user_id: str, file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Upload a profile photo to S3 and update the user's data to reference the new photo.
    
    Args:
        user_id (str): The Cognito user id of the uploader.
        file (UploadFile): The image file to upload.

    Returns:
        A JSON object indicating whether the upload was successful with the key "success" and the new photo URL with the key "photo_url" if "success" is True.
    """

    try:
        # Get connections from pool
        dynamodb = get_dynamodb()
        users_table = dynamodb.Table(DYNAMODB_USERS_TABLE_NAME)
        s3_client = get_s3_client()
        
        # Retrieve the user's data from the users table
        user_response = users_table.get_item(
            Key={'userId': user_id},
            ProjectionExpression="profilePhoto"
        )

        # Check if user exists
        if 'Item' in user_response:
            # Delete the old profile photo from S3 if it exists
            old_url = user_response['Item'].get('profilePhoto', '')
            if old_url and S3_BUCKET_NAME in old_url:
                try:
                    old_key = old_url.split(f"{S3_BUCKET_NAME}.s3.{aws_region}.amazonaws.com/")[1]
                    s3_client.delete_object(
                        Bucket=S3_BUCKET_NAME,
                        Key=old_key
                    )
                except Exception as s3_error:
                    print(f"Warning: Could not delete old S3 profile photo: {str(s3_error)}")
                    # Continue with the upload process even if deletion fails

            # Process and upload the new image to S3
            _, image_data = process_image(file)
            image_hash = generate_image_hash(image_data)
            s3_url = await upload_to_s3(image_data, user_id, f"profile_{image_hash}")

            # Update the user's profile photo URL in the users table
            users_table.update_item(
                Key={'userId': user_id},
                UpdateExpression='SET profilePhoto = :photo_url',
                ExpressionAttributeValues={
                    ':photo_url': s3_url
                }
            )
            
            # Update cache
            profile_photo_cache[user_id] = s3_url

            return {"success": True, "photo_url": s3_url}
        else:
            return {"success": False, "error": "User not found"}
    except Exception as e:
        print(f"Error uploading profile photo: {str(e)}")
        return {"success": False, "error": str(e)}


@app.post("/get-profile-photos")
async def get_profile_photos(user_ids: List[str]) -> Dict[str, Any]:
    """
    Get the current profile photo S3 urls for a list of Cognito user ids from the users table.
    
    Args:
        user_ids (list[str]): A list of Cognito user ids.
        
    Returns:
        A JSON object containing the current profile photo URLs for the provided user ids (dict with user id key) with the key "photos" if "success" is True.
    """

    try:
        # Get connection from pool
        dynamodb = get_dynamodb()
        users_table = dynamodb.Table(DYNAMODB_USERS_TABLE_NAME)
        
        # Get current profile photo for each Cognito user id from users table
        photos = {}
        
        for user_id in user_ids:
            # Check cache first
            if user_id in profile_photo_cache:
                photos[user_id] = profile_photo_cache[user_id]
            else:
                try:
                    response = users_table.get_item(
                        Key={'userId': user_id},
                        ProjectionExpression="profilePhoto"
                    )
                    
                    # Get the profile photo from the user item
                    if 'Item' in response:
                        photo_url = response['Item'].get('profilePhoto', '')
                        photos[user_id] = photo_url
                        # Cache for future requests
                        profile_photo_cache[user_id] = photo_url
                    else:
                        photos[user_id] = ''
                        profile_photo_cache[user_id] = ''
                except Exception as e:
                    print(f"Warning: Could not get profile photo for user {user_id}: {str(e)}")
                    photos[user_id] = ''
            
        return {"success": True, "photos": photos}
    except Exception as e:
        print(f"Error getting profile photos: {str(e)}")
        return {"success": False, "error": str(e)}


@app.post("/remove-profile-photo/{user_id}")
async def remove_profile_photo(user_id: str) -> Dict[str, Any]:
    """
    Remove a user's profile photo from S3 and update the user's data to remove the photo reference.
    
    Args:
        user_id (str): The Cognito user id of the user.

    Returns:
        A JSON object indicating whether the removal was successful with the key "success".
    """

    try:
        # Get connections from pool
        dynamodb = get_dynamodb()
        users_table = dynamodb.Table(DYNAMODB_USERS_TABLE_NAME)
        s3_client = get_s3_client()
        
        # Retrieve the user's data from the users table
        user_response = users_table.get_item(
            Key={'userId': user_id},
            ProjectionExpression="profilePhoto"
        )

        # Check if user exists
        if 'Item' in user_response:
            # Delete the profile photo from S3 if it exists
            old_url = user_response['Item'].get('profilePhoto', '')
            if old_url and S3_BUCKET_NAME in old_url:
                try:
                    old_key = old_url.split(f"{S3_BUCKET_NAME}.s3.{aws_region}.amazonaws.com/")[1]

                    # Remove from S3
                    s3_client.delete_object(
                        Bucket=S3_BUCKET_NAME,
                        Key=old_key
                    )
                except Exception as s3_error:
                    print(f"Warning: Could not delete S3 profile photo: {str(s3_error)}")
                    # Continue with the process even if S3 deletion fails

                # Update the user's profile photo URL in the users table to empty string
                users_table.update_item(
                    Key={'userId': user_id},
                    UpdateExpression='SET profilePhoto = :photo_url',
                    ExpressionAttributeValues={
                        ':photo_url': ''
                    }
                )
                
                # Update cache
                profile_photo_cache[user_id] = ''

            return {"success": True}
        else:
            return {"success": False, "error": "User not found"}
    except Exception as e:
        print(f"Error removing profile photo: {str(e)}")
        return {"success": False, "error": str(e)}


@app.post("/send-contact-email/")
async def send_contact_email(contact_data: ContactForm) -> Dict[str, Any]:
    """
    Send a contact form email.

    Args:
        contact_data (ContactForm): The contact form data including name, email (optional), and message.
 
    Returns:
        A JSON object indicating whether the email was sent successfully with the key "success".
    """
    
    try:
        # Get email configuration from environment variables
        smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', 587))
        email_user = os.getenv('EMAIL_USER')
        email_password = os.getenv('EMAIL_PASSWORD')
        recipient_email = os.getenv('RECIPIENT_EMAIL', email_user)
        
        if not email_user or not email_password:
            raise HTTPException(status_code=500, detail="Email configuration is missing")
        
        # Create email message
        msg = MIMEMultipart()
        msg['From'] = email_user
        msg['To'] = recipient_email
        msg['Subject'] = f"Website Contact: {contact_data.name}"
        
        # Format the email field for display
        email_display = contact_data.email if contact_data.email else "Not provided"
        
        # Create HTML body
        html = f"""
        <html>
        <body>
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> {contact_data.name}</p>
            <p><strong>Email:</strong> {email_display}</p>
            <hr/>
            <h3>Message:</h3>
            <p>{contact_data.message}</p>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html, 'html'))
        
        # Send email with timeout
        try:
            with smtplib.SMTP(smtp_server, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(email_user, email_password)
                server.send_message(msg)
                
            return {"success": True, "message": "Email sent successfully"}
        except smtplib.SMTPException as smtp_error:
            print(f"SMTP error: {str(smtp_error)}")
            raise HTTPException(status_code=500, detail=f"Failed to send email: {str(smtp_error)}")
        except TimeoutError:
            print("SMTP timeout error")
            raise HTTPException(status_code=504, detail="Email server timeout")
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Email error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")