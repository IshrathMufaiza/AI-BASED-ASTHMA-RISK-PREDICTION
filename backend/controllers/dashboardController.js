const HealthRecord = require("../models/HealthRecord");

const getDashboardSummary = async (req, res) => {
  try {
    const records = await HealthRecord.find({
      patientId: req.user.id,
    }).sort({ createdAt: -1 });

    if (records.length === 0) {
      return res.json({
        latestRisk: "No Data",
        totalRecords: 0,
      });
    }

    const latest = records[0];

    res.json({
      latestRisk: latest.riskLevel,
      latestHeartRate: latest.heartRate,
      latestSpo2: latest.spo2,
      totalRecords: records.length,
    });
  } catch (error) {
    console.error("GET DASHBOARD SUMMARY ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getDashboardSummary,
};