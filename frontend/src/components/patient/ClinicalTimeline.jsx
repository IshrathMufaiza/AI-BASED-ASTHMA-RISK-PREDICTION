
function ClinicalTimeline({
  healthHistory,
  aiPredictions,
}) {
  const timeline = [];

  // Health records
  healthHistory.forEach((record) => {
    timeline.push({
      type: "Health Record",
      icon: "🩺",
      title: "Health Reading",
      description:
        `HR ${record.heartRate} bpm • ` +
        `SpO₂ ${record.spo2}% • ` +
        `RR ${record.respiratoryRate} rpm • ` +
        `Peak Flow ${record.peakFlow} L/min`,
      time: record.createdAt,
    });
  });

  // AI prediction sensor readings
  aiPredictions.forEach((prediction) => {
    const readings = prediction.sensorReadings || {};
    const availableReadings = [];

    if (readings.hr_bpm != null) {
      availableReadings.push(`HR ${readings.hr_bpm} bpm`);
    }

    if (readings.spo2_pct != null) {
      availableReadings.push(`SpO₂ ${readings.spo2_pct}%`);
    }

    if (readings.resp_rate_ppg != null) {
      availableReadings.push(
        `RR ${readings.resp_rate_ppg} rpm`
      );
    }

    if (readings.peakFlow != null) {
      availableReadings.push(
        `Peak Flow ${readings.peakFlow} L/min`
      );
    }

    if (availableReadings.length > 0) {
      timeline.push({
        type: "AI Reading",
        icon: "🩺",
        title: "Health Reading",
        description: availableReadings.join(" • "),
        time: prediction.capturedAt || prediction.createdAt,
      });
    }
  });

  // Most recent activity first
  timeline.sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );

  return (
    <div
      className="patient-profile-card"
      style={{ marginTop: "35px" }}
    >
      <h2 style={{ marginBottom: "30px" }}>
        📅 Clinical Timeline
      </h2>

      {timeline.length === 0 ? (
        <p>No clinical activity.</p>
      ) : (
        timeline.map((item, index) => (
          <div
            key={`${item.type}-${index}`}
            style={{
              display: "flex",
              gap: "18px",
              marginBottom: "22px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "50%",
                background: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>

            <div
              style={{
                flex: 1,
                background: "#f8fafc",
                borderRadius: "14px",
                padding: "18px",
                boxShadow: "0 4px 12px rgba(0,0,0,.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                  marginBottom: "8px",
                }}
              >
                <strong>{item.title}</strong>

                <small
                  style={{
                    color: "#6b7280",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.time
                    ? new Date(item.time).toLocaleString()
                    : "Date unavailable"}
                </small>
              </div>

              <p
                style={{
                  margin: 0,
                  lineHeight: "1.6",
                }}
              >
                {item.description}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ClinicalTimeline;
