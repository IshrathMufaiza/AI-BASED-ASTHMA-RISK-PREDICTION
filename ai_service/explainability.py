
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap
from scipy.sparse import issparse

from feature_config import ALL_FEATURES
from feature_formatter import format_contributions


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "risk_model.joblib"


class AsthmaWatchExplainer:
    def __init__(self):
        self.model = joblib.load(MODEL_PATH)

        self.preprocessor = self.model.named_steps["preprocessor"]
        self.classifier = self.model.named_steps["classifier"]

        self.feature_names = self.preprocessor.get_feature_names_out()
        self.classes = list(self.classifier.classes_)

        self.explainer = shap.TreeExplainer(self.classifier)

    def explain(self, sensor_reading):
        # Prepare the sensor input
        input_df = pd.DataFrame(
            [sensor_reading],
            columns=ALL_FEATURES
        )

        # Generate model prediction
        prediction = self.model.predict(input_df)[0]
        probabilities = self.model.predict_proba(input_df)[0]

        probability_dict = {
            str(label): float(probability)
            for label, probability in zip(
                self.classes,
                probabilities
            )
        }

        # Transform input using the model's preprocessor
        transformed = self.preprocessor.transform(input_df)

        if issparse(transformed):
            transformed = transformed.toarray()

        # Generate SHAP explanation
        shap_output = self.explainer(transformed)
        values = np.asarray(shap_output.values)

        # Validate SHAP output dimensions
        expected_shape = (
            1,
            len(self.feature_names),
            len(self.classes)
        )

        if values.shape != expected_shape:
            raise ValueError(
                f"Unexpected SHAP output shape: {values.shape}. "
                f"Expected: {expected_shape}"
            )

        # Select SHAP values for the predicted risk class
        class_index = self.classes.index(prediction)
        contributions = values[0, :, class_index]

        # Build feature contribution list
        explanation = []

        for feature, shap_value in zip(
            self.feature_names,
            contributions
        ):
            shap_value = float(shap_value)

            explanation.append({
                "feature": str(feature),
                "shap_value": shap_value,
                "direction": (
                    "towards" if shap_value > 0
                    else "away" if shap_value < 0
                    else "neutral"
                )
            })

        # Sort by absolute SHAP contribution
        explanation.sort(
            key=lambda item: abs(item["shap_value"]),
            reverse=True
        )

        # Convert technical feature names into readable information
        formatted_explanation = format_contributions(
            explanation[:10],
            sensor_reading
        )

        return {
            "predicted_risk": str(prediction),
            "probabilities": probability_dict,
            "top_contributors": formatted_explanation
        }
