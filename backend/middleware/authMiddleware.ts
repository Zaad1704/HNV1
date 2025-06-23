// backend/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from "express"; // Standard imports
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User"; 

// The custom 'AuthenticatedRequest' interface is no longer needed.

export const protect = async (
  req: Request, // Use the standard Express Request type
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

      // TypeScript now knows 'user' can be on 'req' due to the .d.ts file
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authorized, user not found" });
        return;
      }
      if (req.user.status === "suspended" || req.user.status === "pending") {
        res.status(401).json({ success: false, message: "User account is not active." });
        return;
      }
      next();
    } catch (error) {
      res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
};

export const authorize = (...roles: IUser["role"][]) => {
  return (req: Request, res: Response, next: NextFunction) => { // Use the standard Request type
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
