"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const User_1 = __importDefault(require("../models/User"));
const Organization_1 = __importDefault(require("../models/Organization"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const Plan_1 = __importDefault(require("../models/Plan"));
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await User_1.default.findById(id);
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
const callbackURL = process.env.NODE_ENV === 'production'
    ? `${process.env.BACKEND_URL}/api/auth/google/callback`
    : 'http://localhost:5001/api/auth/google/callback';
const isGoogleOAuthConfigured = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    return clientId && clientSecret &&
        clientId !== 'your_google_client_id' &&
        clientSecret !== 'your_google_client_secret' &&
        !clientId.includes('1234567890') &&
        !clientSecret.includes('GOCSPX-abcdefghijklmnopqrstuvwxyz');
};
if (isGoogleOAuthConfigured()) {
    console.log('Configuring Google OAuth with callback URL:', callbackURL);
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL,
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done) => {
        const userEmail = profile.emails?.[0].value;
        const authRole = req.authRole || 'Landlord';
        if (!userEmail) {
            console.error('Google OAuth: No email found in profile');
            return done(new Error("Could not retrieve email from Google profile."), undefined);
        }
        try {
            let user = await User_1.default.findOne({ googleId: profile.id });
            if (user) {
                user.status = 'active';
                user.isEmailVerified = true;
                await user.save();
                console.log('Google OAuth: Existing user logged in:', user.email);
                return done(null, user);
            }
            user = await User_1.default.findOne({ email: userEmail });
            if (user) {
                user.googleId = profile.id;
                user.name = user.name || profile.displayName;
                user.isEmailVerified = true;
                user.status = 'active';
                await user.save();
                console.log('Google OAuth: Linked existing user:', user.email);
                return done(null, user);
            }
            console.log('Google OAuth: Creating new user for:', userEmail);
            let defaultPlan = await Plan_1.default.findOne({ name: 'Free Trial' }) || await Plan_1.default.findOne({ price: 0 });
            if (!defaultPlan) {
                defaultPlan = await Plan_1.default.create({
                    name: 'Free Trial',
                    price: 0,
                    features: ['Basic Property Management'],
                    maxProperties: 5,
                    maxTenants: 10
                });
                console.log('Created default free trial plan');
            }
            const organization = new Organization_1.default({
                name: `${profile.displayName}'s Organization`,
                members: []
            });
            await organization.save();
            const trialExpiresAt = new Date();
            trialExpiresAt.setDate(trialExpiresAt.getDate() + 14);
            const subscription = new Subscription_1.default({
                organizationId: organization._id,
                planId: defaultPlan._id,
                status: 'trialing',
                trialExpiresAt,
                currentPeriodEndsAt: trialExpiresAt,
            });
            await subscription.save();
            organization.subscription = subscription._id;
            const newUser = await User_1.default.create({
                googleId: profile.id,
                name: profile.displayName,
                email: userEmail,
                role: authRole,
                organizationId: organization._id,
                isEmailVerified: true,
                status: 'active'
            });
            organization.owner = newUser._id;
            organization.members.push(newUser._id);
            await organization.save();
            console.log('Google OAuth: Created new user successfully:', newUser.email);
            return done(null, newUser);
        }
        catch (err) {
            console.error("Error in Google Passport Strategy:", err);
            return done(err, undefined);
        }
    }));
}
else {
    console.warn('Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}
