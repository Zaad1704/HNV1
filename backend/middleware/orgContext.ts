import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import Organization from "../models/Organization";

export async function orgContext(req: Request, res: Response, next: NextFunction) {
  const orgId = req.header("X-Org-Id");
  if (!orgId) return res.status(400).json({ message: "Organization context missing" });

  if (req.user.role === "SuperAdmin") {
    req.organizationId = orgId;
    return next();
  }
  // If user has array of orgs:
  // if (!req.user.organizationIds?.includes(orgId)) ...
  // If only one org per user:
  if (req.user.organizationId !== orgId) {
    return res.status(403).json({ message: "You are not a member of this organization" });
  }
  req.organizationId = orgId;
  next();
}