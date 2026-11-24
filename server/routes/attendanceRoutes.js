// Attendance routes
const express = require("express");
const c = require("../controllers/attendanceController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(protect);

router.post("/check-in", c.checkIn);
router.post("/check-out", c.checkOut);
router.get("/my", c.getMyAttendance);
router.get("/team", authorize("manager"), c.getTeamAttendance);
router.get("/report", authorize("hr"), c.getReport);
router.get("/", authorize("hr"), c.getAllAttendance);

module.exports = router;