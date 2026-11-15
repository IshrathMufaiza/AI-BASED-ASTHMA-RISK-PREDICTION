"""
AsthmaWatch - synthetic two-device multi-sensor dataset generator
=================================================================
ALL DATA PRODUCED HERE IS SYNTHETIC / SIMULATED (column data_source = "synthetic").

Devices / sensors (per project report):
  Wristband : MAX30102 (HR, SpO2, PPG-derived) + BME680 (temp, humidity, gas resistance; NO pressure)
  Pendant   : INMP441 (audio -> wheeze features) + MPU6050 (motion / activity / posture)

Design idea
-----------
A hidden *latent severity* s(t) in [0, 1] and a hidden *activity level* a(t) in [0, 1] drive every
sensor, each with its own sensitivity, lag, noise, per-child baseline and artefacts. The risk label
(LOW / MEDIUM / HIGH) comes from s(t). Because sensors are noisy, confounded (exercise raises HR and
RR without being dangerous) and lagged (exercise-induced symptoms appear AFTER the activity stops),
a model has to genuinely combine devices and context - which is exactly what makes the explanations
(SHAP / LIME / counterfactuals) interesting to test.

Usage:  python generate_synthetic_data.py [--patients 60] [--sessions 14] [--seed 42]
"""
import argparse
import numpy as np
import pandas as pd

WINDOW_SEC = 60          # one row = one 1-minute analysis window
SESSION_LEN = 60         # windows per session (1 hour)
LOW_T, HIGH_T = 0.33, 0.62   # latent severity thresholds for LOW/MEDIUM/HIGH

SCENARIOS = ["normal_rest", "normal_activity", "increased_activity", "mild_symptoms",
             "trigger_exposure", "exercise_induced", "high_risk_episode", "recovery"]

SCEN_WEIGHTS = {  # by patient baseline asthma severity
    "intermittent":        [.22, .20, .14, .12, .10, .07, .09, .06],
    "mild_persistent":     [.16, .16, .12, .14, .12, .08, .14, .08],
    "moderate_persistent": [.11, .11, .08, .16, .13, .09, .22, .10],
}
SEV_MULT = {"intermittent": 0.85, "mild_persistent": 1.0, "moderate_persistent": 1.15}

ENV_TYPES = {  # temp mean, humidity mean, gas resistance (kOhm) median, ambient noise add (dB)
    "indoor_ac":        (24.5, 48, 320, 0),
    "indoor_home":      (28.5, 60, 240, 2),
    "outdoor_day":      (32.0, 52, 200, 6),
    "outdoor_monsoon":  (26.5, 86, 170, 5),
    "cooking_smoke":    (30.5, 66, 70, 4),
    "dust_or_incense":  (29.5, 58, 55, 1),
}
ENV_WEIGHTS = [.25, .30, .20, .10, .08, .07]


def ar1(n, rho, sd, rng):
    x = np.zeros(n)
    e = rng.normal(0, sd, n)
    for i in range(1, n):
        x[i] = rho * x[i - 1] + e[i]
    return x


def ema(x, alpha):
    out = np.zeros_like(x)
    out[0] = x[0]
    for i in range(1, len(x)):
        out[i] = alpha * x[i] + (1 - alpha) * out[i - 1]
    return out


def smooth_clip(x, lo=0.0, hi=1.0):
    return np.clip(x, lo, hi)


# --------------------------------------------------------------------------- patients
def make_patients(n, rng):
    rows = []
    sev_choices = rng.choice(list(SEV_MULT), size=n, p=[.40, .38, .22])
    for i in range(n):
        age = int(rng.integers(6, 15))
        sex = rng.choice(["F", "M"])
        sev = sev_choices[i]
        hr_base = rng.normal(98 - 2.4 * (age - 6), 5)          # resting HR falls with age
        rr_base = rng.normal(24 - 0.6 * (age - 6), 1.6)        # resting resp rate falls with age
        rows.append(dict(
            patient_id=f"SYN-{i+1:03d}", age_years=age, sex=sex, baseline_asthma_severity=sev,
            on_controller_medication=bool(rng.random() < {"intermittent": .2, "mild_persistent": .6,
                                                           "moderate_persistent": .9}[sev]),
            baseline_hr_bpm=round(hr_base, 1),
            baseline_spo2_pct=round(np.clip(rng.normal(98.3, 0.5), 96.5, 99.5), 1),
            baseline_resp_rate=round(rr_base, 1),
            baseline_perfusion_index=round(float(rng.uniform(1.0, 4.0)), 2),
            baseline_rmssd_ms=round(float(rng.normal(62 + 1.5 * (age - 6), 8)), 1),
            wheeze_sensitivity=round(float(np.clip(rng.normal(1.0, 0.18), 0.6, 1.4)), 2),
            trigger_sensitivity=round(float(np.clip(rng.normal(1.0, 0.3), 0.4, 1.8)), 2),
            gas_sensor_baseline_factor=round(float(rng.uniform(0.8, 1.25)), 2),
        ))
    return pd.DataFrame(rows)


