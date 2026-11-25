// Announcement routes
const express = require("express");
const c = require("../controllers/announcementController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", c.getAnnouncements);
router.post("/", authorize("hr", "manager"), c.createAnnouncement);
router.delete("/:id", authorize("hr", "manager"), c.deleteAnnouncement);

module.exports = router;