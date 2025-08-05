const express = require("express");
const {
  createPaymentIntent,
  updatePaymentStatus,
  getTransactions,
} = require("../controllers/transactionController");
const { protect } = require("../controllers/authController");
const router = express.Router();

router.post("/create-payment-intent", protect, createPaymentIntent);
router.patch("/update-payment-status", protect, updatePaymentStatus);
router.get("/get-transactions", protect, getTransactions  );

module.exports = router;
