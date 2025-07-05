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
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt
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
      status: 'pending',
      isEmailVerified: false
    });

    organization.owner = user._id;
    organization.members = [user._id];
    await organization.save();

    // Generate verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    const subscription = new Subscription({
      organizationId: organization._id,
      planId: trialPlan._id,
      status: 'trialing',
      trialExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });
    await subscription.save();

    // Send verification email
    try {
      const emailService = (await import('../services/emailService')).default;
      await emailService.sendVerificationEmail(user.email, verificationToken, user.name);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email and verify your account within 24 hours to maintain access.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
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

    // Auto-verify Google users
    if (user.googleId && !user.isEmailVerified) {
      user.isEmailVerified = true;
      user.status = 'active';
      await user.save();
    }

    // Allow Super Admin to bypass all checks
    if (user.role !== 'Super Admin') {
      if (user.status === 'suspended') {
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

    // Populate organization data if it exists
    let populatedUser = user;
    if (user.organizationId) {
      populatedUser = await User.findById(user._id).populate('organizationId').select('-password');
    }

    res.status(200).json({
      success: true,
      data: {
        _id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        organizationId: populatedUser.organizationId,
        status: populatedUser.status,
        isEmailVerified: populatedUser.isEmailVerified
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
    console.log('Google auth callback triggered');
    
    if (!req.user) {
      console.error('No user found in Google auth callback');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=google-auth-failed&message=Authentication failed`);
    }

    const user = req.user as any;
    console.log('Google auth successful for user:', user.email);
    
    const token = user.getSignedJwtToken();
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`;
    
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Google auth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google-auth-failed&message=Server error during authentication`);
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

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById((req.user as any)._id).select('+password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during password change' 
    });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req.user as any)._id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already verified' 
      });
    }

    // Generate new verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    // Send verification email
    const emailService = (await import('../services/emailService')).default;
    await emailService.sendVerificationEmail(user.email, verificationToken, user.name);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during email resend' 
    });
  }
};

export const updateEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { newEmail } = req.body;
    const user = await User.findById((req.user as any)._id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already in use' 
      });
    }

    // Update email and reset verification
    user.email = newEmail;
    user.isEmailVerified = false;
    user.status = 'pending';
    
    // Generate new verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    // Send verification email to new address
    const emailService = (await import('../services/emailService')).default;
    await emailService.sendVerificationEmail(newEmail, verificationToken, user.name);

    res.status(200).json({
      success: true,
      message: 'Email updated. Please verify your new email address within 24 hours.'
    });

  } catch (error) {
    console.error('Update email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during email update' 
    });
  }
};

export const getVerificationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req.user as any)._id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const verificationDeadline = new Date(user.createdAt.getTime() + 24 * 60 * 60 * 1000);
    const timeRemaining = verificationDeadline.getTime() - new Date().getTime();
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

    res.status(200).json({
      success: true,
      data: {
        isEmailVerified: user.isEmailVerified,
        email: user.email,
        verificationDeadline,
        hoursRemaining: Math.max(0, hoursRemaining),
        isExpired: timeRemaining <= 0 && !user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};