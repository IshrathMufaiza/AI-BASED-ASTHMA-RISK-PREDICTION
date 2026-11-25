
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict

from explainability import AsthmaWatchExplainer
from feature_config import ALL_FEATURES


# --------------------------------------------------
# 1. Initialize FastAPI
# --------------------------------------------------

app = FastAPI(
    title="AsthmaWatch AI Service",
    description="Random Forest asthma risk prediction with SHAP explainability",
    version="1.0.0",
)


# --------------------------------------------------
# 2. Request schema
# --------------------------------------------------

class SensorReading(BaseModel):
    model_config = ConfigDict(extra="forbid")

    # Wristband: MAX30102
    hr_bpm: float | None = None
    spo2_pct: float | None = None
    resp_rate_ppg: float | None = None
    ppg_perfusion_index: float | None = None
    hrv_rmssd_ms: float | None = None
    ppg_signal_quality: float | None = None

    # Wristband: BME680
    temp_c: float | None = None
    humidity_pct: float | None = None
    gas_resistance_kohm: float | None = None

    # Pendant: INMP441
    wheeze_index: float | None = None
    wheeze_band_ratio: float | None = None
    dominant_freq_hz: float | None = None
    spectral_centroid_hz: float | None = None
    spectral_flatness: float | None = None
    cough_count: float | None = None
    ambient_noise_db: float | None = None
    audio_quality: float | None = None


# --------------------------------------------------
# 3. Load the trained model and SHAP explainer
# --------------------------------------------------

try:
    explainer = AsthmaWatchExplainer()
    print("AsthmaWatch Random Forest model loaded successfully.")
    print("SHAP explainer loaded successfully.")

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
        "model_type": "Random Forest",
        "explainability": "SHAP",
    }


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
        # Generate Random Forest prediction and SHAP explanation.
        result = explainer.explain(sensor_data)

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}",
        )

    # Return prediction and explainability results.
    return {
        "success": True,
        "predicted_risk": result["predicted_risk"],
        "probabilities": result["probabilities"],
        "explanation": result["top_contributors"],
        "language_explanation": None,
        "model_type": "Random Forest",
        "explainability_method": "SHAP",
        "input_features": ALL_FEATURES,
    }
