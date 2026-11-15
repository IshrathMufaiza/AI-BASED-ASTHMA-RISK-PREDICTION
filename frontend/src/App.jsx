import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDetails from "./pages/PatientDetails";
import Profile from "./pages/Profile";
import AboutAsthma from "./pages/AboutAsthma";
import FAQPage from "./pages/FAQPage";
import AboutAsthmaWatch from "./pages/AboutAsthmaWatch";
import KnowYourVitals from "./pages/KnowYourVitals";
import FunZone from "./pages/FunZone";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/patients/:id"
          element={<PatientDetails />}
        />

        <Route
          path="/doctor-dashboard"
          element={<DoctorDashboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/about-asthma"
          element={<AboutAsthma />}
        />

        <Route
          path="/asthma-faqs"
          element={<FAQPage />}
        />

        <Route
          path="/about-asthmawatch"
          element={<AboutAsthmaWatch />}
        />

        <Route
    path="/know-your-vitals"
    element={<KnowYourVitals />}
/>

<Route
    path="/fun-zone"
    element={<FunZone />}
/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;