# --------------------------------------------------------------------------- scenario profiles
def scenario_profile(scn, n, rng):
    """Return target latent severity s_t and activity a_t (before smoothing/noise) and env override."""
    u = np.linspace(0, 1, n)
    env_force = None
    if scn == "normal_rest":
        s = np.full(n, rng.uniform(0.03, 0.12)); a = np.full(n, rng.uniform(0.02, 0.08))
    elif scn == "normal_activity":
        s = np.full(n, rng.uniform(0.05, 0.15)); a = np.full(n, rng.uniform(0.28, 0.5))
    elif scn == "increased_activity":
        s = np.full(n, rng.uniform(0.06, 0.18)); a = np.full(n, rng.uniform(0.7, 0.95))
        # normal exertion bump: breathless but NOT asthmatic
        s = s + 0.08 * np.sin(np.pi * u)
    elif scn == "mild_symptoms":
        s = np.full(n, rng.uniform(0.34, 0.52)) + 0.06 * np.sin(2 * np.pi * u * rng.uniform(0.5, 1.5))
        a = np.full(n, rng.uniform(0.08, 0.3))
    elif scn == "trigger_exposure":
        onset = rng.uniform(0.15, 0.35)
        ramp = np.clip((u - onset) / 0.5, 0, 1)
        s = 0.10 + rng.uniform(0.3, 0.55) * ramp
        a = np.full(n, rng.uniform(0.1, 0.3))
        env_force = rng.choice(["cooking_smoke", "dust_or_incense", "outdoor_monsoon"])
    elif scn == "exercise_induced":
        stop = rng.uniform(0.28, 0.4)
        a = np.where(u < stop, rng.uniform(0.7, 0.92), rng.uniform(0.04, 0.15))
        peak = stop + rng.uniform(0.15, 0.28)
        s = 0.10 + rng.uniform(0.45, 0.7) * np.exp(-((u - peak) ** 2) / (2 * 0.12 ** 2))
        s = np.where(u < stop, 0.10 + 0.05 * u / stop, s)
    elif scn == "high_risk_episode":
        t0 = rng.uniform(0.0, 0.2)
        ramp = np.clip((u - t0) / 0.45, 0, 1)
        s = 0.30 + rng.uniform(0.5, 0.75) * ramp
        a = np.clip(0.3 - 0.28 * ramp, 0.03, 1)      # child sits down / stops playing
    elif scn == "recovery":
        s = 0.72 * np.exp(-u * rng.uniform(1.5, 3.0)) + 0.1
        a = np.full(n, rng.uniform(0.03, 0.12))
    else:
        raise ValueError(scn)
    return s, a, env_force


