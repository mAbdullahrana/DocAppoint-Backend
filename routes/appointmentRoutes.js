const express = require("express");
const appointmentController = require("../controllers/appointmentController");
const authController = require("../controllers/authController");
const router = express.Router();

router.route("/").post(appointmentController.createAppointment);
router
  .route("/all")
  .get(authController.protect, appointmentController.getAllAppointments);

router
  .route("/available-slots/:doctorID/:date")
  .get(appointmentController.getAvailableSlots);

router
  .route("/:appointmentID") 
  .get(authController.protect, appointmentController.getAppointment)
  .patch(authController.protect, appointmentController.updateAppointment);

module.exports = router;
