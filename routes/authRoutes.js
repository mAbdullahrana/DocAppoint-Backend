const express = require("express");
const authController = require("../controllers/authController");
const passport = require("passport");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOtp);
router.post("/resend-otp", authController.resendOtp);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.post(
  "/change-password",
  authController.protect,
  authController.changePassword
);

router.get("/google-login", (req, res, next) => {
  const role = req.query.role;
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: role,
  })(req, res, next);
});

router.get(
  "/google-callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  authController.googleCallback
);

router.get("/google-calendar", (req, res, next) => {
  passport.authenticate("google-calendar", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/calendar",
      // "https://www.googleapis.com/auth/calendar.events"
    ],
    accessType: "offline",
    prompt: "consent",
  })(req, res, next);
});

router.get(
  "/google-calendar-callback",
  passport.authenticate("google-calendar", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/dashboard/settings`,
  }),
  authController.googleCalendarCallback
);

module.exports = router;
