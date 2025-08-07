const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email address"],
  },

  phone: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ["patient", "doctor"],
    default: "patient",
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [8, "Password must be at least 8 characters long"],
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator(val) {
        return val === this.password;
      },
      message: "Passwords do not match",
      select: false,
    },
  },

  profilePicture: {
    type: String,
    default: null,
  },

  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number,
    default: 0,
  },
  days: {
    type: [String],
    default: [],
  },
  active: {
    type: Boolean,
    default: true,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },


  otp: String,
  otpExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre(/^find/, async function (next) {
  // Checking if this is a population query
  const isPopulation =
    this.getQuery()._id && typeof this.getQuery()._id === "object";

  // Check if we should allow inactive users (for OTP functions)
  const allowInactiveUsers = this.getOptions().allowInactiveUsers;
  const isAdminRequest = this.getOptions().requestedBy === "admin";

  if (!isAdminRequest && !allowInactiveUsers && !isPopulation) {
    this.find({ active: { $ne: false } });
  }
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.createOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const encryptedOtp = crypto
    .createHash("sha256")
    .update(otp.toString())
    .digest("hex");
  this.otp = encryptedOtp;
  this.otpExpiry = Date.now() + 1 * 60 * 1000;
  return otp;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
