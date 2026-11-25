
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPatientDetails } from "../services/patientService";
import "../styles/patientDetails.css";
import VitalTrendChart from "../components/patient/VitalTrendChart";
import ClinicalTimeline from "../components/patient/ClinicalTimeline";

function PatientDetails() {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [healthRecord, setHealthRecord] = useState(null);
  const [healthHistory, setHealthHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [aiPredictions, setAiPredictions] = useState([]);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const data = await getPatientDetails(id);

        setPatient(data.patient);
        setHealthRecord(data.latestHealthRecord);
        setHealthHistory(data.healthHistory || []);
        setAlerts(data.alerts || []);
        setAiPredictions(data.aiPredictions || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPatient();
  }, [id]);

  if (!patient) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="patient-details-container">
      <button
        className="back-button"
        onClick={() => window.history.back()}
      >
        ← Patients List
      </button>

      <div className="patient-profile-card">
        <div className="patient-header">
          <div>
            <h1>👤 {patient.name}</h1>
            <p style={{ color: "#6b7280" }}>
              Patient Profile
            </p>
          </div>

          {healthRecord && (
            <span
              className={`risk-badge ${healthRecord.riskLevel.toLowerCase()}`}
            >
              {healthRecord.riskLevel} RISK
            </span>
          )}
        </div>

        <hr style={{ margin: "20px 0" }} />

        <div
          className="patient-info"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: "20px",
          }}
        >
          <div>
            <strong>🎂 Age</strong>
            <p>{patient.age || "--"} years</p>
          </div>

          <div>
            <strong>⚖️ Weight</strong>
            <p>{patient.weight || "--"} kg</p>
          </div>

          <div>
            <strong>📏 Height</strong>
            <p>{patient.height || "--"} cm</p>
          </div>

          <div>
            <strong>👨‍⚕️ Assigned Doctor</strong>
            <p>{patient.assignedDoctor}</p>
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: "20px" }}>
        Latest Health Record
      </h2>

      {healthRecord ? (
        <div className="health-overview">
          <div className="health-card">
            <div style={{ fontSize: "34px" }}>❤️</div>
            <h3>Heart Rate</h3>
            <h2>{healthRecord.heartRate}</h2>
            <small>bpm</small>
          </div>

          <div className="health-card">
            <div style={{ fontSize: "34px" }}>🫁</div>
            <h3>SpO₂</h3>
            <h2>{healthRecord.spo2}%</h2>
            <small>Oxygen Saturation</small>
          </div>

          <div className="health-card">
            <div style={{ fontSize: "34px" }}>🌬️</div>
            <h3>Respiratory Rate</h3>
            <h2>{healthRecord.respiratoryRate}</h2>
            <small>rpm</small>
          </div>

          <div className="health-card">
            <div style={{ fontSize: "34px" }}>💨</div>
            <h3>Peak Flow</h3>
            <h2>{healthRecord.peakFlow}</h2>
            <small>L/min</small>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div style={{ fontSize: "50px" }}>📋</div>
          <h2>No Health Records Found</h2>
          <p>
            This patient has not submitted any health readings yet.
          </p>
        </div>
      )}

      {healthHistory.length > 0 && (
        <>
          <VitalTrendChart
            title="Heart Rate Trend"
            icon="❤️"
            unit="bpm"
            dataKey="heartRate"
            healthHistory={healthHistory}
          />

          <VitalTrendChart
            title="SpO₂ Trend"
            icon="🫁"
            unit="%"
            dataKey="spo2"
            healthHistory={healthHistory}
          />

          <VitalTrendChart
            title="Respiratory Rate Trend"
            icon="🫁"
            unit="rpm"
            dataKey="respiratoryRate"
            healthHistory={healthHistory}
          />

          <VitalTrendChart
            title="Peak Flow Trend"
            icon="💨"
            unit="L/min"
            dataKey="peakFlow"
            healthHistory={healthHistory}
          />
        </>
      )}

      <ClinicalTimeline
        healthHistory={healthHistory}
        aiPredictions={aiPredictions}
      />
    </div>
  );
}

export default PatientDetails;
