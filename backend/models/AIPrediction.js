
const mongoose = require("mongoose");

const aiPredictionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    dataSource: {
  type: String,
  enum: ["TEST", "DEVICE"],
  default: "TEST",
  required: true,
},

    sensorReadings: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    predictedRisk: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: true,
    },

    probabilities: {
      HIGH: { type: Number, required: true },
      LOW: { type: Number, required: true },
      MEDIUM: { type: Number, required: true },
    },

    explanation: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    languageExplanation: {
      type: String,
      default: null,
    },

    modelType: {
      type: String,
      default: "Random Forest",
    },

    explainabilityMethod: {
      type: String,
      default: "SHAP",
    },

    languageModel: {
      type: String,
      default: "Gemini",
    },

    capturedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "AIPrediction",
  aiPredictionSchema
);
