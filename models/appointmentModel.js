const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: Date,
    required: true,
  },
  slotStart: {
    type: String,
    required: true,
  },
  slotEnd: {
    type: String,
    required: true,
  },
  note: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "succeeded", "failed", "refunded"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


// This ensures no two appointments can have the same doctor, date, and time slot
appointmentSchema.index(
  { doctor: 1, date: 1, slotStart: 1, slotEnd: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: "cancelled" } },
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
