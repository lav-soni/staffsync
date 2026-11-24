// Employee routes
const express = require("express");
const c = require("../controllers/employeeController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(protect); // every route below needs a login

router.get("/me", c.getMyProfile);
router.put("/me", c.updateMyProfile);
router.get("/team", authorize("manager"), c.getTeam);
router.get("/managers", authorize("hr"), c.getManagers);

router.route("/")
  .get(authorize("hr"), c.getEmployees)
  .post(authorize("hr"), c.createEmployee);

router.route("/:id")
  .get(authorize("hr"), c.getEmployee)
  .put(authorize("hr"), c.updateEmployee)
  .delete(authorize("hr"), c.deleteEmployee);

module.exports = router;