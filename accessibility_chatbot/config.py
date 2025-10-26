import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    UPLOAD_FOLDER = 'uploads' # Directory to temporarily store uploaded files
    OUTPUT_FOLDER = 'outputs' # Directory to store generated PDFs
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 # 16 MB limit for uploads