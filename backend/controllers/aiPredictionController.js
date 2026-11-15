
const AIPrediction = require("../models/AIPrediction");
const { predictRisk } = require("../services/aiService");

const createPrediction = async (req, res) => {
  try {
    const sensorReadings = req.body;

    // Reject empty requests.
    if (
      !sensorReadings ||
      typeof sensorReadings !== "object" ||
      Array.isArray(sensorReadings) ||
      Object.keys(sensorReadings).length === 0
    ) {
      return res.status(400).json({
        message: "Sensor readings are required.",
      });
    }

    // Step 1: Send readings to the Python AI service.
    let aiResult;

    try {
      aiResult = await predictRisk(sensorReadings);
    } catch (error) {
      console.error("AI SERVICE ERROR:", error);

      return res.status(502).json({
        message: "Unable to get a prediction from the AI service.",
      });
    }

    // Step 2: Validate the AI response.
    if (
      !aiResult.success ||
      !["LOW", "MEDIUM", "HIGH"].includes(aiResult.predicted_risk) ||
      !aiResult.probabilities ||
      !Array.isArray(aiResult.explanation)
    ) {
      return res.status(502).json({
        message: "Invalid response received from the AI service.",
      });
    }

    // Step 3: Save the prediction in MongoDB.
    const prediction = await AIPrediction.create({
  patientId: req.user.id,
  dataSource: "TEST",
  sensorReadings,
  predictedRisk: aiResult.predicted_risk,
  probabilities: aiResult.probabilities,
  explanation: aiResult.explanation,
  languageExplanation: aiResult.language_explanation,
  modelType: aiResult.model_type,
  explainabilityMethod: aiResult.explainability_method,
  languageModel: aiResult.language_model,
});

    // Step 4: Return the saved prediction.
    return res.status(201).json({
      message: "AI prediction generated successfully.",
      prediction,
    });

  } catch (error) {
    console.error("CREATE AI PREDICTION ERROR:", error);

    return res.status(500).json({
      message: "Unable to process AI prediction.",
    });
  }
};

module.exports = {
  createPrediction,
};
