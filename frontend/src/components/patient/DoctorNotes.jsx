import { useState } from "react";
import { addDoctorNote } from "../../services/patientService";
import { toast } from "react-toastify";

function DoctorNotes({
  patientId,
  doctorNotes,
  onNoteAdded,
})  {
  const [note, setNote] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async () => {
    if (!note.trim()) return;

    try {
      setLoading(true);

      await addDoctorNote(
        patientId,
        note
      );

      setNote("");

      if (onNoteAdded) {
        onNoteAdded();
      }

    } catch (error) {
      console.error(error);
      toast.error("Unable to add note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="patient-profile-card"
      style={{ marginTop: "30px" }}
    >
      <h2>📝 Doctor Notes</h2>

      {doctorNotes.length > 0 && (
  <div style={{ marginBottom: "30px" }}>

    <h3 style={{ marginBottom: "20px" }}>
      📋 Clinical Notes History
    </h3>

    {doctorNotes.map((note) => (
      <div
        key={note._id}
        style={{
          background: "#f8fafc",
          borderLeft: "5px solid #2563eb",
          borderRadius: "12px",
          padding: "18px",
          marginBottom: "15px",
          boxShadow: "0 5px 15px rgba(0,0,0,.05)"
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >

          <strong>👨‍⚕️ Doctor</strong>

          <small style={{ color: "#6b7280" }}>
            {new Date(note.createdAt).toLocaleString()}
          </small>

        </div>

        <p
          style={{
            margin: 0,
            lineHeight: 1.7,
          }}
        >
          {note.note}
        </p>

      </div>
    ))}

  </div>
)}

      <h3
  style={{
    marginTop: "35px",
    marginBottom: "15px",
  }}
>
  ✍️ Add Clinical Note
</h3>

<textarea
  rows="6"
  placeholder="Enter clinical observations, diagnosis, treatment plan or follow-up recommendations..."
  value={note}
  onChange={(e) => setNote(e.target.value)}
  style={{
    width: "100%",
    boxSizing: "border-box",
    padding: "18px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    lineHeight: "1.6",
    resize: "vertical",
    outline: "none",
  }}
/>

<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "18px",
  }}
>
  <button
    onClick={handleSubmit}
    disabled={loading}
    style={{
      background: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "12px",
      padding: "14px 28px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      transition: ".25s",
    }}
  >
    {loading ? "Saving..." : "💾 Save Clinical Note"}
  </button>
</div>
    </div>
  );
}

export default DoctorNotes;