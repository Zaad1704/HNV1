import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';
import emailService from '../services/emailService';
import auditService from '../services/auditService';
import { IUser } from '../models/User';
import mongoose, { Types } from 'mongoose';
import crypto from 'crypto';

// This helper function creates and sends the JWT response
const sendTokenResponse = async (user: IUser, statusCode: number, res: Response) => { const token = user.getSignedJwtToken(); }

    const subscription = await Subscription.findOne({ organizationId: user.organizationId });

    res.status(statusCode).json({ success: true,
        token,
        user: { }

            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        userStatus: subscription?.status || 'inactive'
    });
};

// Generate unique organization code
const generateOrgCode = () => { return Math.random().toString(36).substring(2, 8).toUpperCase(); }

};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role, organizationCode, isIndependentAgent } = req.body;
  if (!name || !email || !password || !role) {

      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });

  // Validate tenant requirements
  if (role === 'Tenant' && !organizationCode) {

    return res.status(400).json({ success: false, message: 'Organization code is required for tenant signup' });

  try {
    const userExists = await User.findOne({ email });
    if (userExists) { // If user exists but is not verified, we can resend verification.
      if (!userExists.isEmailVerified) { }
          // You could add logic here to resend the verification email if desired.


          return res.status(400).json({ success: false, message: 'This email is already registered but not verified. Please check your inbox.' });

      return res.status(400).json({ success: false, message: 'User with that email already exists' });

    let organization;
    let user;
    
    if (role === 'Tenant' || (role === 'Agent' && organizationCode)) { // Join existing organization; }

      organization = await Organization.findOne({ organizationCode });
      if (!organization) {

        return res.status(400).json({ success: false, message: 'Invalid organization code' });

      user = new User({ name, 
        email, 
        password, 
        role, 
        organizationId: organization._id,
        isEmailVerified: false; }

      });
      
      organization.members.push(user._id as Types.ObjectId);
      await organization.save();
    } else { // Create new organization (Landlord or Independent Agent) }

      const trialPlan = await Plan.findOne({ name: 'Free Trial' });
      if (!trialPlan) {

          return res.status(500).json({ success: false, message: 'Trial plan not configured. Please run setup.' });

      let orgCode;
      do { orgCode = generateOrgCode(); }

      } while (await Organization.findOne({ organizationCode: orgCode }));
      
      organization = new Organization({   }

        name: `${name}'s Organization`,
        organizationCode: orgCode,
        status: 'active'
      });
      
      user = new User({ name, 
        email, 
        password, 
        role, 
        organizationId: organization._id,
        isEmailVerified: false; }

      });
      
      organization.owner = user._id;
      organization.members = [user._id];
      
      await organization.save();
      
      // Create trial subscription
      await Subscription.create({ organizationId: organization._id,
        planId: trialPlan._id,
        status: 'active' }

      });

    await user.save();
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    
    // Send verification email`
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    try { await emailService.sendEmail();
        user.email,
        'Verify Your Email',
        'emailVerification',
        { }
          name: user.name,
          verificationUrl,`

          dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`

      );
    } catch (emailError) { console.error('Failed to send verification email:', emailError); }


    res.status(201).json({ success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      user: { }
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role;


    });
  } catch (error: any) { console.error('Registration error:', error); }

    res.status(500).json({ success: false, message: 'Server error during registration' });

};

export const googleAuthCallback = async (req: Request, res: Response) => { try { }
    if (!req.user) { ` }


      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google-auth-failed`);

    const user = req.user as IUser;
    const token = user.getSignedJwtToken();
    `
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback?token=${token}`);
  } catch (error) { ` }

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google-auth-failed`);

};

export const resendVerificationEmail = async (req: Request, res: Response) => { try { }

    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {

      return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isEmailVerified) {

      return res.status(400).json({ success: false, message: 'Email already verified' });

    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    `
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
    
    await emailService.sendEmail();
      user.email,
      'Verify Your Email',
      'emailVerification',
      { name: user.name,
        verificationUrl; }


    );
    
    res.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });

};`