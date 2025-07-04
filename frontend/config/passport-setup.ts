// backend/config/passport-setup.ts

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Request } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

const callbackURL = `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/google/callback`;

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: callbackURL,
        passReqToCallback: true // **SOLUTION: Pass request object to the callback**
    },
    async (req: Request, accessToken, refreshToken, profile, done) => {
        const userEmail = profile.emails?.[0].value;
        const authRole = (req as any).authRole || 'Landlord'; // Get role from state

        if (!userEmail) {
            return done(new Error("Could not retrieve email from Google profile."), undefined);
        }

        try {
            // Check if user exists with this Google ID
            let user = await User.findOne({ googleId: profile.id });
            if (user) {
                return done(null, user); // User exists, log them in
            }

            // Check if user exists with this email but not linked to Google yet
            user = await User.findOne({ email: userEmail });
            if (user) {
                user.googleId = profile.id; // Link Google ID
                user.name = user.name || profile.displayName;
                await user.save();
                return done(null, user); // Linked account, log them in
            }

            // --- **SOLUTION: Logic to create a new user with Organization and Trial Subscription** ---
            const organization = new Organization({ name: `${profile.displayName}'s Organization` });
            await organization.save();

            const defaultPlan = await Plan.findOne({ price: 0 }); // Find the free/trial plan
            if (!defaultPlan) {
                const errorMessage = 'Default "Free Trial" plan not found. Please run setup to create default plans.';
                console.error("Google Passport Strategy Error:", errorMessage);
                return done(new Error(errorMessage), undefined);
            }

            const trialExpiresAt = new Date();
            trialExpiresAt.setDate(trialExpiresAt.getDate() + 14); // 14-day trial

            const subscription = new Subscription({
                organizationId: organization._id,
                planId: defaultPlan._id,
                status: 'trialing',
                trialExpiresAt,
                currentPeriodEndsAt: trialExpiresAt,
            });
            await subscription.save();

            organization.subscription = subscription._id;
            await organization.save();

            const newUser = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: userEmail,
                role: authRole, // **SOLUTION: Use the role from the state**
                organizationId: organization._id,
            });

            // Assign the new user as the owner of the organization
            organization.owner = newUser._id;
            await organization.save();

            return done(null, newUser);

        } catch (err) {
            console.error("Error in Google Passport Strategy:", err);
            return done(err as Error, undefined);
        }
    }
));
