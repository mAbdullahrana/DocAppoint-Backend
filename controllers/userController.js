const User = require("../models/userModel");
const AppError = require("../util/appError");
const catchAsync = require("../util/catchAsync");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  let query;

  if (req.params.role) {
    query = User.find({ role: req.params.role });
  } else {
    query = User.find();
  }

  const users = await query;
  res.json({
    status: "success",
    results: users.length,
    users,
  });
});

exports.getAllDoctors = catchAsync(async (req, res, next) => {
  const doctors = await User.find({ role: "doctor" });

  if (!doctors) {
    return next(new AppError("No doctors found", 404));
  }
  res.json({
    status: "success",
    results: doctors.length,
    doctors,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  const filteredBody = filterObj(
    req.body,
    "name",
    "phone",
    "startTime",
    "endTime",
    "duration",
    "days"
  );

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: user,
  });
});
