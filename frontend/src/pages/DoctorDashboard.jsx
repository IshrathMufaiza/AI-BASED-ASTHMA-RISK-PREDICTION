import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPatients } from "../services/doctorService";
import { getAlerts } from "../services/alertService";
import ClinicalIncidentCard from "../components/doctor/ClinicalIncidentCard";
import DashboardSummary from "../components/doctor/DashboardSummary";
import SearchBar from "../components/doctor/SearchBar";
import PatientTable from "../components/doctor/PatientTable";
import DashboardHeader from "../components/doctor/DashboardHeader";
import { getProfile } from "../services/authService";
import "../styles/doctorDashboard.css";

function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] =
  useState("");
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientData = await getPatients();
        console.log(patientData);
        const alertData = await getAlerts();
        const doctorData = await getProfile();

        setPatients(patientData);
        setAlerts(alertData);
        setDoctor(doctorData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

 return (
  <div className="dashboard-container">

    <DashboardHeader doctor={doctor} />

    <DashboardSummary
      totalPatients={patients.length}
      activeIncidents={alerts.length}
    />

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