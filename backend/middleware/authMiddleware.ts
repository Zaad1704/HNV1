import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User"; 
import { Document, Types } from "mongoose";

// AuthenticatedRequest is no longer an interface that extends Request directly to avoid TS2430.
// Instead, it's a type alias for Request, leveraging the global augmentation in express.d.ts.
export type AuthenticatedRequest = Request;

// Middleware to protect routes (JWT authentication)
export const protect = async (
  req: AuthenticatedRequest, // Now refers to the globally augmented Request
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

      // Fetch the user, exclude password field.
      // The result is directly assigned to req.user, which is typed by express.d.ts
      req.user = (await User.findById(decoded.id).select("-password")) as (IUser & Document<any, any, any>) | null;

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
export const authorize = (...roles: IUser["role"][]) => { // Directly use IUser['role'] for roles array
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => { // Use AuthenticatedRequest type
    // req.user is correctly typed here due to global augmentation
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user?.role} is not authorized`,
      });
    }
    next();
  };
};
