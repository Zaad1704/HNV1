import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';
import crypto from 'crypto';

const sendTokenResponse = async (user: any, statusCode: number, res: Response) => {
  const token = user.getSignedJwtToken();
  const subscription = await Subscription.findOne({ organizationId: user.organizationId });
  
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    userStatus: subscription?.status || 'inactive'
  });
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide name, email, password, and role' 
    });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      if (!userExists.isEmailVerified) {
        return res.status(400).json({ 
          success: false, 
          message: 'This email is already registered but not verified. Please check your inbox.' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        message: 'User with that email already exists' 
      });
    }

    const trialPlan = await Plan.findOne({ name: 'Free Trial' });
    if (!trialPlan) {
      return res.status(500).json({ 
        success: false, 
        message: 'Trial plan not configured. Please run setup.' 
      });
    }

    const organization = new Organization({
      name: `${name}'s Organization`,
      status: 'active'
    });
    await organization.save();

    const user = new User({
      name,
      email,
      password,
      role,
      organizationId: organization._id,
      status: 'pending'
    });

    organization.owner = user._id;
    organization.members = [user._id];
    await organization.save();

    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    const subscription = new Subscription({
      organizationId: organization._id,
      planId: trialPlan._id,
      status: 'trialing',
      trialExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });
    await subscription.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide email and password' 
    });
  }

  try {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password provided:', !!password);
    
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', !!user);
    
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    console.log('User details:');
    console.log('- Role:', user.role);
    console.log('- Status:', user.status);
    console.log('- Email verified:', user.isEmailVerified);
    console.log('- Has password:', !!user.password);
    
    const isMatch = await user.matchPassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password mismatch for user:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    console.log('✅ Password verified successfully');

    // Allow Super Admin to bypass email verification and status checks
    if (user.role !== 'Super Admin') {
      if (!user.isEmailVerified) {
        return res.status(401).json({ 
          success: false, 
          message: 'Please verify your email before logging in' 
        });
      }

      if (user.status !== 'active') {
        return res.status(401).json({ 
          success: false, 
          message: 'Account is suspended. Please contact support.' 
        });
      }
    }

    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification token' 
      });
    }

    user.isEmailVerified = true;
    user.status = 'active';
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during email verification' 
    });
  }
};

export const googleAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=google-auth-failed`);
    }

    const token = (req.user as any).getSignedJwtToken();
    res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`);

  } catch (error) {
    console.error('Google auth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google-auth-failed`);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, profilePicture } = req.body;
    const user = await User.findById((req.user as any)._id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during profile update' 
    });
  }
};