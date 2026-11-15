const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    heartRate: {
      type: Number,
      required: true,
      min: 0,
    },

    spo2: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    respiratoryRate: {
      type: Number,
      required: true,
      min: 0,
    },

    peakFlow: {
      type: Number,
      required: true,
      min: 0,
    },

    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "HealthRecord",
  healthRecordSchema
);