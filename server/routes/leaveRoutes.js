// Leave routes
const express = require("express");
const c = require("../controllers/leaveController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(protect);

router.post("/", authorize("employee", "manager"), c.applyLeave);
router.get("/my", c.getMyLeaves);
router.get("/", authorize("manager", "hr"), c.getLeaves);
router.put("/:id/status", authorize("manager", "hr"), c.updateLeaveStatus);
router.delete("/:id", c.cancelLeave);

module.exports = router;