
import sys
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

from feature_config import ALL_FEATURES, TARGET_COLUMN
from explainability import AsthmaWatchExplainer


# Load a correctly classified HIGH-risk validation sample.
df = pd.read_csv(
    BASE_DIR / "data" / "asthmawatch_synthetic_dataset.csv"
)

val_df = df[df["split"] == "val"].copy()

explainer = AsthmaWatchExplainer()

X_val = val_df[ALL_FEATURES]
predictions = explainer.model.predict(X_val)

correct_high_indices = [
    i for i, (pred, actual) in enumerate(
        zip(predictions, val_df[TARGET_COLUMN])
    )
    if pred == "HIGH" and actual == "HIGH"
]

if not correct_high_indices:
    raise ValueError("No correctly predicted HIGH sample found.")

sample_index = correct_high_indices[0]
sample = X_val.iloc[sample_index].to_dict()

# Generate explanation using the reusable module.
result = explainer.explain(sample)

print("\n========== EXPLAINABILITY MODULE TEST ==========")
print("Actual risk:", val_df.iloc[sample_index][TARGET_COLUMN])
print("Predicted risk:", result["predicted_risk"])

print("\nProbabilities:")
for label, probability in result["probabilities"].items():
    print(f"{label}: {probability:.4f}")

print("\nTop contributing features:")
for item in result["top_contributors"]:
    print(
        f'{item["feature"]}: '
        f'{item["shap_value"]:.5f} '
        f'({item["direction"]})'
    )

print("\nExplainability module test completed!")
