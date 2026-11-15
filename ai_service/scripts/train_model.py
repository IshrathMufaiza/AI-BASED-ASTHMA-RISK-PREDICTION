
import json
import sys
from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    balanced_accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


# --------------------------------------------------
# 1. Project paths and feature configuration
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

from feature_config import (
    TARGET_COLUMN,
    NUMERIC_FEATURES,
    CATEGORICAL_FEATURES,
    ALL_FEATURES,
)

DATASET_PATH = BASE_DIR / "data" / "asthmawatch_synthetic_dataset.csv"
OUTPUT_DIR = BASE_DIR / "models"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# 2. Load and validate dataset
# --------------------------------------------------

print("\nLoading AsthmaWatch dataset...")

df = pd.read_csv(DATASET_PATH)

required_columns = ALL_FEATURES + [
    TARGET_COLUMN,
    "split",
    "patient_id",
]

missing_columns = [
    col for col in required_columns if col not in df.columns
]

if missing_columns:
    raise ValueError(f"Missing dataset columns: {missing_columns}")

if df[TARGET_COLUMN].isnull().any():
    raise ValueError("Target column contains missing labels.")

print("Dataset loaded:", df.shape)


# --------------------------------------------------
# 3. Separate patient-level splits
# --------------------------------------------------

train_df = df[df["split"] == "train"].copy()
val_df = df[df["split"] == "val"].copy()
test_df = df[df["split"] == "test"].copy()

if train_df.empty or val_df.empty or test_df.empty:
    raise ValueError("One or more dataset splits are empty.")

# Verify that patients do not overlap between splits.
train_patients = set(train_df["patient_id"])
val_patients = set(val_df["patient_id"])
test_patients = set(test_df["patient_id"])

if (
    train_patients & val_patients
    or train_patients & test_patients
    or val_patients & test_patients
):
    raise ValueError("Patient overlap detected between dataset splits!")

print("\nDataset split sizes:")
print("Training:", len(train_df))
print("Validation:", len(val_df))
print("Testing:", len(test_df))

print("\nTraining risk distribution:")
print(train_df[TARGET_COLUMN].value_counts())


# --------------------------------------------------
# 4. Prepare features and target
# --------------------------------------------------

X_train = train_df[ALL_FEATURES]
y_train = train_df[TARGET_COLUMN]

X_val = val_df[ALL_FEATURES]
y_val = val_df[TARGET_COLUMN]


# --------------------------------------------------
# 5. Build preprocessing pipeline
# --------------------------------------------------

numeric_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
])

categorical_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("encoder", OneHotEncoder(handle_unknown="ignore")),
])

preprocessor = ColumnTransformer([
    ("numeric", numeric_pipeline, NUMERIC_FEATURES),
    ("categorical", categorical_pipeline, CATEGORICAL_FEATURES),
])


# --------------------------------------------------
# 6. Build Random Forest model
# --------------------------------------------------

random_forest = RandomForestClassifier(
    n_estimators=300,
    max_features="sqrt",
    class_weight="balanced_subsample",
    random_state=42,
    n_jobs=-1,
)

model = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", random_forest),
])


# --------------------------------------------------
# 7. Train model
# --------------------------------------------------

print("\nTraining Random Forest model...")

model.fit(X_train, y_train)

print("Training completed!")


# --------------------------------------------------
# 8. Evaluate on validation data
# --------------------------------------------------

print("\nEvaluating validation data...")

y_val_pred = model.predict(X_val)

balanced_acc = balanced_accuracy_score(y_val, y_val_pred)
macro_f1 = f1_score(y_val, y_val_pred, average="macro")

print("\n========== VALIDATION RESULTS ==========")
print(f"Balanced Accuracy: {balanced_acc:.4f}")
print(f"Macro F1 Score:    {macro_f1:.4f}")

print("\nClassification Report:")
report = classification_report(
    y_val,
    y_val_pred,
    zero_division=0,
)
print(report)

labels = list(model.named_steps["classifier"].classes_)

print("\nConfusion Matrix:")
print(confusion_matrix(y_val, y_val_pred, labels=labels))


# --------------------------------------------------
# 9. Save trained model and validation metrics
# --------------------------------------------------

model_path = OUTPUT_DIR / "risk_model.joblib"
metrics_path = OUTPUT_DIR / "validation_metrics.json"

joblib.dump(model, model_path)

metrics = {
    "balanced_accuracy": float(balanced_acc),
    "macro_f1": float(macro_f1),
    "classification_report": classification_report(
        y_val,
        y_val_pred,
        output_dict=True,
        zero_division=0,
    ),
    "confusion_matrix": confusion_matrix(
        y_val,
        y_val_pred,
        labels=labels,
    ).tolist(),
    "classes": labels,
    "features": ALL_FEATURES,
}

with open(metrics_path, "w") as file:
    json.dump(metrics, file, indent=4)

print("\n========== SAVED FILES ==========")
print("Model:", model_path)
print("Metrics:", metrics_path)

print("\nTraining pipeline completed successfully!")
