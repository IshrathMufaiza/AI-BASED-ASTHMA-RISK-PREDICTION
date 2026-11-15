
import os
import json
from pathlib import Path

from dotenv import load_dotenv
from google import genai

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=API_KEY)


def generate_language_explanation(prediction_result, sensor_reading):
    """
    Converts Random Forest predictions and SHAP contributions
    into a clear, human-readable explanation.
    """

    context = {
        "predicted_risk": prediction_result["predicted_risk"],
        "probabilities": prediction_result["probabilities"],
        "top_contributors": prediction_result["top_contributors"],
        "sensor_readings": sensor_reading,
    }

    prompt = f"""
You are the explanation component of AsthmaWatch,
a prototype asthma-monitoring system.

Explain the model output using ONLY the information provided below.

MODEL OUTPUT:
{json.dumps(context, indent=2)}

Instructions:
1. Keep the predicted risk category exactly as provided.
2. Do not modify or reinterpret the model probabilities.
3. Explain the important contributing sensor features in simple language.
4. A positive SHAP contribution means the feature pushed the
   model towards its predicted class.
5. A negative SHAP contribution means the feature pushed the
   model away from its predicted class.
6. SHAP contributions describe model behaviour, not medical causes.
7. Do not invent readings, symptoms, diagnoses, or medical facts.
8. Do not describe model probability as the probability of an
   asthma attack.
9. Do not recommend medication or treatment.
10. Clearly mention that this is an experimental prediction,
    not a clinical diagnosis.

Return a concise explanation with these sections:

Predicted Risk:
Overall Explanation:
Important Contributing Features:
Important Note:
"""

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt
    )

    return response.text
