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

   // Strategy for calendar integration
   passport.use(
    "google-calendar",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/google-calendar-callback`,
        scope: [
          "profile", 
          "email",
          "https://www.googleapis.com/auth/calendar"
          // "https://www.googleapis.com/auth/calendar.events"
        ],
      },
      async function verify(accessToken, refreshToken, profile, done) {
        
        profile.accessToken = accessToken;
        return done(null, profile);
      }
    )
  );
};
