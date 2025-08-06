const { promisify } = require("util");
const User = require("../models/userModel");
const AppError = require("../util/appError");
const catchAsync = require("../util/catchAsync");
const jwt = require("jsonwebtoken");


function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXPIRES,
  });
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  newUser.password = undefined;

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  const token = signToken(user._id);

  user.password = undefined;

  res.status(200).json({
    status: "success",
    token,
    user,
  });
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
 
  console.log("User from passport:", req.user);

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
      role: "patient",
    });
    user = newUser;
  }

  const token = signToken(user._id);

  // Remove password from response
  user.password = undefined;

  // Redirect to frontend with token
  res.redirect(
    `${
      process.env.FRONTEND_URL
    }/oauth-callback?token=${token}&user=${encodeURIComponent(
      JSON.stringify(user)
    )}`
  );
});
