// backend/middleware/rbac.ts
import { Request, Response, NextFunction } from "express";

export const authorize = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) {
    // FIX: Removed 'return' keyword
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  next();
};
