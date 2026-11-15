const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getPatients,
  getAlerts,
} = require("../controllers/doctorController");

router.get(
  "/patients",
  protect,
  getPatients
);

router.get(
  "/alerts",
  protect,
  getAlerts
);

module.exports = router;