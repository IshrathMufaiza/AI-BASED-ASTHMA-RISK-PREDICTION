
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getPatients,
  getAlerts,
  getAllAlerts,
  reviewAlert,
  saveAlertNotes,
  resolveAlert,
  getPatientAIPredictions,
} = require("../controllers/doctorController");

// Get assigned patients
router.get("/patients", protect, getPatients);

// Get active clinical alerts
router.get("/alerts", protect, getAlerts);

// Get all alerts
router.get("/alerts/history", protect, getAllAlerts);

// Acknowledge an alert
router.patch("/alerts/:alertId/review", protect, reviewAlert);

// Save alert notes without changing status
router.patch("/alerts/:alertId/notes", protect, saveAlertNotes);

// Resolve an alert
router.patch("/alerts/:alertId/resolve", protect, resolveAlert);

// Get latest AI predictions
router.get("/ai-predictions", protect, getPatientAIPredictions);

module.exports = router;
