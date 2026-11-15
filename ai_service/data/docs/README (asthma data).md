# AsthmaWatch — Synthetic Multi-Sensor Dataset

> **All data is synthetic / simulated** (`data_source = "synthetic"`). It is for validating the data-fusion and Explainable AI pipeline, not clinical evidence.

## 1. Dataset at a glance
| Item                | Value                    |
|:--------------------|:-------------------------|
| Rows                | 50,400                   |
| Patients            | 60                       |
| Sessions            | 840                      |
| Windows per session | 60 (1 minute each)       |
| Columns             | 47                       |
| Date range          | 2026-09-01 to 2026-09-29 |
| Data source         | synthetic (all rows)     |
| Seed                | 42                       |

## 2. Files
| File | Description |
|---|---|
| `asthmawatch_synthetic_dataset.csv` | Main window-level dataset (one row per 1-minute window) |
| `asthmawatch_synthetic_patients.csv` | Per-child profile and baselines (60 rows) |
| `DATA_DICTIONARY.md` | Column definitions |
| `generate_synthetic_data.py` | Generator (`--patients`, `--sessions`, `--seed`) |

## 3. Hardware → feature mapping
| Device | Sensor | Features in the dataset |
|---|---|---|
| Wristband | MAX30102 | `hr_bpm`, `spo2_pct`, `resp_rate_ppg`, `ppg_perfusion_index`, `hrv_rmssd_ms`, `ppg_signal_quality` |
| Wristband | BME680 | `temp_c`, `humidity_pct`, `gas_resistance_kohm` (no barometric pressure) |
| Pendant | INMP441 | `wheeze_index`, `wheeze_band_ratio`, `dominant_freq_hz`, `spectral_centroid_hz`, `spectral_flatness`, `cough_count`, `ambient_noise_db`, `audio_quality` |
| Pendant | MPU6050 | `accel_mean_g`, `accel_std_g`, `step_count`, `trunk_tilt_deg`, `activity_level`, `posture` |

## 4. Class distribution
| risk_label   |   rows |   percent |
|:-------------|-------:|----------:|
| LOW          |  29433 |      58.4 |
| MEDIUM       |  13642 |      27.1 |
| HIGH         |   7325 |      14.5 |

## 5. Train / validation / test split (by patient)
| split   |   patients |   rows |
|:--------|-----------:|-------:|
| test    |          9 |   7560 |
| train   |         42 |  35280 |
| val     |          9 |   7560 |

## 6. Scenarios vs risk label (% of each scenario's rows)
| scenario           |   LOW |   MEDIUM |   HIGH |   rows |
|:-------------------|------:|---------:|-------:|-------:|
| exercise_induced   |  68   |     24.6 |    7.4 |   3840 |
| high_risk_episode  |   8.1 |     27.4 |   64.5 |   8160 |
| increased_activity |  98.4 |      1.6 |    0   |   5820 |
| mild_symptoms      |   9.8 |     86.3 |    3.9 |   7800 |
| normal_activity    | 100   |      0   |    0   |   8400 |
| normal_rest        | 100   |      0   |    0   |   7440 |
| recovery           |  34.9 |     43.8 |   21.4 |   3840 |
| trigger_exposure   |  48.8 |     38.3 |   12.9 |   5100 |

