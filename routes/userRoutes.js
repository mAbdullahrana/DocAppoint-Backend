const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.patch(
  "/updateMe",
  authController.protect,
  userController.uploadProfilePicture,
  userController.updateMe
);

router
  .route("/patient")
  .get(authController.protect, userController.getAllPatients);
router
  .route("/doctor")
  .get(authController.protect, userController.getAllDoctors);
router.route("/:id").get(userController.getUser);

module.exports = router;
