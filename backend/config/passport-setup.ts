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

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && 
    process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here' &&
    process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here') {
  
  console.log('✅ Google OAuth configured successfully');
  
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth callback received for:', profile.emails?.[0]?.value);
      
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        console.log('Existing Google user found:', user.email);
        return done(null, user);
      }
      
      // Check if user exists with same email
      const existingUser = await User.findOne({ email: profile.emails?.[0]?.value });
      if (existingUser) {
        // Link Google account to existing user
        existingUser.googleId = profile.id;
        existingUser.profilePicture = profile.photos?.[0]?.value;
        existingUser.isEmailVerified = true;
        existingUser.status = 'active';
        await existingUser.save();
        console.log('Linked Google account to existing user:', existingUser.email);
        return done(null, existingUser);
      }
      
      // Create new user with organization
      const trialPlan = await Plan.findOne({ name: 'Free Trial' });
      if (!trialPlan) {
        return done(new Error('Trial plan not configured'), null);
      }

      const organization = new Organization({
        name: `${profile.displayName}'s Organization`,
        status: 'active'
      });
      await organization.save();
      
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        profilePicture: profile.photos?.[0]?.value,
        isEmailVerified: true,
        status: 'active',
        role: 'Landlord',
        organizationId: organization._id
      });
      
      organization.owner = user._id;
      organization.members = [user._id];
      await organization.save();
      
      // Create trial subscription
      const subscription = new Subscription({
        organizationId: organization._id,
        planId: trialPlan._id,
        status: 'trialing',
        trialExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      });
      await subscription.save();
      
      await user.save();
      console.log('New Google user created:', user.email);
      done(null, user);
    } catch (error) {
      console.error('Google OAuth error:', error);
      done(error, null);
    }
  }));
} else {
  console.warn('❌ Google OAuth not configured - missing or placeholder GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET');
  console.warn('To enable Google OAuth:');
  console.warn('1. Go to Google Cloud Console');
  console.warn('2. Create OAuth 2.0 credentials');
  console.warn('3. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
}