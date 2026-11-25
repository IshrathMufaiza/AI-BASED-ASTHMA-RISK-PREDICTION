
import os
import json
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env")


# Gemini request timeout: 25 seconds
client = genai.Client(
    api_key=API_KEY,
    http_options=types.HttpOptions(timeout=25000)
)


def generate_language_explanation(prediction_result, sensor_reading):
    """
    Generates a human-readable explanation using Gemini.

    Gemini is optional. If it fails, the calling API
    should retain the Random Forest prediction and SHAP output.
    """

    context = {
        "predicted_risk": prediction_result["predicted_risk"],
        "probabilities": prediction_result["probabilities"],
        "top_contributors": prediction_result["top_contributors"],
        "sensor_readings": sensor_reading,
    }

    prompt = f"""
You are the explanation component of AsthmaWatch,
an experimental asthma-monitoring prototype.

Explain the model output using ONLY the information provided.

MODEL OUTPUT:
{json.dumps(context, indent=2)}

Instructions:
1. Keep the predicted risk category exactly as provided.
2. Do not modify or reinterpret model probabilities.
3. Explain important contributing sensor features simply.
4. Positive SHAP contribution means a feature pushed
   the model towards its predicted class.
5. Negative SHAP contribution means a feature pushed
   the model away from its predicted class.
6. SHAP contributions describe model behaviour,
   not medical causes.
7. Do not invent readings, symptoms, or diagnoses.
8. Do not describe model probability as the probability
   of an asthma attack.
9. Do not recommend medication or treatment.
10. Mention that this is experimental, not a clinical diagnosis.

Return a concise explanation with these sections:

Predicted Risk:
Overall Explanation:
Important Contributing Features:
Important Note:

Return the actual explanation, not these instructions.
Do not copy any instruction sentence into the response.
"""

    try:
        print("Sending one Gemini explanation request...")

        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=250,
                temperature=0.2
            )
        )

        # TEMPORARY DEBUGGING
        print("Gemini response:", response)
        print("Candidates:", response.candidates)
        print("Prompt feedback:", response.prompt_feedback)

        if not response.text:
            raise ValueError(
                "Gemini returned an empty explanation."
            )

        explanation = response.text.strip()

        # Prevent prompt instructions from being saved as explanations
        invalid_responses = [
            "Do not invent readings, symptoms, or diagnoses",
            "Return a concise explanation with these sections"
        ]

        if any(
            invalid in explanation
            for invalid in invalid_responses
        ):
            raise ValueError(
                "Gemini returned prompt instructions instead "
                "of a generated explanation."
            )

        print("Gemini explanation generated successfully.")

        return explanation

    except Exception as error:
        print(f"Gemini explanation unavailable: {error}")
        raise
