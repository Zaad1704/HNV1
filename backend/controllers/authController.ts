import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import emailService from '../services/emailService';
import auditService from '../services/auditService';

// Helper function to create and send a token
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token });
};

// @desc    Register a new user, create an organization, and return a token
// @route   POST /api/auth/register
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const organization = await Organization.create({ name: `${name}'s Organization` });

    const user = new User({
      name,
      email,
      password, // Password will be hashed by the pre-save hook in the model
      role,
      organizationId: organization._id,
    });

    await user.save();

    organization.owner = user._id;
    organization.members.push(user._id);
    await organization.save();

    auditService.recordAction(user._id, organization._id, 'USER_REGISTER', { registeredUserId: user._id.toString() });
    
    // In a real flow, you would send an OTP here and not log them in immediately.
    // For now, we log them in and send a welcome email.
    try {
        await emailService.sendOtpEmail(user.email, 'Welcome!'); // Simulating with "Welcome!"
    } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
    }

    sendTokenResponse(user, 201, res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Other controller functions (loginUser, getMe) remain the same...

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    auditService.recordAction(user._id, user.organizationId, 'USER_LOGIN');
    sendTokenResponse(user, 200, res);
};

export const getMe = async (req: any, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
};
