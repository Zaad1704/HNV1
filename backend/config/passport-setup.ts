import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import jwt from 'jsonwebtoken';

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
                    // Add additional fields as needed
                });
            }
            // ISSUE JWT
            const token = jwt.sign(
                { id: user._id, role: user.role, email: user.email },
                process.env.JWT_SECRET!,
                { expiresIn: '7d' }
            );
            // Attach token to user object
            return done(null, { ...user.toObject(), token });
        } catch (err) {
            return done(err, undefined);
        }
    }
));
