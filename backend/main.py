from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import google.generativeai as genai
import pillow_heif
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
model = genai.GenerativeModel('gemini-2.0-flash')

app = FastAPI()

# Enable CORS - TODO: change before deploy
app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:3000", "http://192.168.0.24:3000"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Define preprocessing transformations
def preprocess_image(image: UploadFile) -> Image:
    # Load image using PIL
    image_bytes = io.BytesIO(image.file.read())

    try:
        # Try to open normally
        image = Image.open(image_bytes)
    except Image.UnidentifiedImageError:
        # If it's a HEIC file, use pillow-heif to convert
        heif_image = pillow_heif.open_heif(image_bytes)
        image = Image.frombytes(
            heif_image.mode, 
            heif_image.size, 
            heif_image.data
        )

    image = image.convert('RGB')
    return image


@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    # Process the image
    image = preprocess_image(file)
    
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