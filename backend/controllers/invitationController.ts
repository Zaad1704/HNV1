// ...existing imports...
import Organization from "../models/Organization";
import { Request, Response, NextFunction } from 'express';

// Get info for an invitation token (for registration page)
export async function getInvitationInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    const invite = await OrgInvitation.findOne({ token, status: "pending", expiresAt: { $gt: new Date() } });
    if (!invite) return res.status(404).json({ message: "Invalid or expired invitation" });

    const org = await Organization.findById(invite.orgId);
    res.json({
      email: invite.email,
      role: invite.role,
      orgName: org?.name || "Unknown Org"
    });
  } catch (err) {
    next(err);
  }
}
