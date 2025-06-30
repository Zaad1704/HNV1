// backend/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { Document } from "mongoose";
import Subscription from "../models/Subscription"; // Import Subscription model

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET not defined");
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };

      const foundUser = await User.findById(decoded.id).select("-password");
      req.user = foundUser as (IUser & Document<any, any, any>) | null;

      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "Not authorized, user not found" });
      }

      // Check user's individual status (e.g., suspended by admin)
      if (req.user.status === "suspended" || req.user.status === "pending") {
        return res
          .status(401)
          .json({ success: false, message: "User account is not active." });
      }

      // Check organization's subscription status (relaxed approach)
      if (req.user.organizationId) {
        try {
          const subscription = await Subscription.findOne({ organizationId: req.user.organizationId });
          
          if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing')) {
            // Allow Super Admin and Super Moderator regardless of subscription
            if (req.user.role === 'Super Admin' || req.user.role === 'Super Moderator') {
              return next();
            }
            // For other roles, add warning but don't block access
            (req as any).subscriptionWarning = {
              status: subscription?.status || 'none',
              message: 'Subscription may be inactive. Some features may be limited.'
            };
          }
        } catch (subscriptionError) {
          console.warn('Subscription check failed:', subscriptionError);
          // Don't block user if subscription check fails
          (req as any).subscriptionWarning = {
            status: 'unknown',
            message: 'Unable to verify subscription status.'
          };
        }
      } else if (req.user.role !== 'Super Admin' && req.user.role !== 'Super Moderator') {
        // Only block if user has no organization and is not a super user
        console.warn('User has no organization:', req.user.email);
        (req as any).organizationWarning = 'User is not associated with an organization.';
      }

      return next(); // Proceed if user and subscription are active

    } catch (error) {
      // Differentiate between token errors and other errors
      if (error instanceof jwt.JsonWebTokenError) {
          return res.status(401).json({ success: false, message: "Not authorized, invalid token." });
      }
      console.error("Authentication/Authorization error in protect middleware:", error);
      return res.status(500).json({ success: false, message: "Server Error during authentication." });
    }
  }
  return res
    .status(401)
    .json({ success: false, message: "Not authorized, no token provided." });
};

// The authorize function remains the same
export const authorize = (...roles: IUser["role"][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role ${req.user?.role} is not authorized`,
      });
      return;
    }
    next();
  };
};
