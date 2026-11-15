const HealthRecord = require("../models/HealthRecord");
const Alert = require("../models/Alert");

const addHealthRecord = async (req, res) => {
  try {
    const {
      heartRate,
      spo2,
      respiratoryRate,
      peakFlow,
    } = req.body;

    let riskLevel = "LOW";

    if (
      spo2 < 92 ||
      respiratoryRate > 25 ||
      heartRate > 120 ||
      peakFlow < 250
    ) {
      riskLevel = "HIGH";
    } else if (
      spo2 <= 95 ||
      respiratoryRate >= 20 ||
      heartRate >= 100 ||
      peakFlow < 350
    ) {
      riskLevel = "MEDIUM";
    }

    const healthRecord = await HealthRecord.create({
      patientId: req.user.id,
      heartRate,
      spo2,
      respiratoryRate,
      peakFlow,
      riskLevel,
    });

    if (riskLevel === "HIGH") {
      const activeAlert = await Alert.findOne({
        patientId: req.user.id,
        status: {
          $in: ["ACTIVE", "REVIEWED"],
        },
      });

      if (activeAlert) {
        activeAlert.riskLevel = "HIGH";
        activeAlert.lastUpdatedAt = new Date();

        await activeAlert.save();
      } else {
        await Alert.create({
          patientId: req.user.id,
          riskLevel: "HIGH",
          message: "Patient showing high-risk asthma readings.",
          status: "ACTIVE",
        });
      }
    } else {
      await Alert.updateMany(
        {
          patientId: req.user.id,
          status: {
            $in: ["ACTIVE", "REVIEWED"],
          },
        },
        {
          status: "RESOLVED",
          lastUpdatedAt: new Date(),
        }
      );
    }

    res.status(201).json({
      message: "Health record added",
      healthRecord,
    });
  } catch (error) {
    console.error("ADD HEALTH RECORD ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getHealthRecords = async (req, res) => {
  try {
    const records = await HealthRecord.find({
      patientId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(records);
  } catch (error) {
    console.error("GET HEALTH RECORDS ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  addHealthRecord,
  getHealthRecords,
};