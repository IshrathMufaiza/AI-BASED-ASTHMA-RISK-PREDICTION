import { useEffect, useState } from "react";
import Sidebar from "../components/patient/Sidebar";
import { getProfile } from "../services/authService";
import "./Profile.css";

function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  if (!profile) return <h2>Loading...</h2>;

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="profile-page">

        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your personal information</p>
        </div>

        <div className="profile-card">

          <div className="profile-avatar">
            👤
          </div>

          <h2>{profile.name}</h2>

          <span className="patient-tag">
            Patient
          </span>

          <div className="profile-grid">

            <div>
              <label>Email</label>
              <p>{profile.email}</p>
            </div>

            <div>
              <label>Age</label>
              <p>{profile.age} years</p>
            </div>

            <div>
              <label>Height</label>
              <p>{profile.height} cm</p>
            </div>

            <div>
              <label>Weight</label>
              <p>{profile.weight} kg</p>
            </div>

            <div>
  <label>Assigned Doctor</label>
  <p>{profile.doctorName || profile.assignedDoctor || "Not assigned"}</p>
</div>

<div>
  <label>Doctor Contact</label>
  <p>{profile.doctorContact || "Not available"}</p>
</div>
          </div>

          <button className="edit-btn" disabled>
    Edit Profile (Coming Soon)
</button>

        </div>

      </main>

    </div>
  );
}

export default Profile;