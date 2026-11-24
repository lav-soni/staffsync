// Authentication routes
const express = require("express");
const { register, login } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", protect, authorize("hr"), register);
router.post("/login", login);

module.exports = router;