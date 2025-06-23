import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User"; 
import { Document } from "mongoose";

// Middleware to protect routes (JWT authentication)
export const protect = async (
  req: Request, // Express.Request is now globally augmented
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
  return res
    .status(401)
    .json({ success: false, message: "Not authorized, no token" });
};

// Middleware to authorize based on user role
export const authorize = (...roles: IUser["role"][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user?.role} is not authorized`,
      });
    }
    next();
  };
};
