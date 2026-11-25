// Notification routes
const express = require("express");
const c = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", c.getMyNotifications);
router.put("/read-all", c.markAllRead);
router.put("/:id/read", c.markRead);

module.exports = router;