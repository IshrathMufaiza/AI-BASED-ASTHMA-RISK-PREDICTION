# AsthmaWatch - Model Feature Configuration

TARGET_COLUMN = "risk_label"

# Wristband: MAX30102 + BME680
NUMERIC_FEATURES = [
    "hr_bpm",
    "spo2_pct",
    "resp_rate_ppg",
    "ppg_perfusion_index",
    "hrv_rmssd_ms",
    "ppg_signal_quality",
    "temp_c",
    "humidity_pct",
    "gas_resistance_kohm",

    # Pendant: INMP441
    "wheeze_index",
    "wheeze_band_ratio",
    "dominant_freq_hz",
    "spectral_centroid_hz",
    "spectral_flatness",
    "cough_count",
    "ambient_noise_db",
    "audio_quality",

    # Pendant: MPU6050
    "accel_mean_g",
    "accel_std_g",
    "step_count",
    "trunk_tilt_deg",
]

CATEGORICAL_FEATURES = [
    "activity_level",
    "posture",
]

ALL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES