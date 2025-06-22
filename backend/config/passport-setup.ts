// backend/config/passport-setup.ts

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

// ---- START: Add this block for debugging ----
const callbackURL = `${process.env.BACKEND_URL}/api/auth/google/callback`;

console.log("--- GOOGLE OAUTH DEBUGGER ---");
console.log("Generated Callback URL for Google:", callbackURL);
console.log("Value of process.env.BACKEND_URL:", process.env.BACKEND_URL);
console.log("-----------------------------");
// ---- END: Add this block for debugging ----


passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: callbackURL, // Use the variable here
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
                user = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails?.[0].value,
                });
            }
            return done(null, user);
        } catch (err) {
            return done(err, undefined);
        }
    }
));
