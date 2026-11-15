import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import "./Register.css";
import { toast } from "react-toastify";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState("patient");

  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [assignedDoctor, setAssignedDoctor] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [doctorRegistrationKey, setDoctorRegistrationKey] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userData = {
        name,
        email,
        password,
        role,
      };

      if (role === "doctor") {
  userData.contactNumber = contactNumber;
  userData.doctorRegistrationKey = doctorRegistrationKey;
}

      if (role === "patient") {
        userData.age = age;
        userData.weight = weight;
        userData.height = height;
        userData.emergencyContact = emergencyContact;
        userData.assignedDoctor = assignedDoctor;
      }

      await registerUser(userData);

      toast.success("Account created successfully!");

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error("Registration failed");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">

        <div className="register-logo">
  <img
    src="/images/asthmawatch-logo.png"
    alt="AsthmaWatch"
  />
</div>
        

        <p className="register-subtitle">
          Create your account
          <br />
          <span>Predict. Prevent. Breathe.</span>
        </p>

        <form onSubmit={handleSubmit}>

          <div className="register-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="register-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="register-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="register-group">
            <label>Role</label>

            <select
              className="register-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {role === "patient" && (
            <>
              <div className="register-group">
                <label>Age</label>
                <input
                  type="number"
                  placeholder="Enter age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>

              <div className="register-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  placeholder="Enter weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>

              <div className="register-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  placeholder="Enter height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required
                />
              </div>

              <div className="register-group">
                <label>Emergency Contact</label>
                <input
                  type="text"
                  placeholder="Phone number"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  required
                />
              </div>

              <div className="register-group">
                <label>Assigned Doctor</label>
                <input
                  type="text"
                  placeholder="Doctor's name"
                  value={assignedDoctor}
                  onChange={(e) => setAssignedDoctor(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {role === "doctor" && (
  <>
    <div className="register-group">
      <label>Doctor Contact Number</label>
      <input
        type="tel"
        value={contactNumber}
        onChange={(e) => setContactNumber(e.target.value)}
        placeholder="Enter your contact number"
        required
      />
    </div>

    <div className="register-group">
      <label>Doctor Registration Key</label>
      <input
        type="password"
        value={doctorRegistrationKey}
        onChange={(e) =>
          setDoctorRegistrationKey(e.target.value)
        }
        placeholder="Enter registration key"
        required
      />
    </div>
  </>
)}

          <button
            className="register-btn"
            type="submit"
          >
            Create Account
          </button>

        </form>

        <div className="register-footer">
          Already have an account?{" "}
          <Link to="/">
            Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Register;