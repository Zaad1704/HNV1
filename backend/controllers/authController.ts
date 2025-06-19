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

/* ========== backend/middleware/rbac.ts ========== */
import { Request, Response, NextFunction } from "express";

export const authorize = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  // Now that req.user is properly typed globally, this access is safe.
  // Using optional chaining `?.` is still a good practice.
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

/* ========== backend/middleware/orgContext.ts ========== */
import { Request, Response, NextFunction } from "express";

export async function orgContext(req: Request, res: Response, next: NextFunction) {
  const orgId = req.header("X-Org-Id");
  if (!orgId) {
      return res.status(400).json({ message: "Organization context missing" });
  }
  
  // These property accesses are now type-safe due to the global declaration.
  if (req.user?.role === "SuperAdmin") {
    req.organizationId = orgId;
    return next();
  }

  if (req.user?.organizationId.toString() !== orgId) {
    return res.status(403).json({ message: "You are not a member of this organization" });
  }
  req.organizationId = orgId;
  next();
}
