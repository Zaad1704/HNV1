import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User"; 
import { Document } from "mongoose";

// FIX: Define and export the AuthenticatedRequest interface
export interface AuthenticatedRequest extends Request {
  user?: (IUser & Document<any, any, any>) | null;
}

// Middleware to protect routes (JWT authentication)
export const protect = async (
  req: AuthenticatedRequest, // Use the new interface here
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

      req.user = await User.findById(decoded.id).select("-password");

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
  return res
    .status(401)
    .json({ success: false, message: "Not authorized, no token" });
};

// Middleware to authorize based on user role
export const authorize = (...roles: IUser["role"][]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => { // Use the new interface here
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
