"use strict";
// backend/config/passport-setup.ts
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
const callbackURL = `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/google/callback`;
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    passReqToCallback: true // **SOLUTION: Pass request object to the callback**
}, async (req, accessToken, refreshToken, profile, done) => {
    const userEmail = profile.emails?.[0].value;
    const authRole = req.authRole || 'Landlord'; // Get role from state
    if (!userEmail) {
        return done(new Error("Could not retrieve email from Google profile."), undefined);
    }
    try {
        // Check if user exists with this Google ID
        let user = await User_1.default.findOne({ googleId: profile.id });
        if (user) {
            return done(null, user); // User exists, log them in
        }
        // Check if user exists with this email but not linked to Google yet
        user = await User_1.default.findOne({ email: userEmail });
        if (user) {
            user.googleId = profile.id; // Link Google ID
            user.name = user.name || profile.displayName;
            await user.save();
            return done(null, user); // Linked account, log them in
        }
        // --- **SOLUTION: Logic to create a new user with Organization and Trial Subscription** ---
        const organization = new Organization_1.default({ name: `${profile.displayName}'s Organization` });
        await organization.save();
        const defaultPlan = await Plan_1.default.findOne({ price: 0 }); // Find the free/trial plan
        if (!defaultPlan) {
            const errorMessage = 'Default "Free Trial" plan not found. Please run setup to create default plans.';
            console.error("Google Passport Strategy Error:", errorMessage);
            return done(new Error(errorMessage), undefined);
        }
        const trialExpiresAt = new Date();
        trialExpiresAt.setDate(trialExpiresAt.getDate() + 14); // 14-day trial
        const subscription = new Subscription_1.default({
            organizationId: organization._id,
            planId: defaultPlan._id,
            status: 'trialing',
            trialExpiresAt,
            currentPeriodEndsAt: trialExpiresAt,
        });
        await subscription.save();
        organization.subscription = subscription._id;
        await organization.save();
        const newUser = await User_1.default.create({
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
    }
    catch (err) {
        console.error("Error in Google Passport Strategy:", err);
        return done(err, undefined);
    }
}));
//# sourceMappingURL=passport-setup.js.map