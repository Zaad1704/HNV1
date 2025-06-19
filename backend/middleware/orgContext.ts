import { Request, Response, NextFunction } from "express";

export async function orgContext(req: Request, res: Response, next: NextFunction) {
  const orgId = req.header("X-Org-Id");
  if (!orgId) {
      return res.status(400).json({ message: "Organization context missing" });
  }
  
  // These property accesses are now type-safe due to the global declaration.
  if (req.user?.role === "SuperAdmin") {
    req.organizationId = orgId;
    return next();
  }

  if (req.user?.organizationId.toString() !== orgId) {
    return res.status(403).json({ message: "You are not a member of this organization" });
  }
  req.organizationId = orgId;
  next();
}
