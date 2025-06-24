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

      // NEW LOGIC: Check organization's subscription status
      if (req.user.organizationId) {
        const subscription = await Subscription.findOne({ organizationId: req.user.organizationId });

        if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing')) {
          // Allow Super Admin even if subscription is inactive/canceled
          if (req.user.role === 'Super Admin') {
            return next();
          }
          // For other roles, deny access if subscription is not active or trialing
          return res.status(403).json({ success: false, message: "Your organization's subscription is not active. Please renew to continue accessing features." });
        }
      } else {
        // If user has no organizationId, they cannot access protected routes
        // This case might occur if an organization was deleted but user still exists.
        return res.status(403).json({ success: false, message: "User is not associated with an organization." });
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
