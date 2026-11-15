import { useState } from "react";
import { useNavigate } from "react-router-dom";

function DashboardHeader({ doctor }) {
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 17) {
    greeting = "Good Afternoon";
  }

  const today = new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  const [open,setOpen]=useState(false);

const navigate=useNavigate();

const logout=()=>{

    localStorage.removeItem("token");

    localStorage.removeItem("role");

    navigate("/");

};

  return (
    <div className="dashboard-header">

      <div className="header-left">

<div className="greeting">

    <h1>
        Good Afternoon 👋
    </h1>

    <h2 className="doctor-name">
        {doctor?.name}
    </h2>

</div>

        <p className="dashboard-date">
          {today}
        </p>

      </div>

      <div className="header-right">

  <div className="device-status">

    <span className="status-dot"></span>

    <div>

      <strong>Device Status</strong>

      <p>Connected</p>

      <small>Last Sync: Just now</small>

    </div>

  </div>

  <div className="profile-menu">

    <button
        className="profile-button"
        onClick={()=>setOpen(!open)}
    >
        👨‍⚕️ {doctor?.name} ▼
    </button>

    {open && (

        <div className="dropdown">

            <button>
                Profile
            </button>

            <button
                onClick={logout}
            >
                Logout
            </button>

        </div>

    )}

</div>

</div>

    </div>
  );
}

export default DashboardHeader;