# --------------------------------------------------------------------------- session simulation
def simulate_session(p, scn, session_id, start_ts, rng):
    n = SESSION_LEN
    s_t, a_t, env_force = scenario_profile(scn, n, rng)

    # ---- environment (BME680 on wristband) ----
    env_type = env_force or rng.choice(list(ENV_TYPES), p=ENV_WEIGHTS)
    t_mu, h_mu, g_mu, noise_add = ENV_TYPES[env_type]
    temp = t_mu + 0.7 * ar1(n, 0.97, 0.12, rng) + rng.normal(0, 0.08, n)
    hum = np.clip(h_mu + 3.0 * ar1(n, 0.97, 0.5, rng) + rng.normal(0, 0.4, n), 20, 98)
    gas_log = np.log(g_mu * p.gas_sensor_baseline_factor) + 0.15 * ar1(n, 0.95, 0.07, rng)
    if scn == "trigger_exposure":   # VOC load builds up -> gas resistance falls
        u = np.linspace(0, 1, n)
        gas_log = gas_log - 0.9 * np.clip((u - 0.1) / 0.4, 0, 1)
    gas = np.exp(gas_log + rng.normal(0, 0.03, n))          # kOhm
    gas_term = np.clip((260 - gas / p.gas_sensor_baseline_factor) / 260, 0, 1)
    hum_term = np.clip((np.abs(hum - 50) - 10) / 40, 0, 1)
    temp_term = np.clip((np.abs(temp - 26) - 3) / 10, 0, 1)
    env_risk = np.clip(0.6 * gas_term + 0.25 * hum_term + 0.15 * temp_term, 0, 1)

    # ---- latent severity & activity ----
    env_lag = np.roll(env_risk, 5); env_lag[:5] = env_risk[0]
    a = smooth_clip(ema(a_t, 0.4) + ar1(n, 0.8, 0.03, rng))
    s = s_t * SEV_MULT[p.baseline_asthma_severity] + 0.10 * env_lag * p.trigger_sensitivity
    s = smooth_clip(ema(s, 0.35) + ar1(n, 0.9, 0.02, rng))
    a_phys = ema(a, 0.3)                                     # physiological lag of HR/RR behind activity

    hour = (start_ts.hour + np.arange(n) * WINDOW_SEC / 3600.0)
    sleeping = ((hour % 24) >= 22) | ((hour % 24) < 6)
    night_worse = np.where(sleeping, 0.04, 0.0)
    s = smooth_clip(s + night_worse * (s > 0.2))

    # ---- pendant: motion (MPU6050) ----
    accel_mean = 0.012 + 0.50 * a + np.abs(rng.normal(0, 0.01, n))
    accel_std = 0.010 + 0.38 * a + np.abs(rng.normal(0, 0.01, n))
    steps = np.clip(np.round(130 * a * rng.uniform(0.7, 1.15, n) + rng.normal(0, 3, n)), 0, None)
    steps = np.where(a < 0.08, 0, steps).astype(int)
    tilt = np.where(a < 0.2, 8 + 26 * s * (1 - a) + rng.normal(0, 5, n), rng.uniform(2, 20, n))
    tilt = np.clip(tilt, 0, 70)
    act_cat = pd.cut(a, [-1, .12, .35, .65, 2], labels=["sedentary", "light", "moderate", "vigorous"]).astype(str)
    posture = np.where(sleeping & (a < .08), "lying",
              np.where(a < .12, np.where(tilt > 22, "sitting_leaning_forward", "sitting"),
              np.where(a < .35, "standing", np.where(a < .65, "walking", "running"))))

    # ---- pendant: audio (INMP441) ----
    noise_db = 36 + noise_add + 22 * a + rng.normal(0, 2.5, n)
    wh_true = 0.02 + 0.90 * np.clip(s, 0, 1) ** 1.4 * p.wheeze_sensitivity
    silent = (s > 0.9) & (rng.random(n) < 0.3)               # rare "silent chest": severe but quiet
    wh_true = np.where(silent, wh_true * 0.45, wh_true)
    wh_true = np.clip(wh_true, 0, 1)
    audio_noise_pen = np.clip((noise_db - 55) / 25, 0, 1)
    wheeze_idx = np.clip(wh_true + rng.normal(0, 0.04 + 0.14 * audio_noise_pen, n), 0, 1)
    wheeze_band = np.clip(0.07 + 0.55 * wh_true + rng.normal(0, 0.04 + 0.05 * audio_noise_pen, n), 0, 1)
    dom_f = np.where(wh_true > 0.3, rng.normal(430 + 220 * wh_true, 60, n), rng.uniform(110, 380, n))
    centroid = np.clip(620 + 900 * wh_true + 120 * audio_noise_pen + rng.normal(0, 70, n), 200, 3000)
    flatness = np.clip(0.46 - 0.30 * wh_true + rng.normal(0, 0.04, n), 0.02, 0.8)
    cough = rng.poisson(0.1 + 4.0 * np.clip(s, 0, 1) ** 1.5 + 0.3 * env_lag)
    audio_quality = np.clip(0.95 - 0.55 * audio_noise_pen - 0.15 * a + rng.normal(0, 0.03, n), 0.1, 1)

    # ---- wristband: MAX30102 ----
    hr = (p.baseline_hr_bpm + 52 * a_phys + 30 * s * (1 - 0.3 * a_phys)
          + ar1(n, 0.85, 1.8, rng) + rng.normal(0, 1.0, n) - np.where(sleeping & (a < .08), 8, 0))
    hr = np.clip(hr, 50, 200)
    spo2 = (p.baseline_spo2_pct - 10.0 * np.clip(s, 0, 1) ** 1.5 - 0.8 * a_phys * s
            + ar1(n, 0.7, 0.25, rng) + rng.normal(0, 0.25, n))
    spo2 = np.clip(spo2, 80, 100)
    resp_rate = (p.baseline_resp_rate + 14 * a_phys + 14 * s + ar1(n, 0.8, 0.8, rng) + rng.normal(0, 0.8, n))
    resp_rate = np.clip(resp_rate, 10, 60)
    ppg_q = np.clip(0.95 - 0.55 * a + rng.normal(0, 0.04, n), 0.05, 1)
    perf_idx = np.clip(p.baseline_perfusion_index * (1 - 0.25 * s) * (1 - 0.25 * temp_term)
                       * np.exp(rng.normal(0, 0.08, n)), 0.1, 10)
    rmssd = np.clip(p.baseline_rmssd_ms * (1 - 0.5 * a_phys) * (1 - 0.35 * s) * np.exp(rng.normal(0, 0.1, n)), 5, 150)

    # motion artefacts on SpO2 / HR
    artefact = (ppg_q < 0.45) & (rng.random(n) < 0.35)
    spo2 = np.where(artefact, spo2 + rng.normal(0, 2.5, n), spo2)
    hr = np.where(artefact, hr + rng.normal(0, 9, n), hr)
    spo2 = np.clip(spo2, 80, 100)

    df = pd.DataFrame(dict(
        patient_id=p.patient_id, session_id=session_id, window_idx=np.arange(n),
        timestamp=[start_ts + pd.Timedelta(seconds=WINDOW_SEC * i) for i in range(n)],
        scenario=scn, env_type=env_type,
        # wristband
        hr_bpm=hr.round(1), spo2_pct=spo2.round(1), resp_rate_ppg=resp_rate.round(1),
        ppg_perfusion_index=perf_idx.round(2), hrv_rmssd_ms=rmssd.round(1), ppg_signal_quality=ppg_q.round(2),
        temp_c=temp.round(2), humidity_pct=hum.round(1), gas_resistance_kohm=gas.round(1),
        # pendant
        wheeze_index=wheeze_idx.round(3), wheeze_band_ratio=wheeze_band.round(3),
        dominant_freq_hz=dom_f.round(0), spectral_centroid_hz=centroid.round(0),
        spectral_flatness=flatness.round(3), cough_count=cough, ambient_noise_db=noise_db.round(1),
        audio_quality=audio_quality.round(2),
        accel_mean_g=accel_mean.round(3), accel_std_g=accel_std.round(3), step_count=steps,
        trunk_tilt_deg=tilt.round(1), activity_level=act_cat, posture=posture,
        # hidden / evaluation-only
        latent_severity=s.round(3), latent_activity=a.round(3), env_risk_index=env_risk.round(3),
    ))
    df["motion_artifact_flag"] = artefact.astype(int)

    # sensor dropouts (wristband disconnect bursts + random single-value NaNs)
    wrist_cols = ["hr_bpm", "spo2_pct", "resp_rate_ppg", "ppg_perfusion_index", "hrv_rmssd_ms",
                  "temp_c", "humidity_pct", "gas_resistance_kohm"]
    pend_cols = ["wheeze_index", "wheeze_band_ratio", "dominant_freq_hz", "spectral_centroid_hz",
                 "spectral_flatness", "accel_mean_g", "accel_std_g", "trunk_tilt_deg"]
    if rng.random() < 0.10:
        i0 = int(rng.integers(0, n - 6)); df.loc[i0:i0 + int(rng.integers(2, 6)), wrist_cols] = np.nan
    if rng.random() < 0.06:
        i0 = int(rng.integers(0, n - 6)); df.loc[i0:i0 + int(rng.integers(2, 5)), pend_cols] = np.nan
    for c in wrist_cols + pend_cols:
        m = rng.random(n) < 0.006
        df.loc[m, c] = np.nan
    return df


