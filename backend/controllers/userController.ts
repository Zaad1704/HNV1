mport { Request, Response } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
    // This combines getMe and user details logic
    try {
        const user = await User.findById(req.user!.id).populate('organizationId', 'name');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
export const updateUserDetails = async (req: AuthenticatedRequest, res: Response) => { /* ... */ };
export const updateUserPassword = async (req: AuthenticatedRequest, res: Response) => { /* ... */ };

