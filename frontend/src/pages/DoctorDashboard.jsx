
import { useEffect, useState } from "react";
import {
  getPatients,
  getPatientAIPredictions,
} from "../services/doctorService";
import {
  getAlerts,
  getAlertHistory,
  reviewAlert,
  saveAlertNotes,
  resolveAlert,
} from "../services/alertService";
import ClinicalIncidentCard from "../components/doctor/ClinicalIncidentCard";
import DashboardSummary from "../components/doctor/DashboardSummary";
import SearchBar from "../components/doctor/SearchBar";
import PatientTable from "../components/doctor/PatientTable";
import DashboardHeader from "../components/doctor/DashboardHeader";
import { getProfile } from "../services/authService";
import { toast } from "react-toastify";
import "../styles/doctorDashboard.css";

function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [aiPredictions, setAiPredictions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [doctor, setDoctor] = useState(null);

  const [loadingAI, setLoadingAI] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  const [alertFilter, setAlertFilter] = useState("ALL");
  const [alertNotes, setAlertNotes] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  // ==========================================
  // FETCH ALERTS
  // ==========================================

  const fetchAlerts = async () => {
    try {
      const [activeData, historyData] = await Promise.all([
        getAlerts(),
        getAlertHistory(),
      ]);

      setAlerts(activeData);
      setAlertHistory(historyData);
    } catch (error) {
      console.error("ALERT FETCH ERROR:", error);
      toast.error("Unable to refresh alerts.");
    } finally {
      setLoadingAlerts(false);
    }
  };

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  useEffect(() => {
    const fetchData = async () => {
      const results = await Promise.allSettled([
        getPatients(),
        getAlerts(),
        getProfile(),
        getPatientAIPredictions(),
        getAlertHistory(),
      ]);

      const [
        patientResult,
        alertResult,
        doctorResult,
        predictionResult,
        historyResult,
      ] = results;

      if (patientResult.status === "fulfilled") {
        setPatients(patientResult.value);
      } else {
        console.error("PATIENT FETCH ERROR:", patientResult.reason);
      }

      if (alertResult.status === "fulfilled") {
        setAlerts(alertResult.value);
      } else {
        console.error("ACTIVE ALERT FETCH ERROR:", alertResult.reason);
      }

      if (doctorResult.status === "fulfilled") {
        setDoctor(doctorResult.value);
      } else {
        console.error("DOCTOR PROFILE FETCH ERROR:", doctorResult.reason);
      }

      if (predictionResult.status === "fulfilled") {
        setAiPredictions(predictionResult.value);
      } else {
        console.error("AI PREDICTION FETCH ERROR:", predictionResult.reason);
      }

      if (historyResult.status === "fulfilled") {
        setAlertHistory(historyResult.value);
      } else {
        console.error("ALERT HISTORY FETCH ERROR:", historyResult.reason);
      }

      setLoadingAI(false);
      setLoadingAlerts(false);
    };

    fetchData();
  }, []);

  // ==========================================
  // ALERT ACTIONS
  // ==========================================

  const setAlertLoading = (alertId, loading) => {
    setActionLoading((previous) => ({
      ...previous,
      [alertId]: loading,
    }));
  };

  const handleReviewAlert = async (alertId) => {
    try {
      setAlertLoading(alertId, true);

      await reviewAlert(alertId);

      toast.success("Alert acknowledged successfully.");

      await fetchAlerts();
    } catch (error) {
      console.error("REVIEW ALERT ERROR:", error);
      toast.error(
        error.response?.data?.message || "Unable to acknowledge alert."
      );
    } finally {
      setAlertLoading(alertId, false);
    }
  };

  const handleSaveNotes = async (alertId) => {
    try {
      setAlertLoading(alertId, true);

      await saveAlertNotes(
        alertId,
        alertNotes[alertId] || ""
      );

      toast.success("Notes saved successfully.");

      setAlertNotes((previous) => ({
        ...previous,
        [alertId]: "",
      }));

      await fetchAlerts();
    } catch (error) {
      console.error("SAVE NOTES ERROR:", error);
      toast.error(
        error.response?.data?.message || "Unable to save notes."
      );
    } finally {
      setAlertLoading(alertId, false);
    }
  };

  const handleResolveAlert = async (alertId) => {
    const confirmed = window.confirm(
      "Are you sure you want to mark this alert as resolved?"
    );

    if (!confirmed) return;

    try {
      setAlertLoading(alertId, true);

      await resolveAlert(alertId);

      toast.success("Alert resolved successfully.");

      await fetchAlerts();
    } catch (error) {
      console.error("RESOLVE ALERT ERROR:", error);
      toast.error(
        error.response?.data?.message || "Unable to resolve alert."
      );
    } finally {
      setAlertLoading(alertId, false);
    }
  };

  // ==========================================
  // AI RISK MONITORING
  // ==========================================

  const riskCounts = {
    HIGH: aiPredictions.filter(
      (item) => item.latestPrediction?.predictedRisk === "HIGH"
    ).length,

    MEDIUM: aiPredictions.filter(
      (item) => item.latestPrediction?.predictedRisk === "MEDIUM"
    ).length,

    LOW: aiPredictions.filter(
      (item) => item.latestPrediction?.predictedRisk === "LOW"
    ).length,
  };

  const patientsWithPredictions = aiPredictions.filter(
    (item) => item.latestPrediction
  ).length;

  const formatDate = (date) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleString();
  };

  const getRiskClass = (risk) => {
    if (risk === "HIGH") return "high";
    if (risk === "MEDIUM") return "medium";
    if (risk === "LOW") return "low";
    return "";
  };

  const filteredAlerts = alertHistory.filter((alert) => {
    if (alertFilter === "ALL") return true;
    return alert.status === alertFilter;
  });

  const alertStatusStyle = (status) => {
    if (status === "ACTIVE") {
      return { background: "#fee2e2", color: "#b91c1c" };
    }

    if (status === "REVIEWED") {
      return { background: "#fef3c7", color: "#92400e" };
    }

    return { background: "#dcfce7", color: "#166534" };
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="dashboard-container">

      <DashboardHeader doctor={doctor} />

      <DashboardSummary
        totalPatients={patients.length}
        activeIncidents={alerts.length}
      />

      {/* ACTIVE CLINICAL INCIDENTS */}

      <h2>🚨 Active Clinical Incidents</h2>

      {alerts.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: "36px" }}>🫁</div>
          <h2>No Active Clinical Incidents</h2>
          <p>
            All assigned patients are currently stable.
            No clinical incidents require immediate review.
          </p>
        </div>
      ) : (
        alerts.map((alert) => (
          <ClinicalIncidentCard
            key={alert._id}
            alert={alert}
          />
        ))
      )}

      {/* ALERT MANAGEMENT */}

      <section
        className="ai-monitoring-section"
        style={{ marginTop: "35px" }}
      >
        <div className="ai-monitoring-header">
          <div>
            <h2>🔔 Alert Management</h2>
            <p>
              Review, acknowledge and resolve patient alerts
            </p>
          </div>

          <span className="ai-model-label">
            {alerts.length} Active Alerts
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            margin: "20px 0",
          }}
        >
          {["ALL", "ACTIVE", "REVIEWED", "RESOLVED"].map((status) => (
            <button
              key={status}
              onClick={() => setAlertFilter(status)}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background:
                  alertFilter === status ? "#2563eb" : "#ffffff",
                color:
                  alertFilter === status ? "#ffffff" : "#334155",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {status === "ALL" ? "All Alerts" : status}
            </button>
          ))}
        </div>

        {loadingAlerts ? (
          <div className="empty-state">Loading alerts...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="empty-state">
            <h3>
              No {alertFilter === "ALL" ? "" : alertFilter.toLowerCase()} alerts
            </h3>
            <p>No alerts are available in this category.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "18px" }}>
            {filteredAlerts.map((alert) => (
              <div
                key={alert._id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 6px" }}>
                      {alert.patientName}
                    </h3>

                    <span
                      style={{
                        fontWeight: "600",
                        color:
                          alert.riskLevel === "HIGH"
                            ? "#dc2626"
                            : alert.riskLevel === "MEDIUM"
                            ? "#d97706"
                            : "#16a34a",
                      }}
                    >
                      {alert.riskLevel} RISK
                    </span>
                  </div>

                  <span
                    style={{
                      ...alertStatusStyle(alert.status),
                      padding: "7px 13px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {alert.status}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "14px",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  <p>
                    Alert created: {formatDate(alert.createdAtRisk)}
                  </p>

                  <p>
                    Last updated: {formatDate(alert.lastUpdatedAt)}
                  </p>

                  {alert.reviewedAt && (
                    <p>Reviewed: {formatDate(alert.reviewedAt)}</p>
                  )}

                  {alert.resolvedAt && (
                    <p>Resolved: {formatDate(alert.resolvedAt)}</p>
                  )}
                </div>

                {alert.doctorNotes && (
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "8px",
                      padding: "12px",
                      marginTop: "12px",
                    }}
                  >
                    <strong>Doctor's Notes</strong>
                    <p style={{ marginBottom: 0 }}>
                      {alert.doctorNotes}
                    </p>
                  </div>
                )}

                {alert.status !== "RESOLVED" && (
                  <>
                    <div style={{ marginTop: "18px" }}>
                      <label
                        htmlFor={`alert-note-${alert._id}`}
                        style={{
                          display: "block",
                          fontWeight: "600",
                          marginBottom: "8px",
                        }}
                      >
                        Add or update clinical notes
                      </label>

                      <textarea
                        id={`alert-note-${alert._id}`}
                        rows={3}
                        value={alertNotes[alert._id] || ""}
                        onChange={(event) =>
                          setAlertNotes((previous) => ({
                            ...previous,
                            [alert._id]: event.target.value,
                          }))
                        }
                        placeholder="Enter observations or actions taken..."
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          resize: "vertical",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                        marginTop: "14px",
                      }}
                    >
                      {alert.status === "ACTIVE" && (
                        <button
                          onClick={() => handleReviewAlert(alert._id)}
                          disabled={!!actionLoading[alert._id]}
                          style={{
                            background: "#2563eb",
                            color: "#ffffff",
                            border: "none",
                            padding: "10px 16px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                        >
                          {actionLoading[alert._id]
                            ? "Processing..."
                            : "✓ Acknowledge Alert"}
                        </button>
                      )}

                      <button
                        onClick={() => handleSaveNotes(alert._id)}
                        disabled={!!actionLoading[alert._id]}
                        style={{
                          background: "#475569",
                          color: "#ffffff",
                          border: "none",
                          padding: "10px 16px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        {actionLoading[alert._id]
                          ? "Processing..."
                          : "Save Notes"}
                      </button>

                      <button
                        onClick={() => handleResolveAlert(alert._id)}
                        disabled={!!actionLoading[alert._id]}
                        style={{
                          background: "#16a34a",
                          color: "#ffffff",
                          border: "none",
                          padding: "10px 16px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        ✓ Resolve Alert
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI RISK MONITORING */}

      <section className="ai-monitoring-section">
        <div className="ai-monitoring-header">
          <div>
            <h2>🧠 AI Risk Monitoring</h2>
            <p>
              Latest Random Forest predictions for assigned patients
            </p>
          </div>

          <span className="ai-model-label">
            Random Forest + SHAP
          </span>
        </div>

        {loadingAI ? (
          <div className="empty-state">
            Loading AI predictions...
          </div>
        ) : (
          <>
            <div className="ai-risk-summary">
              <div className="ai-risk-card">
                <span>Patients Monitored</span>
                <h3>{patientsWithPredictions}</h3>
                <p>Out of {aiPredictions.length} assigned patients</p>
              </div>

              <div className="ai-risk-card high">
                <span>High Risk</span>
                <h3>{riskCounts.HIGH}</h3>
                <p>Latest prediction</p>
              </div>

              <div className="ai-risk-card medium">
                <span>Medium Risk</span>
                <h3>{riskCounts.MEDIUM}</h3>
                <p>Latest prediction</p>
              </div>

              <div className="ai-risk-card low">
                <span>Low Risk</span>
                <h3>{riskCounts.LOW}</h3>
                <p>Latest prediction</p>
              </div>
            </div>

            <div className="ai-patient-list">
              <h3>Patient Risk Overview</h3>

              {aiPredictions.length === 0 ? (
                <div className="empty-state">
                  No assigned patients found.
                </div>
              ) : (
                aiPredictions.map((item) => {
                  const prediction = item.latestPrediction;
                  const risk = prediction?.predictedRisk;

                  return (
                    <div
                      className="ai-patient-card"
                      key={item.patientId}
                    >
                      <div className="ai-patient-info">
                        <h4>{item.patientName}</h4>
                        <p>{item.email}</p>
                      </div>

                      {prediction ? (
                        <>
                          <div className="ai-patient-risk">
                            <span
                              className={`ai-risk-badge ${getRiskClass(risk)}`}
                            >
                              {risk} RISK
                            </span>

                            <p>
                              Captured: {formatDate(prediction.capturedAt)}
                            </p>
                          </div>

                          <div className="ai-patient-confidence">
                            <span>Model probabilities</span>

                            <p>
                              High:{" "}
                              {(prediction.probabilities.HIGH * 100).toFixed(1)}%
                            </p>

                            <p>
                              Medium:{" "}
                              {(prediction.probabilities.MEDIUM * 100).toFixed(1)}%
                            </p>

                            <p>
                              Low:{" "}
                              {(prediction.probabilities.LOW * 100).toFixed(1)}%
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="ai-no-prediction">
                          No AI prediction available
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        <p className="ai-disclaimer">
          This prototype uses a model trained on synthetic data.
          Its predictions are for demonstration and research purposes
          only and are not clinically validated or intended for diagnosis.
        </p>
      </section>

      {/* PATIENT LIST */}

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {patients.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: "50px" }}>👨‍⚕️</div>
          <h2>No Assigned Patients</h2>
          <p>
            There are currently no patients assigned to your account.
          </p>
        </div>
      ) : (
        <PatientTable
          patients={patients}
          searchTerm={searchTerm}
        />
      )}
    </div>
  );
}

export default DoctorDashboard;
