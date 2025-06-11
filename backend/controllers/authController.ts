import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import Organization from '../models/Organization';
import emailService from '../services/emailService';
import auditService from '../services/auditService';

// This is a custom interface that adds the 'user' property to the Express Request object,
// which is populated by our 'protect' middleware.
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// This helper function handles creating a JWT and sending it in the response.
const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token });
};

/**
 * @desc    Register a new user (Landlord or Agent)
 * @route   POST /api/auth/register
 */
export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create a new organization for this user
        const organization = new Organization({
            name: `${name}'s Organization`,
            members: [] // Initialize members array
        });

        // Create the new user and assign them to the new organization
        const user = new User({
            name,
            email,
            password, // Password will be hashed automatically by the pre-save hook
            role,
            organizationId: organization._id,
        });
        
        // Set the user as the owner and a member of the organization
        organization.owner = user._id;
        organization.members.push(user._id);

        // Save both documents to the database
        await organization.save();
        await user.save();

        // Record this action in the audit log
        auditService.recordAction(user._id, organization._id, 'USER_REGISTER', { registeredUserId: user._id.toString() });
        
        // For a real app, you might send an OTP here. For now, we log them in directly.
        sendTokenResponse(user, 201, res);

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Login a user
 * @route   POST /api/auth/login
 */
export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Record this action in the audit log
        auditService.recordAction(user._id, user.organizationId, 'USER_LOGIN');
        
        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Get current logged-in user's profile
 * @route   GET /api/auth/me
 */
export const getMe = async (req: AuthenticatedRequest, res: Response) => {
    // The user object is attached to the request by the 'protect' middleware
    res.status(200).json({ success: true, data: req.user });
};
