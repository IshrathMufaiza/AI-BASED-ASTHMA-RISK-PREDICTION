import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import "./Login.css";
import { toast } from "react-toastify";

function Login() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const navigate = useNavigate();

const handleSubmit = async (e) => {
e.preventDefault();


try {
  const data = await loginUser({
    email,
    password,
  });

  console.log("LOGIN RESPONSE:", data);

  localStorage.setItem(
    "token",
    data.token
  );

  localStorage.setItem(
    "role",
    data.role
  );
  toast.success("Welcome back!");

  if (data.role === "doctor") {
    setTimeout(() => {
    navigate("/doctor-dashboard");
}, 1200);
  } else {
    setTimeout(() => {
    navigate("/dashboard");
}, 1200);
  }
} catch (error) {
  toast.error("Invalid email or password");
}


};


return (
  <div className="login-page">

    <div className="login-card">

      <div className="login-logo">
  <img
    src="/images/asthmawatch-logo.png"
    alt="AsthmaWatch"
  />
</div>

      <p className="login-subtitle">
        Welcome back
      </p>

      <form onSubmit={handleSubmit}>

        <div className="login-group">
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="login-group">
          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          className="login-btn"
          type="submit"
        >
          Login
        </button>

      </form>

      <div className="login-footer">

        Don't have an account?{" "}

        <Link to="/register">
    Register
</Link>

      </div>

    </div>

  </div>
);
}

export default Login;
