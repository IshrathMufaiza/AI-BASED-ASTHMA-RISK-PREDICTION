
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap
from scipy.sparse import issparse


# --------------------------------------------------
# 1. Project paths and configuration
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

from feature_config import ALL_FEATURES, TARGET_COLUMN

DATASET_PATH = BASE_DIR / "data" / "asthmawatch_synthetic_dataset.csv"
MODEL_PATH = BASE_DIR / "models" / "risk_model.joblib"


# --------------------------------------------------
# 2. Load model and validation data
# --------------------------------------------------

print("\nLoading trained model and dataset...")

model = joblib.load(MODEL_PATH)
df = pd.read_csv(DATASET_PATH)

val_df = df[df["split"] == "val"].copy()

X_val = val_df[ALL_FEATURES]
y_val = val_df[TARGET_COLUMN]

print("Model and validation data loaded.")


# --------------------------------------------------
# 3. Select a sample predicted as HIGH risk
# --------------------------------------------------

predictions = model.predict(X_val)

# Prefer a HIGH-risk sample that the model classified correctly.
high_correct_indices = np.where(
    (predictions == "HIGH") &
    (y_val.to_numpy() == "HIGH")
)[0]

if len(high_correct_indices) > 0:
    sample_index = high_correct_indices[0]
else:
    # Fall back to any sample predicted as HIGH.
    high_indices = np.where(predictions == "HIGH")[0]

    if len(high_indices) == 0:
        raise ValueError("No HIGH-risk predictions found.")

    sample_index = high_indices[0]

sample = X_val.iloc[[sample_index]]
actual_risk = y_val.iloc[sample_index]
predicted_risk = predictions[sample_index]

print("\n========== SELECTED SAMPLE ==========")
print("Actual risk:", actual_risk)
print("Predicted risk:", predicted_risk)

probabilities = model.predict_proba(sample)[0]
classifier = model.named_steps["classifier"]
classes = classifier.classes_

print("\nPrediction probabilities:")

for class_name, probability in zip(classes, probabilities):
    print(f"{class_name}: {probability:.4f}")


# --------------------------------------------------
# 4. Apply the trained preprocessing pipeline
# --------------------------------------------------

preprocessor = model.named_steps["preprocessor"]

transformed_sample = preprocessor.transform(sample)

if issparse(transformed_sample):
    transformed_sample = transformed_sample.toarray()

feature_names = preprocessor.get_feature_names_out()


# --------------------------------------------------
# 5. Generate SHAP explanations
# --------------------------------------------------

print("\nGenerating SHAP explanations...")

explainer = shap.TreeExplainer(classifier)

shap_explanation = explainer(transformed_sample)

shap_values = np.asarray(shap_explanation.values)

# Handle different SHAP output shapes.
if shap_values.ndim == 2:
    class_values = shap_values

elif shap_values.ndim == 3:

    if shap_values.shape[0] == 1:
        # Shape: samples, features, classes
        if shap_values.shape[1] == len(feature_names):
            class_values = shap_values[0]

        # Shape: samples, classes, features
        elif shap_values.shape[2] == len(feature_names):
            class_values = shap_values[0].T

        else:
            raise ValueError(
                f"Unexpected SHAP output shape: {shap_values.shape}"
            )

    # Shape: classes, samples, features
    elif (
        shap_values.shape[1] == 1
        and shap_values.shape[2] == len(feature_names)
    ):
        class_values = shap_values[:, 0, :].T

    else:
        raise ValueError(
            f"Unexpected SHAP output shape: {shap_values.shape}"
        )

else:
    raise ValueError(
        f"Unsupported SHAP output dimensions: {shap_values.shape}"
    )


# --------------------------------------------------
# 6. Extract explanation for predicted class
# --------------------------------------------------

class_index = list(classes).index(predicted_risk)

contributions = class_values[:, class_index]

explanation_df = pd.DataFrame({
    "feature": feature_names,
    "shap_value": contributions,
})

explanation_df["abs_shap"] = explanation_df["shap_value"].abs()

explanation_df = explanation_df.sort_values(
    "abs_shap",
    ascending=False,
)


# --------------------------------------------------
# 7. Display explanation
# --------------------------------------------------

print("\n========== SHAP EXPLANATION ==========")
print("Explaining predicted class:", predicted_risk)

print("\nTop contributing features:")
print(
    explanation_df[
        ["feature", "shap_value"]
    ].head(10).to_string(index=False)
)

print("\nFactors pushing towards the predicted class:")

positive = explanation_df[
    explanation_df["shap_value"] > 0
].sort_values("shap_value", ascending=False)

print(
    positive[["feature", "shap_value"]]
    .head(5)
    .to_string(index=False)
)

print("\nFactors pushing away from the predicted class:")

negative = explanation_df[
    explanation_df["shap_value"] < 0
].sort_values("shap_value")

print(
    negative[["feature", "shap_value"]]
    .head(5)
    .to_string(index=False)
)

print("\nSHAP explanation generated successfully!")
