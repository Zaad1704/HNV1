// backend/config/passport-setup.ts

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

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
            return done(new Error("Could not retrieve email from Google profile."), undefined);
        }

        try {
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                return done(null, user);
            }

            user = await User.findOne({ email: userEmail });

            if (user) {
                user.googleId = profile.id;
                user.name = user.name || profile.displayName;
                await user.save();
                return done(null, user);
            }

            // FIX: Added logic to create an Organization and a Trial Subscription for new Google users.
            // This mirrors the logic from the manual registration controller.
            const organization = new Organization({ name: `${profile.displayName}'s Organization` });
            await organization.save();

            const defaultPlan = await Plan.findOne({ name: 'Free Trial' });
            if (!defaultPlan) {
                // If this fails, the user can't be created correctly.
                return done(new Error('Default "Free Trial" plan not found in the database.'));
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
                role: 'Landlord', // Default new signups to Landlord role
                organizationId: organization._id, // Assign the new organization
            });

            // Assign the new user as the owner of the organization
            organization.owner = newUser._id;
            await organization.save();
            
            return done(null, newUser);

        } catch (err) {
            console.error("Error in Google Passport Strategy:", err);
            return done(err, undefined);
        }
    }
));
