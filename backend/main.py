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
from typing import Optional, List, Dict, Any
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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

# Configure Gemini API (Gemini 2.0 Flash)
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
model = genai.GenerativeModel('gemini-2.0-flash')

# Configure AWS services
aws_region = os.getenv('AWS_REGION')
aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')

# DynamoDB setup for car posts and user info
dynamodb = boto3.resource(
    'dynamodb', 
    region_name=aws_region,
    aws_access_key_id=aws_access_key,
    aws_secret_access_key=aws_secret_key
)
cars_table = dynamodb.Table(os.getenv('DYNAMODB_TABLE_NAME'))
users_table = dynamodb.Table(os.getenv('DYNAMODB_USERS_TABLE_NAME'))

# Cognito setup for auth
cognito_client = boto3.client(
    'cognito-idp',
    region_name=aws_region,
    aws_access_key_id=aws_access_key,
    aws_secret_access_key=aws_secret_key
)

# S3 setup for image storage
s3_client = boto3.client(
    's3',
    region_name=aws_region,
    aws_access_key_id=aws_access_key,
    aws_secret_access_key=aws_secret_key
)
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')

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
    Process an uploaded image.
    
    Args:
        image (UploadFile): The image as a file.
        
    Returns:
        A tuple containing the processed PIL image and the original image bytes.
    """

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
        pil_image.save(buffer, format="JPEG")
        image_data = buffer.getvalue()

    # Ensure that image is RGB
    pil_image = pil_image.convert('RGB')

    return pil_image, image_data


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
        raise e


@app.post("/predict/")
async def predict(image: UploadFile) -> Dict[str, Any]:
    """
    Identify the car in an image with Gemini.

    Args:
        image (UploadFile): The image as a file.
 
    Returns:
        The car information in JSON format containing keys for the car's make, model, year, rarity, and link to additional information with the key "car" if "success" is True.
    """

    # Process the image first 
    image, _ = process_image(image)
    
    # Gemini prompt
    prompt = """
        Please analyze this car image and provide the following details in a structured format:
        - Make (Manufacturer)
        - Model (Do not include any information that isn't needed, just the model name, number, and trim if you are very confident in the trim)
        - Exact Year (Be exact if possible; if the exact year cannot be determined, provide the possible year range)
        - Rarity (Choose one: Unknown (if there is no car or unknown info), Common, Rare, Very Rare, or Extremely Rare)
        - Link (Wikipedia link for the car)

        If there is no car, return all details as "n/a".

        Please ensure the response is formatted as a JSON object with the following keys: make, model, year, rarity, link
    """

    # Generate response with Gemini
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
        
        # Return the parsed details
        car = {
            "make": parsed_response.get("make"),
            "model": parsed_response.get("model"),
            "year": parsed_response.get("year"),
            "rarity": parsed_response.get("rarity"),
            "link": parsed_response.get("link")
        }
        return {"success": True, "car": car}
    except json.JSONDecodeError as e:
        return {"success": False, "error": "Failed to parse response as JSON", "response_text": response.text}
    except Exception as e:
        return {"success": False, "error": str(e)}


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
        return {"success": False, "error": str(e)}


@app.get("/get-user-cars/{user_id}")
async def get_user_cars(user_id: str) -> Dict[str, Any]:
    """
    Retrieve the cars saved by a specific user.
    
    Args:
        user_id (str): THe Cognito user id of the requester.
        
    Returns:
        A JSON object containing a list of CarData for all of the user's saved cars with the key "cars" if "success" is True.
    """

    try:
        # Query DynamoDB for user's saved cars (newest first)
        response = cars_table.query(
            KeyConditionExpression='userId = :uid',
            ExpressionAttributeValues={
                ':uid': user_id
            },
            ScanIndexForward=False
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
        # Scan DynamoDB for all car entries
        response = cars_table.scan()
        
        # Format the response
        cars = []
        for item in response.get('Items', []):
            # Skip private cars
            if item.get('isPrivate', False):
                continue
            
            # Get current username from users table
            user_response = users_table.get_item(
                Key={'userId': item.get('userId')}
            )
            current_username = user_response.get('Item', {}).get('username', item.get('username', 'Anonymous'))
                
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
                'likedBy': item.get('likedBy', []),
                'username': current_username,
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
        # First get the car details
        car_response = cars_table.get_item(
            Key={
                'userId': poster_id,
                'savedAt': saved_at
            }
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
        # First get the car details
        car_response = cars_table.get_item(
            Key={
                'userId': poster_id,
                'savedAt': saved_at
            }
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
        # Add the user to the users table
        users_table.put_item(
            Item={
                'userId': user_data.user_id,
                'username': user_data.username,
            }
        )
        return {"success": True}
    except Exception as e:
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
        # Check if username already exists
        response = users_table.scan(
            FilterExpression="username = :username",
            ExpressionAttributeValues={
                ":username": new_user_data.new_username
            }
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
        return {"success": True}
    except Exception as e:
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
        # Get current username for each Cognito user id from users table
        usernames = {}
        for user_id in user_ids:
            try:
                response = users_table.get_item(
                    Key={'userId': user_id}
                )
                # Get the username from the user item
                if 'Item' in response:
                    usernames[user_id] = response['Item'].get('username', None)
                else:
                    usernames[user_id] = None
            except Exception as e:
                usernames[user_id] = None
        
        return {"success": True, "usernames": usernames}
    except Exception as e:
        return {"success": False, "error": str(e)}
    

@app.post("/upload-profile-photo/{user_id}")
async def upload_profile_photo(user_id: str, file: UploadFile = File) -> Dict[str, Any]:
    """
    Upload a profile photo to S3 and update the user's data to reference the new photo.
    
    Args:
        user_id (str): The Cognito user id of the uploader.
        file (UploadFile): The image file to upload.

    Returns:
        A JSON object indicating whether the upload was successful with the key "success" and the new photo URL with the key "photo_url" if "success" is True.
    """

    try:
        # Retrieve the user's data from the users table
        user_response = users_table.get_item(
            Key={'userId': user_id}
        )

        # Check if user exists
        if 'Item' in user_response:
            # Delete the old profile photo from S3 if it exists
            old_url = user_response['Item'].get('profilePhoto', '')
            if old_url:
                old_key = old_url.split(f"{S3_BUCKET_NAME}.s3.{aws_region}.amazonaws.com/")[1]

                s3_client.delete_object(
                    Bucket=S3_BUCKET_NAME,
                    Key=old_key
                )

            # Process and upload the new image to S3
            _, image_data = process_image(file)
            s3_url = await upload_to_s3(image_data, user_id, generate_image_hash(image_data))

            # Update the user's profile photo URL in the users table
            users_table.update_item(
                Key={'userId': user_id},
                UpdateExpression='SET profilePhoto = :photo_url',
                ExpressionAttributeValues={
                    ':photo_url': s3_url
                }
            )

            return {"success": True, "photo_url": s3_url}
        else:
            return {"success": False, "error": "User not found"}
    except Exception as e:
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
        # Get current profile photo for each Cognito user id from users table
        photos = {}
        for user_id in user_ids:
            try:
                response = users_table.get_item(
                    Key={'userId': user_id}
                )
                # Get the profile photo from the user item
                if 'Item' in response:
                    photos[user_id] = response['Item'].get('profilePhoto', '')
                else:
                    photos[user_id] = ''
            except Exception as e:
                photos[user_id] = ''
        
        return {"success": True, "photos": photos}
    except Exception as e:
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
        # Retrieve the user's data from the users table
        user_response = users_table.get_item(
            Key={'userId': user_id}
        )

        # Check if user exists
        if 'Item' in user_response:
            # Delete the profile photo from S3 if it exists
            old_url = user_response['Item'].get('profilePhoto', '')
            if old_url:
                old_key = old_url.split(f"{S3_BUCKET_NAME}.s3.{aws_region}.amazonaws.com/")[1]

                # Remove from S3
                s3_client.delete_object(
                    Bucket=S3_BUCKET_NAME,
                    Key=old_key
                )

                # Update the user's profile photo URL in the users table to empty string
                users_table.update_item(
                    Key={'userId': user_id},
                    UpdateExpression='SET profilePhoto = :photo_url',
                    ExpressionAttributeValues={
                        ':photo_url': ''
                    }
                )

            return {"success": True}
        else:
            return {"success": False, "error": "User not found"}
    except Exception as e:
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
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(email_user, email_password)
            server.send_message(msg)
        
        return {"success": True, "message": "Email sent successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")