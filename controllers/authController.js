const { promisify } = require("util");
const User = require("../models/userModel");
const AppError = require("../util/appError");
const catchAsync = require("../util/catchAsync");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../util/email");
const crypto = require("crypto");

async function sendOtp(user, res, next) {
  const otp = user.createOtp();
  await user.save({ validateBeforeSave: false });

  const message = `Your OTP for MedAppoint is ${otp}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "OTP for MedAppoint",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "OTP sent to your email",
      email: user.email,
    });
  } catch (err) {
    console.log(err);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("Error sending email", 500));
  }
}
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXPIRES,
  });
}

exports.signup = catchAsync(async (req, res, next) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const encryptedOtp = crypto
    .createHash("sha256")
    .update(otp.toString())
    .digest("hex");

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    active: false,
    otp: encryptedOtp,
    otpExpiry: Date.now() + 1 * 60 * 1000,
  });
  console.log(newUser);
  newUser.password = undefined;

  const message = `Your OTP for MedAppoint is ${otp}`;

  try {
    await sendEmail({
      email: newUser.email,
      subject: "Please verify your email to continue registration",
      message,
    });

    res.status(201).json({
      status: "success",
      message: "OTP sent to your email",
      email: newUser.email,
    });
  } catch (err) {
    console.log(err);
    newUser.otp = undefined;
    newUser.otpExpiry = undefined;
    await newUser.save({ validateBeforeSave: false });
    return next(new AppError("Error sending email", 500));
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email })
    .select("+password")
    .setOptions({ allowInactiveUsers: true });

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  if (user.twoFactorEnabled) {
    await sendOtp(user, res, next);
  } else {
    const token = signToken(user._id);
    user.password = undefined;

    res.status(200).json({
      status: "success",
      token,
      user,
    });
  }
});

exports.verifyOtp = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  const hashedOtp = crypto
    .createHash("sha256")
    .update(otp.toString())
    .digest("hex");

  let user = await User.findOne({
    otp: hashedOtp,
    otpExpiry: { $gt: Date.now() },
  }).setOptions({ allowInactiveUsers: true });

  if (!user) {
    return next(new AppError("Invalid or expired OTP", 400));
  }
  if (!user.active) {
    user.active = true;
  }
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);
  user.password = undefined;

  res.status(200).json({
    status: "success",
    token,
    user,
  });
});

exports.resendOtp = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).setOptions({
    allowInactiveUsers: true,
  }); // Custom option for OTP functions

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const otp = user.createOtp();
  await user.save({ validateBeforeSave: false });
  const message = `Your OTP for MedAppoint is ${otp}`;

  try {
    sendEmail({
      email: user.email,
      subject: "OTP for MedAppoint",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "OTP sent to your email",
      email: user.email,
    });
  } catch (err) {
    console.log(err);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("Error sending email", 500));
  }
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    next(
      new AppError("The user belonging to this token does no longer exist", 401)
    );
  }

  req.user = currentUser;

  next();
});

exports.googleCallback = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Google authentication failed", 401));
  }

  let user = await User.findOne({ email: req.user.emails[0].value });
  if (!user) {
    const newUser = await User.create({
      googleId: req.user.id,
      name: req.user.displayName,
      email: req.user.emails[0].value,
      password: req.user.id,
      passwordConfirm: req.user.id,
      role: req.query.state,
    });
    user = newUser;
  }

  const token = signToken(user._id);

  user.password = undefined;

  res.redirect(
    `${
      process.env.FRONTEND_URL
    }/oauth-callback?token=${token}&user=${encodeURIComponent(
      JSON.stringify(user)
    )}`
  );
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (newPassword !== confirmNewPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  if (!(await user.correctPassword(oldPassword, user.password))) {
    return next(new AppError("Incorrect password", 401));
  }

  user.password = newPassword;
  user.passwordConfirm = newPassword;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password changed successfully",
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("User with this email not found", 404));
  }

  const resetToken = user.createResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `Forgot your password? Click here to reset it: ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Reset your password",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Reset password email sent",
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("Error sending email", 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { newPassword, confirmNewPassword  } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = newPassword;
  user.passwordConfirm = confirmNewPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Password reset successfully",
  });
});
