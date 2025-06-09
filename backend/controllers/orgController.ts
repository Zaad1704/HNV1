import User from "../models/User";
import { Request, Response, NextFunction } from 'express';

// BEST PRACTICE: Define the shape of the request parameters.
interface OrgParams {
  orgId: string;
}

// Per-org stats for dashboard
// FIX: Applied the OrgParams type to the Request object.
export async function orgStats(req: Request<OrgParams>, res: Response, next: NextFunction) {
  try {
    const { orgId } = req.params;
    // Ensure requester is member of org (or superadmin)
    if (req.user.role !== "SuperAdmin" && req.user.organizationId !== orgId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const members = await User.countDocuments({ organizationId: orgId });
    // Replace with real property/tenant logic as needed
    const tenants = await User.countDocuments({ organizationId: orgId, role: "Tenant" });
    const properties = 0; // placeholder, implement as needed
    res.json({ members, tenants, properties });
  } catch (err) {
    next(err);
  }
}

// --- FIX: ADDED MISSING FUNCTIONS ---
// Your adminRoutes.ts file needs these functions. You need to implement their logic.

export async function listOrganizations(req: Request, res: Response, next: NextFunction) {
  try {
    // TODO: Implement logic to list all organizations for SuperAdmin
    res.json({ message: "listOrganizations function not implemented yet." });
  } catch (err) {
    next(err);
  }
}

export async function setOrgStatus(req: Request, res: Response, next: NextFunction) {
  try {
    // TODO: Implement logic for SuperAdmin to set an organization's status
    res.json({ message: "setOrgStatus function not implemented yet." });
  } catch (err) {
    next(err);
  }
}
