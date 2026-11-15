function ClinicalTimeline({
  healthHistory,
  doctorNotes,
  alerts,
}) {

  const timeline = [];

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

  doctorNotes.forEach((note) => {
    timeline.push({
      type: "Clinical Note",
      icon: "📝",
      title: "Clinical Note",
      description: note.note,
      time: note.createdAt,
    });
  });

  alerts.forEach((alert) => {
    timeline.push({
      type: "Alert",
      icon: "🚨",
      title: "High Risk Alert",
      description: alert.message,
      time: alert.createdAt,
    });
  });

  timeline.sort(
    (a, b) =>
      new Date(b.time) -
      new Date(a.time)
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
  key={index}
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
        marginBottom: "8px",
      }}
    >
      <strong>{item.title}</strong>

      <small style={{ color: "#6b7280" }}>
        {new Date(item.time).toLocaleString()}
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