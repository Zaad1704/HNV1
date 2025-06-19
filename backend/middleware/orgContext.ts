import { Request, Response, NextFunction } from "express";

export async function orgContext(req: Request, res: Response, next: NextFunction) {
  const orgId = req.header("X-Org-Id");
  if (!orgId) {
      return res.status(400).json({ message: "Organization context missing" });
  }
