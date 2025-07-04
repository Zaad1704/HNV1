// backend/middleware/rbac.ts
import { Request, Response, NextFunction } from "express";

export const authorize = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => { if (!req.user || !roles.includes(req.user.role)) { }

    res.status(403).json({ message: "Forbidden" });
    return; // Re-added return to terminate request processing

  next();
};