## 7. Feature summary
| feature              | device    | sensor         |   mean |    std |    min |   median |     max |   missing_% |
|:---------------------|:----------|:---------------|-------:|-------:|-------:|---------:|--------:|------------:|
| hr_bpm               | Wristband | MAX30102       | 111.12 |  15.39 |  67.2  |   110.4  |  177.9  |        1.54 |
| spo2_pct             | Wristband | MAX30102       |  95.88 |   2.69 |  86.5  |    96.8  |  100    |        1.47 |
| resp_rate_ppg        | Wristband | MAX30102 (PPG) |  29.5  |   4.72 |  13.6  |    29.6  |   45.4  |        1.5  |
| ppg_perfusion_index  | Wristband | MAX30102       |   2.25 |   0.84 |   0.63 |     2.31 |    4.85 |        1.5  |
| hrv_rmssd_ms         | Wristband | MAX30102       |  51.51 |  11.18 |  20    |    50.9  |   99.7  |        1.51 |
| ppg_signal_quality   | Wristband | MAX30102       |   0.8  |   0.15 |   0.26 |     0.84 |    1    |        0    |
| temp_c               | Wristband | BME680         |  28.24 |   2.68 |  23.06 |    28.53 |   33.05 |        1.48 |
| humidity_pct         | Wristband | BME680         |  59.09 |  12.18 |  28.3  |    57.1  |   98    |        1.53 |
| gas_resistance_kohm  | Wristband | BME680         | 213.49 |  99.17 |  17.1  |   222.7  |  459.7  |        1.52 |
| wheeze_index         | Pendant   | INMP441        |   0.23 |   0.22 |   0    |     0.15 |    1    |        1.03 |
| wheeze_band_ratio    | Pendant   | INMP441        |   0.2  |   0.13 |   0    |     0.16 |    0.77 |        1.03 |
| dominant_freq_hz     | Pendant   | INMP441        | 331.33 | 155.39 | 110    |   300    |  830    |        1.06 |
| spectral_centroid_hz | Pendant   | INMP441        | 828.51 | 207.6  | 376    |   773    | 1701    |        1.02 |
| spectral_flatness    | Pendant   | INMP441        |   0.39 |   0.08 |   0.05 |     0.4  |    0.62 |        1.04 |
| cough_count          | Pendant   | INMP441        |   1.09 |   1.49 |   0    |     1    |   13    |        0    |
| ambient_noise_db     | Pendant   | INMP441        |  44.7  |   6.56 |  27    |    43.6  |   70.2  |        0    |
| audio_quality        | Pendant   | INMP441        |   0.9  |   0.07 |   0.46 |     0.92 |    1    |        0    |
| accel_mean_g         | Pendant   | MPU6050        |   0.16 |   0.13 |   0.01 |     0.12 |    0.54 |        1.05 |
| accel_std_g          | Pendant   | MPU6050        |   0.12 |   0.1  |   0.01 |     0.09 |    0.41 |        1.02 |
| step_count           | Pendant   | MPU6050        |  31.48 |  32.89 |   0    |    22    |  151    |        0    |
| trunk_tilt_deg       | Pendant   | MPU6050        |  14.59 |   8.15 |   0    |    13.8  |   51.2  |        1.02 |

## 8. Average sensor values by risk level
| risk_label   |   hr_bpm |   spo2_pct |   resp_rate_ppg |   wheeze_index |   cough_count |   step_count |   trunk_tilt_deg |   gas_resistance_kohm |
|:-------------|---------:|-----------:|----------------:|---------------:|--------------:|-------------:|-----------------:|----------------------:|
| LOW          |   110.39 |       97.6 |           28.18 |           0.09 |          0.4  |        42.18 |            11.08 |                220.86 |
| MEDIUM       |   110.82 |       95   |           30.17 |           0.32 |          1.44 |        21.11 |            15.51 |                200.69 |
| HIGH         |   114.64 |       90.6 |           33.56 |           0.64 |          3.24 |         7.78 |            27.03 |                207.76 |

## 9. Healthy exertion vs genuine high risk (why context matters)
| metric                       |   healthy exertion (increased_activity) |   true HIGH risk (high_risk_episode) |
|:-----------------------------|----------------------------------------:|-------------------------------------:|
| hr_bpm                       |                                  135.1  |                               114.7  |
| spo2_pct                     |                                   97.3  |                                90    |
| resp_rate_ppg                |                                   35.3  |                                33.9  |
| wheeze_index                 |                                    0.11 |                                 0.67 |
| step_count                   |                                   99.6  |                                 5    |
| rule_based flags non-LOW (%) |                                   96.9  |                               100    |

