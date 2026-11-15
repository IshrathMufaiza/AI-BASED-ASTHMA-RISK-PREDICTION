
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict

from explainability import AsthmaWatchExplainer
from feature_config import ALL_FEATURES
from language_explainer import generate_language_explanation


# --------------------------------------------------
# 1. Initialize FastAPI
# --------------------------------------------------

app = FastAPI(
    title="AsthmaWatch AI Service",
    description="Asthma risk prediction and SHAP explainability API",
    version="1.0.0",
)


# --------------------------------------------------
# 2. Request schema
# --------------------------------------------------

class SensorReading(BaseModel):
    model_config = ConfigDict(extra="forbid")

    # All 23 sensor-derived features are accepted.
    # Missing values are allowed because the model
    # already has an imputation pipeline.

    hr_bpm: float | None = None
    spo2_pct: float | None = None
    resp_rate_ppg: float | None = None
    ppg_perfusion_index: float | None = None
    hrv_rmssd_ms: float | None = None
    ppg_signal_quality: float | None = None

    temp_c: float | None = None
    humidity_pct: float | None = None
    gas_resistance_kohm: float | None = None

    wheeze_index: float | None = None
    wheeze_band_ratio: float | None = None
    dominant_freq_hz: float | None = None
    spectral_centroid_hz: float | None = None
    spectral_flatness: float | None = None
    cough_count: float | None = None
    ambient_noise_db: float | None = None
    audio_quality: float | None = None

    accel_mean_g: float | None = None
    accel_std_g: float | None = None
    step_count: float | None = None
    trunk_tilt_deg: float | None = None

    activity_level: str | None = None
    posture: str | None = None


# --------------------------------------------------
# 3. Load the trained model and SHAP explainer
# --------------------------------------------------

try:
    explainer = AsthmaWatchExplainer()
    print("AsthmaWatch AI model loaded successfully.")

except Exception as error:
    explainer = None
    print(f"Model loading failed: {error}")


# --------------------------------------------------
# 4. Health endpoint
# --------------------------------------------------

@app.get("/health")
def health_check():

    if explainer is None:
        raise HTTPException(
            status_code=503,
            detail="AI model is not available.",
        )

    return {
        "status": "healthy",
        "service": "AsthmaWatch AI Service",
        "model_loaded": True,
        "explainability": "SHAP",
    }


# --------------------------------------------------
# 5. Prediction endpoint
# --------------------------------------------------


# --------------------------------------------------
# 5. Prediction endpoint
# --------------------------------------------------

@app.post("/predict")
def predict_risk(reading: SensorReading):

    if explainer is None:
        raise HTTPException(
            status_code=503,
            detail="AI model is not available.",
        )

    sensor_data = reading.model_dump()

    # Reject completely empty readings.
    if all(value is None for value in sensor_data.values()):
        raise HTTPException(
            status_code=400,
            detail="At least one sensor reading is required.",
        )

    try:
        # Step 1: Generate Random Forest prediction and SHAP explanation.
        result = explainer.explain(sensor_data)

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}",
        )

    # Step 2: Generate a natural-language explanation using Gemini.
    language_explanation = None
    gemini_status = "unavailable"

    try:
        language_explanation = generate_language_explanation(
            result,
            sensor_data
        )

        gemini_status = "success"

    except Exception as error:
        print(f"Gemini explanation failed: {error}")

    # Step 3: Return the complete response.
    return {
        "success": True,
        "predicted_risk": result["predicted_risk"],
        "probabilities": result["probabilities"],
        "explanation": result["top_contributors"],
        "language_explanation": language_explanation,
        "model_type": "Random Forest",
        "explainability_method": "SHAP",
        "language_model": "Gemini",
        "gemini_status": gemini_status,
        "input_features": ALL_FEATURES,
    }
