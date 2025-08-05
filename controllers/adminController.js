const catchAsync = require("../util/catchAsync");
const User = require("../models/userModel");
const Appointment = require("../models/appointmentModel");
const Transaction = require("../models/transactionModel");
const AppError = require("../util/appError");
const { getIO } = require("../socket");

exports.toggleUserStatus = catchAsync(async (req, res , next) => {
  if (req.user.role !== "admin") {
    return next(new AppError("You are not authorized to access this resource", 403));
  }
  const { id } = req.params;
  const { status } = req.body;

  const user = await User.findByIdAndUpdate(
    id,
    { active: status },
    { new: true }
  ).setOptions({
    requestedBy: req.user.role,
  });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

try{
  const io = getIO();
  io.to(`user_${user._id}`).emit(
    "userStatusUpdated",
    user
  );
}catch(err){
  console.log(err);
}
  res.status(200).json({ success: true, data: user });
});

exports.getAdminDashboardStats = catchAsync(async (req, res) => {
  const totalAppointments = await Appointment.aggregate([
    {
      $match: { paymentStatus: "succeeded" },
    },
    {
      $group: {
        _id: "$paymentStatus",
        totalAppointments: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        paymentStatus: "$_id",
        totalAppointments: 1,
      },
    },
  ]);

  const totalRevenue = await Transaction.aggregate([
    {
      $match: { paymentStatus: "succeeded" },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1,
      },
    },
  ]);

  const totalDoctors = await User.countDocuments({
    role: "doctor",
  });

  const totalPatients = await User.countDocuments({
    role: "patient",
  });

  res.status(200).json({
    success: true,
    data: {
      totalAppointments: totalAppointments[0].totalAppointments,
      totalRevenue: totalRevenue[0].totalRevenue,
      totalDoctors,
      totalPatients,
    },
  });
});