## 10. Sample rows — first 8 rows of the file
| patient_id   | timestamp           | scenario    |   hr_bpm |   spo2_pct |   resp_rate_ppg |   temp_c |   humidity_pct |   gas_resistance_kohm |   wheeze_index |   cough_count |   step_count | activity_level   | risk_label   |
|:-------------|:--------------------|:------------|---------:|-----------:|----------------:|---------:|---------------:|----------------------:|---------------:|--------------:|-------------:|:-----------------|:-------------|
| SYN-001      | 2026-09-01 16:57:00 | normal_rest |    100   |       98.7 |            22   |    24.66 |           48   |                 332.9 |          0.099 |             1 |            0 | sedentary        | LOW          |
| SYN-001      | 2026-09-01 16:58:00 | normal_rest |    101.1 |       98.2 |            20.9 |    24.57 |           46.3 |                 320   |          0.07  |             0 |            0 | sedentary        | LOW          |
| SYN-001      | 2026-09-01 16:59:00 | normal_rest |    101.3 |       97.8 |            21   |    24.46 |           46.8 |                 326.4 |          0.034 |             0 |            0 | sedentary        | LOW          |
| SYN-001      | 2026-09-01 17:00:00 | normal_rest |    101.7 |       97.8 |            22.4 |    24.1  |           47   |                 326.4 |          0.052 |             1 |            0 | sedentary        | LOW          |
| SYN-001      | 2026-09-01 17:01:00 | normal_rest |    106.8 |       98.1 |            19.9 |    24.17 |           47.3 |                 319.9 |          0     |             0 |            0 | sedentary        | LOW          |
| SYN-001      | 2026-09-01 17:02:00 | normal_rest |    107.6 |       97.8 |            21.1 |    24.09 |           47.7 |                 323.2 |          0.075 |             0 |            0 | sedentary        | LOW          |
| SYN-001      | 2026-09-01 17:03:00 | normal_rest |    105.6 |       97.5 |            21.7 |    24.07 |           46.1 |                 332.9 |          0     |             0 |            0 | sedentary        | LOW          |
| SYN-001      | 2026-09-01 17:04:00 | normal_rest |    102.8 |       98.4 |            22.9 |    24.24 |           45.5 |                 324.7 |          0.082 |             1 |            0 | sedentary        | LOW          |

## 11. Sample rows — random LOW / MEDIUM / HIGH
| patient_id   | timestamp           | scenario          |   hr_bpm |   spo2_pct |   resp_rate_ppg |   temp_c |   humidity_pct |   gas_resistance_kohm |   wheeze_index |   cough_count |   step_count | activity_level   | risk_label   |
|:-------------|:--------------------|:------------------|---------:|-----------:|----------------:|---------:|---------------:|----------------------:|---------------:|--------------:|-------------:|:-----------------|:-------------|
| SYN-047      | 2026-09-16 09:47:00 | high_risk_episode |    107.6 |       96.5 |            25.4 |    31.92 |           50.4 |                 204.6 |          0.193 |             0 |           40 | light            | LOW          |
| SYN-003      | 2026-09-24 12:44:00 | normal_activity   |     91   |       98.3 |            25.1 |    24.5  |           51.1 |                 317.9 |          0.008 |             1 |           32 | light            | LOW          |
| SYN-056      | 2026-09-03 19:04:00 | trigger_exposure  |    125.6 |       98.3 |            27.1 |    26.36 |           78.1 |                 101.3 |          0.064 |             0 |           46 | light            | LOW          |
| SYN-047      | 2026-09-22 15:32:00 | exercise_induced  |    102.1 |       96.2 |            27.8 |    32.25 |           58.7 |                 200.5 |          0.312 |             3 |           16 | sedentary        | MEDIUM       |
| SYN-018      | 2026-09-23 12:25:00 | exercise_induced  |    127.6 |       93.8 |            33.6 |    31.93 |           51.9 | — |          0.429 |             0 |            6 | sedentary        | MEDIUM       |
| SYN-060      | 2026-09-02 08:45:00 | trigger_exposure  |    137.2 |       94.3 |            33.5 |    29.61 |           61.2 |                  24   |          0.48  |             5 |           27 | light            | MEDIUM       |
| SYN-033      | 2026-09-24 17:53:00 | high_risk_episode |    107.5 |       93.3 |            33.6 |    28.69 |           43.6 |                 210.1 |          0.751 |             3 |            0 | sedentary        | HIGH         |
| SYN-012      | 2026-09-02 21:36:00 | high_risk_episode |    114.3 |       89.5 |            35.2 |    24.89 |           58.3 |                 387.2 |          0.826 |             5 |            0 | sedentary        | HIGH         |
| SYN-028      | 2026-09-16 09:07:00 | high_risk_episode |    109   |       92.1 |            31.8 |    28.67 |           60.8 |                 268.4 |          0.556 |             1 |            0 | sedentary        | HIGH         |
| SYN-020      | 2026-09-16 09:00:00 | exercise_induced  |    105.5 |       94   |            28.7 |    26.39 |           86.6 |                 163.1 |          0.638 |             0 |            0 | sedentary        | HIGH         |

