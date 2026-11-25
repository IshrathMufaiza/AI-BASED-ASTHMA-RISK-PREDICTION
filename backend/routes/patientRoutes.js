
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getPatientDetails,
} = require("../controllers/patientController");

// Get patient details
router.get(
  "/:id",
  protect,
  getPatientDetails
);

module.exports = router;
