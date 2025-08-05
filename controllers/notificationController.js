const catchAsync = require("../util/catchAsync");
const Notification = require("../models/notificationModel");
const AppError = require("../util/appError");

exports.getNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    notifications,
  });
});

exports.updateNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, {
    read: true,
  }, { new: true });
  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }
  res.status(200).json({
    status: "success",
    notification,
  });

});