## 12. Patient profiles (first 8 of 60)
| patient_id   |   age_years | sex   | baseline_asthma_severity   |   baseline_hr_bpm |   baseline_spo2_pct |   baseline_resp_rate |   wheeze_sensitivity |   trigger_sensitivity | split   |
|:-------------|------------:|:------|:---------------------------|------------------:|--------------------:|---------------------:|---------------------:|----------------------:|:--------|
| SYN-001      |           9 | M     | mild_persistent            |              95.6 |                98.4 |                 19.5 |                 1.14 |                  0.9  | train   |
| SYN-002      |          14 | F     | mild_persistent            |              77.8 |                97.8 |                 17.2 |                 1.12 |                  0.87 | train   |
| SYN-003      |          14 | M     | moderate_persistent        |              77.3 |                98.1 |                 19.9 |                 1.09 |                  0.86 | train   |
| SYN-004      |          14 | F     | mild_persistent            |              81   |                98.1 |                 20.3 |                 0.74 |                  0.6  | test    |
| SYN-005      |           9 | M     | intermittent               |              86.3 |                98.1 |                 21.6 |                 0.96 |                  0.71 | train   |
| SYN-006      |           7 | F     | moderate_persistent        |              87   |                98   |                 24.1 |                 0.9  |                  1.07 | train   |
| SYN-007      |           7 | M     | mild_persistent            |              94.4 |                98.4 |                 21.8 |                 1.06 |                  1.44 | train   |
| SYN-008      |          13 | F     | moderate_persistent        |              76.6 |                98.6 |                 19.2 |                 0.82 |                  1.09 | train   |

Baseline severity mix:

| baseline_asthma_severity   |   patients |
|:---------------------------|-----------:|
| mild_persistent            |         24 |
| intermittent               |         22 |
| moderate_persistent        |         14 |

## 13. Metadata and label columns
| Column | Type | Meaning |
|---|---|---|
| `patient_id`, `session_id`, `window_idx`, `timestamp` | key | Child, 1-hour session, minute index 0–59, time |
| `split` | key | train / val / test (patient-level) |
| `scenario` | context | normal_rest, normal_activity, increased_activity, mild_symptoms, trigger_exposure, exercise_induced, high_risk_episode, recovery |
| `env_type` | context | indoor_ac, indoor_home, outdoor_day, outdoor_monsoon, cooking_smoke, dust_or_incense |
| `activity_level`, `posture` | feature | Categorical activity and posture from MPU6050 |
| `risk_label`, `risk_label_id` | **target** | LOW / MEDIUM / HIGH (0 / 1 / 2) |
| `risk_next_15min` | **target** | Label 15 minutes ahead within the session (forecasting) |
| `rule_based_risk` | baseline | Naive absolute-threshold rules to compare against |
| `latent_severity`, `latent_activity`, `env_risk_index` | evaluation only | Hidden generator state — do not use as inputs |
| `ref_driver_spo2_drop` | evaluation only | SpO₂ ≥ 2.5 points below the child's baseline |
| `ref_driver_hr_above_expected` | evaluation only | HR ≥ 12 bpm above what activity alone explains |
| `ref_driver_wheeze` | evaluation only | Wheeze index ≥ 0.35 |
| `ref_driver_resp_rate` | evaluation only | Respiratory rate well above activity-expected |
| `ref_driver_low_activity_context` | evaluation only | Low activity while risk is above LOW |
| `ref_driver_env_trigger` | evaluation only | Environmental risk index ≥ 0.45 |
| `ref_driver_cough` | evaluation only | Cough count ≥ 2 |
| `ref_n_drivers` | evaluation only | Number of active driver flags |
| `motion_artifact_flag` | quality | Window affected by motion artefact |

## 14. Realism built in
| Aspect | How it is simulated |
|---|---|
| Per-child baselines | Age-dependent HR / RR, own SpO₂, wheeze and trigger sensitivity |
| Confounding | Exercise raises HR and RR without being dangerous |
| Lagged effects | Exercise-induced symptoms appear after activity stops; triggers act with a delay |
| Rare cases | "Silent chest": severe but little wheeze |
| Time of day | Night-time worsening, sleep lowers HR |
| Sensor problems | ~1% missing values, dropout bursts, motion artefacts on SpO₂ / HR |

## 15. Suggested usage
| Step | Recommendation |
|---|---|
| Inputs | Features in sections 3 and 13 marked "feature" — never `latent_*`, `ref_*`, `env_risk_index` |
| Targets | `risk_label_id` (now) or `risk_next_15min` (forecasting) |
| Splitting | Use the provided `split` column (patient-level) |
| Explainability | Compare SHAP / LIME top features against the `ref_driver_*` flags |
| Baseline | Compare against `rule_based_risk` |
| Real data | Expect lower accuracy than on this synthetic data |
