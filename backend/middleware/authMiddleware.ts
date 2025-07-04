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
        
        // For inactive subscriptions, allow only view-only access
        const viewOnlyRoutes = ['/api/dashboard', '/api/properties', '/api/tenants', '/api/payments'];
        const isViewOnlyRoute = viewOnlyRoutes.some(route => req.originalUrl.startsWith(route));
        const isGetRequest = req.method === 'GET';
        
        if (isViewOnlyRoute && isGetRequest) {
          return next();
        }
        
        return res.status(403).json({ 
          success: false, 
          message: "Your subscription has expired. You can view existing data but cannot add, edit, or delete items. Please reactivate your subscription to restore full functionality.",
          action: "renew_subscription",
          upgradeUrl: "/billing"
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