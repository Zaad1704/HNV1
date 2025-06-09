// ...existing imports...
import User from "../models/User";

// Per-org stats for dashboard
export async function orgStats(req: Request, res: Response, next: NextFunction) {
  try {
    const { orgId } = req.params;
    // Ensure requester is member of org (or superadmin)
    if (req.user.role !== "SuperAdmin" && req.user.organizationId !== orgId)
      return res.status(403).json({ message: "Forbidden" });

    const members = await User.countDocuments({ organizationId: orgId });
    // Replace with real property/tenant logic as needed
    const tenants = await User.countDocuments({ organizationId: orgId, role: "Tenant" });
    const properties = 0; // placeholder, implement as needed
    res.json({ members, tenants, properties });
  } catch (err) {
    next(err);
  }
}