from feature_formatter import format_contributions
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap
from scipy.sparse import issparse

from feature_config import ALL_FEATURES


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "risk_model.joblib"


class AsthmaWatchExplainer:

    def __init__(self):
        self.model = joblib.load(MODEL_PATH)

        self.preprocessor = self.model.named_steps["preprocessor"]
        self.classifier = self.model.named_steps["classifier"]

        self.feature_names = (
            self.preprocessor.get_feature_names_out()
        )

        self.explainer = shap.TreeExplainer(self.classifier)

    def explain(self, sensor_reading):

        # Convert input into a DataFrame.
        input_df = pd.DataFrame(
            [sensor_reading],
            columns=ALL_FEATURES,
        )

        # Generate prediction.
        prediction = self.model.predict(input_df)[0]

        probabilities = self.model.predict_proba(input_df)[0]

        probability_dict = {
            str(label): float(probability)
            for label, probability in zip(
                self.classifier.classes_,
                probabilities,
            )
        }

        # Apply the same preprocessing used during training.
        transformed = self.preprocessor.transform(input_df)

        if issparse(transformed):
            transformed = transformed.toarray()

        # Generate SHAP values.
        shap_output = self.explainer(transformed)

        values = np.asarray(shap_output.values)

        # Extract SHAP values for the predicted class.
        if values.ndim == 2:
            class_values = values

        elif values.ndim == 3:
            if values.shape[0] != 1:
                raise ValueError("Expected one input sample.")

            if values.shape[1] == len(self.feature_names):
                class_values = values[0]

            elif values.shape[2] == len(self.feature_names):
                class_values = values[0].T

            else:
                raise ValueError(
                    f"Unexpected SHAP output shape: {values.shape}"
                )

        else:
            raise ValueError(
                f"Unsupported SHAP output shape: {values.shape}"
            )

        class_index = list(
            self.classifier.classes_
        ).index(prediction)

        contributions = class_values[:, class_index]

        # Prepare structured feature contributions.
        explanation = []

        for feature, shap_value in zip(
            self.feature_names,
            contributions,
        ):
            explanation.append({
                "feature": str(feature),
                "shap_value": float(shap_value),
                "direction": (
                    "towards" if shap_value > 0
                    else "away" if shap_value < 0
                    else "neutral"
                ),
            })

        
        explanation.sort(
            key=lambda item: abs(item["shap_value"]),
            reverse=True,
        )

        formatted_explanation = format_contributions(
            explanation[:10],
            sensor_reading,
        )

        return {
            "predicted_risk": str(prediction),
            "probabilities": probability_dict,
            "top_contributors": formatted_explanation,
        }

