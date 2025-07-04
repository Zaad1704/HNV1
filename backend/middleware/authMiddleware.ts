import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Subscription from '../models/Subscription';

interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET not defined");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      const foundUser = await User.findById(decoded.id).select("-password");
      req.user = foundUser;

      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: "Not authorized, user not found" 
        });
      }

      if (req.user.status === "suspended" || req.user.status === "pending") {
        return res.status(401).json({ 
          success: false, 
          message: "User account is not active." 
        });
      }

      // Allow Super Admin access regardless of subscription
      if (req.user.role === 'Super Admin') {
        return next();
      }

      // For regular users, check organization and subscription
      if (req.user.organizationId) {
        const subscription = await Subscription.findOne({ 
          organizationId: req.user.organizationId 
        });
        
        // Allow access if subscription is active, trialing, or doesn't exist (free tier)
        if (!subscription || subscription.status === 'active' || subscription.status === 'trialing') {
          return next();
        }
        
        // For inactive subscriptions, still allow basic dashboard access
        const basicRoutes = ['/api/dashboard', '/api/properties', '/api/tenants', '/api/payments'];
        const isBasicRoute = basicRoutes.some(route => req.originalUrl.startsWith(route));
        
        if (isBasicRoute) {
          return next();
        }
        
        return res.status(403).json({ 
          success: false, 
          message: "Your organization's subscription is not active. Please renew to continue accessing premium features." 
        });
      } else {
        // Allow users without organization to access basic features
        return next();
      }

      return next();

    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ 
          success: false, 
          message: "Not authorized, invalid token." 
        });
      }
      console.error("Authentication error:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Server Error during authentication." 
      });
    }
  }

  return res.status(401).json({ 
    success: false, 
    message: "Not authorized, no token provided." 
  });
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user?.role} is not authorized to access this route`
      });
    }
    next();
  };
};