// FIX: Added the missing import for the OrgInvitation model.
import OrgInvitation from '../models/OrgInvitation';
import Organization from '../models/Organization';
import { Request, Response, NextFunction } from 'express';

// BEST PRACTICE: Define the shape of the request parameters.
interface InvitationParams {
  token: string;
}

// Get info for an invitation token (for registration page)
// FIX: Applied the InvitationParams type to the Request object.
export async function getInvitationInfo(req: Request<InvitationParams>, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    const invite = await OrgInvitation.findOne({ token, status: "pending", expiresAt: { $gt: new Date() } });
    
    if (!invite) {
      return res.status(404).json({ message: "Invalid or expired invitation" });
    }

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
