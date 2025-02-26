from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import torch
import numpy as np
import pillow_heif

# Load model and set to evaluation mode
model = torch.jit.load("models/model.pth", map_location=torch.device("cpu"))
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

    # Convert to grayscale
    image = image.convert("L")

    # Resize to match training dimensions (128x128)
    image = image.resize((128, 128))

    # Convert to numpy array and normalize
    image = np.array(image) / 255.0

    # Add channel dimension (1, 128, 128)
    image = np.expand_dims(image, axis=0)

    # Convert to PyTorch tensor
    image_tensor = torch.tensor(image, dtype=torch.float32)

    # Add batch dimension (1, 1, 128, 128)
    image_tensor = image_tensor.unsqueeze(0)

    return image_tensor  # Shape: (1, 1, 128, 128)


@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    image = preprocess_image(file)
    
    # Run prediction
    with torch.no_grad():
        output = model(image)
    
    # Convert to label
    prediction = torch.argmax(output, dim=1).item()

    return {"prediction": prediction}
