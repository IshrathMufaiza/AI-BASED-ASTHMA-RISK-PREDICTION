
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/doctors`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

// Get active alerts
export const getAlerts = async () => {
  const response = await axios.get(
    `${API_URL}/alerts`,
    { headers: getAuthHeaders() }
  );

  return response.data;
};

// Get all alerts
export const getAlertHistory = async () => {
  const response = await axios.get(
    `${API_URL}/alerts/history`,
    { headers: getAuthHeaders() }
  );

  return response.data;
};

// Acknowledge an alert
export const reviewAlert = async (alertId) => {
  const response = await axios.patch(
    `${API_URL}/alerts/${alertId}/review`,
    {},
    { headers: getAuthHeaders() }
  );

  return response.data;
};

// Save notes without changing alert status
export const saveAlertNotes = async (alertId, doctorNotes) => {
  const response = await axios.patch(
    `${API_URL}/alerts/${alertId}/notes`,
    { doctorNotes },
    { headers: getAuthHeaders() }
  );

  return response.data;
};

// Resolve an alert
export const resolveAlert = async (alertId) => {
  const response = await axios.patch(
    `${API_URL}/alerts/${alertId}/resolve`,
    {},
    { headers: getAuthHeaders() }
  );

  return response.data;
};