# --------------------------------------------------------------------------- labels & reference explanations
def add_labels(df, patients):
    df = df.merge(patients[["patient_id", "baseline_hr_bpm", "baseline_spo2_pct", "baseline_resp_rate"]],
                  on="patient_id", how="left")
    s = df["latent_severity"]
    df["risk_label"] = np.where(s < LOW_T, "LOW", np.where(s < HIGH_T, "MEDIUM", "HIGH"))
    df["risk_label_id"] = df["risk_label"].map({"LOW": 0, "MEDIUM": 1, "HIGH": 2})

    # next-15-min label (forecasting target), within session
    df["risk_next_15min"] = df.groupby("session_id")["risk_label"].shift(-15)

    # existing-style absolute-threshold rule system (naive baseline, ignores activity context)
    hi = (df.spo2_pct < 92) | ((df.wheeze_index > 0.65) & (df.resp_rate_ppg > 35))
    med = (df.spo2_pct < 95) | (df.wheeze_index > 0.35) | (df.hr_bpm > 115)
    df["rule_based_risk"] = np.where(hi, "HIGH", np.where(med, "MEDIUM", "LOW"))
    df.loc[df[["spo2_pct", "wheeze_index", "hr_bpm"]].isna().all(axis=1), "rule_based_risk"] = np.nan

    # reference driver flags (what a *good* explanation should mention), context-aware
    a = df["latent_activity"]
    exp_hr = df.baseline_hr_bpm + 52 * ema_by_session(df, "latent_activity", 0.3)
    df["ref_driver_spo2_drop"] = ((df.baseline_spo2_pct - df.spo2_pct) >= 2.5).astype(int)
    df["ref_driver_hr_above_expected"] = ((df.hr_bpm - exp_hr) >= 12).astype(int)
    df["ref_driver_wheeze"] = (df.wheeze_index >= 0.35).astype(int)
    df["ref_driver_resp_rate"] = ((df.resp_rate_ppg - df.baseline_resp_rate - 14 * ema_by_session(df, "latent_activity", 0.3)) >= 6).astype(int)
    df["ref_driver_low_activity_context"] = ((a < 0.15) & (s > LOW_T)).astype(int)
    df["ref_driver_env_trigger"] = (df.env_risk_index >= 0.45).astype(int)
    df["ref_driver_cough"] = (df.cough_count >= 2).astype(int)
    drv = ["spo2_drop", "hr_above_expected", "wheeze", "resp_rate", "low_activity_context", "env_trigger", "cough"]
    df["ref_n_drivers"] = df[[f"ref_driver_{d}" for d in drv]].sum(axis=1)
    return df.drop(columns=["baseline_hr_bpm", "baseline_spo2_pct", "baseline_resp_rate"])


