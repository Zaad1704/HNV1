import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User, { IUser } from '../models/User'; // Import IUser
import { Request, Response, NextFunction } from 'express';

const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        
        // Get user from the token and attach it to the request object
        const foundUser = await User.findById(decoded.id).select('-password');
        
        if (!foundUser) {
          res.status(401);
          throw new Error('Not authorized, user not found');
        }
        // Explicitly cast foundUser to IUser to ensure correct typing on req.user
        req.user = foundUser as IUser;
        
        next();
      } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    }

    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }
  }
);

export { protect };
