const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
 
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  paidTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentClientSecret: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "succeeded", "failed", "refunded"],
    default: "pending",
    required: true,
  },
  paymentID: {
    type: String,
    
  },
  
  currency : {    
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

});

// transactionSchema.pre(/^find/, function (next) {
//   if (this.getOptions().requestedBy === "admin") {
//     this.find({ active: { $ne: true } });
//   }
//   next();
// });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
