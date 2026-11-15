
const express = require("express");
const router = express.Router();

const {
  createPrediction,
} = require("../controllers/aiPredictionController");

const {
  protect,
} = require("../middleware/authMiddleware");

// Generate and save an AI prediction
router.post("/", protect, createPrediction);

module.exports = router;
