
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/patients`;

export const getPatientDetails = async (patientId) => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API_URL}/${patientId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
