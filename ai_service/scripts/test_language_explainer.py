
from pathlib import Path
import sys
import pandas as pd

# Make the ai_service directory importable
BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

from explainability import AsthmaWatchExplainer
from language_explainer import generate_language_explanation

# Load a sample from the validation dataset
dataset_path = BASE_DIR / "data" / "asthmawatch_synthetic_dataset.csv"
df = pd.read_csv(dataset_path)

sample = df[df["split"] == "val"].iloc[0]

# Keep only the 23 model input features
from feature_config import ALL_FEATURES

sensor_reading = sample[ALL_FEATURES].to_dict()

# Generate Random Forest prediction and SHAP explanation
explainer = AsthmaWatchExplainer()
prediction_result = explainer.explain(sensor_reading)

print("\n--- MODEL PREDICTION ---")
print(prediction_result["predicted_risk"])

print("\n--- GEMINI EXPLANATION ---")
explanation = generate_language_explanation(
    prediction_result,
    sensor_reading
)

print(explanation)
