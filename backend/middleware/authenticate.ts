import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { AuthenticatedRequest } from '../types/express';


export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication failed: No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        
        // CORRECTED LINE: Added 'as IUser' type assertion
        req.user = (await User.findById(decoded.id).select('-password')) as IUser;
        
        if (!req.user) {
            return res.status(404).json({ message: 'User not found' });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed: Invalid token' });
    }
};
