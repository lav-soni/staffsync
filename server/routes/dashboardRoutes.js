const express = require("express");
const { getDashboard, getReport } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();
router.get("/", protect, getDashboard);
router.get("/report", protect, authorize("hr", "manager"), getReport);

module.exports = router;