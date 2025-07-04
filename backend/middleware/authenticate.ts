// middleware/authenticate.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User'; // Import IUser
import { Document } from 'mongoose'; // Import Document

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed: No token provided' });

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    
    // Assign the Mongoose document directly, correctly typed.
    // If your Express augmentation for Request.user is correct,
    // this assignment should now be valid.
    req.user = (await User.findById(decoded.id).select('-password')) as (IUser & Document<any, any, any>) | null;
    
    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });

    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed: Invalid token' });

};
