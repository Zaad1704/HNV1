import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User, { IUser } from '../models/User';
import { Request, Response, NextFunction } from 'express';

const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        token = req.headers.authorization.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        
        const foundUser = await User.findById(decoded.id).select('-password');

        if (!foundUser) {
          res.status(401);
          throw new Error('Not authorized, user not found');
        }

        req.user = foundUser; // ✅ Fully typed as IUser from global declaration
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
