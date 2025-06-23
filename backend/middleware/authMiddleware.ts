import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { Document } from "mongoose";

// Define the authenticated user interface (extend as needed)
export interface AuthenticatedUser {
  _id: string;
  organizationId: string;
  email: string;
  role: "superadmin" | "landlord" | "agent" | "tenant";
  name: string;
  status: "active" | "pending" | "suspended";
  // Add other fields as needed!
}

// Attach the authenticated user to the Express Request type
export interface AuthenticatedRequest extends Request {
  user?: (AuthenticatedUser & Document<any, any, any>) | null;
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
      req.user = (await User.findById(decoded.id).select("-password")) as
        | (AuthenticatedUser & Document<any, any, any>)
        | null;

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
