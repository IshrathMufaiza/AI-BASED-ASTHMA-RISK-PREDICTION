
const User = require("../models/User");
const Alert = require("../models/Alert");
const HealthRecord = require("../models/HealthRecord");
const AIPrediction = require("../models/AIPrediction");

// =======================
// HELPER: GET ASSIGNED PATIENTS
// =======================
const getAssignedPatients = async (doctorName) => {
  const normalizedDoctorName = (doctorName || "")
    .replace(/\s/g, "")
    .toLowerCase();

  const allPatients = await User.find({
    role: "patient",
  }).select("-password");

  return allPatients.filter((patient) => {
    const assignedDoctor = (patient.assignedDoctor || "")
      .replace(/\s/g, "")
      .toLowerCase();

    return assignedDoctor === normalizedDoctorName;
  });
};

// =======================
// HELPER: VERIFY DOCTOR
// =======================
const getDoctorAndPatients = async (doctorId) => {
  const doctor = await User.findById(doctorId).select("name role");

  if (!doctor || doctor.role !== "doctor") {
    return null;
  }

  const patients = await getAssignedPatients(doctor.name);

  return { doctor, patients };
};

// =======================
// GET ASSIGNED PATIENTS
// =======================
const getPatients = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await getDoctorAndPatients(req.user.id);

    if (!result) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.status(200).json(result.patients);
  } catch (error) {
    console.error("DOCTOR ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================
// GET ACTIVE INCIDENTS
// =======================
const getAlerts = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await getDoctorAndPatients(req.user.id);

    if (!result) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const patients = result.patients;
    const patientIds = patients.map((patient) => patient._id);

    const alerts = await Alert.find({
      patientId: { $in: patientIds },
      status: "ACTIVE",
    }).sort({ lastUpdatedAt: -1 });

    const alertsWithNames = await Promise.all(
      alerts.map(async (alert) => {
        const patient = patients.find(
          (p) => p._id.toString() === alert.patientId.toString()
        );

        const latestRecord = await HealthRecord.findOne({
          patientId: alert.patientId,
        }).sort({ createdAt: -1 });

        return {
          _id: alert._id,
          patientId: alert.patientId,
          patientName: patient ? patient.name : "Unknown",
          riskLevel: alert.riskLevel,
          status: alert.status,
          startedAt: alert.createdAtRisk,
          lastUpdatedAt: alert.lastUpdatedAt,
          latestReading: latestRecord
            ? {
                heartRate: latestRecord.heartRate,
                spo2: latestRecord.spo2,
                respiratoryRate: latestRecord.respiratoryRate,
                peakFlow: latestRecord.peakFlow,
              }
            : null,
        };
      })
    );

    return res.status(200).json(alertsWithNames);
  } catch (error) {
    console.error("ALERT ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================
// GET ALL ALERTS
// =======================
const getAllAlerts = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await getDoctorAndPatients(req.user.id);

    if (!result) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const patientIds = result.patients.map((patient) => patient._id);

    const alerts = await Alert.find({
      patientId: { $in: patientIds },
    })
      .sort({ lastUpdatedAt: -1 })
      .lean();

    const patientMap = new Map(
      result.patients.map((patient) => [
        patient._id.toString(),
        patient.name,
      ])
    );

    const alertsWithNames = alerts.map((alert) => ({
      ...alert,
      patientName:
        patientMap.get(alert.patientId.toString()) || "Unknown",
    }));

    return res.status(200).json(alertsWithNames);
  } catch (error) {
    console.error("ALL ALERTS ERROR:", error);
    return res.status(500).json({ message: "Unable to retrieve alerts." });
  }
};

// =======================
// REVIEW / ACKNOWLEDGE ALERT
// =======================
const reviewAlert = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await getDoctorAndPatients(req.user.id);

    if (!result) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const patientIds = result.patients.map((patient) =>
      patient._id.toString()
    );

    const alert = await Alert.findOne({
      _id: req.params.alertId,
      patientId: { $in: patientIds },
    });

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    if (alert.status === "RESOLVED") {
      return res.status(400).json({
        message: "A resolved alert cannot be reviewed.",
      });
    }

    alert.status = "REVIEWED";
    alert.reviewedAt = new Date();
    alert.lastUpdatedAt = new Date();

    await alert.save();

    return res.status(200).json({
      message: "Alert acknowledged successfully.",
      alert,
    });
  } catch (error) {
    console.error("REVIEW ALERT ERROR:", error);
    return res.status(500).json({ message: "Unable to review alert." });
  }
};