def ema_by_session(df, col, alpha):
    return df.groupby("session_id")[col].transform(lambda x: x.ewm(alpha=alpha, adjust=False).mean())


# --------------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--patients", type=int, default=60)
    ap.add_argument("--sessions", type=int, default=14)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--out", default="/mnt/user-data/outputs")
    args = ap.parse_args()
    rng = np.random.default_rng(args.seed)

    patients = make_patients(args.patients, rng)
    ids = patients.patient_id.values
    order = rng.permutation(len(ids))
    n_tr, n_va = int(0.7 * len(ids)), int(0.15 * len(ids))
    split = {ids[j]: ("train" if k < n_tr else "val" if k < n_tr + n_va else "test") for k, j in enumerate(order)}
    patients["split"] = patients.patient_id.map(split)

    frames, sid = [], 0
    base_day = pd.Timestamp("2026-09-01")
    for p in patients.itertuples():
        w = np.array(SCEN_WEIGHTS[p.baseline_asthma_severity]); w = w / w.sum()
        for k in range(args.sessions):
            scn = rng.choice(SCENARIOS, p=w)
            if scn in ("normal_activity", "increased_activity", "exercise_induced"):
                hour = int(rng.integers(7, 19))
            else:
                hour = int(rng.choice(np.arange(24), p=_hour_probs()))
            start = base_day + pd.Timedelta(days=int(k * 2 + rng.integers(0, 2)), hours=hour,
                                            minutes=int(rng.integers(0, 60)))
            sid += 1
            frames.append(simulate_session(p, scn, f"S{sid:05d}", start, rng))
    data = pd.concat(frames, ignore_index=True)
    data = add_labels(data, patients)
    data.insert(2, "split", data.patient_id.map(split))
    data.insert(3, "data_source", "synthetic")
    data = data.sort_values(["patient_id", "timestamp"]).reset_index(drop=True)

    data.to_csv(f"{args.out}/asthmawatch_synthetic_dataset.csv", index=False)
    patients.to_csv(f"{args.out}/asthmawatch_synthetic_patients.csv", index=False)
    print(data.shape)
    print(data.risk_label.value_counts(normalize=True).round(3))
    print(data.groupby("scenario").risk_label.value_counts(normalize=True).unstack().round(2))


def _hour_probs():
    p = np.array([2, 2, 2, 2, 2, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 4, 3, 2], float)
    return p / p.sum()


if __name__ == "__main__":
    main()
