const express = require("express");
const router = express.Router();

const {
  addHealthRecord,
  getHealthRecords,
} = require("../controllers/healthController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, addHealthRecord);
router.get("/", protect, getHealthRecords);

module.exports = router;