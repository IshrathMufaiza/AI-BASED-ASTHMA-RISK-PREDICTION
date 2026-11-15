
from pathlib import Path
import sys
import json

import joblib
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    f1_score,
    classification_report,
    confusion_matrix,
)

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

from feature_config import ALL_FEATURES, TARGET_COLUMN

# Load dataset and trained model
DATASET_PATH = BASE_DIR / "data" / "asthmawatch_synthetic_dataset.csv"
MODEL_PATH = BASE_DIR / "models" / "risk_model.joblib"

df = pd.read_csv(DATASET_PATH)
model = joblib.load(MODEL_PATH)

# Select ONLY the untouched test split
test_df = df[df["split"] == "test"].copy()

X_test = test_df[ALL_FEATURES]
y_test = test_df[TARGET_COLUMN]

# Generate predictions
y_pred = model.predict(X_test)

labels = ["LOW", "MEDIUM", "HIGH"]

# Calculate evaluation metrics
accuracy = accuracy_score(y_test, y_pred)
balanced_accuracy = balanced_accuracy_score(y_test, y_pred)
macro_f1 = f1_score(y_test, y_pred, average="macro")

report = classification_report(
    y_test,
    y_pred,
    labels=labels,
    target_names=labels,
    zero_division=0,
    output_dict=True,
)

matrix = confusion_matrix(
    y_test,
    y_pred,
    labels=labels,
)

# Display results
print("\n========== TEST DATASET EVALUATION ==========")

print(f"\nTest samples: {len(test_df)}")

print(f"\nAccuracy: {accuracy:.4f}")
print(f"Balanced Accuracy: {balanced_accuracy:.4f}")
print(f"Macro F1-score: {macro_f1:.4f}")

print("\n--- CLASSIFICATION REPORT ---")
print(
    classification_report(
        y_test,
        y_pred,
        labels=labels,
        target_names=labels,
        zero_division=0,
    )
)

print("\n--- CONFUSION MATRIX ---")
print("Rows = Actual | Columns = Predicted")
print("Order: LOW, MEDIUM, HIGH")
print(matrix)

# Save results
results = {
    "test_samples": len(test_df),
    "accuracy": accuracy,
    "balanced_accuracy": balanced_accuracy,
    "macro_f1": macro_f1,
    "classification_report": report,
    "confusion_matrix": matrix.tolist(),
    "class_order": labels,
}

OUTPUT_PATH = BASE_DIR / "models" / "test_metrics.json"

with open(OUTPUT_PATH, "w") as file:
    json.dump(results, file, indent=4)

print(f"\nResults saved to: {OUTPUT_PATH}")
