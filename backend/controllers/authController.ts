import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import emailService from '../services/emailService';
import auditService from '../services/auditService';

// This custom interface extends the Express Request to include our user property
// after they have been authenticated by the 'protect' middleware.
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    organizationId: string;
    role: string;
  };
}

// Helper function to create and send a secure JWT token in the response.
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token });
};

/**
 * @desc    Register a new user (Landlord or Agent)
 * @route   POST /api/auth/register
 */
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with that email already exists' });
    }

    // Create a new organization for this user
    const organization = new Organization({
        name: `${name}'s Organization`,
        members: [] // Initialize the members array
    });

    // Create the new user and assign them to the new organization
    const user = new User({
      name,
      email,
      password, // Password will be hashed automatically by the model's pre-save hook
      role,
      organizationId: organization._id,
    });
    
    // Set the user as the owner and a member of the organization
    organization.owner = user._id;
    organization.members.push(user._id);

    // Save both new documents to the database
    await organization.save();
    await user.save();

    // Log this important action
    auditService.recordAction(user._id, organization._id, 'USER_REGISTER', { registeredUserId: user._id.toString() });
    
    // Send a welcome email (this is simulated in the service file)
    try {
        await emailService.sendEmail(user.email, 'Welcome to HNV!', '<h1>Welcome!</h1><p>Thank you for registering.</p>');
    } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
    }

    sendTokenResponse(user, 201, res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ... other controller functions like loginUser and getMe
export const loginUser = async (req: Request, res: Response) => { /* ... */ };
export const getMe = async (req: AuthenticatedRequest, res: Response) => { /* ... */ };

