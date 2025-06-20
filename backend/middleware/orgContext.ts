// middleware/orgContext.ts
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export async function orgContext(req: Request, res: Response, next: NextFunction) {
  const orgId = req.header('X-Org-Id');
  if (!orgId) {
    return res.status(400).json({ message: 'Organization context missing' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Fix the role comparison
  if (req.user.role === 'Super Admin') {
    req.organizationId = new mongoose.Types.ObjectId(orgId);
    return next();
  }

  if (req.user.organizationId.toString() !== orgId) {
    return res.status(403).json({ message: 'You are not a member of this organization' });
  }

  req.organizationId = req.user.organizationId;
  next();
}
