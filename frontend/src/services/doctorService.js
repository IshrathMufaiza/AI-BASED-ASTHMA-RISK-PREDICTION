
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/doctors`;

// Get assigned patients
export const getPatients = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API_URL}/patients`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// Get latest AI predictions for assigned patients
export const getPatientAIPredictions = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API_URL}/ai-predictions`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
