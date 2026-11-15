function DashboardSummary({
  totalPatients,
  activeIncidents,
  reviewedIncidents,
  resolvedIncidents,
}) {
  const stablePatients =
    totalPatients - activeIncidents;

  return (
    <div className="summary-container">

      <div className="summary-card">
        <div className="summary-icon">👥</div>

        <div>
          <h2>{totalPatients}</h2>
          <p>Total Patients</p>
        </div>
      </div>

      <div className="summary-card critical">
        <div className="summary-icon">🚨</div>

        <div>
          <h2>{activeIncidents}</h2>
          <p>Active Incidents</p>
        </div>
      </div>

      <div className="summary-card success">
        <div className="summary-icon">✅</div>

        <div>
          <h2>{stablePatients}</h2>
          <p>Stable Patients</p>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-icon">✔️</div>

        <div>
          <h2>{resolvedIncidents}</h2>
          <p>Resolved Cases</p>
        </div>
      </div>

    </div>
  );
}

export default DashboardSummary;