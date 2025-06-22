// backend/config/passport-setup.ts

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User, { IUser } from '../models/User';
import Organization from '../models/Organization';

passport.serializeUser((user: any, done) => {
  // user is now a plain object, so we access id
  done(null, user._id.toString());
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    // Corrected: Convert Mongoose doc to plain object before passing to done
    done(null, user ? user.toObject() : undefined);
  } catch (err) {
    done(err, undefined);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/google/callback', // This is the expected callback path
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          // Corrected: Convert to plain object
          return done(null, existingUser.toObject());
        }

        const orgName = profile.displayName + "'s Organization";
        let organization = await Organization.findOne({ name: orgName });
        if (!organization) {
          organization = new Organization({ name: orgName });
          await organization.save();
        }

        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0].value,
          organizationId: organization._id,
          role: 'Landlord', // Default role for new Google sign-ups
          status: 'active'
        });
        await newUser.save();
        
        // Corrected: Convert to plain object
        return done(null, newUser.toObject());
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);
