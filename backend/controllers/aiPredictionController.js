
const AIPrediction = require("../models/AIPrediction");
const Alert = require("../models/Alert");
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
      modelType: aiResult.model_type,
      explainabilityMethod: aiResult.explainability_method,
    });

    // Step 4: Generate or update an alert for elevated risk.
    let alert = null;

    if (
      aiResult.predicted_risk === "HIGH" ||
      aiResult.predicted_risk === "MEDIUM"
    ) {
      const riskLevel = aiResult.predicted_risk;

      const message =
        riskLevel === "HIGH"
          ? "The AI model has detected a HIGH risk pattern. Doctor review is recommended."
          : "The AI model has detected a MEDIUM risk pattern. Doctor review is recommended.";

      const now = new Date();

      // Check whether this patient already has an active alert.
      const existingAlert = await Alert.findOne({
        patientId: req.user.id,
        status: "ACTIVE",
      });

      if (existingAlert) {
        existingAlert.riskLevel = riskLevel;
        existingAlert.message = message;
        existingAlert.lastUpdatedAt = now;

        await existingAlert.save();

        alert = existingAlert;
      } else {
        alert = await Alert.create({
          patientId: req.user.id,
          riskLevel,
          message,
          status: "ACTIVE",
          createdAtRisk: now,
          lastUpdatedAt: now,
        });
      }
    }

    // Step 5: Return the saved prediction and alert.
    return res.status(201).json({
      message: "AI prediction generated successfully.",
      prediction,
      alert,
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
