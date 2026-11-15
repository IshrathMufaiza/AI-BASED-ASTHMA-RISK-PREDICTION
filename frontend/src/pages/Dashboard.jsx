
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

  const chartData = [...records]
    .reverse()
    .map((record) => ({
      date: new Date(record.createdAt).toLocaleDateString(),
      heartRate: record.heartRate,
      spo2: record.spo2,
    }));

  // Filter only actual device predictions
const devicePredictions = aiPredictions.filter(
  (prediction) => prediction.dataSource === "DEVICE"
);

// Latest device prediction
const latestPrediction = devicePredictions[0] || null;

// Previous device predictions
const previousPredictions = devicePredictions.slice(1);

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

        {/* Existing Alert */}

        {(summary.latestRisk === "HIGH" ||
          summary.latestSpo2 < 90) && (
          <div className="alert-banner">
            ⚠ High Risk Detected. Please contact your doctor immediately.
          </div>
        )}

        {/* Patient Information */}

        <div className="patient-card">
          <div className="patient-header">
            <h2>Patient Information</h2>

            <span
              className={
                summary.latestRisk === "HIGH"
                  ? "risk-badge high"
                  : summary.latestRisk === "MEDIUM"
                  ? "risk-badge medium"
                  : "risk-badge low"
              }
            >
              {summary.latestRisk} RISK
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
            <h2>{summary.latestHeartRate} bpm</h2>
          </div>

          <div className="vital-card">
            <div className="vital-icon">🫁</div>
            <h3>SpO₂</h3>
            <h2>{summary.latestSpo2}%</h2>
          </div>

          <div className="vital-card">
            <div className="vital-icon">🌬️</div>
            <h3>Respiratory Rate</h3>
            <h2>{summary.latestRespiratoryRate ?? "--"} rpm</h2>
          </div>

          <div className="vital-card">
            <div className="vital-icon">💨</div>
            <h3>Peak Flow</h3>
            <h2>{summary.latestPeakFlow ?? "--"} L/min</h2>
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
                            ? "Increased model risk"
                            : "Reduced model risk"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p>No feature contributions available.</p>
                  )}
                </div>
              </div>

              {/* Gemini Explanation */}

              <div className="ai-gemini-box">
                <h3>Understanding Your Latest Reading</h3>

                {latestPrediction.languageExplanation ? (
                  <p>
                    {latestPrediction.languageExplanation}
                  </p>
                ) : (
                  <p>
                    A human-readable explanation is currently unavailable
                    for this prediction.
                  </p>
                )}
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

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="heartRate"
                name="Heart Rate"
              />

              <Line
                type="monotone"
                dataKey="spo2"
                name="SpO₂"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Health History */}

        <div className="history-card">
          <h2>Health History</h2>

          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Heart Rate</th>
                <th>SpO₂</th>
                <th>Respiratory</th>
                <th>Peak Flow</th>
                <th>Risk</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => (
                <tr key={record._id}>
                  <td>
                    {new Date(record.createdAt).toLocaleDateString()}
                  </td>

                  <td>{record.heartRate}</td>

                  <td>{record.spo2}%</td>

                  <td>{record.respiratoryRate}</td>

                  <td>{record.peakFlow}</td>

                  <td>
                    <span
                      className={`risk-pill ${record.riskLevel.toLowerCase()}`}
                    >
                      {record.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}

export default Dashboard;
