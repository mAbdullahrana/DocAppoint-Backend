const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});




userSchema.pre(/^find/, async function (next) {

  
  // Checking if this is a population query
  const isPopulation = this.getQuery()._id && typeof this.getQuery()._id === 'object';
  
  if (this.getOptions().requestedBy !== "admin" && !isPopulation) {
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

const User = mongoose.model("User", userSchema);

module.exports = User;
