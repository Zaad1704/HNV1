import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { Document } from "mongoose";
import Subscription from "../models/Subscription"; // Import Subscription model for subscription checks

// Extend the Request type to include the 'user' property
declare global {
  namespace Express {
    interface Request {
      user?: (IUser & Document<any, any, any>) | null;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  // 1. Check for token presence in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token provided." });
  }

  try {
    // 2. Verify JWT secret
    if (!process.env.JWT_SECRET) {
      // This should ideally be caught during application startup or configuration validation
      // But including it here for robustness
      throw new Error("Server configuration error: JWT_SECRET not defined");
    }

    // 3. Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };

    // 4. Find the user based on the decoded ID
    const foundUser = await User.findById(decoded.id).select("-password");
    req.user = foundUser as (IUser & Document<any, any, any>) | null;

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, user not found." });
    }

    // 5. Check user's individual status (suspended, pending)
    if (req.user.status === "suspended" || req.user.status === "pending") {
      return res
        .status(401)
        .json({ success: false, message: "User account is not active." });
    }

    // 6. NEW LOGIC: Check organization's association and subscription status
    if (!req.user.organizationId) {
      // If user has no organizationId, they cannot access protected routes
      // This implicitly handles scenarios where a user might exist but their organization was removed.
      return res.status(403).json({ success: false, message: "User is not associated with an organization." });
    }

    // If organizationId exists, check its subscription status
    const subscription = await Subscription.findOne({ organizationId: req.user.organizationId });

    // Define allowed subscription statuses for access
    const allowedSubscriptionStatuses = ['active', 'trialing'];

    if (!subscription || !allowedSubscriptionStatuses.includes(subscription.status)) {
      // Allow Super Admin even if subscription is inactive/canceled
      if (req.user.role === 'Super Admin') {
        return next(); // Super Admin bypasses subscription check
      }

      // For other roles, deny access if subscription is not active or trialing
      return res.status(403).json({
        success: false,
        message: "Your organization's subscription is not active. Please renew to continue accessing features."
      });
    }

    // If all checks pass, proceed to the next middleware/route handler
    return next();

  } catch (error) {
    // 7. Comprehensive error handling
    if (error instanceof jwt.JsonWebTokenError) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: "Not authorized, token has expired." });
      }
      return res.status(401).json({ success: false, message: "Not authorized, invalid token." });
    }
    if (error instanceof Error && error.message.includes("JWT_SECRET not defined")) {
      console.error(error.message); // Log server configuration error
      return res.status(500).json({ success: false, message: "Server configuration error." });
    }

    console.error("Authentication/Authorization error in protect middleware:", error);
    return res.status(500).json({ success: false, message: "Server Error during authentication." });
  }
};

// The authorize function remains the same, it's a separate authorization layer
export const authorize = (...roles: IUser["role"][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role ${req.user?.role || 'unknown'} is not authorized to access this resource.`,
      });
      return;
    }
    next();
  };
};
