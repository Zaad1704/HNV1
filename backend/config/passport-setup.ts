import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';
import { Types } from 'mongoose';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/google/callback', // Must match the route and Google Console URI
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in our database
        const existingUser = await User.findOne({ email: profile.emails?.[0].value });

        if (existingUser) {
          // If user exists, log them in.
          console.log('Existing user found:', existingUser.email);
          return done(null, existingUser);
        }

        // If not, create a new user in our database
        console.log('New user detected, creating account for:', profile.emails?.[0].value);
        
        // --- This logic mirrors your local registration process ---
        const trialPlan = await Plan.findOne({ name: 'Free Trial' });
        if (!trialPlan) {
            return done(new Error('Trial plan not configured. Please run setup.'), false);
        }
        
        const organization = new Organization({ 
            name: `${profile.displayName}'s Organization`, 
            members: [] 
        });

        const newUser = new User({
          name: profile.displayName,
          email: profile.emails?.[0].value,
          role: 'Landlord', // Default role for new sign-ups
          organizationId: organization._id,
          // We don't save a password for OAuth users
        });
        
        organization.owner = newUser._id as Types.ObjectId;
        organization.members.push(newUser._id as Types.ObjectId);

        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);

        const subscription = new Subscription({
            organizationId: organization._id as Types.ObjectId,
            planId: trialPlan._id as Types.ObjectId,
            status: 'trialing',
            trialExpiresAt: trialEndDate,
        });

        organization.subscription = subscription._id as Types.ObjectId;
        
        await organization.save();
        await newUser.save();
        await subscription.save();
        // ---------------------------------------------------------

        return done(null, newUser);
      } catch (error) {
        return done(error as Error, false);
      }
    }
  )
);
