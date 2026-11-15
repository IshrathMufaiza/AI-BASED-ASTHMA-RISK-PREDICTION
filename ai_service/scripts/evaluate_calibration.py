
from pathlib import Path
import sys
import json

import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.metrics import log_loss
from sklearn.calibration import calibration_curve

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

from feature_config import ALL_FEATURES, TARGET_COLUMN

# Load the existing dataset and trained model
DATASET_PATH = BASE_DIR / "data" / "asthmawatch_synthetic_dataset.csv"
MODEL_PATH = BASE_DIR / "models" / "risk_model.joblib"

df = pd.read_csv(DATASET_PATH)
model = joblib.load(MODEL_PATH)

# Use the existing test split only
test_df = df[df["split"] == "test"].copy()

X_test = test_df[ALL_FEATURES]
y_test = test_df[TARGET_COLUMN]

# Obtain class probabilities
probabilities = model.predict_proba(X_test)
classes = model.classes_

predictions = model.predict(X_test)
correct = (predictions == y_test.to_numpy()).astype(int)

# --------------------------------------------------
# 1. Multiclass probability metrics
# --------------------------------------------------

# Multiclass Brier score
y_one_hot = np.column_stack([
    (y_test.to_numpy() == class_name).astype(int)
    for class_name in classes
])

multiclass_brier = np.mean(
    np.sum((probabilities - y_one_hot) ** 2, axis=1)
)

# Log loss
model_log_loss = log_loss(
    y_test,
    probabilities,
    labels=classes
)

# --------------------------------------------------
# 2. Per-class calibration
# --------------------------------------------------

class_results = {}

plt.figure(figsize=(8, 6))
plt.plot([0, 1], [0, 1], linestyle="--", label="Perfect calibration")

for index, class_name in enumerate(classes):

    actual_class = (y_test.to_numpy() == class_name).astype(int)
    class_probabilities = probabilities[:, index]

    class_brier = np.mean(
        (class_probabilities - actual_class) ** 2
    )

    fraction_positive, mean_predicted = calibration_curve(
        actual_class,
        class_probabilities,
        n_bins=10,
        strategy="quantile"
    )

    class_results[str(class_name)] = {
        "brier_score": float(class_brier),
        "calibration_points": [
            {
                "mean_predicted_probability": float(predicted),
                "actual_fraction": float(actual)
            }
            for predicted, actual in zip(
                mean_predicted,
                fraction_positive
            )
        ]
    }

    plt.plot(
        mean_predicted,
        fraction_positive,
        marker="o",
        label=str(class_name)
    )

plt.xlabel("Mean predicted probability")
plt.ylabel("Actual fraction of class")
plt.title("AsthmaWatch - Per-Class Calibration")
plt.legend()
plt.grid(True)

# Save calibration plot
PLOT_PATH = BASE_DIR / "models" / "calibration_plot.png"
plt.savefig(PLOT_PATH, dpi=150, bbox_inches="tight")
plt.close()

# --------------------------------------------------
# 3. Overall confidence calibration
# --------------------------------------------------

# Confidence means the highest probability assigned
# to any one of the three classes.
confidence = probabilities.max(axis=1)

# Quantile bins contain approximately equal sample counts.
bin_edges = np.unique(
    np.quantile(confidence, np.linspace(0, 1, 11))
)

confidence_bins = []

for lower, upper in zip(bin_edges[:-1], bin_edges[1:]):

    if upper == bin_edges[-1]:
        mask = (confidence >= lower) & (confidence <= upper)
    else:
        mask = (confidence >= lower) & (confidence < upper)

    if not np.any(mask):
        continue

    confidence_bins.append({
        "lower_confidence": float(lower),
        "upper_confidence": float(upper),
        "sample_count": int(mask.sum()),
        "mean_confidence": float(confidence[mask].mean()),
        "actual_accuracy": float(correct[mask].mean())
    })

# Expected Calibration Error (ECE)
ece = sum(
    item["sample_count"] / len(test_df)
    * abs(item["mean_confidence"] - item["actual_accuracy"])
    for item in confidence_bins
)

# --------------------------------------------------
# 4. Print and save results
# --------------------------------------------------

results = {
    "test_samples": int(len(test_df)),
    "class_order": [str(class_name) for class_name in classes],
    "multiclass_brier_score": float(multiclass_brier),
    "log_loss": float(model_log_loss),
    "top_label_ece": float(ece),
    "per_class": class_results,
    "confidence_bins": confidence_bins
}

print("\n========== CALIBRATION EVALUATION ==========")
print(f"Test samples: {len(test_df)}")
print(f"Multiclass Brier score: {multiclass_brier:.4f}")
print(f"Log loss: {model_log_loss:.4f}")
print(f"Top-label ECE: {ece:.4f}")

print("\n--- PER-CLASS BRIER SCORES ---")
for class_name, values in class_results.items():
    print(f"{class_name}: {values['brier_score']:.4f}")

print("\n--- CONFIDENCE BINS ---")
for item in confidence_bins:
    print(
        f"Confidence: {item['mean_confidence']:.3f} | "
        f"Actual accuracy: {item['actual_accuracy']:.3f} | "
        f"Samples: {item['sample_count']}"
    )

OUTPUT_PATH = BASE_DIR / "models" / "calibration_metrics.json"

with open(OUTPUT_PATH, "w") as file:
    json.dump(results, file, indent=4)

print(f"\nMetrics saved to: {OUTPUT_PATH}")
print(f"Calibration plot saved to: {PLOT_PATH}")
