const express = require("express");

const authController = require("../controllers/authController");
const calenderController = require("../controllers/calenderController");

const router = express.Router();

router.post(
  "/disconnect-calender",
  authController.protect,
  calenderController.disconnectCalender
);

module.exports = router;
