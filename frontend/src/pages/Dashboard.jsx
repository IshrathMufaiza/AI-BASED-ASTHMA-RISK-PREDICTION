
import { useEffect, useState } from "react";
import Sidebar from "../components/patient/Sidebar";
import { getDashboardSummary } from "../services/dashboardService";
import { getProfile } from "../services/authService";
import { getPatientDetails } from "../services/aiPredictionService";
import { getHealthRecords } from "../services/healthRecordService";
import "./Dashboard.css";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [aiPredictions, setAiPredictions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summaryData = await getDashboardSummary();
        const profileData = await getProfile();
        const healthData = await getHealthRecords();
        const patientData = await getPatientDetails(profileData._id);

        setSummary(summaryData);
        setProfile(profileData);
        setRecords(healthData);
        setAiPredictions(patientData.aiPredictions || []);
      } catch (error) {
        console.error("Dashboard loading error:", error);
      }
    };

    fetchData();
  }, []);

  if (!summary || !profile) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <h2>Loading Dashboard...</h2>
        </main>
      </div>
    );
  }

  // Include both TEST and DEVICE predictions during development
  const dashboardPredictions = aiPredictions.filter(
    (prediction) =>
      prediction.dataSource === "DEVICE" ||
      prediction.dataSource === "TEST"
  );

  // Latest prediction (backend returns newest first)
  const latestPrediction = dashboardPredictions[0] || null;

  // Previous predictions
  const previousPredictions = dashboardPredictions.slice(1);

  // Extract readings from the latest AI prediction
  const sensorReadings = latestPrediction?.sensorReadings || {};

  // Use AI readings when available; otherwise use HealthRecord values
  const latestHeartRate =
    sensorReadings.hr_bpm ?? summary.latestHeartRate;

  const latestSpo2 =
    sensorReadings.spo2_pct ?? summary.latestSpo2;

  const latestRespiratoryRate =
    sensorReadings.resp_rate_ppg ?? summary.latestRespiratoryRate;

  // Combine HealthRecord history and AI prediction history for chart
  const healthRecordChartData = records.map((record) => {
    const timestamp = new Date(record.createdAt).getTime();

    return {
      timestamp,
      dateTime: new Date(timestamp).toLocaleString(),
      heartRate: record.heartRate ?? null,
      spo2: record.spo2 ?? null,
    };
  });

  const aiChartData = dashboardPredictions
    .map((prediction) => {
      const readings = prediction.sensorReadings || {};
      const predictionTimestamp =
        prediction.capturedAt || prediction.createdAt;

      const timestamp = predictionTimestamp
        ? new Date(predictionTimestamp).getTime()
        : null;

      return {
        timestamp,
        dateTime: timestamp
          ? new Date(timestamp).toLocaleString()
          : "--",
        heartRate: readings.hr_bpm ?? null,
        spo2: readings.spo2_pct ?? null,
      };
    })
    .filter(
      (reading) =>
        reading.timestamp !== null &&
        (reading.heartRate != null || reading.spo2 != null)
    );

  // Merge both sources and sort chronologically
  const chartData = [
    ...healthRecordChartData,
    ...aiChartData,
  ]
    .filter(
      (reading) =>
        reading.timestamp &&
        (reading.heartRate != null || reading.spo2 != null)
    )
    .sort((a, b) => a.timestamp - b.timestamp);

  // Combine records for the Health History table
  const healthHistoryData = [
    ...records.map((record) => ({
      id: record._id,
      timestamp: new Date(record.createdAt).getTime(),
      date: new Date(record.createdAt).toLocaleString(),
      recordType: "Health Record",
      heartRate: record.heartRate ?? "--",
      spo2: record.spo2 != null ? `${record.spo2}%` : "--",
      respiratoryRate: record.respiratoryRate ?? "--",
      peakFlow: record.peakFlow ?? "--",
      risk: record.riskLevel,
      riskClass: record.riskLevel?.toLowerCase(),
    })),

    ...dashboardPredictions.map((prediction) => {
      const readings = prediction.sensorReadings || {};
      const timestampValue =
        prediction.capturedAt || prediction.createdAt;
      const timestamp = timestampValue
        ? new Date(timestampValue).getTime()
        : 0;

      return {
        id: prediction._id,
        timestamp,
        date: timestamp
          ? new Date(timestamp).toLocaleString()
          : "--",
        recordType: "AI Prediction",
        heartRate: readings.hr_bpm ?? "--",
        spo2:
          readings.spo2_pct != null
            ? `${readings.spo2_pct}%`
            : "--",
        respiratoryRate: readings.resp_rate_ppg ?? "--",
        peakFlow: "--",
        risk: prediction.predictedRisk,
        riskClass: prediction.predictedRisk?.toLowerCase(),
      };
    }),
  ].sort((a, b) => b.timestamp - a.timestamp);

  // Historical risk counts
  const previousRiskCounts = {
    LOW: previousPredictions.filter(
      (item) => item.predictedRisk === "LOW"
    ).length,

    MEDIUM: previousPredictions.filter(
      (item) => item.predictedRisk === "MEDIUM"
    ).length,

    HIGH: previousPredictions.filter(
      (item) => item.predictedRisk === "HIGH"
    ).length,
  };

  const previousElevatedCount =
    previousRiskCounts.MEDIUM + previousRiskCounts.HIGH;

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">

        {/* Dashboard Header */}

        <div className="dashboard-header">
          <div>
            <h1>Hello, {profile.name} 👋</h1>

            <p className="dashboard-subtitle">
              Predict. Prevent. Breathe.
            </p>
          </div>

          <div className="device-status">
            <span className="status-dot"></span>
            Connected
          </div>
        </div>

        {/* AI-Based Risk Alert */}

        {latestPrediction?.predictedRisk === "HIGH" && (
          <div className="alert-banner">
            ⚠ AsthmaWatch AI has predicted HIGH risk.
            Please review your latest reading and consult your doctor.
          </div>
        )}

        {/* Patient Information */}

        <div className="patient-card">
          <div className="patient-header">
            <h2>Patient Information</h2>

            <span
              className={`risk-badge ${
                latestPrediction
                  ? latestPrediction.predictedRisk.toLowerCase()
                  : "no-data"
              }`}
            >
              {latestPrediction
                ? `${latestPrediction.predictedRisk} RISK`
                : "NO AI DATA"}
            </span>
          </div>

          <div className="patient-grid">
            <div>
              <strong>Age</strong>
              <p>{profile.age} years</p>
            </div>

            <div>
              <strong>Weight</strong>
              <p>{profile.weight} kg</p>
            </div>

            <div>
              <strong>Height</strong>
              <p>{profile.height} cm</p>
            </div>

            <div>
              <strong>Doctor</strong>
              <p>{profile.assignedDoctor}</p>
            </div>

            <div>
              <strong>Emergency Contact</strong>
              <p>{profile.emergencyContact}</p>
            </div>

            <div>
              <strong>Email</strong>
              <p>{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Vitals */}

        <div className="vitals-grid">
          <div className="vital-card">
            <div className="vital-icon">❤️</div>
            <h3>Heart Rate</h3>
            <h2>{latestHeartRate ?? "--"} bpm</h2>
            <small className="vital-source-label">
              {sensorReadings.hr_bpm != null
                ? latestPrediction.dataSource === "TEST"
                  ? "TEST READING"
                  : "DEVICE READING"
                : summary.latestHeartRate != null
                ? "HEALTH RECORD"
                : "NO READING"}
            </small>
          </div>

          <div className="vital-card">
            <div className="vital-icon">🫁</div>
            <h3>SpO₂</h3>
            <h2>{latestSpo2 ?? "--"}%</h2>
            <small className="vital-source-label">
              {sensorReadings.spo2_pct != null
                ? latestPrediction.dataSource === "TEST"
                  ? "TEST READING"
                  : "DEVICE READING"
                : summary.latestSpo2 != null
                ? "HEALTH RECORD"
                : "NO READING"}
            </small>
          </div>

          <div className="vital-card">
            <div className="vital-icon">🌬️</div>
            <h3>Respiratory Rate</h3>
            <h2>{latestRespiratoryRate ?? "--"} rpm</h2>
            <small className="vital-source-label">
              {sensorReadings.resp_rate_ppg != null
                ? latestPrediction.dataSource === "TEST"
                  ? "TEST READING"
                  : "DEVICE READING"
                : summary.latestRespiratoryRate != null
                ? "HEALTH RECORD"
                : "NO READING"}
            </small>
          </div>

          <div className="vital-card">
            <div className="vital-icon">💨</div>
            <h3>Peak Flow</h3>
            <h2>{summary.latestPeakFlow ?? "--"} L/min</h2>
            <small className="vital-source-label">
              {summary.latestPeakFlow != null
                ? "HEALTH RECORD"
                : "NO READING"}
            </small>
          </div>
        </div>

        {/* AI Prediction Section */}

        <section className="ai-section">

          <div className="ai-section-header">
            <div>
              <h2>AsthmaWatch AI Insights</h2>
              <p>Analysis of your latest sensor readings</p>
            </div>

            <span className="ai-powered-label">AI POWERED</span>
          </div>

          {!latestPrediction ? (
            <div className="ai-empty-state">
              <h3>No AI predictions available</h3>
              <p>
                Your AI insights will appear here when sensor readings
                are analysed.
              </p>
            </div>
          ) : (
            <>
              {/* Latest Prediction */}

              <div className="ai-latest-risk">
                <div>
                  <span className="ai-overline">
                    LATEST PREDICTION
                  </span>

                  <h3
                    className={`ai-risk-text ${latestPrediction.predictedRisk.toLowerCase()}`}
                  >
                    {latestPrediction.predictedRisk} RISK
                  </h3>

                  <p>
                    Generated on{" "}
                    {new Date(
                      latestPrediction.capturedAt
                    ).toLocaleString()}
                  </p>

                  <span
                    className={`prediction-source ${
                      latestPrediction.dataSource === "TEST"
                        ? "test"
                        : "device"
                    }`}
                  >
                    {latestPrediction.dataSource === "TEST"
                      ? "TEST DATA · Development prediction"
                      : "DEVICE DATA"}
                  </span>
                </div>

                <div className="ai-model-info">
                  <span>Model</span>
                  <strong>{latestPrediction.modelType}</strong>
                </div>
              </div>

              {/* Model Probabilities */}

              <div className="ai-block">
                <h3>Model Probabilities</h3>

                <div className="ai-probability-grid">
                  {["LOW", "MEDIUM", "HIGH"].map((risk) => (
                    <div
                      className={`ai-probability ${risk.toLowerCase()}`}
                      key={risk}
                    >
                      <span>{risk}</span>

                      <strong>
                        {(
                          (latestPrediction.probabilities?.[risk] ?? 0) *
                          100
                        ).toFixed(1)}%
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* SHAP Contributions */}

              <div className="ai-block">
                <h3>What influenced this prediction?</h3>

                <p className="ai-section-description">
                  Important sensor features influencing the latest
                  model prediction.
                </p>

                <div className="ai-feature-list">
                  {latestPrediction.explanation?.length > 0 ? (
                    latestPrediction.explanation.map((item, index) => (
                      <div className="ai-feature-item" key={index}>
                        <div className="ai-feature-details">
                          <strong>
                            {item.label || item.feature}
                          </strong>

                          <span>
                            {item.device || "Sensor"} ·{" "}
                            {item.input_value ?? "--"}
                            {item.unit ? ` ${item.unit}` : ""}
                          </span>
                        </div>

                        <span
                          className={`ai-direction ${
                            item.direction === "towards"
                              ? "towards"
                              : "away"
                          }`}
                        >
                          {item.direction === "towards"
                            ? "Towards predicted class"
                            : "Away from predicted class"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p>No feature contributions available.</p>
                  )}
                </div>
              </div>

              {/* Previous Reading Summary */}

              <div className="ai-history-summary">
                <h3>Previous AI Predictions Summary</h3>

                {previousPredictions.length === 0 ? (
                  <p>
                    There are no previous AI predictions available
                    for comparison.
                  </p>
                ) : (
                  <>
                    <div className="ai-history-counts">
                      <div>
                        <span>LOW</span>
                        <strong>{previousRiskCounts.LOW}</strong>
                      </div>

                      <div>
                        <span>MEDIUM</span>
                        <strong>{previousRiskCounts.MEDIUM}</strong>
                      </div>

                      <div>
                        <span>HIGH</span>
                        <strong>{previousRiskCounts.HIGH}</strong>
                      </div>
                    </div>

                    {previousElevatedCount > 0 ? (
                      <p className="ai-history-warning">
                        Previous readings also showed elevated-risk
                        classifications: {previousElevatedCount} out of{" "}
                        {previousPredictions.length} previous predictions
                        were classified as MEDIUM or HIGH.
                      </p>
                    ) : (
                      <p className="ai-history-normal">
                        None of the previous readings were classified
                        as MEDIUM or HIGH by the model.
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Disclaimer */}

              <p className="ai-disclaimer">
                Experimental prototype output, not a clinical diagnosis.
                Model probabilities and feature contributions are not
                clinically validated medical measurements.
              </p>
            </>
          )}
        </section>

        {/* Health Trend */}

        <div className="chart-card">
          <h2>Health Trend</h2>

          {chartData.length === 0 ? (
            <p>No historical readings available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 10, bottom: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="dateTime"
                  tickFormatter={(value) => {
                    const date = new Date(value);

                    return date.toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    });
                  }}
                  angle={0}
                  height={45}
                  interval="preserveStartEnd"
                  tickMargin={10}
                  minTickGap={20}
                />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate"
                  connectNulls={false}
                />

                <Line
                  type="monotone"
                  dataKey="spo2"
                  name="SpO₂"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Health History */}

        <div className="history-card">
          <h2>Health History</h2>

          <table className="history-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Record Type</th>
                <th>Heart Rate</th>
                <th>SpO₂</th>
                <th>Respiratory</th>
                <th>Peak Flow</th>
                <th>Risk</th>
              </tr>
            </thead>

            <tbody>
              {healthHistoryData.length > 0 ? (
                healthHistoryData.map((record) => (
                  <tr key={`${record.recordType}-${record.id}`}>
                    <td>{record.date}</td>

                    <td>{record.recordType}</td>

                    <td>{record.heartRate}</td>

                    <td>{record.spo2}</td>

                    <td>{record.respiratoryRate}</td>

                    <td>{record.peakFlow}</td>

                    <td>
                      <span
                        className={`risk-pill ${record.riskClass}`}
                      >
                        {record.risk}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    No health history available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}

export default Dashboard;
