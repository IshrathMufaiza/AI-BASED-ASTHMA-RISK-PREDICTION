
# AsthmaWatch - SHAP Feature Formatter

FEATURE_DETAILS = {
    "hr_bpm": ("Heart rate", "beats/min", "Wristband"),
    "spo2_pct": ("Blood oxygen level (SpO2)", "%", "Wristband"),
    "resp_rate_ppg": ("Respiratory rate", "breaths/min", "Wristband"),
    "ppg_perfusion_index": ("PPG perfusion index", None, "Wristband"),
    "hrv_rmssd_ms": ("Heart rate variability", "ms", "Wristband"),
    "ppg_signal_quality": ("PPG signal quality", None, "Wristband"),
    "temp_c": ("Environmental temperature", "°C", "Wristband"),
    "humidity_pct": ("Environmental humidity", "%", "Wristband"),
    "gas_resistance_kohm": ("Gas resistance", "kΩ", "Wristband"),

    "wheeze_index": ("Wheezing intensity", None, "Pendant"),
    "wheeze_band_ratio": ("Wheezing frequency-band ratio", None, "Pendant"),
    "dominant_freq_hz": ("Dominant audio frequency", "Hz", "Pendant"),
    "spectral_centroid_hz": ("Audio spectral centroid", "Hz", "Pendant"),
    "spectral_flatness": ("Audio spectral flatness", None, "Pendant"),
    "cough_count": ("Cough count", "count", "Pendant"),
    "ambient_noise_db": ("Ambient noise level", "dB", "Pendant"),
    "audio_quality": ("Audio signal quality", None, "Pendant"),

    "accel_mean_g": ("Mean acceleration", "g", "Pendant"),
    "accel_std_g": ("Acceleration variation", "g", "Pendant"),
    "step_count": ("Step count", "steps", "Pendant"),
    "trunk_tilt_deg": ("Body tilt angle", "degrees", "Pendant"),

    "activity_level": ("Activity level", None, "Pendant"),
    "posture": ("Body posture", None, "Pendant"),
}


def format_contributions(contributions, sensor_reading):

    formatted = []

    for item in contributions:

        feature_name = item["feature"]
        raw_value = None
        original_feature = None
        category_value = None

        if feature_name.startswith("numeric__"):
            original_feature = feature_name.replace(
                "numeric__", "", 1
            )
            raw_value = sensor_reading.get(original_feature)

        elif feature_name.startswith("categorical__"):

            encoded_name = feature_name.replace(
                "categorical__", "", 1
            )

            for category in ("activity_level", "posture"):
                prefix = category + "_"

                if encoded_name.startswith(prefix):
                    original_feature = category
                    category_value = encoded_name[len(prefix):]
                    raw_value = sensor_reading.get(category)
                    break

        if original_feature not in FEATURE_DETAILS:
            continue

        label, unit, device = FEATURE_DETAILS[original_feature]

        formatted.append({
            "feature": original_feature,
            "label": label,
            "device": device,
            "input_value": raw_value,
            "unit": unit,
            "imputed": raw_value is None,
            "shap_value": item["shap_value"],
            "direction": item["direction"],
            "encoded_category": category_value,
        })

    return formatted
