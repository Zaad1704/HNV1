import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User"; // Import IUser directly
import { Document, Types } from "mongoose"; // Import Types for ObjectId

// AuthenticatedUser interface defines the shape of the user object that should be attached to req.user.
// It directly extends IUser and includes the Mongoose Document properties.
// The 'role' property is explicitly defined here to ensure its casing matches
// the enum in backend/models/User.ts, resolving TS2367 errors.
export interface AuthenticatedUser extends IUser, Document {
  // Ensure role casing matches the enum in User.ts
  role: 'Super Admin' | 'Landlord' | 'Agent' | 'Tenant'; 
  // All other properties are inherited from IUser and Document.
}

// Attach the authenticated user to the Express Request type
// By casting req.user to AuthenticatedUser, we ensure it has all the properties
// from IUser and Document, and the correct role casing.
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser | null; 
}

// Middleware to protect routes (JWT authentication)
export const protect = async (
  req: AuthenticatedRequest,
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

      // Fetch the user, exclude password field
      // Cast the result to AuthenticatedUser to match the interface of req.user
      req.user = (await User.findById(decoded.id).select("-password")) as AuthenticatedUser | null;

      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "Not authorized, user not found" });
      }
      if (req.user.status === "suspended" || req.user.status === "pending") {
        return res
          .status(401)
          .json({ success: false, message: "User account is not active." });
      }
      return next();
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
    }
  }
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }
};

// Middleware to authorize based on user role
export const authorize = (...roles: AuthenticatedUser["role"][]) => { 
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user?.role} is not authorized`,
      });
    }
    next();
  };
};
