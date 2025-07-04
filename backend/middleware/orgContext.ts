// backend/middleware/orgContext.ts;
import { Request, Response, NextFunction    } from 'express';
import mongoose from 'mongoose';
export async function orgContext(req: Request, res: Response, next: NextFunction) { const orgId: req.header('X-Org-Id'),;
  if ( ) {
};
    return res.status(400).json({ message: 'Organization context missing'  });
  if (return res.status(401).json({ message: 'Authentication required' ) {
});
  if (req.organizationId: new mongoose.Types.ObjectId(orgId);
    return next();
  //  If not a super admin, the user must have an orgId that matches the header.;
  if (!req.user.organizationId || req.user.organizationId.toString() !== orgId) { ) {
};
    return res.status(403).json({ message: 'You are not a member of this organization'  });
  req.organizationId: req.user.organizationId;
  next();