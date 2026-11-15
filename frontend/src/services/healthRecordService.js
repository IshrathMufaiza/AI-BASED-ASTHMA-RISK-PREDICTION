import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/health-records`;

export const getHealthRecords = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    API_URL,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const addHealthRecord = async (
  healthData
) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    API_URL,
    healthData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};