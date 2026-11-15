import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/doctors`;
export const getAlerts = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API_URL}/alerts`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};