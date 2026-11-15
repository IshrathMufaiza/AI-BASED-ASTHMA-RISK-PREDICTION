import { Link } from "react-router-dom";
function ClinicalIncidentCard({ alert }) {

  const started = new Date(alert.startedAt);

  const updated = new Date(alert.lastUpdatedAt);

  const durationMinutes = Math.floor(
    (updated - started) / 60000
  );

  return (
    <div className="incident-card">

      <div className="incident-header">

        <div>
          <h2>{alert.patientName}</h2>

          <p
            style={{
              color: "#6b7280",
              marginTop: "-10px",
            }}
          >
            Clinical Incident
          </p>
        </div>

        <span className="risk-pill">
  HIGH RISK
</span>

      </div>
      <div className="vital-box">

    <span className="vital-icon">
        ❤️
    </span>

    <div>

        <small>Heart Rate</small>

        <h2>
            {alert.latestReading?.heartRate}
        </h2>

        <small>bpm</small>

    </div>

</div>

      <div className="incident-vitals">

        <div>
          <small>❤️ Heart Rate</small>

          <h2>
            {alert.latestReading?.heartRate}
          </h2>

          <small>bpm</small>
        </div>

        <div>
          <small>🫁 SpO₂</small>

          <h2>
            {alert.latestReading?.spo2}
          </h2>

          <small>%</small>
        </div>

        <div>
          <small>🌬 Respiratory Rate</small>

          <h2>
            {alert.latestReading?.respiratoryRate}
          </h2>

          <small>rpm</small>
        </div>

        <div>
          <small>💨 Peak Flow</small>

          <h2>
            {alert.latestReading?.peakFlow}
          </h2>

          <small>L/min</small>
        </div>

      </div>

      <div className="incident-footer">

        <div>

          <strong>Started</strong>

          <p>
            {started.toLocaleTimeString()}
          </p>

        </div>

        <div>

          <strong>Last Updated</strong>

          <p>
            {updated.toLocaleTimeString()}
          </p>

        </div>

        <div>

          <strong>Duration</strong>

          <p>
            {durationMinutes} min
          </p>

        </div>

      </div>

      <Link to={`/patients/${alert.patientId}`}>
  <button
    style={{
      marginTop: "20px",
      padding: "12px 22px",
      border: "none",
      borderRadius: "10px",
      background: "#2563eb",
      color: "white",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    Review Patient →
  </button>
</Link>

    </div>
  );
}

export default ClinicalIncidentCard;