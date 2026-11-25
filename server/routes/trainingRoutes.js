// Training routes
const express = require("express");
const c = require("../controllers/trainingController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", c.getTrainings);
router.post("/", authorize("manager"), c.createTraining);
router.put("/:id/progress", c.updateMyProgress);
router.put("/:id", authorize("manager"), c.updateTraining);
router.delete("/:id", authorize("manager", "hr"), c.deleteTraining);

module.exports = router;