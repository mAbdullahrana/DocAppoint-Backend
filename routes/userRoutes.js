const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.patch("/updateMe", authController.protect, userController.updateMe);

router.route("/").get(authController.protect, userController.getAllUsers);
router
  .route("/doctor")
  .get(authController.protect, userController.getAllDoctors);
router.route("/:id").get(userController.getUser);

module.exports = router;
