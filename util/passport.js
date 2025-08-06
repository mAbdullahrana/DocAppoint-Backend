const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

module.exports = function () {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/google-callback`,
        scope: ["profile", "email"],
      },
      async function verify(accessToken, refreshToken, profile, done) {
        return done(null, profile);
      }
    )
  );
};
