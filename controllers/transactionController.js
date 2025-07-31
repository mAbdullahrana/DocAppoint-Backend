const Stripe = require("stripe");
const catchAsync = require("../util/catchAsync");
const Transaction = require("../models/transactionModel");
const AppError = require("../util/appError");
const Appointment = require("../models/appointmentModel");

exports.createPaymentIntent = catchAsync(async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { appointmentID, doctorID } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 50,
    currency: "usd",
  });

  console.log("appointmentID", req.body);

  await Transaction.create({
    amount: 50,
    currency: "usd",
    paymentClientSecret: paymentIntent.client_secret,
    paymentStatus: "pending",
    paidBy: req.user._id,
    paidTo: doctorID,
    appointment: appointmentID,
  });

   await Appointment.findByIdAndUpdate(appointmentID, {
    paymentStatus: "pending",
  });


  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
});

exports.updatePaymentStatus = catchAsync(async (req, res, next) => {
  const { paymentIntentId, status } = req.body;

  if (!paymentIntentId) {
    return res.status(400).json({
      success: false,
      message: "Payment intent ID is required",
    });
  }

  try {
    // Find and update the transaction
    const transaction = await Transaction.findOneAndUpdate(
      { paymentClientSecret: { $regex: paymentIntentId } },
      {
        paymentStatus: status === "succeeded" ? "succeeded" : "failed",
        paymentID: paymentIntentId,
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    await Appointment.findByIdAndUpdate(transaction.appointment, {
      paymentStatus: status === "succeeded" ? "succeeded" : "failed",
    });

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
    });
  }
});
