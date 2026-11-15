const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getPatientDetails,
  addDoctorNote,
} = require("../controllers/patientController");

// Get patient details
router.get(
  "/:id",
  protect,
  getPatientDetails
);

// Add doctor note
router.post(
  "/:id/notes",
  protect,
  addDoctorNote
);

module.exports = router;