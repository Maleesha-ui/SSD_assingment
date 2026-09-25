const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  const callbackURL = `${backendUrl}/api/auth/google/callback`;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] 
            ? profile.emails[0].value.toLowerCase().trim() 
            : null;

          if (!email) {
            return done(new Error('No email found in Google account profile'), null);
          }

          const photoUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : '';

          // 1. Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            if (!user.avatar && photoUrl) {
              user.avatar = photoUrl;
              await user.save();
            }
            return done(null, user);
          }

          // 2. Check if a local account exists with the same email (Account Linking)
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            if (!user.avatar && photoUrl) {
              user.avatar = photoUrl;
            }
            // Existing local user already completed initial registration
            user.isProfileComplete = true;
            await user.save();
            return done(null, user);
          }

          // 3. Brand new user signup via Google
          const displayName = profile.displayName || 
            `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || 
            email.split('@')[0];

          const newUser = await User.create({
            googleId: profile.id,
            name: displayName,
            email: email,
            avatar: photoUrl,
            role: 'customer', // safe default role
            authProvider: 'google',
            isProfileComplete: false, // Flag indicating new user needs to complete profile
          });

          return done(null, newUser);
        } catch (err) {
          console.error('Passport Google Strategy error:', err);
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
