// backend/config/passport-setup.ts

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Request } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

// Passport session serialization
passport.serializeUser((user: any, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

const callbackURL = process.env.NODE_ENV === 'production' 
    ? `${process.env.BACKEND_URL}/api/auth/google/callback`
    : 'http://localhost:5001/api/auth/google/callback';

// Check if Google OAuth is properly configured
const isGoogleOAuthConfigured = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    return clientId && clientSecret && 
           clientId !== 'your_google_client_id' && 
           clientSecret !== 'your_google_client_secret' &&
           !clientId.includes('1234567890') &&
           !clientSecret.includes('GOCSPX-abcdefghijklmnopqrstuvwxyz');
};

// Always configure Google OAuth strategy (with fallback values)
const clientId = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id';
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret';

passport.use(new GoogleStrategy(
    {
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL: callbackURL,
        passReqToCallback: true
    },
    async (req: Request, accessToken, refreshToken, profile, done) => {
        if (!isGoogleOAuthConfigured()) {
            return done(new Error('Google OAuth not properly configured'), undefined);
        }

        const userEmail = profile.emails?.[0].value;
        const authRole = (req as any).authRole || 'Landlord';

        if (!userEmail) {
            console.error('Google OAuth: No email found in profile');
            return done(new Error("Could not retrieve email from Google profile."), undefined);
        }

        try {
            // Check if user exists with this Google ID
            let user = await User.findOne({ googleId: profile.id });
            if (user) {
                user.status = 'active';
                user.isEmailVerified = true;
                await user.save();
                console.log('Google OAuth: Existing user logged in:', user.email);
                return done(null, user);
            }

            // Check if user exists with this email but not linked to Google yet
            user = await User.findOne({ email: userEmail });
            if (user) {
                user.googleId = profile.id;
                user.name = user.name || profile.displayName;
                user.isEmailVerified = true;
                user.status = 'active';
                await user.save();
                console.log('Google OAuth: Linked existing user:', user.email);
                return done(null, user);
            }

            // Create new user with organization and subscription
            console.log('Google OAuth: Creating new user for:', userEmail);
            
            // Find or create default plan
            let defaultPlan = await Plan.findOne({ name: 'Free Trial' }) || await Plan.findOne({ price: 0 });
            if (!defaultPlan) {
                defaultPlan = await Plan.create({
                    name: 'Free Trial',
                    price: 0,
                    features: ['Basic Property Management'],
                    maxProperties: 5,
                    maxTenants: 10
                });
                console.log('Created default free trial plan');
            }

            // Create organization
            const organization = new Organization({ 
                name: `${profile.displayName}'s Organization`,
                members: []
            });
            await organization.save();

            // Create subscription
            const trialExpiresAt = new Date();
            trialExpiresAt.setDate(trialExpiresAt.getDate() + 14);

            const subscription = new Subscription({
                organizationId: organization._id,
                planId: defaultPlan._id,
                status: 'trialing',
                trialExpiresAt,
                currentPeriodEndsAt: trialExpiresAt,
            });
            await subscription.save();

            organization.subscription = subscription._id;
            
            // Create new user
            const newUser = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: userEmail,
                role: authRole,
                organizationId: organization._id,
                isEmailVerified: true,
                status: 'active'
            });

            // Update organization with owner and member
            organization.owner = newUser._id;
            organization.members.push(newUser._id);
            await organization.save();

            console.log('Google OAuth: Created new user successfully:', newUser.email);
            return done(null, newUser);

        } catch (err) {
            console.error("Error in Google Passport Strategy:", err);
            return done(err as Error, undefined);
        }
    }
));

if (!isGoogleOAuthConfigured()) {
    console.warn('Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}
