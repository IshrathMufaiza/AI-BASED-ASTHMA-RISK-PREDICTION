
import pandas as pd

# Load the main AsthmaWatch dataset
dataset_path = "data/asthmawatch_synthetic_dataset.csv"

df = pd.read_csv(dataset_path)

# Display basic information
print("\n========== DATASET OVERVIEW ==========")
print("Number of records:", df.shape[0])
print("Number of columns:", df.shape[1])

# Display all column names
print("\n========== COLUMN NAMES ==========")
print(df.columns.tolist())

# Display data types
print("\n========== DATA TYPES ==========")
print(df.dtypes)

# Check missing values
print("\n========== MISSING VALUES ==========")
print(df.isnull().sum()[df.isnull().sum() > 0])

# Check risk distribution
print("\n========== RISK DISTRIBUTION ==========")
print(df["risk_label"].value_counts())

# Check patient distribution
print("\n========== PATIENT DISTRIBUTION ==========")
print(df["patient_id"].nunique())

print("\nDataset inspection completed!")


# Check patient-level data splitting

print("\n========== DATA SPLIT ANALYSIS ==========")

# Count records in each split
print("\nRecords in each split:")
print(df["split"].value_counts())

# Count unique patients in each split
print("\nUnique patients in each split:")
print(df.groupby("split")["patient_id"].nunique())

# Check whether any patient appears in multiple splits
patient_split_counts = df.groupby("patient_id")["split"].nunique()

overlapping_patients = patient_split_counts[
    patient_split_counts > 1
]

print("\nPatients appearing in multiple splits:")
print(overlapping_patients)

print("\nSplit verification completed!")


# Sensor-wise missing data analysis

wristband_features = [
    "hr_bpm",
    "spo2_pct",
    "resp_rate_ppg",
    "ppg_perfusion_index",
    "hrv_rmssd_ms",
    "ppg_signal_quality",
    "temp_c",
    "humidity_pct",
    "gas_resistance_kohm"
]

pendant_features = [
    "wheeze_index",
    "wheeze_band_ratio",
    "dominant_freq_hz",
    "spectral_centroid_hz",
    "spectral_flatness",
    "cough_count",
    "ambient_noise_db",
    "audio_quality",
    "accel_mean_g",
    "accel_std_g",
    "step_count",
    "trunk_tilt_deg"
]

print("\n========== WRISTBAND MISSING DATA ==========")
print(df[wristband_features].isnull().sum())

print("\n========== PENDANT MISSING DATA ==========")
print(df[pendant_features].isnull().sum())
