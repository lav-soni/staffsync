// Employee routes
const express = require("express");
const c = require("../controllers/employeeController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();
router.use(protect); // every route below needs a login

router.get("/me", c.getMyProfile);
router.put("/me", c.updateMyProfile);
router.put(
  "/me/photo",
  (req, res, next) =>
    upload.single("photo")(req, res, (err) => {
      if (err)
        return res.status(400).json({
          message: err.code === "LIMIT_FILE_SIZE" ? "Image must be under 2 MB" : err.message,
        });
      next();
    }),
  c.uploadMyPhoto
);
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