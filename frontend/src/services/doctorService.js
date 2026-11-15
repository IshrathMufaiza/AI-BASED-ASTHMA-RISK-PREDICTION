import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/doctors`;

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