// =======================
// SAVE ALERT NOTES
// =======================
const saveAlertNotes = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await getDoctorAndPatients(req.user.id);

    if (!result) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const patientIds = result.patients.map((patient) =>
      patient._id.toString()
    );

    const alert = await Alert.findOne({
      _id: req.params.alertId,
      patientId: { $in: patientIds },
    });

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    if (alert.status === "RESOLVED") {
      return res.status(400).json({
        message: "Cannot update notes on a resolved alert.",
      });
    }

    const { doctorNotes } = req.body;

    if (typeof doctorNotes !== "string") {
      return res.status(400).json({
        message: "Notes must be text.",
      });
    }

    alert.doctorNotes = doctorNotes.trim();
    alert.lastUpdatedAt = new Date();

    await alert.save();

    return res.status(200).json({
      message: "Notes saved successfully.",
      alert,
    });
  } catch (error) {
    console.error("SAVE ALERT NOTES ERROR:", error);
    return res.status(500).json({
      message: "Unable to save notes.",
    });
  }
};

// =======================
// RESOLVE ALERT
// =======================
const resolveAlert = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await getDoctorAndPatients(req.user.id);

    if (!result) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const patientIds = result.patients.map((patient) =>
      patient._id.toString()
    );

    const alert = await Alert.findOne({
      _id: req.params.alertId,
      patientId: { $in: patientIds },
    });

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    if (alert.status === "RESOLVED") {
      return res.status(400).json({
        message: "Alert is already resolved.",
      });
    }

    alert.status = "RESOLVED";
    alert.resolvedAt = new Date();
    alert.lastUpdatedAt = new Date();

    await alert.save();

    return res.status(200).json({
      message: "Alert resolved successfully.",
      alert,
    });
  } catch (error) {
    console.error("RESOLVE ALERT ERROR:", error);
    return res.status(500).json({ message: "Unable to resolve alert." });
  }
};

// =======================
// GET LATEST AI PREDICTIONS
// =======================
const getPatientAIPredictions = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await getDoctorAndPatients(req.user.id);

    if (!result) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const patients = result.patients;
    const patientIds = patients.map((patient) => patient._id);

    if (patientIds.length === 0) {
      return res.status(200).json([]);
    }

    const predictions = await AIPrediction.find({
      patientId: { $in: patientIds },
    })
      .select(
        "patientId dataSource sensorReadings predictedRisk probabilities explanation modelType explainabilityMethod capturedAt createdAt"
      )
      .sort({ capturedAt: -1, createdAt: -1 })
      .lean();

    const latestPredictions = new Map();

    predictions.forEach((prediction) => {
      const patientId = prediction.patientId.toString();

      if (!latestPredictions.has(patientId)) {
        latestPredictions.set(patientId, prediction);
      }
    });

    const response = patients.map((patient) => ({
      patientId: patient._id,
      patientName: patient.name,
      email: patient.email,
      latestPrediction:
        latestPredictions.get(patient._id.toString()) || null,
    }));

    return res.status(200).json(response);
  } catch (error) {
    console.error("DOCTOR AI PREDICTION ERROR:", error);
    return res.status(500).json({
      message: "Unable to retrieve patient AI predictions.",
    });
  }
};

module.exports = {
  getPatients,
  getAlerts,
  getAllAlerts,
  reviewAlert,
  saveAlertNotes,
  resolveAlert,
  getPatientAIPredictions,
};
