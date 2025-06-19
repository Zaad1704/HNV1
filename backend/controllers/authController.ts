import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import passport from 'passport';
import User, { IUser } from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';

// --- HELPER FUNCTION ---
// Creates a JWT and sends it in the response for client-side session management
const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true, // The cookie is not accessible via client-side JavaScript
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
  };
  res.status(statusCode).cookie('token', token, options).json({ success: true, token });
};

// --- LOCAL AUTHENTICATION ---

/**
 * @desc    Register a new user with a local password
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, organizationName } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with that email already exists');
  }

  // Start a transaction to ensure all database operations succeed or fail together
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const trialPlan = await Plan.findOne({ name: 'Free Trial' }).session(session);
    if (!trialPlan) {
      throw new Error('Trial plan is not configured on the server.');
    }

    // Create the Organization and User
    const organization = new Organization({
      name: organizationName || `${name}'s Organization`,
      members: [],
    });

    const newUser = new User({
      name,
      email,
      password, // The password will be hashed by the pre-save middleware in the User model
      role: 'Landlord',
      organizationId: organization._id,
    });

    organization.owner = newUser._id;
    organization.members.push(newUser._id);

    // Create the trial Subscription
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    const subscription = new Subscription({
      organizationId: organization._id,
      planId: trialPlan._id,
      status: 'trialing',
      trialExpiresAt: trialEndDate,
    });

    organization.subscription = subscription._id;

    // Save all documents within the transaction
    await organization.save({ session });
    await newUser.save({ session });
    await subscription.save({ session });

    // If everything is successful, commit the transaction
    await session.commitTransaction();

    sendTokenResponse(newUser, 201, res);
  } catch (error) {
    // If any operation fails, roll back all changes
    await session.abortTransaction();
    next(error); // Pass the error to the global error handler
  } finally {
    // End the session
    session.endSession();
  }
});

/**
 * @desc    Login user with email and password
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  sendTokenResponse(user, 200, res);
});


// --- GOOGLE OAUTH ---

/**
 * @desc    Initiates the Google OAuth authentication flow
 * @route   GET /api/auth/google
 * @access  Public
 */
export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

/**
 * @desc    Handles the callback from Google after authentication
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
export const googleAuthCallback = [
    // Let Passport handle the authentication and user creation/retrieval
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    // If successful, passport attaches the user to req.user. We then issue our own token.
    (req: Request, res: Response) => {
        sendTokenResponse(req.user as IUser, 200, res);
    }
];


// --- USER MANAGEMENT ---

/**
 * @desc    Get details of the currently logged-in user
 * @route   GET /api/auth/me
 * @access  Private (requires 'protect' middleware)
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // req.user is attached by the 'protect' middleware
  if (!req.user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Populate the user object with details from related collections
  const fullUserData = await User.findById(req.user._id).populate({
    path: 'organizationId',
    select: 'name status subscription branding',
    populate: {
      path: 'subscription',
      model: 'Subscription',
      populate: {
        path: 'planId',
        model: 'Plan',
      },
    },
  });

  res.status(200).json({ success: true, data: fullUserData });
});
