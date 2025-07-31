const express = require("express");
const {
  createPaymentIntent,
  updatePaymentStatus,
} = require("../controllers/transactionController");
const { protect } = require("../controllers/authController");
const router = express.Router();

router.post("/create-payment-intent", protect, createPaymentIntent);
router.patch("/update-payment-status", protect, updatePaymentStatus);

module.exports = router;
