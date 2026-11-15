
const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

const predictRisk = async (sensorReadings) => {
  const response = await fetch(`${AI_SERVICE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sensorReadings),
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `AI service error (${response.status}): ${errorBody}`
    );
  }

  return await response.json();
};

module.exports = {
  predictRisk,
};
