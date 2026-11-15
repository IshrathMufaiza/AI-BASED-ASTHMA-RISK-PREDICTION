
import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai


# Load environment variables from ai_service/.env
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

if not API_KEY:
    raise ValueError(
        "GEMINI_API_KEY not found. Check your ai_service/.env file."
    )

# Initialize Gemini client
client = genai.Client(api_key=API_KEY)

print("Gemini API key loaded successfully.")
print("Testing model:", MODEL)

# Send a harmless test prompt
response = client.models.generate_content(
    model=MODEL,
    contents="Reply with exactly: AsthmaWatch Gemini connection successful."
)

print("\nGemini response:")
print(response.text)
