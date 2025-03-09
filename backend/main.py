from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import torch
import numpy as np
import pillow_heif

IMAGE_SIZE = (512, 512)

# Load model and set to evaluation mode
model = torch.jit.load("models/jit_model_val95_test99.pth", map_location=torch.device("cpu"))
model.eval()

app = FastAPI()

# Enable CORS - TODO: change before deploy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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

    # Resize to match training dimensions
    image = image.convert('RGB').resize(IMAGE_SIZE)

    # Convert to numpy array and normalize
    image = np.array(image, dtype=np.float32) / 255.0

    # Convert to PyTorch tensor as (C, H, W)
    image = torch.tensor(image).permute(2, 0, 1)

    return image.unsqueeze(0)


@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    image = preprocess_image(file)
    print(image.shape)
    
    # Run prediction
    with torch.no_grad():
        print(image.shape)
        output = model(image)
    
    # Convert to label
    prediction = torch.argmax(output, dim=1).item()

    return {"prediction": prediction + 1}
