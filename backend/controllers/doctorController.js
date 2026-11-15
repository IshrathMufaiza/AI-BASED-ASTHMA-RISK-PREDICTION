const User = require("../models/User");
const Alert = require("../models/Alert");
const HealthRecord = require("../models/HealthRecord");

// =======================
// GET ASSIGNED PATIENTS
// =======================
const getPatients = async (req, res) => {
  try {
    // Only doctors can access this endpoint
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const doctor = await User.findById(req.user.id).select(
      "name role"
    );

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const normalizedDoctorName = doctor.name
      .replace(/\s/g, "")
      .toLowerCase();

    const allPatients = await User.find({
      role: "patient",
    }).select("-password");

    const patients = allPatients.filter((patient) => {
      const assignedDoctor = (patient.assignedDoctor || "")
        .replace(/\s/g, "")
        .toLowerCase();

      return assignedDoctor === normalizedDoctorName;
    });

    res.status(200).json(patients);
  } catch (error) {
    console.error("DOCTOR ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =======================
// GET ACTIVE INCIDENTS
// =======================
const getAlerts = async (req, res) => {
  try {
    // Only doctors can access this endpoint
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const doctor = await User.findById(req.user.id).select(
      "name role"
    );

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const normalizedDoctorName = doctor.name
      .replace(/\s/g, "")
      .toLowerCase();

    const allPatients = await User.find({
      role: "patient",
    }).select("_id name assignedDoctor");

    const patients = allPatients.filter((patient) => {
      const assignedDoctor = (patient.assignedDoctor || "")
        .replace(/\s/g, "")
        .toLowerCase();

      return assignedDoctor === normalizedDoctorName;
    });

    const patientIds = patients.map(
      (patient) => patient._id
    );

    const alerts = await Alert.find({
      patientId: { $in: patientIds },
      status: "ACTIVE",
    }).sort({
      lastUpdatedAt: -1,
    });

    const alertsWithNames = await Promise.all(
      alerts.map(async (alert) => {
        const patient = patients.find(
          (p) =>
            p._id.toString() ===
            alert.patientId.toString()
        );

        const latestRecord =
          await HealthRecord.findOne({
            patientId: alert.patientId,
          }).sort({
            createdAt: -1,
          });

        return {
          _id: alert._id,
          patientId: alert.patientId,
          patientName: patient
            ? patient.name
            : "Unknown",

          riskLevel: alert.riskLevel,
          status: alert.status,

          startedAt: alert.createdAtRisk,
          lastUpdatedAt: alert.lastUpdatedAt,

          latestReading: latestRecord
            ? {
                heartRate:
                  latestRecord.heartRate,
                spo2:
                  latestRecord.spo2,
                respiratoryRate:
                  latestRecord.respiratoryRate,
                peakFlow:
                  latestRecord.peakFlow,
              }
            : null,
        };
      })
    );

    res.status(200).json(alertsWithNames);
  } catch (error) {
    console.error("ALERT ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getPatients,
  getAlerts,
};