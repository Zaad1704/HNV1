// backend/config/passport-setup.ts

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

const callbackURL = `${process.env.BACKEND_URL}/api/auth/google/callback`;

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
        const userEmail = profile.emails?.[0].value;

        if (!userEmail) {
            // Cannot proceed without an email from the Google profile.
            return done(new Error("Could not retrieve email from Google profile."), undefined);
        }

        try {
            // First, try to find a user by their existing Google ID
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                // If the user is found, login is successful.
                return done(null, user);
            }

            // If no user with that Google ID, check if their email address is already registered.
            user = await User.findOne({ email: userEmail });

            if (user) {
                // The user exists, but this is their first time using Google Sign-In.
                // Link their Google ID to their existing account.
                user.googleId = profile.id;
                user.name = user.name || profile.displayName; // Update name if it was empty
                await user.save();
                return done(null, user);
            }

            // If no user exists with that Google ID or email, create a brand new user.
            const newUser = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: userEmail,
                // 'role' and other fields will use the defaults from your User schema
            });
            
            return done(null, newUser);

        } catch (err) {
            console.error("Error in Google Passport Strategy:", err);
            return done(err, undefined);
        }
    }
));
