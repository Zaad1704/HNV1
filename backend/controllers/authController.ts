import User, { IUser } from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';
import auditService from '../services/auditService';
import mongoose from 'mongoose';

// The function signatures no longer need to import Request, Response, etc.
const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token });
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    // ... function logic remains the same
};

export const loginUser = async (req: Request, res: Response) => {
    // ... function logic remains the same
};

export const getMe = async (req: Request, res: Response) => { 
    // The type of req.user is now correctly inferred from our global definition
    if (!req.user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const fullUserData = await User.findById(req.user._id).populate({
        path: 'organizationId',
        select: 'name status subscription',
        populate: { path: 'subscription', model: 'Subscription' }
    });
    res.status(200).json({ success: true, data: fullUserData }); 
};
