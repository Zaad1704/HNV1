// backend/controllers/authController.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User'; 
import OrgInvitation from '../models/OrgInvitation';

// ... (Your existing register function should be here) ...
export async function register(req: Request, res: Response, next: NextFunction) {
  // ... your existing register code
}


// FIX: Added the missing 'login' function and exported it.
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password." });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Create and sign a JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, orgId: user.organizationId },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ success: true, token });

  } catch (err) {
    next(err);
  }
}
