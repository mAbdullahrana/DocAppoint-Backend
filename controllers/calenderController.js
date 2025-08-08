const catchAsync = require("../util/catchAsync")
const User = require("../models/userModel")

exports.disconnectCalender = catchAsync(async (req, res, next) => {
  console.log("disconnectCalender")
  const user = await User.findById(req.user.id)
  user.calendarSyncEnabled = false
  user.googleCalendarTokens = null
  await user.save({ validateBeforeSave: false })
  res.status(200).json({
    status: "success",
    message: "Calendar disconnected successfully",
  })
})  