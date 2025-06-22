// backend/config/passport-setup.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
// REMOVED: No longer need jwt here
// import jwt from 'jsonwebtoken'; 

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
                user = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails?.[0].value,
                    // Role will be the default 'Tenant' from the schema
                });
            }
            // THE FIX: Pass the user object directly without the token.
            // The controller will now handle token creation.
            return done(null, user);
        } catch (err) {
            return done(err, undefined);
        }
    }
));
