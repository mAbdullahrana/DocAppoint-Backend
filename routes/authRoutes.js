const express = require("express");
const authController = require("../controllers/authController");
const passport = require("passport");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get(
  "/google-login",
  passport.authenticate("google", ["profile", "email"])
);


router.get(
  "/google-callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  authController.googleCallback
);

module.exports = router;
