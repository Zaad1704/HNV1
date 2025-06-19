import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User, { IUser } from '../models/User';
import Organization from '../models/Organization';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || undefined);
  } catch (err) {
    done(err, undefined);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          return done(null, existingUser);
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
        });
        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);
